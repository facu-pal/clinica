import { Component, Input, inject,AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Admin } from 'src/app/classes/admin';
import { Patient } from 'src/app/classes/patient';
import { Specialist } from 'src/app/classes/specialist';
import { User } from 'src/app/classes/user';
import { Loader, ToastError, ToastSuccess } from 'src/app/environments/environment';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';
import { AuthService } from 'src/app/services/auth.service';
import * as XLSX from 'xlsx';
import { Appointment } from 'src/app/classes/appointment';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
	readonly userInSession: Patient | Specialist | Admin;
	users: Array<User> = [];
	filteredUsers: Array<User> = [];
	@Input() dbColPath: string = 'users';

	@Input() userFilter: ((user: User) => boolean) | undefined;
	creatingUser: boolean = false;

	showAdmins: boolean = true;
	showSpecialists: boolean = true; 
	showPatients: boolean =true;

	constructor(private db: DatabaseService, private dialog: MatDialog) {
		this.userInSession = inject(AuthService).LoggedUser!;
	}


	async ngOnInit() {
		// Escuchar cambios en la colección de usuarios
		this.db.listenColChanges<User>(
		  this.dbColPath,
		  this.users,
		  this.userFilter,
		  (u1: User, u2: User) => u1.lastName > u2.lastName ? 1 : -1,
		  this.userMap
		);
	  }
	
	  ngAfterViewInit() {
		// Esperar un momento para que los datos se carguen
		setTimeout(() => {
		  this.filteredUsers = [...this.users]; // Inicializar usuarios filtrados con todos los usuarios cargados
		  this.filterUsers(); // Aplicar filtros iniciales
		}, 1000); // Ajustar el tiempo según sea necesario
	  }

	private readonly userMap = async (user: User) => {
		switch (user.role) {
			case 'patient':
				return user as Patient;
			case 'specialist':
				return user as Specialist;
			case 'admin':
				return user as Admin;
		}
	};

	filterUsers() { 
		this.filteredUsers = this.users.filter(user => { 
		  if (user.role === 'admin' && !this.showAdmins) return false;
		  if (user.role === 'specialist' && !this.showSpecialists) return false; 
		  if (user.role === 'patient' && !this.showPatients) return false;
		  return true; 
		}); 
	}

	parseSpecialist = (user: User) => {
		return user as Specialist;
	}

	showSpecs(user: User) {
		if (user.role !== 'specialist') return;

		const specialist = user as Specialist;
		let specsStr: string = "";
		for (const spec of specialist.specialties) {
			specsStr += '+ ' + spec.value + '<br>';
		}

		Swal.fire(`Dr. ${specialist.lastName} is:`, specsStr, 'info');
	}

	async toggleEnable(user: User) {
		if (user.role !== 'specialist') return;

		const specialist = user as Specialist;
		const newValue = !specialist.isEnabled;
		Loader.fire();
		await this.db.updateDoc('users', specialist.id, { isEnabled: newValue })
			.then(() => {
				const status = newValue ? 'enabled' : 'disabled';
				ToastSuccess.fire('Done!', `Specialist #${specialist.idNo} ${status}!`);
				specialist.isEnabled = newValue;
			})
			.catch((error) => { ToastError.fire({ title: 'Oops...', text: error.message }); });
	}

	async showMedicalHistory(user: User) {
		if (user.role !== 'patient') return;

		const patient = user as Patient;
		const dialogRef = this.dialog.open(PatientHistoryComponent, {
			width: '1200px'
		});

		dialogRef.componentInstance.exportBtn = true;
		dialogRef.componentInstance.exportBtnText = 'Descargar Excel';
		dialogRef.componentInstance.patient = patient;

		dialogRef.afterClosed().subscribe(list => {
			if (list) {
				const parsedList = this.parseList(list);
				this.downloadXlsx(parsedList, `${patient.firstName}_${patient.lastName}_Historial_medico.xlsx`);
			}
		});
	}



	// Agrega este método en tu componente
	async descargarHistoriaClinica(user: User) {
		if (user.role !== 'patient') return;
	
		const paciente = user as Patient;
	
		Swal.fire({
			title: '¿Estás seguro?',
			text: "¿Deseas descargar esta historia clínica?",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí',
			cancelButtonText: 'No'
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const listaDeCitas = await this.db.obtenerHistorialMedico(paciente.id);
					const listaParseada = this.parseList(listaDeCitas);
					this.downloadXlsx(listaParseada, `${paciente.firstName}_${paciente.lastName}_Historial_medico.xlsx`);
					ToastSuccess.fire('¡Descarga exitosa!', 'La historia clínica ha sido descargada.');
				} catch (error) {
					ToastError.fire({ title: 'Oops...', text: 'Hubo un problema al descargar la historia clínica.' });
				}
			}
		});
	}
	




	

	parseList(list: Array<Appointment>) {
		const formattedList: Array<any> = [];
		if (list.length > 0) {
			for (const appt of list) {
				formattedList.push(
					{
						Date: appt.date,
						Specialty: appt.specialty.value,
						Specialist: `${appt.specialist.lastName}, ${appt.specialist.firstName}`,
						Review: appt.specReview,
						Height: appt.diagnosis?.height,
						Weight: appt.diagnosis?.weight,
						Blood_pressure: appt.diagnosis?.pressure,
						Temperature: appt.diagnosis?.tempC,
						Diag_data1: `${appt.diagnosis?.additionalData[0].key}: ${appt.diagnosis?.additionalData[0].value}`,
						Diag_data2: `${appt.diagnosis?.additionalData[1].key}: ${appt.diagnosis?.additionalData[1].value}`,
						Diag_data3: `${appt.diagnosis?.additionalData[2].key}: ${appt.diagnosis?.additionalData[2].value}`
					}
				)
			}
		} else {
			formattedList.push({specialist: 'No hay citas para mostrar.'});
		}

		return formattedList;
	}

	downloadXlsx(json: any, fileName: string) {
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

		XLSX.utils.book_append_sheet(wb, ws);
		XLSX.writeFile(wb, fileName);
	}

	newAccount(user: Patient | Specialist | Admin) {
		ToastSuccess.fire('User created!', `${user.role} #${user.idNo}.`);
		this.creatingUser = false;
	}


}
