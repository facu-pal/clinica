import { StringIdValuePair } from "../environments/environment";
import { User } from "./user";

export class Paciente extends User {
	planSalud: StringIdValuePair;

	constructor(id: string = '', nombre: string, apellido: string, edad: number, 
		idNo: number, imgUrl1: string, imgUrl2: string, email: string, password: string, planSalud: StringIdValuePair) {
		super('especialista', id, nombre, apellido, edad, idNo, imgUrl1, imgUrl2, email, password);
		this.planSalud = planSalud;
	}
}
