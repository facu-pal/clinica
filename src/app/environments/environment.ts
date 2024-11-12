import Swal from "sweetalert2";
import { User } from "../classes/user";

export const environment = {
	firebase:
	{
		projectId: "clinica-97505",
		appId: "1:844730787559:web:08a2f857916a8887806442",
		storageBucket: "clinica-97505.firebasestorage.app",
		apiKey: "AIzaSyCDBrTKFrSXxwQyzwrF93mwWrzwbhH8kns",
		authDomain: "clinica-97505.firebaseapp.com",
		messagingSenderId: "844730787559",
	}
}

export const ToastSuccess = Swal.mixin({
	icon: 'success',
	background: '#a5dc86',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastWarning = Swal.mixin({
	icon: 'warning',
	background: '#3fc3ee',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastError = Swal.mixin({
	icon: 'error',
	background: '#f27474',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastInfo = Swal.mixin({
	icon: 'info',
	background: '#0dcaf0',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const Loader = Swal.mixin({
	allowEscapeKey: false,
	allowOutsideClick: false,
	didOpen: () => {
		Swal.showLoading();
	}
});

export interface StringIdValuePair {
	id: string;
	value: string;
}

export const InputSwal = Swal.mixin({
	input: "textarea",
	inputPlaceholder: "Escriba su mensaje aca",
	inputAttributes: {
		"aria-label": "Escriba su mensaje aca"
	},
	showCancelButton: true,
	inputValidator: (value) => {
		if (!value) {
			return "Tienes que escribir algo";
		}
		return undefined;
	},
});

export interface Log {
	id: string,
	date: Date,
	user: User
};
