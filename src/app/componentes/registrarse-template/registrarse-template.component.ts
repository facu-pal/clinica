import { InputSwal, Loader, StringIdValuePair, ToastError, ToastSuccess } from '../../environments/environment';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component,EventEmitter, Input, Output, inject  } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
//clases
import { Admin } from '../../classes/admin';
import { Paciente } from '../../classes/paciente';
import { especialidad } from '../../classes/especialidad';
import { especialista } from '../../classes/especialista';

import { NotLoggedError } from '../../errors/not-logged-error';

//servicios
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { ImgurService } from '../../services/imgur.service';

import { UpperCasePipe } from '@angular/common';
const uppercasePipe = new UpperCasePipe();


@Component({
  selector: 'app-registrarse-template',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule],
  templateUrl: './registrarse-template.component.html',
  styleUrl: './registrarse-template.component.css'
})
export class RegistrarseTemplateComponent {
  signUpForm: FormGroup;

	protected healthCarePlans: Array<StringIdValuePair> = [];
	protected especilidades: Array<especialidad> = [];
	imgFile1: File | undefined;
	imgFile2: File | undefined;
	imgFile1Label: string = 'Elige una imagen';
	imgFile2Label: string = 'Elige una segunda imagen';

	@Input() admin: boolean = false;
	@Output() createdUser = new EventEmitter<Paciente | especialista | Admin>();

	constructor(
		private router: Router,
		private db: DatabaseService,
    	private imgur: ImgurService,
		private auth: AuthService
	) {
		this.signUpForm = inject(FormBuilder).group({
			role: 'paciente',
			firstName: ['',	[Validators.required,Validators.pattern(/[\p{L}\p{M}]+/u),]],
			lastName: ['',[Validators.required,	Validators.pattern(/[\p{L}\p{M}]+/u),]],
			age: [ 0, [ Validators.required, Validators.min(0), Validators.max(125), this.specAgeValidator, ] ],
			idNo: [ '', [ Validators.required, Validators.pattern(/^\d{8}/), ] ],
			hcp: [ null, [ Validators.required ], ],
			specialties: [ [], [ Validators.minLength(1) ], ],
			diaTrabajo: [ { value: [], disabled: true }, [ Validators.required, ] ],
			email: [ '', [ Validators.required, Validators.email, ] ],
			password: [ '', [ Validators.required, Validators.minLength(6), Validators.maxLength(20), ] ],
			passCheck: [ '', [ Validators.required, this.passwordMatchValidator, ] ],
		});
	}

	async ngOnInit() {
		this.db.listenColChanges<especialidad>('especialidades', this.especilidades, undefined, (h1, h2) => h1.value > h2.value ? 1 : -1);
		this.db.listenColChanges<StringIdValuePair>('obraSocial', this.healthCarePlans, undefined, (h1, h2) => h1.value > h2.value ? 1 : -1);
	}

	private passwordMatchValidator(control: AbstractControl): null | object {
		const password = <string>control.parent?.value.password;
		const passCheck = <string>control.value;

		if (password !== passCheck)
			return { passwordMismatch: true };

		return null;
	}

	private specAgeValidator(control: AbstractControl): null | object {
		const role = <string>control.parent?.value.role;
		const age = <number>control.value;

		if (role === 'especialista' && age < 18)
			return { invalidAge: true };

		return null;
	}

	protected roleChange() {
		const roleValue = <string>this.signUpForm.get('role')?.value;
		const hcp = this.signUpForm.get('hcp');
		const specs = this.signUpForm.get('especialista');
		const diaTrabajo = this.signUpForm.get('diaTrabajo');
		hcp?.setValue(null);
		specs?.setValue([]);
		diaTrabajo?.setValue([]);

		if (roleValue === 'paciente') {
			hcp?.enable();
			hcp?.addValidators(Validators.required);
			specs?.clearValidators();
			specs?.disable();
			diaTrabajo?.clearValidators();
			diaTrabajo?.disable();
		} else if (roleValue === 'especialista') {
			hcp?.clearValidators();
			hcp?.disable();
			specs?.enable();
			specs?.addValidators(Validators.required);
			diaTrabajo?.enable();
			diaTrabajo?.addValidators(Validators.required);
		} else {
			hcp?.clearValidators();
			hcp?.disable();
			specs?.clearValidators();
			specs?.disable();
			diaTrabajo?.clearValidators();
			diaTrabajo?.disable();
		}

		hcp?.updateValueAndValidity();
		specs?.updateValueAndValidity();
		diaTrabajo?.updateValueAndValidity();
	}

