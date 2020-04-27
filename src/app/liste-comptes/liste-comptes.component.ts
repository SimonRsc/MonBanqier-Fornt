import {Component, OnInit, OnDestroy} from '@angular/core';
import {ListComptesService} from '../services/list-comptes.service';
import {Compte} from '../model/compte.model';
import {Subscription} from 'rxjs/Subscription';
import {MainViewComponent} from '../main-view/main-view.component';
import {NgForm} from '@angular/forms';

import * as $ from 'jquery';
import {AuthentificationService} from "../services/authentification.service";
import {User} from "../model/user.model";

@Component({
  selector: 'app-liste-comptes',
  templateUrl: './liste-comptes.component.html',
  styleUrls: ['./liste-comptes.component.scss']
})
export class ListeComptesComponent implements OnInit, OnDestroy {

  comptes: Array<Compte> = []
  compteSubscription: Subscription;
  selectedCompteSubscription: Subscription;
  user: User;
  constructor(private listCompteService: ListComptesService, private authentificationService: AuthentificationService) {
    this.user = this.authentificationService.user;
  }


  async ngOnInit() {
    $('#createCompteForm').hide();
    $('#shareError').hide();
    this.compteSubscription = this.listCompteService.comptesSubject.subscribe(
      (compte: Array<Compte>) => {
        this.comptes = compte;
      }
    );
    await this.listCompteService.emitCompte();
    this.listCompteService.emitSelectedCompte(null);
  }

  ngOnDestroy() {
    this.compteSubscription.unsubscribe();
  }

  selectCompte($event, compte) {
    if ($event.target.tagName !== 'IMG'){
      this.listCompteService.emitSelectedCompte(compte);
    }
  }

  async deleteCompte(compteId) {
    if (confirm('Etes vous sur de vouloir supprimer ce compte ?')) {
      const res = await this.listCompteService.deleteCompte(compteId);
      $('.alertMain').text(res.message);
      if (res.error) {
        $('.alertMain').addClass('alert-danger').removeClass('alert-success').show(1000);
      }
    }
  }

  async createCompte(form: NgForm) {
    if (!form.invalid) {
      const res = await this.listCompteService.createCompte(form.value);
      $('.alertMain').text(res.message);
      if (res.error) {
        $('.alertMain').addClass('alert-danger').removeClass('alert-success').show(1000);
      }
      this.hideForm();
      $('#createCompteForm input').val('');
      form.resetForm();
    }
  }

  async modifyCompte(form: NgForm, compteId) {
    if (!form.invalid){
      form.value.compteId = compteId;
      const res = await this.listCompteService.modifyCompte(form.value);
      $('.alertMain').text(res.message);
      if (res.error) {
        $('.alertMain').addClass('alert-danger').removeClass('alert-success').show(1000);
      }
    }
  }

  showForm() {
    $('#createCompteForm').show(1000);
    $('#ajoutBudget').hide(1000);
  }

  hideForm() {
    $('#createCompteForm').hide(1000);
    $('#ajoutBudget').show(1000);
  }

  showModificationForm(event){
    $(event.target).closest('.compteInfo').hide();
    $(event.target).closest('.compteInfo').next().show();
  }

  hideModificationForm(event){
    $(event.target).closest('.compteModification').hide();
    $(event.target).closest('.compteModification').prev().show();
  }

  async addShare(form: NgForm){
    const result = await this.listCompteService.addShareCompte(form.value.token);
    if (result.error){
      $('#shareError').text(result.message).show();
    }else{
      form.resetForm();
      $('#shareError').hide();
      this.hideForm();
    }
  }

}
