import {Component, OnInit, OnDestroy} from '@angular/core';
import {ListComptesService} from '../services/list-comptes.service';
import {Subscription} from 'rxjs/Subscription';
import {NgForm} from '@angular/forms';
import * as $ from 'jquery';
import {Compte} from '../model/compte.model';
import {Budget} from '../model/budget.model';

@Component({
  selector: 'app-liste-operations',
  templateUrl: './liste-operations.component.html',
  styleUrls: ['./liste-operations.component.scss']
})
export class ListeOperationsComponent implements OnDestroy, OnInit {
  selectedCompteSubscription: Subscription;
  selectedMonthSubscription: Subscription;
  selectedCompte: Compte;
  selectedMonth: any = new Date().getMonth() + 1;
  currentMonth: any = new Date().getMonth() + 1;
  listDate: Array<any> = [];

  constructor(private listCompteService: ListComptesService) {
    const date = new Date();
    date.setDate(1);
    for (let i = 1; i < 5; i++) {
      this.listDate.push(date.toLocaleString('fr', {month: 'long'}));
      date.setMonth(date.getMonth() - 1);
    }
  }

   ngOnInit() {
     this.selectedCompteSubscription = this.listCompteService.selectedCompte.subscribe(
      (value) => {
        if (value !== null){
          this.selectedCompte = value;

        }
      }
    );
     this.selectedMonthSubscription = this.listCompteService.selectedMonth.subscribe(
      (value) => {
        if (value !== null){
          this.selectedMonth = value;
        }
      }
    );

    this.listCompteService.emitSelectedMonth(null);

  }

  async addOperation(form: NgForm, budgetId, event) {
    if (!form.invalid) {
      if (isNaN($(event.target).find('input.mustNumber').val())){

        $(event.target).find('div.mustNumber').show();
        return;
      }
      form.value.budgetId = budgetId;
      const result = await this.listCompteService.addOperation(form.value);
      if (result.error) {
        $('.alertMain').text(result.message).addClass('alert-danger').removeClass('alert-success').show(1000);
      }
      $(event.target).parent().parent().next().children().children().show();
      form.resetForm();
    }
  }

  async deleteOperation(operation) {
    const result = await this.listCompteService.deleteOperation(operation);
    if (result.error) {
      $('.alertMain').text(result.message).addClass('alert-danger').removeClass('alert-success').show(1000);
    }
  }

  async deleteBudget(budget) {
    if (confirm('Etes vous sur de vouloir supprimer ce budget ?')) {
      const result = await this.listCompteService.deleteBudget(budget);
      if (result.error) {
        $('.alertMain').text(result.message).addClass('alert-danger').removeClass('alert-success').show(1000);
      }
    }

  }

  showForm(event) {
    $(event.target).closest('tr').prev().find('div.mustNumber').hide();
    $(event.target).closest('tr').prev().show();
    $(event.target).closest('tr').hide();


  }

  hideForm(event, form: NgForm) {
    $(event.target).closest('tr').next().show();
    $(event.target).closest('tr').find('input.clearableInput').val('');
    $(event.target).closest('tr').hide();
    form.resetForm();
  }

  ngOnDestroy() {
    this.selectedCompteSubscription.unsubscribe();
    this.selectedMonthSubscription.unsubscribe();
  }

  async addBudget(form: NgForm) {
    if (!form.invalid) {
      if (isNaN($('.addBudgetForm input.mustNumber').val())) {
            $('div.mustNumber').show();
            return;
      }
      if (form.value.compteId == null) {
        form.value.compteId = this.selectedCompte.id;
      }

      const result = await this.listCompteService.addBudget(form.value);
      if (result.error) {
        $('.alertMain').text(result.message).addClass('alert-danger').removeClass('alert-success').show(1000);
      } else {
        $('.clearBudgetInput').val('');
        $('.addBudgetForm').hide().removeClass('d-flex').removeClass('justify-content-between');
        $('.ajoutBudget').show();
        $('div.mustNumber').hide();

        form.resetForm();
      }
    }
  }

  addDefaultBudget() {
    this.listCompteService.getModelBudgets(this.selectedCompte.id).subscribe(async (data) => {
      const arr = [];
      if (data == null || data.length === 0){
        alert('Vous n\'avez aucun budget par défaut');
      }
      for (const budget of data) {
        await this.listCompteService.addBudget({
          compteId: this.selectedCompte.id,
          nom: budget.budgetNom,
          montant: budget.budgetMontant,
          model: false
        });
      }
    });
  }


  selectMonth(event, monthId) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthId);
    $('.activeMonth').removeClass('activeMonth');
    $(event.target).addClass('activeMonth');
    this.listCompteService.emitSelectedMonth(date);
  }

  showBudgetForm() {
    $('.ajoutBudget').hide();
    $('div.mustNumber').hide();
    $('.addBudgetForm').addClass('d-flex').addClass('justify-content-between').show();
    $('.addBudgetForm').addClass('active');
    $('.addBudget').addClass('active');
  }

  hideBudgetForm(form: NgForm) {
    $('.addBudgetForm').removeClass('active');
    $('.addBudget').removeClass('active');
    $('.clearBudgetInput').val('');
    $('div.mustNumber').hide();

    $('.addBudgetForm').hide().removeClass('d-flex').removeClass('justify-content-between');
    $('.ajoutBudget').show();


  }

 async  modifyBudget(form: NgForm, budgetId, event){
    if ( !form.invalid) {
      const params = { budgetId, nom: form.value.modificationNom, montant: form.value.modificationMontant};
      const result = await this.listCompteService.modifyBudget(params);
      if (result.error) {
        $('.alertMain').text(result.message).addClass('alert-dawaitanger').removeClass('alert-success').show(1000);
      }
      this.hideModificationForm(event);
    }


  }

  showModificationForm($event){
    $($event.target).closest('thead').hide();
    $($event.target).closest('form').prev('.budgetModificationFormWrapper').show();
  }
  hideModificationForm($event){
    $($event.target).closest('.budgetModificationFormWrapper').hide();
    $($event.target).closest('.budgetModificationFormWrapper').next().children().children('thead').show();
  }

  async shareLink(){
    this.listCompteService.getShareLink().subscribe((link) => {
      $('#buttonShare').hide();
      const tmpElem = $('<div>');
      tmpElem.css({position: 'absolute', left: '-1000px', top:      '-1000px',});
      // Add the input value to the temp element.
      tmpElem.text(link.token);
      $('body').append(tmpElem);
      const range = document.createRange();
      // Select temp element.
      range.selectNodeContents(tmpElem.get(0));
      let selection = window.getSelection ();
      selection.removeAllRanges ();
      selection.addRange (range);
      // Lets copy.
      document.execCommand ('copy', false, null);
      $('#shareLinkCopy').show();
    });

  }

}
