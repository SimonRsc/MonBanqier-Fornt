import { Component, OnInit } from '@angular/core';
import {AuthentificationService} from '../services/authentification.service';
import {User} from "../model/user.model";
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  public user: User;
  constructor(private authService: AuthentificationService) {
    this.user = authService.user;
  }

  ngOnInit(): void {
  }


  deconnexion(){
    this.authService.logout();
  }

}
