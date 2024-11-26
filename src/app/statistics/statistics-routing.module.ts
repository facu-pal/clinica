import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformesComponent } from './informes/informes.component';
const routes: Routes = [
	{
		path: 'informes',
		component: InformesComponent
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
