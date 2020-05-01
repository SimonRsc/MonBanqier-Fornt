import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Stock} from '../../model/stock.model';
import {BourseService} from '../../services/bourse.service';
import {NgForm} from '@angular/forms';
import * as $ from 'jquery';

@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, OnDestroy {

    portfolioSub: Subscription;
    portfolio: Array<Stock>;

    constructor(private bourseService: BourseService) {
    }

    ngOnInit(): void {
        this.portfolioSub = this.bourseService.portfolioSubject.subscribe((value) => {
            this.portfolio = value;
        });
        this.bourseService.emitPorfolio();
    }

    ngOnDestroy(): void {
        this.portfolioSub.unsubscribe();
    }

    addStock(form: NgForm) {
        this.bourseService.addStock(form.value);
    }

    deleteStock(stockId) {
        this.bourseService.deleteStock(stockId);
    }

    toggleForm() {
        $('.form').toggle();
        $('.showForm').toggle();
    }


}
