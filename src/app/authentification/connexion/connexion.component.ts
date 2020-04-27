import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthentificationService} from '../../services/authentification.service';
import {Router} from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})

export class ConnexionComponent implements OnInit {

  constructor(private authentificationService: AuthentificationService, private router: Router) {
  }

  ngOnInit(): void {
    $('#alertConnexion').hide();

  }

  // Hide AlertBox
  hideAlert() { 
    $('#alertConnexion').hide(1500);
  }

  async onSubmit(form: NgForm) {

    if (!form.invalid) {
      const data = {email: form.value.email, password: form.value.password};

      const result = await this.authentificationService.connect(data);

      if (result.connection === true) {
        this.router.navigate(['Comptes']);
      } else {
        $('#alertConnexion').text(result.message);
        $('#alertConnexion').show(1000);
      }
    }
  }
}
