import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { RegistrarseComponent } from './componentes/registrarse/registrarse.component';
import { PageNotFoundComponent } from './componentes/page-not-found/page-not-found.component';
import { HomeComponent } from './componentes/home/home.component';


export const routes: Routes = [
   // { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: HomeComponent },

    {path: 'registrarse', component:RegistrarseComponent},
    {path: 'login', component:LoginComponent},

    //{ path: '**', component: PageNotFoundComponent },


];
