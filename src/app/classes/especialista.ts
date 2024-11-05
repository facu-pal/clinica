import { especialidad } from "./especialidad";
import { User } from "./user";

export class especialista extends User {
	especialidad: Array<especialidad>;
	isEnabled: boolean;
	diaTrabajo: Array<number>;
	empieza: string = '08:30';
	termina: string = '18:30';

	constructor(id: string = '', nombre: string, apellido: string, edad: number, idNo: number,
		 imgUrl: string, email: string, password: string, especialidad: Array<especialidad>,
		  isEnabled: boolean, diaTrabajo: Array<number>, empieza: string = '08:30', termina: string = '18:30') {
			
		super('especialista', id, nombre, apellido, edad, idNo, imgUrl, '', email, password);
		this.especialidad = especialidad;
		this.isEnabled = isEnabled;
		this.diaTrabajo = diaTrabajo;
		this.empieza = empieza;
		this.termina = termina;
	}
}
