import { Component, inject } from '@angular/core';
import { Appointment } from 'src/app/classes/appointment';
import { Patient } from 'src/app/classes/patient';
import { AuthService } from 'src/app/services/auth.service';
import * as pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from "node_modules/@types/pdfmake/interfaces.js";
import { DatePipe } from '@angular/common';
import { Diagnosis } from 'src/app/classes/diagnosis';

const datePipe = new DatePipe('en-US', '-0300');
const pdf = pdfMake;
pdf.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-pat-profile',
	templateUrl: './pat-profile.component.html',
	styleUrls: ['./pat-profile.component.css']
})
export class PatProfileComponent {
	readonly user: Patient;

	constructor() {
		this.user = <Patient>inject(AuthService).LoggedUser;
	}

	async downloadPDF(history: Array<Appointment>) {
		const date = new Date();
		const docDef = {
			pageSize: 'A4',
			pageOrientation: 'landscape',
			header: {
				columns: [
					{ text: datePipe.transform(date, 'longDate'), margin: [15, 15, 0, 0], alignment: 'left' },
					{
						image: await this.getBase64ImageFromURL('https://img.icons8.com/?size=500&id=43219&format=png&color=000000'),
						fit: [25, 25],
						margin: [15, 15, 0, 0],
						alignment: 'right'
					}
				]
			},
			content: [
				{ text: 'Historial medico', fontSize: 18, bold: true, decoration: 'underline', alignment: 'center', margin: [0, 5, 0, 5] },
				{ text: `${this.user.firstName} ${this.user.lastName}, ${this.user.idNo}`, fontSize: 14, italics: true, alignment: 'center', margin: [0, 5, 0, 30] },
				{
					layout: 'lightHorizontalLines',
					table: {
						headerRows: 1,
						widths: history.length > 0 ? [100, 100, 150, 125, '*'] : ['*'],
						body: this.parseAppointments(history)
					}
				}
			],
		};

		pdf.createPdf(<TDocumentDefinitions>docDef).download(`${this.user.firstName}_${this.user.lastName}_historial_medico.pdf`);
	}

	parseAppointments(appts: Array<Appointment>): Array<Array<any>> {
		let bodyRows: Array<Array<any>> = []
		if (appts.length > 0) {
			bodyRows.push([
				{ text: 'Fecha', bold: true, fontSize: 13 },
				{ text: 'Especialidad', bold: true, fontSize: 13 },
				{ text: 'Especialsta', bold: true, fontSize: 13 },
				{ text: "Reseña del especialista", bold: true, fontSize: 13 },
				{ text: 'Diagnóstico', bold: true, fontSize: 13 }
			]);
			for (const appt of appts) {
				const row: Array<any> = [
					{ text: datePipe.transform(appt.date, 'YYYY/MM/dd, HH:mm')! + 'hs' },
					{ text: appt.specialty.value, italics: true },
					`${appt.specialist.lastName}, ${appt.specialist.firstName}`,
					appt.specReview,
					Diagnosis.getData(appt.diagnosis!),
				]

				bodyRows.push(row);
			}
		} else
			bodyRows.push([
				{ text: 'No hay historial medico para mostrarte.', italics: true }
			]);

		return bodyRows;
	}

	private getBase64ImageFromURL(url: string) {
		return new Promise((resolve, reject) => {
			var img = new Image();
			img.setAttribute("crossOrigin", "anonymous");

			img.onload = () => {
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;

				var ctx = canvas.getContext("2d");
				ctx?.drawImage(img, 0, 0);

				var dataURL = canvas.toDataURL("image/png");

				resolve(dataURL);
			};

			img.onerror = error => {
				reject(error);
			};

			img.src = url;
		});
	}

}
