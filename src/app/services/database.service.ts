import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, where, doc, getDocs, setDoc, deleteDoc, updateDoc, getDoc, DocumentReference, DocumentData, QuerySnapshot, onSnapshot, query } from '@angular/fire/firestore';
import { User } from '../classes/user';
const userPath = 'users';
import { Timestamp } from '@angular/fire/firestore';

import { Appointment } from '../classes/appointment';

@Injectable({
    providedIn: 'root'
})


@Injectable({
	providedIn: 'root'
})
export class DatabaseService {
	constructor(private firestore: Firestore) { }

	async getData<T>(dbPath: string): Promise<Array<T>> {
		const col = collection(this.firestore, dbPath);

		const querySnapshot = await getDocs(col);
		const arrAux: Array<T> = [];

		querySnapshot.forEach((doc) => {
			arrAux.push(doc.data() as T);
		});

		return arrAux;
	}

	async addData(dbPath: string, data: any) {
		const col = collection(this.firestore, dbPath);
		await addDoc(col, { ...data });
	}

	async addDataAutoId(dbPath: string, data: any): Promise<string> {
		const col = collection(this.firestore, dbPath);
		const newDoc = doc(col);
		data.id = newDoc.id;

		try {
			await setDoc(newDoc, { ...data });
		} catch (error) {
			deleteDoc(newDoc);
			throw new Error('Hubo un problema al cargar.', { cause: error });
		}

		return data.id;
	}

	updateDoc(dbPath: string, docId: string, data: any) {
		const docRef = doc(this.firestore, dbPath, docId);

		return updateDoc(docRef, { ...data });
	}

	listenColChanges<T extends { id: string }>(colPath: string, arrayPointer: Array<T>, filterFunc?: (item: T) => boolean, sortFunc?: (a: any, b: any) => number, transform?: (item: T) => Promise<T>) {
		const col = collection(this.firestore, colPath);
		const q = query(col);

		onSnapshot(q, async (addSnap: QuerySnapshot) => {
			for (const change of addSnap.docChanges()) {
				const data = change.doc.data();
				const newData = transform ? await transform(data as T) : data as T;
				if (!filterFunc || filterFunc(newData)) {
					if (change.type === 'added') {
						arrayPointer.push(newData);
					} else {
						const index = arrayPointer.findIndex(t => t.id === newData.id);
						if (change.type === 'modified')
							arrayPointer[index] = newData;
						else
							arrayPointer.splice(index, 1);
					}
				}
			}

			if (sortFunc)
				arrayPointer.sort(sortFunc);
		});
	}

	async searchUserByEmail(email: string): Promise<User> {
		const arrayUsers = await this.getData<User>(userPath);
		const index = arrayUsers.findIndex(u => u.email === email);
		if (index === -1) throw new Error('Este mail no esta registrado.');

		return arrayUsers[index];
	}

	async searchUserByIdNo(idNo: number): Promise<User> {
		const arrayUsers = await this.getData<User>(userPath);
		const index = arrayUsers.findIndex(u => u.idNo === idNo);
		if (index === -1) throw new Error('Este número de identificación no está registrado.');

		return arrayUsers[index];
	}
	
	async obtenerHistorialMedico(pacienteId: string): Promise<Array<Appointment>> {
        const col = collection(this.firestore, 'appointments');
        const q = query(col, where('patient.id', '==', pacienteId), where('status', '==', 'done'));
        const querySnapshot = await getDocs(q);
        const appointments: Array<Appointment> = [];

        querySnapshot.forEach((doc) => {
            const appointment = doc.data() as Appointment;
            appointment.date = appointment.date instanceof Timestamp ? appointment.date.toDate() : appointment.date;
            appointments.push(appointment);
        });

        return appointments;
    }



}
