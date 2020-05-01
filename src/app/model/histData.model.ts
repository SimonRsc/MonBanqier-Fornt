export class HistData {
    chartData: Array<Array<any>> = [];

    constructor(public symbol, public qte, public data: Array<any>) {
        for (let tmp of data) {
            let timestamp = new Date(tmp.date).getTime()
            this.chartData.push([timestamp, tmp.close]);
        }
    }
}
