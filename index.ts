const moment = require('moment');
const readlineSync = require('readline-sync');

class Transaction {
    date: any;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(date: string, from: string, to: string, narrative: string, amount: number) {
        this.date = moment(date, "DD-MM-YYYY");
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = +amount;
    }
}

class Account {
    name: string;
    transactions: Transaction[] = [];
    balance: number = 0;

    constructor(name: string) {
        this.name = name;
    }

    addTransaction(newTransaction: Transaction): void {
        this.transactions.push(newTransaction);
    }

    updateBalance(amount: number): void {
        this.balance += amount;
    }
}

class Bank {
    accounts: Account[] = [];

    addAccount(newAccount: Account): void {
        this.accounts.push(newAccount);
    }
}



const supportBank = new Bank();

function findOrCreateAccount(name: string) {
    let account = supportBank.accounts.find(function (account: Account) {
        return account.name === name;
    })
    if (!account) {
        account = new Account(name);
        supportBank.addAccount(account);
    }
    return account;
}
const csv = require('csv-parser')
const fs = require('fs')
const results: any[] = [];

fs.createReadStream('Transactions2014.csv')
    .pipe(csv())
    .on('data', (data: any) => {
        //Find or create account for "From" and "To"
        const fromAccount = findOrCreateAccount(data["From"])
        const toAccount = findOrCreateAccount(data["To"])

        //Add transaction to the accounts
        const transaction = new Transaction(data["Date"], data["From"], data["To"], data["Narrative"], data["Amount"])
        fromAccount.addTransaction(transaction)
        toAccount.addTransaction(transaction)

        //Update the balance of the accounts
        fromAccount.updateBalance(-transaction.amount.toFixed(2))
        toAccount.updateBalance(+transaction.amount.toFixed(2))
    })
    .on('end', () => {
        // Ask for user's command.
        const userCommand = readlineSync.question('List All or List [Account] (Enter a name)? ');
        switch ( userCommand ) {
            case 'List All':
                // List all accounts with balance
                supportBank.accounts.forEach((account) => {
                    if (account.balance > 0) console.log(`${account.name} is owed ${account.balance.toFixed(2)}`)
                    else console.log(`${account.name} owed ${-account.balance.toFixed(2)}`)
                })
                break;
            default:
                // List all transactions for that account
                const account = findOrCreateAccount(userCommand.substring(5))
                account.transactions.forEach((transaction) => {
                    console.log(`Date: ${transaction.date}, From: ${transaction.from}, To: ${transaction.to}, Narrative: ${transaction.narrative}, Amount: ${transaction.amount}`)
                })
                break;
        }
    });
