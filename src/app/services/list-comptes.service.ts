import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
import {Compte} from '../model/compte.model';
import {Budget} from '../model/budget.model';
import {Operation} from '../model/operation.model';
import {AuthentificationService} from './authentification.service';
import {Observable} from "rxjs";

@Injectable()
export class ListComptesService {
  private comptes: Array<Compte> = [];
  urlCompte = 'https://monbanquier-backend.herokuapp.com/api/comptes';
  urlOperation = 'https://monbanquier-backend.herokuapp.com/api/operations/';
  urlBudget = 'https://monbanquier-backend.herokuapp.com/api/budgets/';
  urlBudgetModel = 'https://monbanquier-backend.herokuapp.com/api/budgets/models/';
  private month: any;
  private compte: Compte;
  comptesSubject = new Subject<Array<Compte>>();
  selectedCompte = new Subject<any>();
  selectedMonth = new Subject<any>();


  constructor(private http: HttpClient, private authentificationService: AuthentificationService) {
    const date = new Date();
    this.month = date.getMonth() + 1;

  }

  async emitCompte() {
    this.comptes = [];
    await this.getAllCompteFromUser();
    if (this.comptes !== null && this.comptes.length !== 0) {
      this.comptesSubject.next(this.comptes.slice());

    }

  }

  emitSelectedCompte(value) {
    if (this.comptes !== null && this.comptes.length !== 0) {
      if (value != null) {
        this.compte = value;
      } else {
        this.compte = this.comptes[0];
      }
      if (this.compte != null) {
        this.selectedCompte.next(this.compte);

      }
    }
  }

  emitSelectedMonth(date: Date) {
    if (this.compte != null) {
      if (date != null) {
        this.month = date.getMonth() + 1;

        this.compte.selectMonth(date);
        this.emitSelectedCompte(this.compte);
      }

      this.selectedMonth.next(this.month);
    }
  }


  async getAllCompteFromUser() {
    const result = await this.http.get<any>(this.urlCompte + '/user/' + this.authentificationService.user.id).toPromise();

    for (const index in result.data) {
      const obj = result.data[index];
      const budgets = await this.getAllBudget(obj);
      const budgetArray = [];
      for (const bud of budgets) {
        const operationArray = [];
        for (const op of bud.operations) {
          operationArray.push(new Operation(op.opId, op.opDescription, op.opDate, op.opMontant, op.opUserId));
        }
        budgetArray.push(new Budget(bud.budgetId, bud.budgetNom, bud.budgetDate, bud.budgetMontant, bud.budgetUserId, operationArray));
      }
      this.comptes.push(new Compte(obj.compteId, obj.compteNom, obj.compteDescription,  obj.userPrenom, obj.userNom, budgetArray));
    }
  }


  async getAllBudget(compte): Promise<Array<any>> {
    const budgets = await this.http.get<any>(this.urlBudget + compte.compteId).toPromise();
    return budgets.budgets;
  }

  async deleteCompte(compteId) {
    const result = {error: false, message: 'Le compte a bien été supprimé'};
    await this.http.delete<any>(this.urlCompte + '/' + this.authentificationService.user.id + '/' + compteId).toPromise().catch((error) => {
      result.error = true;
      result.message = error.error.message;
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[0]);
    }
    return result;
  }

  async createCompte(info) {
    const param = {nom: info.nom, description: info.description, userId: this.authentificationService.user.id};
    const result = {error: false, message: info.nom + ' a bien été créée'};
    await this.http.post<any>(this.urlCompte, {data: JSON.stringify(param)}).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez !';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.comptes.length - 1]);
    }
    return result;
  }

  async modifyCompte(infos) {
    const result = {error: false, message: 'Une erreur est survenue, réessayer !'};
    await this.http.put<any>(this.urlCompte + '/' + this.authentificationService.user.id, {data: JSON.stringify(infos)}).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez !';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.comptes.length - 1]);
    }
    return result;
  }

  async modifyBudget(infos) {
    const result = {error: false, message: 'Une erreur est survenue, réessayer !'};
    await this.http.put<any>(this.urlBudget, {data: JSON.stringify(infos)}).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez !';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.getIndexOfCompte(this.compte)]);
    }
    return result;
  }

  async addOperation(data) {
    const result = {error: false, message: 'L\'opération n\'a pas pu être créée'};
    const param = {description: data.description, montant: data.montant, userId: this.authentificationService.user.id};
    await this.http.post<any>(this.urlOperation + data.budgetId, {data: JSON.stringify(param)}).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez!';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.getIndexOfCompte(this.compte)]);
    }
    return result;
  }

  async deleteOperation(op) {
    const result = {error: false, message: 'L\'opération n\'a pas pu être supprimée'};
    await this.http.delete<any>(this.urlOperation + op.id).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez!';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.getIndexOfCompte(this.compte)]);
    }
    return result;
  }

  async deleteBudget(bud) {
    const result = {error: false, message: 'Le budget n\'a pas pu être supprimé'};
    await this.http.delete<any>(this.urlBudget + bud.id).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez!';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.getIndexOfCompte(this.compte)]);
    }

    return result;
  }


  async addBudget(infos) {
    const result = {error: false, message: 'Le budget n\'a pas pu être ajouté'};
    if (infos.model == null) {
      infos.model = false;
    }
    const params = {
      nom: infos.nom,
      userId: this.authentificationService.user.id,
      montant: infos.montant,
      model: infos.model
    };
    await this.http.post<any>(this.urlBudget + infos.compteId, {data: JSON.stringify(params)}).toPromise().catch((error) => {
      result.error = true;
      result.message = 'Une erreur c\'est produite, réessayez!';
    });
    if (!result.error) {
      await this.emitCompte();
      this.emitSelectedCompte(this.comptes[this.getIndexOfCompte(this.compte)]);
    }
    return result;
  }

  getModelBudgets(compteId): Observable<any> {
    return this.http.get<Array<Budget>>(this.urlBudgetModel + compteId);
  }

  getIndexOfCompte(compte: Compte): any {
    let index = 0;
    for (const cpt of this.comptes) {
      if (cpt.id == compte.id) {
        return index;
      }
      index++;
    }
    console.log('Not found');
    return -1;
  }

  getShareLink(): Observable<any> {
    return this.http.post<any>(this.urlCompte + '/share/get', {
      data: JSON.stringify({
        compteId: this.compte.id,
        userId: this.authentificationService.user.id
      })
    });
  }

  async addShareCompte(token) {
    let result = {error: false, message: ''};

    await this.http.post<any>(this.urlCompte + '/share/use', {
      data: JSON.stringify({
        token: token,
        userId: this.authentificationService.user.id
      })
    }).toPromise().catch((error) => {
      result.error = true;
      result.message = error.error.message;
    });
    await this.emitCompte();
    return result;
  }

}
