import {Operation} from './operation.model';

export class Budget {
  public montantRestant;

  constructor(public id: any, public nom: string, public date: Date, public montant: string, public userId: string, public operations: Array<Operation>) {
    let depenses = 0
    for (const operation of operations) {
      depenses += parseInt(operation.montant);
    }
    this.montantRestant = parseInt(this.montant) - depenses;


  }
}
