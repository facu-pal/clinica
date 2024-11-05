import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../classes/user';
import { Loader } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
	loginForm: FormGroup;
	protected users: Array<User> = [];
  email!: string;
  password!: string;
  msjError: string = "";

	constructor(private router: Router, private auth: AuthService, private db: DatabaseService, private fb: FormBuilder) {
		this.loginForm = fb.group({
			email: [
				'',
				[
					Validators.required,
					Validators.email,
				]
			],
			password: [
				'',
				[
					Validators.required,
				]
			]
		});
	}

	async ngOnInit() {
		Loader.fire();
		this.users = await this.db.getData<User>('users');
		Loader.close();
	}

	async signIn() {
		Loader.fire();
		const email = this.loginForm.get('email')?.value;
		const password = this.loginForm.get('password')?.value;

		await this.auth.signInToFirebase(email, password)
			.catch(() => { });

		this.router.navigateByUrl(this.auth.urlRedirect);
		Loader.close();
	}

	quickFill(user: User) {
		this.loginForm.patchValue({
			email: user.email,
			password: user.password
		})

		this.signIn();
	}


  login(){

  }

  autoCompletar1() {
    this.email="admin@gmail.com";
    this.password = "123123";
  }
  autoCompletar2() {
    this.email="empleado@gmail.com";
    this.password = "123123";
  }
  autoCompletar3() {
    this.email="paciente@gmail.com";
    this.password = "123123";
  }
  navigate(route: string) {
    this.router.navigate([route]); // Navega a la ruta proporcionada
  }
}
