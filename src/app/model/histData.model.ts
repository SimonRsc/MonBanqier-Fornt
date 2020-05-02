export class HistData {
    chartData: Array<Array<any>> = [];

    constructor(public symbol, public qte, public pru, public data: Array<any>) {
        for (const tmp of data) {
            if (tmp.date) {
                const timestamp = new Date(tmp.date).getTime();
                this.chartData.push([timestamp, tmp.close]);

            } else {
                const timestamp = new Date(tmp[0]).getTime();
                this.chartData.push([timestamp, tmp[1]]);
                this.chartData.sort();

            }
        }
    }
}
