import {Budget} from './budget.model';


export class Compte {
  public budgetTotal;
  public budgetDepense;
  public budgets: Array<Budget> = [];

  constructor(public id: any, public nom: string,  public description: string, public createurPrenom: string, public createurNom: string, public AllBudgets: Array<Budget>) {
    const date = new Date();
    this.selectMonth(date);
  }

  selectMonth(date: Date) {
    this.budgets = [];
    this.budgetTotal = 0;
    this.budgetDepense = 0;
    for (const bud of this.AllBudgets) {
      if (new Date(bud.date).getMonth() === date.getMonth() && new Date(bud.date).getFullYear() === date.getFullYear()){
        this.budgets.push(bud);
        this.budgetTotal += parseInt(bud.montant);
        this.budgetDepense += parseInt(bud.montant) - parseInt(bud.montantRestant);
      }
    }
  }
}
