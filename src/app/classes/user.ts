export abstract class User {
	role: 'paciente' | 'especialista' | 'admin';
	id: string;
	nombre: string;
	apellido: string;
	edad: number;
	idNo: number;
	imgUrl1: string;
	imgUrl2: string;
	email: string;
	password: string;

	constructor(role: 'paciente' | 'especialista' | 'admin', id: string = '', nombre: string, apellido: string, edad: number, idNo: number, imgUrl1: string, imgUrl2: string, email: string, password: string) {
		this.role = role;
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.edad = edad;
		this.idNo = idNo;
		this.imgUrl1 = imgUrl1;
		this.imgUrl2 = imgUrl2;
		this.email = email;
		this.password = password;
	}
}