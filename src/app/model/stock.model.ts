export class Stock {
    public symbol;
    public nom;
    public cours;
    public veillePourcent;
    public gainPourcent;
    public gain;

    constructor(public id, public pru, public qte, public date, public data: any) {
        this.symbol = data.symbol;
        if (this.symbol === 'AI.PA') {
            this.nom = 'Air Liquide';
        } else {
            this.nom = data.name;
        }

        this.cours = data.price;
        this.veillePourcent = data.changesPercentage;
        const montantInitial = parseFloat(this.pru) * parseInt(this.qte);
        this.gain = parseInt(this.qte) * parseFloat(this.cours) - montantInitial;
        this.gainPourcent = ((parseInt(this.qte) * parseFloat(this.cours) / montantInitial) - 1) * 100;
    }
}
