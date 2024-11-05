import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Asegúrate de importar esto
import { User } from './classes/user';
import { ToastInfo } from './environments/environment';
import { AuthService } from './services/auth.service';
import { especialista } from './classes/especialista';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Clinica online';
  user: User | null = null;
	isValid: boolean = false;
	isEmailVerif: boolean = false;

	constructor(private router: Router, private auth: AuthService) {
		auth.fireUserObs.subscribe(afUser => {
			if (afUser && afUser.emailVerified) {
				this.isValid = true;
				this.isEmailVerif = true;
			}
		});

		auth.loggedUserObs.subscribe(user => {
			this.user = user;
			if (user) {
				if (user.role === 'especialista' && !((user as especialista).isEnabled))
					this.isValid = false;
			} 
		});
	}
  navigate(route: string) {
    this.router.navigate([route]); // Navega a la ruta proporcionada
  }



}
