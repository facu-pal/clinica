import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Appointment } from 'src/app/classes/appointment'; import { Patient } from 'src/app/classes/patient';
import { Specialist } from 'src/app/classes/specialist';
import { User } from 'src/app/classes/user';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';

import { Timestamp } from 'firebase/firestore'; // Asegúrate de importar Timestamp


@Component({
	selector: 'app-my-patients',
	templateUrl: './my-patients.component.html',
	styleUrls: ['./my-patients.component.css']
})
export class MyPatientsComponent {
	myAppointments: Array<Appointment> = [];
	patients: Array<Patient> = [];
	readonly specialist: Specialist;

	constructor(private db: DatabaseService, private dialog: MatDialog) {
		this.specialist = (inject(AuthService).LoggedUser)! as Specialist;
	}

	ngOnInit() {
		this.db.listenColChanges<Appointment>(
		  'appointments',
		  this.myAppointments,
		  (appt: Appointment) => appt.specialist.id === this.specialist.id,
		  (a1: Appointment, a2: Appointment) => {
			const date1 = new Date(a1.date);
			const date2 = new Date(a2.date);
			return date1.getTime() - date2.getTime();
		  }
		);
	  
		this.db.listenColChanges<User>(
		  'users',
		  this.patients,
		  this.patFilter,
		  undefined,
		  async user => user as Patient
		);
	  }
	  

	readonly patFilter = (patient: User) =>
		patient.role === 'patient' && this.myAppointments.some(appt => appt.patient.id === patient.id);

	readonly parsePatient = (user: User) => user as Patient;

	async showMedicalHistory(patient: Patient) {
		const dialogRef = this.dialog.open(PatientHistoryComponent, {
			width: '1200px'
		});

		dialogRef.componentInstance.patient = patient;
	}


	  

	getLastThreeAppointments(patientId: string): Appointment[] {
	  return this.myAppointments
		.filter(appt => appt.patient.id === patientId)
		.map(appt => {
		  const date = (appt.date instanceof Timestamp) ? appt.date.toDate() : new Date(appt.date);
		  console.log('Fecha original:', appt.date);
		  console.log('Fecha convertida:', date);
		  return { ...appt, date: date };
		})
		.sort((a1, a2) => a2.date.getTime() - a1.date.getTime())
		.slice(0, 3);
	}
	
	  
	  
	  
}
