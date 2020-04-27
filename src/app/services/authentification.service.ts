import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user.model';
import * as moment from 'moment';
import {Router} from '@angular/router';
import * as cryptoJS from 'crypto-js';

@Injectable()
export class AuthentificationService {
  user: User;
  isAuth: boolean;

  constructor(private http: HttpClient, private router: Router) {
    this.isAuth = false;
    this.user = null;
  }
  async inscription(params){
    let result = {error: false, message: '', connection: false};

    const identifiant = {nom: params.nom, prenom: params.prenom, password: cryptoJS.SHA256(params.password).toString(), email: params.email};
    try {
      await this.http.post<any>('http://localhost:3000/connect/new', {data: JSON.stringify(identifiant)}).toPromise();
    }
    catch (e) {
      result.error = true;
      result.message = e.error.message;
      return result;
    }

    if (result.error == false){
      const connection = await this.connect({email: params.email, password: params.password});
      if (connection.connection === true){
        result.connection = true;
      }
    }
    return result;
  }
  async connect(identifiant) {
    identifiant.password = cryptoJS.SHA256(identifiant.password).toString();
    const result = {
      error: false,
      connection: false,
      message: 'Identifiants incorrects ! Vérifiez votre adresse mail et mot de passe'
    };
    const data = await this.http.post<any>('http://localhost:3000/connect',
      {data: JSON.stringify(identifiant)}).toPromise().catch((err) => {
      result.error = true;
      result.message =  err.error.message;
    });
    if (data && !result.error && data.user != null) {
      this.user = new User(data.user.id,  data.user.nom, data.user.prenom);
      const expiresAt = moment().add(data.expireAt, 'second');
      localStorage.setItem('id_token', data.token);
      localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
      localStorage.setItem('user', JSON.stringify(this.user));
      result.connection = true;
      return result;
    }
    return result;
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    localStorage.removeItem('expires_at');
    this.router.navigate(['']);
  }

  public isLoggedIn() {
    const login =  moment().isBefore(this.getExpiration());
    if (login && this.user == null){
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    return login;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
}
