import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthentificationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import * as $ from 'jquery';
@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit {

  constructor(private  authenticationSerive: AuthentificationService, private router : Router) { }

  ngOnInit(): void {
    $('.notSamePassword').hide();
    $('#alertInscription').hide();

  }


  async inscription(form: NgForm){
    if (form.value.password !== form.value.passwordConf){
      $('.notSamePassword').show();
    }else{
      $('.notSamePassword').hide();
    }
    if (!form.invalid){

      const result = await this.authenticationSerive.inscription(form.value);

      if ( !result.error &&  result.connection === true){
        this.router.navigate(['Comptes']);
      }else{
        $('#alertInscription').text(result.message).show(1000);
      }
    }

  }
}
