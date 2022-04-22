import {Moment} from "moment";

export class Transaction {
    date: Moment; //
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(date: Moment, from: string, to: string, narrative: string, amount: number) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = +amount;
    }
}