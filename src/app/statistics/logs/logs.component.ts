import { Component } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Log } from 'src/app/environments/environment';
import { DatabaseService } from 'src/app/services/database.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { DatePipe } from '@angular/common';

const pdf = pdfMake;
pdf.vfs = pdfFonts.pdfMake.vfs;
const datePipe = new DatePipe('en-US', '-0300');

import { RoleTransformPipe } from 'src/app/pipes/role-transform.pipe';
@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent {
	readonly logs: Array<Log> = [];

    constructor(private db: DatabaseService, private roleTransformPipe: RoleTransformPipe) {
		this.db.listenColChanges<Log>(
			'logs',
			this.logs,
			undefined,
			((l1: Log, l2: Log) => l1.date > l2.date ? -1 : 1),
			async log => { log.date = log.date instanceof Timestamp ? log.date.toDate() : log.date; return log; }
		);
	}

	downloadLogs() {
        const logRows = this.logs.map(log => ([
            `${log.user.firstName} ${log.user.lastName}`,
            this.roleTransformPipe.transform(log.user.role ? log.user.role : ''),
            log.user.idNo ? log.user.idNo.toString() : '',
            log.user.age ? log.user.age.toString() : '',
            log.user.email ? log.user.email : '',
            log.date ? datePipe.transform(log.date, 'dd/MM/YYYY, HH:mm:ss') as string : ''
        ]));

        const docDef: TDocumentDefinitions = {
            content: [
                {text: 'Logs', style: 'header', alignment: 'center', margin: [0, 0, 0, 10]},
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [{text: 'User', style: 'tableHeader'}, {text: 'Role', style: 'tableHeader'}, {text: 'Pers. ID', style: 'tableHeader'}, {text: 'Edad', style: 'tableHeader'}, {text: 'Email', style: 'tableHeader'}, {text: 'Date', style: 'tableHeader'}],
                            ...logRows
                        ]
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 20,
                    bold: true
                },
                tableHeader: {
                    bold: true,
                    fontSize: 15,
                    color: 'black'
                },
                tableCell: {
                    fontSize: 8
                }
            },
            defaultStyle: {
                fontSize: 10 
            }
        };

        const date = datePipe.transform(new Date(), 'dd-MM-yy');
        pdf.createPdf(docDef).download(`logs_${date}.pdf`);
    }
}
