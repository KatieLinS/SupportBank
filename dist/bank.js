"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bank = void 0;
const account_1 = require("./account");
class Bank {
    constructor() {
        this.accounts = [];
    }
    findAccount(name) {
        return this.accounts.find(function (account) {
            return account.name === name;
        });
    }
    findOrCreateAccount(name) {
        // Find account
        const account = this.findAccount(name);
        if (account) {
            return account;
        }
        // Create account
        const newAccount = new account_1.Account(name);
        this.accounts.push(newAccount);
        return newAccount;
    }
    getAllAccounts() {
        // List all accounts with balance
        return this.accounts;
    }
    printAllAccounts() {
        // List all accounts with balance
        this.accounts.forEach((account) => {
            if (account.balance > 0)
                console.log(`${account.name} is owed ${account.balance.toFixed(2)}`);
            else
                console.log(`${account.name} owed ${-account.balance.toFixed(2)}`);
        });
    }
}
exports.Bank = Bank;
//# sourceMappingURL=bank.js.map