import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticsRoutingModule } from './statistics-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { LogsComponent } from './logs/logs.component';
import { ChartComponent } from './chart/chart.component';
import { StatsComponent } from './stats/stats.component';
import { FormsModule } from '@angular/forms';

import { InformesComponent } from './informes/informes.component';

import { ScrollableDirective } from '../directives/scrollable.directive';
import { RoleTransformPipe } from 'src/app/pipes/role-transform.pipe';

@NgModule({
	declarations: [
		LogsComponent,
		ChartComponent,
		StatsComponent,
		InformesComponent,
		RoleTransformPipe,
		ScrollableDirective
	],
	imports: [
		CommonModule,
		FormsModule,
		StatisticsRoutingModule,
		NgChartsModule,
	],
	providers: [
		RoleTransformPipe
	]

})
export class StatisticsModule { }
