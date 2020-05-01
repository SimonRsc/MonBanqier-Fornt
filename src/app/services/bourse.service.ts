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
            this.requestedStocks = '';
            for (const stock of data.stock) {
                this.requestedStocks = this.requestedStocks.concat(stock.stockCode + ',');
            }
            const dataRequest = this.http.get<any>(this.apiUrl + this.requestedStocks);

            dataRequest.subscribe((realTimeData) => {
                this.portfolio = [];
                for (const index in realTimeData) {
                    this.portfolio.push(new Stock(data.stock[index].stockId, data.stock[index].stockPru, data.stock[index].stockQte, data.stock[index].stockBuyingDate, realTimeData[index]));
                }
                this.portfolioSubject.next(this.portfolio);
                this.emitHistData();
            });
        });
    }

    emitHistData() {
        this.histData = [];
        for (let stock of this.portfolio) {
            this.http.get<any>(this.histUrl + stock.symbol + '?serietype=line&from=' + stock.date).subscribe((data) => {
                this.histData.push(new HistData(stock.symbol,stock.qte, data.historical));
                this.histDataSubject.next(this.histData);
            });
        }
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

}
