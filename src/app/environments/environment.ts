import Swal from "sweetalert2";
import { User } from "../classes/user";

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
	inputPlaceholder: "Type your message here...",
	inputAttributes: {
		"aria-label": "Type your message here"
	},
	showCancelButton: true,
	inputValidator: (value) => {
		if (!value) {
			return "You need to write something!";
		}
		return undefined;
	},
});

export interface Log {
	id: string,
	date: Date,
	user: User
};
