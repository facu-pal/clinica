import { User } from "./user";

export class Admin extends User {
	constructor(id: string = '', nombre: string, apellido: string, edad: number, 
		idNo: number, imgUrl: string, email: string, password: string) {
		super('admin', id, nombre, apellido, edad, idNo, imgUrl, '', email, password);
	}
}
