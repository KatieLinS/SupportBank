import {Account} from "./account";

export class Bank {
    private accounts: Account[] = [];

    findAccount(name: string): Account | undefined {
        return this.accounts.find(function (account: Account) {
            return account.name === name;
        })
    }

    findOrCreateAccount(name: string): Account {
        // Find account
        const account = this.findAccount(name)
        if (account) {
            return account;
        }

        // Create account
        const newAccount = new Account(name);
        this.accounts.push(newAccount);
        return newAccount;
    }

    getAllAccounts(): Account[] {
        // List all accounts with balance
        return this.accounts;
    }

    printAllAccounts(): void {
        // List all accounts with balance
        this.accounts.forEach((account) => {
            if (account.balance > 0) console.log(`${account.name} is owed ${account.balance.toFixed(2)}`)
            else console.log(`${account.name} owed ${-account.balance.toFixed(2)}`)
        })
    }
}