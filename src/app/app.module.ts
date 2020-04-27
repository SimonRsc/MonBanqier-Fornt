import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthentificationComponent} from './authentification/authentification.component';
import {ConnexionComponent} from './authentification/connexion/connexion.component';
import {DeconnexionComponent} from './authentification/deconnexion/deconnexion.component';
import {InscriptionComponent} from './authentification/inscription/inscription.component';
import {ListeComptesComponent} from './liste-comptes/liste-comptes.component';

import {AuthentificationService} from './services/authentification.service';
import {AuthGuard} from './services/authentification-guard.service';
import {ListComptesService} from './services/list-comptes.service';
import {MainViewComponent} from './main-view/main-view.component';
import {ListeOperationsComponent} from './liste-operations/liste-operations.component';
import {ViewComponent} from './defaultBudget/view/view.component';
import {ModificationComponent} from './defaultBudget/modification/modification.component';
import {NavigationComponent} from './navigation/navigation.component';
import {AuthInterceptor} from './services/authentificationInterceptor';

@NgModule({
  declarations: [
    AppComponent,
    AuthentificationComponent,
    ConnexionComponent,
    DeconnexionComponent,
    InscriptionComponent,
    ListeComptesComponent,
    MainViewComponent,
    ListeOperationsComponent,
    ViewComponent,
    ModificationComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [AuthentificationService, ListComptesService, AuthGuard, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]

})
export class AppModule {
}
