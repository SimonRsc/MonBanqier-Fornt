import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnexionComponent } from './authentification/connexion/connexion.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ViewComponent } from './defaultBudget/view/view.component';
import {AuthGuard } from './services/authentification-guard.service';
import {InscriptionComponent} from './authentification/inscription/inscription.component';
import {BourseComponent} from './bourse/bourse.component';

const routes: Routes = [
  {path: 'Connexion', component: ConnexionComponent},
  {path: 'Inscription',  component: InscriptionComponent},
  {path: 'Comptes', canActivate: [AuthGuard], component: MainViewComponent},
  {path: 'DefaultBudget', canActivate: [AuthGuard], component: ViewComponent},
  {path: 'Bourse', canActivate: [AuthGuard], component: BourseComponent},
  {path: '**', redirectTo: 'Connexion'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
