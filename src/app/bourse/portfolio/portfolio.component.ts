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
    masterPortfolio = {cours: null, pru: null, value: null};
    filterIsn;

    constructor(private bourseService: BourseService) {
    }

    ngOnInit(): void {
        this.portfolioSub = this.bourseService.portfolioSubject.subscribe((value) => {
            this.portfolio = value;
            let pru = 0;
            let cours = 0;
            for (let stock of this.portfolio) {
                pru += stock.pru * stock.qte;
                cours += stock.qte * stock.cours
            }
            this.masterPortfolio.cours = cours;
            this.masterPortfolio.pru = pru;
            this.masterPortfolio.value = (cours / pru - 1) * 100;
        });
        this.bourseService.emitPorfolio();
    }

    ngOnDestroy(): void {
        this.portfolioSub.unsubscribe();
    }

    addStock(form: NgForm) {
        let tmp = $('.mustNumber');
        let err = false;
        for (let inp of tmp) {
            if (isNaN($(inp).val())) {
                $(inp).next().show();
                err = true;
            } else {
                $(inp).next().hide();

            }
        }
        if (!form.invalid && !err) {
            this.bourseService.addStock(form.value);
            $('mustNumberError').hide();
            form.resetForm();
        }
    }

    deleteStock(stockId) {
        this.bourseService.deleteStock(stockId);
    }

    toggleForm() {
        $('.form').toggle();
        $('.showForm').toggle();
    }

    ISNChange($event) {
        this.filterIsn = this.bourseService.search($(event.target).val());
    }

}
