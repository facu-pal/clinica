import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { Appointment } from 'src/app/classes/appointment';
import { Patient } from 'src/app/classes/patient';
import { Specialist } from 'src/app/classes/specialist';
import { User } from 'src/app/classes/user';
import { Loader, ToastError, ToastSuccess } from 'src/app/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { Specialty } from 'src/app/classes/specialty';

const apptDbPath = 'appointments';
const usersDbPath = 'users';
@Component({
	selector: 'app-new-appointment',
	templateUrl: './new-appointment.component.html',
	styleUrls: ['./new-appointment.component.css'],
	providers: [DatePipe]
})
export class NewAppointmentComponent {
    private appointments: Array<Appointment> = [];

    user: User;
    specialtyArray: Array<Specialty> = [];
    specialists: Array<Specialist> = [];
    availableSpecialties: Array<Specialty> = []; 
    private availableDates: Array<Date> = [];
    groupedDates: Array<[string, Date]> = [];
    selectedDayAvHours: Array<Date> = [];

    constructor(private db: DatabaseService, private router: Router, private datePipe: DatePipe) {
        this.user = inject(AuthService).LoggedUser!;
    }

    patientIdNo: number = 0;
    patient: Patient | null = null;
    specialty: Specialty | null = null;
    specialist: Specialist | null = null;
    dateChosen: Date | null = null;

    private readonly timestampParse = async (appt: Appointment) => {
        appt.date = appt.date instanceof Timestamp ? appt.date.toDate() : appt.date;
        return appt;
    }
    async ngOnInit() {
        Loader.fire();
        if (this.user.role === 'patient') {
            this.patientIdNo = this.user.idNo;
            this.patient = this.user as Patient;
        }

        this.db.listenColChanges<Appointment>(apptDbPath, this.appointments, undefined, undefined, this.timestampParse);
        this.db.listenColChanges<Specialty>('specialties', this.specialtyArray);
        this.db.listenColChanges<Specialist>(usersDbPath, this.specialists, (usr => usr.role === 'specialist' && (usr as Specialist).isEnabled));

        Loader.close();
    }

    lookUpPatient() {
        this.db.searchUserByIdNo(this.patientIdNo)
            .then(user => {
                if (user.role !== 'patient')
                    throw new Error('Esta identificación no pertenece a ningún paciente');

                const patient = user as Patient;
                ToastSuccess.fire({ title: `${patient.firstName} ${patient.lastName}, ${patient.healthPlan.value}` });
                this.patient = patient;
            })
            .catch((error: any) => {
                this.patient = null;
                this.specialist = null;
                ToastError.fire({ title: 'Oops...', text: error.message });
            });
    }

    async selectSpecialty(specialty: Specialty | null) {
        this.specialty = specialty;
        this.specialist = null;
        this.groupedDates = [];
        this.availableDates = [];
        if (!specialty) return;

        this.specialists = this.specialists.filter(spec => spec.specialties.some(s => s.id === specialty.id));
    }
    selectSpecialist(specialist: User | null) {
      this.specialist = specialist as Specialist;
      this.groupedDates = [];
      this.availableDates = [];
      if (!specialist) {
          this.availableSpecialties = [];
      } else {
          const allDates = this.getAllSpecDates();
          const existingAppts = this.appointments.filter(appt =>
              appt.specialist.id == this.specialist!.id
              && appt.specialty.id == this.specialty!.id
              && appt.status !== 'cancelled');

          const takenDates = existingAppts.map(appt => appt.date instanceof Timestamp ? appt.date.toDate() : appt.date);
          this.availableDates = allDates.filter(date => !takenDates.some(apptDate => apptDate.getTime() === date.getTime()));

          this.groupDatesByDay();
      }
  }

  private getAllSpecDates(): Array<Date> {
      let datesArray: Array<Date> = [];

      // Obtener horas y minutos de inicio del turno
      let [hoursStartStr, minutesStartStr] = this.specialist!.shiftStart.split(':');
      const hoursStart = parseInt(hoursStartStr, 10);
      const minutesStart = parseInt(minutesStartStr, 10);

      // Obtener horas y minutos de fin del turno
      let [hoursEndStr, minutesEndStr] = this.specialist!.shiftEnd.split(':');
      const hoursEnd = parseInt(hoursEndStr, 10);
      const minutesEnd = parseInt(minutesEndStr, 10);

      // Fecha de inicio: el próximo día laborable del especialista a la hora de inicio del turno
      let startDate: Date = new Date();
      startDate.setDate(startDate.getDate() + 1); // Día siguiente
      startDate.setHours(hoursStart, minutesStart, 0, 0);

      // Fecha de fin: 15 días después de la fecha de inicio a la hora de fin del turno
      let endDate: Date = new Date(startDate);
      endDate.setDate(endDate.getDate() + 15); // 15 días a partir del día siguiente
      endDate.setHours(hoursEnd, minutesEnd, 0, 0);

      let auxDate: Date = new Date(startDate);

      while (auxDate < endDate) {
          if (this.specialist!.workingDays.includes(auxDate.getDay())) {
              let tempDate: Date = new Date(auxDate);
              // Generar fechas y horas dentro del horario laboral del especialista
              while (tempDate.getHours() < hoursEnd || (tempDate.getHours() === hoursEnd && tempDate.getMinutes() < minutesEnd)) {
                  datesArray.push(new Date(tempDate));
                  tempDate.setMinutes(tempDate.getMinutes() + 15); // Incrementar en intervalos de 15 minutos
              }
          }
          auxDate.setDate(auxDate.getDate() + 1); // Pasar al siguiente día
          auxDate.setHours(hoursStart, minutesStart, 0, 0); // Restablecer a la hora de inicio del turno
      }

      return datesArray; // Devolver todas las fechas disponibles
  }

  private groupDatesByDay() {
      this.groupedDates = this.availableDates.map(date => {
          const dateTimeStr = this.datePipe.transform(date, 'yyyy/MM/dd HH:mm');
          return [dateTimeStr, date] as [string, Date];
      });
  }

  selectTime(date: Date) {
      this.dateChosen = new Date(date); // Asignar directamente la fecha completa
      const fullDate = this.datePipe.transform(date, 'yyyy/MM/dd, HH:mm');
      Swal.fire({
          title: "Confirmar cita",
          text: `${fullDate}; con Dr. ${this.specialist!.lastName}, ${this.specialty!.value}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar"
      }).then((result) => {
          if (result.isConfirmed) {
              const newAppt: any = new Appointment('', this.patient!, this.specialty!, this.specialist!, date, 'pending', '', null, '', null);
              this.db.addDataAutoId(apptDbPath, newAppt);
              Swal.fire({
                  title: "Turno agregado",
                  text: "Te esperamos en Av. Mitre 750.",
                  icon: "success"
              }).then(() => this.router.navigateByUrl('home'));
          }
      });
  }
}

