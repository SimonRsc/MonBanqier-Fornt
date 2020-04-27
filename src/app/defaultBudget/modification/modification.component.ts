import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Compte} from '../../model/compte.model';
import {Budget} from '../../model/budget.model';
import {ListComptesService} from '../../services/list-comptes.service';
import {NgForm} from '@angular/forms';
import * as $ from 'jquery';

@Component({
  selector: 'app-modification',
  templateUrl: './modification.component.html',
  styleUrls: ['./modification.component.scss']
})
export class ModificationComponent implements OnInit, OnDestroy {

  selectedCompteSubscription: Subscription;
  selectedCompte: Compte;
  modelBudget: Array<any> = [];
  budgetTotal = 0;

  constructor(private listCompteService: ListComptesService) {

  }

  ngOnInit(): void {
    this.selectedCompteSubscription = this.listCompteService.selectedCompte.subscribe(
      (value) => {
        if (value != null){
          this.selectedCompte = value;
          this.updateModelBudgets(value.id);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.selectedCompteSubscription.unsubscribe();
  }

  updateModelBudgets(value) {
    this.listCompteService.getModelBudgets(value).subscribe((data) => {
      const arr = [];
      this.budgetTotal = 0;
      for (const budget of data) {
        this.budgetTotal += parseInt(budget.budgetMontant);
        arr.push(new Budget(budget.budgetId, budget.budgetNom, budget.budgetDate, budget.budgetMontant, budget.budgetUserId, []));
      }
      this.modelBudget = arr;
    });
  }

  addModelBudget(form: NgForm) {
    form.value.model = true;
    this.listCompteService.addBudget(form.value);
  }

  deleteBudget(budget: Budget){
    this.listCompteService.deleteBudget(budget);
  }
}
