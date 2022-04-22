// parsers
import fs from "fs";
import csv from "csv-parser";
import {XMLParser} from "fast-xml-parser";
import {createObjectCsvWriter as createCsvWriter} from "csv-writer";

// log4js
import log4js from "log4js";
import readlineSync from "readline-sync";
import moment from "moment";

// classes
import {Transaction} from "./transaction";
import {Bank} from "./bank";


const logger = log4js.getLogger('index.ts');
logger.level = "debug";
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
logger.debug("Some debug messages");

const supportBank = new Bank();

function addAccountsAndTransactions(date: any, from: string, to: string, narrative: string, amount: number) {
    //Find or create account for "From" and "To"
    const fromAccount = supportBank.findOrCreateAccount(from)
    const toAccount = supportBank.findOrCreateAccount(to)

    //Add transaction to the accounts
    const transaction = new Transaction(date, from, to, narrative, amount)
    fromAccount.addTransaction(transaction)
    toAccount.addTransaction(transaction)

    //Update the balance of the accounts
    fromAccount.updateBalance(-transaction.amount)
    toAccount.updateBalance(+transaction.amount)
}

function readCSV(filename: string) {
    console.log('reading CSV file')
    fs.createReadStream(`transactions/${filename}`)
        .pipe(csv())
        .on('data', (data: any) => {
            addAccountsAndTransactions(moment(data["Date"], "DD-MM-YYYY"), data["From"], data["To"], data["Narrative"], data["Amount"] )
        })
        .on('end', () => {
            runInterface();
        });
}
function writeCSV(filename: string, records: any) {
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            {id: 'name', title: 'Name'},
            {id: 'balance', title: 'Balance'},
            {id: 'transactions', title: 'Transactions'}
            // {id: 'narrative', title: 'Narrative'},
            // {id: 'amount', title: 'Amount'}
        ]
    });
    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('...Done');
        });
}
function readJSON(filename: string) {
    console.log('reading JSON File')
    fs.readFile(`transactions/${filename}`, (err: Error|null, data: any) => {
        if(err) {
            console.log("File can't be read", err)
            return
        }
        try{
            //Find or create account for "From" and "To"
            const logs = JSON.parse(data)
            logs.forEach((log: any) => {
                addAccountsAndTransactions(moment(log["Date"], "YYYY-MM-DD"), log["FromAccount"], log["ToAccount"], log["Narrative"], log["Amount"])
            })
            runInterface();
        }
        catch(err) {
            console.log("Error parsing JSON string:", err)
        }
    })
}

function readXML(filename: string) {
    console.log('reading XML File')
    fs.readFile(`transactions/${filename}`, (err: Error|null, data: any) => {
        if (err) {
            console.log("File can't be read", err)
            return
        }
        try {
            const options = {
                ignoreAttributes : false
            }
            const parser = new XMLParser(options);
            let logs = parser.parse(data)['TransactionList']['SupportTransaction'];

            logs.forEach((log: any) => {
                //Turn serial date to unix
                const utc_days  = Math.floor(parseInt(log["@_Date"]) - 25569);
                const utc_value = utc_days * 86400;

                addAccountsAndTransactions(moment(utc_value, 'X'), log['Parties']['From'], log['Parties']['To'], log["Description"], log["Value"])
            })

            runInterface();
        } catch (err) {
            console.log("Error parsing JSON string:", err)
        }
    })
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
    console.log('--------------------------------------------------------------')
    console.log('Menu')
    console.log('- Import File [filename] (Enter the file name with extension)')
    console.log('- List All')
    console.log('- List [Account] (Enter the account name)')
    console.log('- Export File [filename] (Enter the file name with extension)')
    console.log('- Quit')
    console.log('--------------------------------------------------------------')
}

function runInterface() {
    printMenu();
    // Ask for user's command.
    let userCommand = readlineSync.question('Choose an action: ');
    if (userCommand === 'Quit') {
        console.log('Goodbye!');
    } else if (userCommand.includes('Import')) {
        let filename: string = userCommand.slice(userCommand.indexOf('Import File ') + 'Import File '.length);
        let extension: string = userCommand.slice(userCommand.indexOf('.') + '.'.length);
        switch(extension) {
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
    } else if (userCommand.includes('List')) {
        switch (userCommand) {
            case 'List All':
                supportBank.printAllAccounts();
                break;
            default:
                const name = userCommand.slice(userCommand.indexOf('List ') + 'List '.length);
                const account = supportBank.findAccount(name);
                if (account) account.printAccountTransaction();
                else console.log('Account does not exist');
                break;
        }
        runInterface();
    } else if (userCommand.includes('Export')) {
        let filename: string = userCommand.slice(userCommand.indexOf('Import File ') + 'Import File '.length);
        let extension: string = userCommand.slice(userCommand.indexOf('.') + '.'.length);
        switch(extension) {
            case 'csv':
                console.log(supportBank.getAllAccounts());
                writeCSV(filename, supportBank.getAllAccounts());
                break;
            case 'json':
                break;
            case 'xml':
                break;
        }
        runInterface();
    } else {
        console.log('Command does not exist. Enter again.');
        runInterface();
    }
}

runInterface();