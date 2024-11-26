import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { AccountComponent } from './components/account/account.component';
import { loggedGuard } from './guards/logged.guard';
import { notLoggedGuard } from './guards/not-logged.guard';
import { adminGuard } from './guards/admin.guard';
import { notEnabledSpecGuard } from './guards/not-enabled-spec.guard';
import { validAccountGuard } from './guards/valid-account.guard';
import { SpecialistNotEnabledComponent } from './components/specialist-not-enabled/specialist-not-enabled.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { notSpecGuard } from './guards/not-spec.guard';
import { NewAppointmentComponent } from './components/appointments/new-appointment/new-appointment.component';
import { ListAppointmentComponent } from './components/appointments/list-appointment/list-appointment.component';
import { MyPatientsComponent } from './components/my-patients/my-patients.component';
import { PatProfileComponent } from './components/pat-profile/pat-profile.component';
import { patGuard } from './guards/pat.guard';
import { notPatGuard } from './guards/not-pat.guard';


const routes: Routes = [
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	},
	{
		path: 'home',
		component: HomeComponent
	},
	{
		path: 'iniciarSesion',
		canActivate: [notLoggedGuard],
		component: LoginComponent,
		data:{animate: 'isTop'}
	},
	{
		path: 'registrarse',
		canActivate: [notLoggedGuard],
		component: SignupComponent,
		data:{animate: 'isBottom'}
	},
	{
		path: 'verificar-cuenta',
		canActivate: [loggedGuard],
		component: EmailVerificationComponent
	},
	{
		path: 'habilitar-especialista',
		canActivate: [notEnabledSpecGuard],
		component: SpecialistNotEnabledComponent
	},
	{
		path: 'perfil',
		canActivate: [notPatGuard, validAccountGuard],
		component: AccountComponent,
		data: { animation: 'isLeft'}
	},
	{
		path: 'usuarios',
		canActivate: [adminGuard, validAccountGuard],
		component: UserListComponent,
		data: { animation: 'isRight'}
	},
	{
		path: 'sacar-turno',
		canActivate: [notSpecGuard, validAccountGuard],
		component: NewAppointmentComponent,
		data: { animation: 'isLeft'}
	},
	{
		path: 'ver-turnos',
		canActivate: [validAccountGuard],
		component: ListAppointmentComponent,
		data: { animation: 'isRight'}
	},
	{
		path: 'mis-pacientes',
		canActivate: [ validAccountGuard],
		component: MyPatientsComponent,
		data: { animation: 'isLeft'}
	},
	
	{
		path: 'mi-perfil',
		canActivate: [patGuard, validAccountGuard],
		component: PatProfileComponent,
		data: { animation: 'isLeft'}
	},
	{
		path: 'informes',
		canActivate: [adminGuard, validAccountGuard],
		loadChildren: () => import('./statistics/statistics.module').then(m => m.StatisticsModule),
		data: { animation: 'isLeft'}
	},
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
