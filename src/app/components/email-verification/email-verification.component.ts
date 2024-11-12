import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastSuccess, ToastWarning, ToastError, ToastInfo } from 'src/app/environments/environment';
import { NotLoggedError } from 'src/app/errors/not-logged-error';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'app-email-verification',
	templateUrl: './email-verification.component.html',
	styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent {
	constructor(private auth: AuthService, private router: Router) { }

	checkVerify() {
		this.auth.checkEmailVerif()
			.then(userVerified => {
				if (userVerified) {
					this.router.navigateByUrl(this.auth.urlRedirect);
				}
				else
					ToastError.fire({ title: 'Oops...', text: 'Verifica tu cuenta' });
			});
	}

	newVerify() {
		this.auth.sendEmailVerif();
		ToastInfo.fire('Email enviado');
	}

	signOut() {
		this.auth.signOut()
			.then(() => {
				ToastSuccess.fire({ title: 'Cerro sesion' });
				this.router.navigateByUrl('login');
			})
			.catch((error: any) => {
				if (error instanceof NotLoggedError)
					ToastWarning.fire({ title: 'Oops...', text: error.message });
				else
					ToastError.fire({ title: 'Oops...', text: error.message });
			});
	}
}
