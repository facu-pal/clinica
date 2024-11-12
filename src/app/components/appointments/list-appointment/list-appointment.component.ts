import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Appointment, ApptStatus } from 'src/app/classes/appointment';
import { Patient } from 'src/app/classes/patient';
import { InputSwal, Loader, ToastSuccess } from 'src/app/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ApptSurveyComponent } from '../appt-survey/appt-survey.component';
import { Timestamp } from 'firebase/firestore';
import { ApptDiagnosisComponent } from '../appt-diagnosis/appt-diagnosis.component';
import { Diagnosis } from 'src/app/classes/diagnosis';
import { User } from 'src/app/classes/user';

const apptDbPath = 'appointments';
@Component({
	selector: 'app-list-appointment',
	templateUrl: './list-appointment.component.html',
	styleUrls: ['./list-appointment.component.css']
})
export class ListAppointmentComponent {
	user: User;
	readonly appointments: Array<Appointment> = [];
	appointmentsToShow: Array<Appointment> = [];
	private readonly apptRoleFilter: (appt: Appointment) => boolean;

	constructor(private db: DatabaseService, private dialog: MatDialog) {
		this.user = inject(AuthService).LoggedUser!;

		switch (this.user.role) {
			case 'patient':
				this.apptRoleFilter = (appt: Appointment) => appt.patient.id === this.user.id;
				break;
			case 'specialist':
				this.apptRoleFilter = (appt: Appointment) => appt.specialist.id === this.user.id;
				break;
			case 'admin':
				this.apptRoleFilter = (appt: Appointment) => appt !== null;
				break;
		}
	}

	private readonly dateSort = (a: Appointment, b: Appointment) => a.date > b.date ? 1 : -1;
	private readonly timestampParse = async (appt: Appointment) => {
		appt.date = appt.date instanceof Timestamp ? appt.date.toDate() : appt.date;
		return appt;
	}
	async ngOnInit() {
		Loader.fire();
		this.db.listenColChanges<Appointment>(apptDbPath, this.appointments, this.apptRoleFilter, this.dateSort, this.timestampParse);

		this.appointmentsToShow = this.appointments;
		Loader.close();
	}

	getBgClassApptStatus(status: ApptStatus) {
		switch (status) {
			case 'pending':
				return 'bg-warning';
			case 'accepted':
				return 'bg-success';
			case 'done':
				return 'bg-info';
			default:
				return 'bg-danger';
		}
	}
}