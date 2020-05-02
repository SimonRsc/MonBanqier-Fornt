import {Injectable} from '@angular/core';
import {AuthentificationService} from './authentification.service';
import {HttpClient} from '@angular/common/http';
import {Stock} from '../model/stock.model';
import {Subject} from 'rxjs';
import {HistData} from '../model/histData.model';


@Injectable()
export class BourseService {

    apiUrl = 'https://financialmodelingprep.com/api/v3/quote/';
    histUrl = 'https://financialmodelingprep.com/api/v3/historical-price-full/';
    searchUrl = ' https://financialmodelingprep.com/api/v3/search?query=';
    backendUrl = 'https://monbanquier-backend.herokuapp.com/api/bourse/'
    portfolio: Array<Stock> = [];
    histData: Array<HistData> = [];
    portfolioSubject = new Subject<Array<Stock>>();
    stockHistData: Array<HistData> = [];
    histDataSubject = new Subject<Array<HistData>>();

    private requestedStocks;

    constructor(private http: HttpClient, private authentificationService: AuthentificationService) {

    }

    emitPorfolio() {
        const request = this.http.get<any>(this.backendUrl + 'composition/' + this.authentificationService.user.id);
        request.subscribe(async (data) => {
            const bdData = data;
            this.requestedStocks = '';
            for (const stock of data.stock) {
                this.requestedStocks = this.requestedStocks.concat(stock.stockCode + ',');
            }
            const dataRequest = this.http.get<any>(this.apiUrl + this.requestedStocks);

            dataRequest.subscribe((realTimeData) => {
                this.portfolio = [];
                for (const realData of realTimeData) {
                    for (const stock of bdData.stock) {
                        if (stock.stockCode === realData.symbol) {
                            this.portfolio.push(new Stock(stock.stockId, stock.stockPru, stock.stockQte, stock.stockBuyingDate, realData));
                        }
                    }
                }
                this.portfolioSubject.next(this.portfolio);
                this.emitHistData();
            });
        });
    }

    async emitHistData() {
        this.histData = [];
        const masterPortfolio = new Map();
        const pruPortfolio = new Map();
        let pru = 0;
        for (const stock of this.portfolio) {
            const data = await this.http.get<any>(this.histUrl + stock.symbol + '?serietype=line&from=' + stock.date).toPromise();
            this.histData.push(new HistData(stock.symbol, stock.qte, stock.pru, data.historical));
            pru += stock.qte * stock.pru;
            for (const hist of data.historical) {
                if (masterPortfolio.has(hist.date)) {
                    masterPortfolio.set(hist.date, masterPortfolio.get(hist.date) + hist.close * stock.qte);
                    pruPortfolio.set(hist.date, pruPortfolio.get(hist.date) + stock.pru * stock.qte);

                } else {
                    masterPortfolio.set(hist.date, hist.close * stock.qte);
                    pruPortfolio.set(hist.date, stock.pru * stock.qte);
                }
            }
        }
        // this.histData.unshift(new HistData('Portefeuille', 1, pru, Array.from(masterPortfolio)));
        const gainPortfolio = [];
        for (const line of masterPortfolio) {
            gainPortfolio.push([line[0], (line[1] / pruPortfolio.get(line[0]) - 1) * 100]);
        }
        this.histData.unshift(new HistData('Portefeuille', 1, 0, gainPortfolio));
        this.histDataSubject.next(this.histData);
    }

    addStock(params) {
        params.userId = this.authentificationService.user.id;
        this.http.post<any>(this.backendUrl + 'stock', {data: JSON.stringify(params)}).subscribe(() => {
            this.emitPorfolio();
        });
    }

    deleteStock(stockId) {
        this.http.delete<any>(this.backendUrl + 'stock/' + stockId).subscribe(() => {
            this.emitPorfolio();
        });
    }

    search(text) {
        return this.http.get<any>(this.searchUrl + text + '&limit=3&exchange=EURONEXT');
    }
}
