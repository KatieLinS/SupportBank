"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
class Account {
    constructor(name) {
        this.balance = 0;
        this.transactions = [];
        this.name = name;
    }
    addTransaction(newTransaction) {
        this.transactions.push(newTransaction);
    }
    updateBalance(amount) {
        this.balance += amount;
    }
    printAccountTransaction() {
        // List all transactions for that account
        this.transactions.forEach((transaction) => {
            console.log(`Date: ${transaction.date.format('DD/MM/YYYY')}, From: ${transaction.from}, To: ${transaction.to}, Narrative: ${transaction.narrative}, Amount: ${transaction.amount}`);
        });
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map