import {Transaction} from "./transaction";

export class Account {
    name: string;
    balance: number = 0;

    private transactions: Transaction[] = [];

    constructor(name: string) {
        this.name = name;
    }

    addTransaction(newTransaction: Transaction): void {
        this.transactions.push(newTransaction);
    }

    updateBalance(amount: number): void {
        this.balance += amount;
    }

    printAccountTransaction() {
        // List all transactions for that account
        this.transactions.forEach((transaction) => {
            console.log(`Date: ${transaction.date.format('DD/MM/YYYY')}, From: ${transaction.from}, To: ${transaction.to}, Narrative: ${transaction.narrative}, Amount: ${transaction.amount}`)
        })
    }
}