	protected async nuevaEspecialidad() {
		const newSpecialty: SweetAlertResult<string> | undefined =
			await InputSwal.fire({ input: 'text', inputLabel: "Nueva especilidad." });

		let imgUrl = 'https://imgur.com/0Cd35Q3';
		const specValue = (newSpecialty?.value)?.toLowerCase();
		if (specValue) {
			const { value: file } =
				await InputSwal.fire({
					input: 'file',
					inputAttributes: { "accept": "image/*", "ariaLabel": 'Choose an image.' },
					inputLabel: "Add an image (Optional).",
					allowOutsideClick: false,
					confirmButtonText: 'Entregar',
					cancelButtonText: 'Omitir',
					inputValidator: (value) => {
						if (!value) {
							return "¡Tienes que elegir una imagen! O simplemente omítelo.";
						}
						return undefined;
					},
				});

			if (!!file)
        imgUrl = await this.imgur.uploadImage(file as File);

			const spec = new especialidad('', specValue, imgUrl);
			this.db.addDataAutoId('especialidades', spec);
			ToastSuccess.fire(`${spec.value} added`);
		} else
			ToastError.fire('Operacion cancelada.');
	}

	imgsUploaded(): boolean {
		const role = this.signUpForm.get('role')?.value;
		if (role === 'paciente')
			return this.imgFile1 instanceof File && this.imgFile2 instanceof File;
		else
			return this.imgFile1 instanceof File;
	}

	imgUpload($event: any) {
		const auxFile: File = $event.target.files[0];
		if (!auxFile.type.startsWith('image')) {
			Swal.fire('Oops...', 'Debes elegir un archivo de tipo de imagen.', 'error');
			return;
		}

		if ($event.target.id == 'img1') {
			this.imgFile1Label = auxFile.name;
			this.imgFile1 = auxFile;
		}
		else if ($event.target.id == 'img2') {
			this.imgFile2Label = auxFile.name;
			this.imgFile2 = auxFile;
		}
	}

	diaLaboralClick($event: any) {
		const dayNum = parseInt($event.target.value);
		const checked = $event.target.checked;
		const formControl = this.signUpForm.get('diaTrabajo'); 
		const auxArray: Array<number> = formControl?.value || []; 
	
		if (checked) {
		  auxArray.push(dayNum);
		} else {
		  const index = auxArray.indexOf(dayNum);
		  if (index > -1) {
			auxArray.splice(index, 1);
		  }
		}
	
		formControl?.setValue(auxArray);
	  }



	async signUp() {


		Loader.fire();
		await this.constructUser()
			.then(async user => {
				await this.auth.createAccount(user);
				this.router.navigateByUrl(this.auth.urlRedirect);
				this.createdUser.emit(user);
			})
			.catch((error: any) => {
				if (error instanceof NotLoggedError)
					this.router.navigateByUrl('login');
				else if (error.code === 'auth/email-already-in-use')
					error.message = 'Este correo electrónico ya está registrado.';

				ToastError.fire({ title: 'Oops...', text: error.message });
			});
		Loader.close();
	}

  private async constructUser(): Promise<Paciente | especialista | Admin> {
    if (!(this.imgFile1 instanceof File)) throw new Error(`Ha habido un problema con la imagen.`);
    const role: string = this.signUpForm.get('role')?.value;
  
    const idNo: number = parseInt(this.signUpForm.get('idNo')?.value);
    const nombre: string = uppercasePipe.transform(this.signUpForm.get('firstName')?.value);
    const apellido: string = uppercasePipe.transform(this.signUpForm.get('lastName')?.value);
    const edad: number = this.signUpForm.get('age')?.value;
    const email: string = this.signUpForm.get('email')?.value;
    const password: string = this.signUpForm.get('password')?.value;
  
    // Sube la primera imagen y obtén la URL
    const imgUrl1 = await this.imgur.uploadImage(this.imgFile1);
  
    let user: Paciente | especialista | Admin;
  
    if (role === 'Paciente') {
      if (!(this.imgFile2 instanceof File)) throw new Error(`Ha habido un problema con la segunda imagen.`);
  
      const hcp: StringIdValuePair = this.signUpForm.get('hcp')?.value;
  
      // Sube la segunda imagen y obtén la URL
      const imgUrl2 = await this.imgur.uploadImage(this.imgFile2);
  
      // Crea una instancia de Paciente con todos los argumentos necesarios
      user = new Paciente('', nombre, apellido, edad, idNo, imgUrl1, imgUrl2, email, password, hcp);
  
    } else if (role === 'especialista') {
      const especialidades: Array<especialidad> = this.signUpForm.get('especialidad')?.value;
      const diaTrabajo: Array<number> = this.signUpForm.get('diaTrabajo')?.value;
      const empieza: string = this.signUpForm.get('empieza')?.value || '09:00';
      const termina: string = this.signUpForm.get('termina')?.value || '17:00';
  
      // Crea una instancia de especialista con todos los argumentos necesarios
      user = new especialista('', nombre, apellido, edad, idNo, imgUrl1, email, password,
        especialidades, false, diaTrabajo, empieza, termina
      );
  
    } else {
      // Crea una instancia de Admin con todos los argumentos necesarios
      user = new Admin('', nombre, apellido, edad, idNo, imgUrl1, email, password);
    }
  
    return user;
  }

}
