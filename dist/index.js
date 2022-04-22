"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// parsers
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fast_xml_parser_1 = require("fast-xml-parser");
const csv_writer_1 = require("csv-writer");
// log4js
const log4js_1 = __importDefault(require("log4js"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const moment_1 = __importDefault(require("moment"));
// classes
const transaction_1 = require("./transaction");
const bank_1 = require("./bank");
const logger = log4js_1.default.getLogger('index.ts');
logger.level = "debug";
log4js_1.default.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug' }
    }
});
logger.debug("Some debug messages");
const supportBank = new bank_1.Bank();
function addAccountsAndTransactions(date, from, to, narrative, amount) {
    //Find or create account for "From" and "To"
    const fromAccount = supportBank.findOrCreateAccount(from);
    const toAccount = supportBank.findOrCreateAccount(to);
    //Add transaction to the accounts
    const transaction = new transaction_1.Transaction(date, from, to, narrative, amount);
    fromAccount.addTransaction(transaction);
    toAccount.addTransaction(transaction);
    //Update the balance of the accounts
    fromAccount.updateBalance(-transaction.amount);
    toAccount.updateBalance(+transaction.amount);
}
function readCSV(filename) {
    console.log('reading CSV file');
    fs_1.default.createReadStream(`transactions/${filename}`)
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => {
        addAccountsAndTransactions((0, moment_1.default)(data["Date"], "DD-MM-YYYY"), data["From"], data["To"], data["Narrative"], data["Amount"]);
    })
        .on('end', () => {
        runInterface();
    });
}
function writeCSV(filename, records) {
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: filename,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'balance', title: 'Balance' },
            { id: 'transactions', title: 'Transaction' }
            // {id: 'narrative', title: 'Narrative'},
            // {id: 'amount', title: 'Amount'}
        ]
    });
    csvWriter.writeRecords(records) // returns a promise
        .then(() => {
        console.log('...Done');
    });
}
function readJSON(filename) {
    console.log('reading JSON File');
    fs_1.default.readFile(`transactions/${filename}`, (err, data) => {
        if (err) {
            console.log("File can't be read", err);
            return;
        }
        try {
            //Find or create account for "From" and "To"
            const logs = JSON.parse(data);
            logs.forEach((log) => {
                addAccountsAndTransactions((0, moment_1.default)(log["Date"], "YYYY-MM-DD"), log["FromAccount"], log["ToAccount"], log["Narrative"], log["Amount"]);
            });
            runInterface();
        }
        catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
}
function readXML(filename) {
    console.log('reading XML File');
    fs_1.default.readFile(`transactions/${filename}`, (err, data) => {
        if (err) {
            console.log("File can't be read", err);
            return;
        }
        try {
            const options = {
                ignoreAttributes: false
            };
            const parser = new fast_xml_parser_1.XMLParser(options);
            let logs = parser.parse(data)['TransactionList']['SupportTransaction'];
            logs.forEach((log) => {
                //Turn serial date to unix
                const utc_days = Math.floor(parseInt(log["@_Date"]) - 25569);
                const utc_value = utc_days * 86400;
                addAccountsAndTransactions((0, moment_1.default)(utc_value, 'X'), log['Parties']['From'], log['Parties']['To'], log["Description"], log["Value"]);
            });
            runInterface();
        }
        catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
}
// readXML('Transactions2012.xml');
// Import File Transactions2012.xml
// readJSON('Transactions2013.json');
// Import File Transactions2013.json
// readCSV('Transactions2014.csv');
// Import File Transactions2014.csv
// readCSV('DodgyTransactions2015.csv');
// Import File DodgyTransactions2015.csv
// Export File data.csv
function printMenu() {
    console.log('');
    console.log('--------------------------------------------------------------');
    console.log('Menu');
    console.log('- Import File [filename] (Enter the file name with extension)');
    console.log('- List All');
    console.log('- List [Account] (Enter the account name)');
    console.log('- Export File [filename] (Enter the file name with extension)');
    console.log('- Quit');
    console.log('--------------------------------------------------------------');
}
function runInterface() {
    printMenu();
    // Ask for user's command.
    let userCommand = readline_sync_1.default.question('Choose an action: ');
    if (userCommand === 'Quit') {
        console.log('Goodbye!');
    }
    else if (userCommand.includes('Import')) {
        let filename = userCommand.slice(userCommand.indexOf('Import File ') + 'Import File '.length);
        let extension = userCommand.slice(userCommand.indexOf('.') + '.'.length);
        switch (extension) {
            case 'csv':
                readCSV(filename);
                break;
            case 'json':
                readJSON(filename);
                break;
            case 'xml':
                readXML(filename);
                break;
        }
    }
    else if (userCommand.includes('List')) {
        switch (userCommand) {
            case 'List All':
                supportBank.printAllAccounts();
                break;
            default:
                const name = userCommand.slice(userCommand.indexOf('List ') + 'List '.length);
                const account = supportBank.findAccount(name);
                if (account)
                    account.printAccountTransaction();
                else
                    console.log('Account does not exist');
                break;
        }
        runInterface();
    }
    else if (userCommand.includes('Export')) {
        let filename = userCommand.slice(userCommand.indexOf('Import File ') + 'Import File '.length);
        let extension = userCommand.slice(userCommand.indexOf('.') + '.'.length);
        switch (extension) {
            case 'csv':
                console.log(supportBank.getAllAccounts());
                writeCSV(filename, supportBank.getAllAccounts());
                break;
            case 'json':
                readJSON(filename);
                break;
            case 'xml':
                readXML(filename);
                break;
        }
    }
    else {
        console.log('Command does not exist. Enter again.');
        runInterface();
    }
}
runInterface();
//# sourceMappingURL=index.js.map