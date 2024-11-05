// import { Injectable } from '@angular/core';
// import { Auth, User as FireUser, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateCurrentUser } from '@angular/fire/auth';
// import { User } from '../classes/user';
// import { especialista } from '../classes/especialista';
// import { NotLoggedError } from '../errors/not-logged-error';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Paciente } from '../classes/paciente';
// import { Admin } from '../classes/admin';
// import { DatabaseService } from './database.service';




// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
// 	//#region Properties, Subjects and Observables
// 	urlRedirect: string = 'login';

// 	private _loggedUserSub = new BehaviorSubject<Paciente | especialista | Admin | null>(null);
// 	public loggedUserObs = this._loggedUserSub.asObservable();
// 	public get LoggedUser(): Paciente | especialista | Admin | null {
// 		return this._loggedUserSub.getValue();
// 	}
// 	private set LoggedUser(value: Paciente | especialista | Admin | null) {
// 		this._loggedUserSub.next(value);
// 	}

// 	private _fireUserSub = new BehaviorSubject<FireUser | null>(null);
// 	public fireUserObs = this._fireUserSub.asObservable();
// 	public get FireUser(): FireUser | null {
// 		return this._fireUserSub.getValue();
// 	}
// 	private set FireUser(value: FireUser | null) {
// 		this._fireUserSub.next(value);
// 	}

// 	isEmailVerified: boolean = false;

// 	public get IsUserValid(): boolean {
// 		return this.isFullyValidUser();
// 	}
// 	//#endregion

// 	constructor(private auth: Auth, private db: DatabaseService) { }

// 	async createAccount(user: User): Promise<UserCredential> {
// 		const ogFireUser = this._fireUserSub.getValue();
// 		const ogUser = this._loggedUserSub.getValue();

// 		this.db.searchUserByIdNo(user.idNo)
// 			.then(() => { throw new Error("This id number is already registered.") })
// 			.catch(() => { });

// 		return createUserWithEmailAndPassword(this.auth, user.email, user.password)
// 			.then(async userCredential => {
// 				const newUser = this.auth.currentUser
// 				if (!ogFireUser) {
// 					this.FireUser = newUser;
// 					this.urlRedirect = 'home';
// 					this.LoggedUser = user;
// 					this.db.addDataAutoId('logs', { date: new Date(), user: user })
// 				} else { //If not null, admin is creating new account
// 					this.FireUser = ogFireUser;
// 					this.LoggedUser = ogUser;
// 					this.urlRedirect = 'users'
// 					await updateCurrentUser(this.auth, ogFireUser);
// 				}

// 				this.sendEmailVerif(newUser);
// 				await this.db.addDataAutoId('users', user);

// 				return userCredential
// 			});
// 	}

// 	async signInToFirebase(email: string, password: string) {
// 		try {
// 			const userCred = await signInWithEmailAndPassword(this.auth, email, password);
// 			this.FireUser = this.auth.currentUser;
// 			await this.db.searchUserByEmail(this.FireUser?.email!)
// 				.then(async user => {
// 					this.LoggedUser = user;
// 					this.isEmailVerified = this.FireUser!.emailVerified!;
// 					this.urlRedirect = 'home';
// 					this.db.addDataAutoId('logs', { date: new Date(), user: user })

// 					if (!this.isEmailVerified) {
// 						this.urlRedirect = 'account-verification';
// 						throw new Error('You have to verify your email.');
// 					}

// 					if (this.LoggedUser!.role === 'especialista' && !(this.LoggedUser as especialista).isEnabled) {
// 						this.urlRedirect = 'especialista-enabling';
// 						throw new Error('Your account has not been enabled yet.');
// 					}

// 				});
// 		} catch (error: any) {
// 			if (error.code === 'auth/invalid-login-credentials') {
// 				this.urlRedirect = 'login';
// 				throw new Error("Credentials don't match.");
// 			} else {
// 				throw error;
// 			}
// 		}
// 	}

// 	signOut() {
// 		if (this.auth.currentUser === null) throw new NotLoggedError;

// 		this.LoggedUser = null;
// 		this.isEmailVerified = false;
// 		this.urlRedirect = 'login';
// 		return this.auth.signOut()
// 			.then(() => {
// 				this.auth.currentUser?.reload();
// 				this.FireUser = this.auth.currentUser;
// 			});
// 	}

// 	sendEmailVerif(afUser?: FireUser | null) {
// 		const user = afUser ? afUser : this.auth.currentUser;
// 		if (user === null) throw new NotLoggedError;

// 		return sendEmailVerification(user);
// 	}

// 	async checkEmailVerif(): Promise<boolean> {
// 		await this.auth.currentUser?.reload();
// 		this.FireUser = this.auth.currentUser;
// 		if (this.FireUser) {
// 			if (this.FireUser.emailVerified) {
// 				this.isEmailVerified = this.FireUser.emailVerified;
// 				this.urlRedirect = 'home';

// 				if (this.LoggedUser!.role === 'especialista' && !(this.LoggedUser as especialista).isEnabled)
// 					this.urlRedirect = 'especialista-habilitado';

// 				return true;
// 			}

// 			return false;
// 		}

// 		throw new NotLoggedError;
// 	}

// 	async isEspecialistaEnabled(): Promise<boolean> {
// 		if (this.LoggedUser?.role !== 'especialista') throw new Error("usuario no especialista.");

// 		const spec = await this.db.searchUserByIdNo(this.LoggedUser.idNo);
// 		this.LoggedUser = spec;
// 		return (spec as especialista).isEnabled;
// 	}

// 	isFullyValidUser(): boolean {
// 		if (!this.LoggedUser || !this.isEmailVerified) {
// 			return false;
// 		}

// 		if (this.LoggedUser.role === 'especialista') {
// 			return (this.LoggedUser as especialista).isEnabled;
// 		}

// 		return true;
// 	}
// }

import { Injectable } from '@angular/core';
import { Auth, User as FireUser, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateCurrentUser } from '@angular/fire/auth';
import { User } from '../classes/user';
import { especialista } from '../classes/especialista';
import { NotLoggedError } from '../errors/not-logged-error';
import { BehaviorSubject } from 'rxjs';
import { Paciente } from '../classes/paciente';
import { Admin } from '../classes/admin';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //#region Properties, Subjects and Observables
  urlRedirect: string = 'login';

  private _loggedUserSub = new BehaviorSubject<Paciente | especialista | Admin | null>(null);
  public loggedUserObs = this._loggedUserSub.asObservable();
  
  public get LoggedUser(): Paciente | especialista | Admin | null {
    return this._loggedUserSub.getValue();
  }
  
  private set LoggedUser(value: Paciente | especialista | Admin | null) {
    this._loggedUserSub.next(value);
  }

  private _fireUserSub = new BehaviorSubject<FireUser | null>(null);
  public fireUserObs = this._fireUserSub.asObservable();
  
  public get FireUser(): FireUser | null {
    return this._fireUserSub.getValue();
  }
  
  private set FireUser(value: FireUser | null) {
    this._fireUserSub.next(value);
  }

  isEmailVerified: boolean = false;

  public get IsUserValid(): boolean {
    return this.isFullyValidUser();
  }
  //#endregion

  constructor(private auth: Auth, private db: DatabaseService) { }

  async createAccount(user: User): Promise<UserCredential> {
    const ogFireUser = this._fireUserSub.getValue();
    const ogUser = this._loggedUserSub.getValue();

    // Validar si el ID ya está registrado
    await this.db.searchUserByIdNo(user.idNo)
      .then(() => { throw new Error("This ID number is already registered."); })
      .catch(() => { /* No hacer nada si no está registrado */ });

    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then(async userCredential => {
        const newUser = this.auth.currentUser;
        if (!ogFireUser) {
          this.FireUser = newUser;
          this.urlRedirect = 'home';
          this.LoggedUser = user;
          this.db.addDataAutoId('logs', { date: new Date(), user: user });
        } else { // Si no es null, un admin está creando una nueva cuenta
          this.FireUser = ogFireUser;
          this.LoggedUser = ogUser;
          this.urlRedirect = 'users';
          await updateCurrentUser(this.auth, ogFireUser);
        }

        await this.sendEmailVerif(newUser);
        await this.db.addDataAutoId('users', user);

        return userCredential;
      });
  }

  async signInToFirebase(email: string, password: string) {
    try {
      const userCred = await signInWithEmailAndPassword(this.auth, email, password);
      const currentUser = this.auth.currentUser; // Obtener el usuario actual

      if (!currentUser) throw new NotLoggedError; // Verificar si hay un usuario autenticado

      this.FireUser = currentUser;
      await this.db.searchUserByEmail(this.FireUser?.email!)
        .then(async user => {
          this.LoggedUser = user;
          this.isEmailVerified = this.FireUser!.emailVerified!;
          this.urlRedirect = 'home'; // Redirigir a home inicialmente
          this.db.addDataAutoId('logs', { date: new Date(), user: user });

          // Validaciones adicionales
          if (!this.isEmailVerified) {
            this.urlRedirect = 'account-verification'; // Cambiar URL si no está verificado
            throw new Error('You have to verify your email.');
          }

          if (this.LoggedUser!.role === 'especialista' && !(this.LoggedUser as especialista).isEnabled) {
            this.urlRedirect = 'especialista-enabling'; // Cambiar URL si el especialista no está habilitado
            throw new Error('Your account has not been enabled yet.');
          }

        });
    } catch (error: any) {
      if (error.code === 'auth/invalid-login-credentials') {
        this.urlRedirect = 'login';
        throw new Error("Credentials don't match.");
      } else {
        throw error; // Re-lanzar otros errores
      }
    }
  }

  signOut() {
    if (this.auth.currentUser === null) throw new NotLoggedError;

    this.LoggedUser = null; // Limpiar el usuario logueado
    this.isEmailVerified = false; // Reiniciar verificación de email
    this.urlRedirect = 'login'; // Establecer redirección a login

    return this.auth.signOut()
      .then(() => {
        this.auth.currentUser?.reload(); // Recargar el usuario actual
        this.FireUser = this.auth.currentUser; // Actualizar FireUser
      });
  }

  sendEmailVerif(afUser?: FireUser | null) {
    const user = afUser ? afUser : this.auth.currentUser;
    if (user === null) throw new NotLoggedError;

    return sendEmailVerification(user);
  }

  async checkEmailVerif(): Promise<boolean> {
    await this.auth.currentUser?.reload();
    this.FireUser = this.auth.currentUser;
    if (this.FireUser) {
      if (this.FireUser.emailVerified) {
        this.isEmailVerified = this.FireUser.emailVerified;
        this.urlRedirect = 'home'; // Redirigir a home si está verificado

        if (this.LoggedUser!.role === 'especialista' && !(this.LoggedUser as especialista).isEnabled)
          this.urlRedirect = 'especialista-habilitado'; // Cambiar URL si el especialista no está habilitado

        return true;
      }
      return false; // No verificado
    }

    throw new NotLoggedError; // Usuario no autenticado
  }

  async isEspecialistaEnabled(): Promise<boolean> {
    if (this.LoggedUser?.role !== 'especialista') throw new Error("Usuario no especialista.");

    const spec = await this.db.searchUserByIdNo(this.LoggedUser.idNo);
    this.LoggedUser = spec; // Actualizar el LoggedUser
    return (spec as especialista).isEnabled; // Retornar el estado de habilitación
  }

  isFullyValidUser(): boolean {
    if (!this.LoggedUser || !this.isEmailVerified) {
      return false; // No es un usuario válido si no está autenticado o no ha verificado el email
    }

    if (this.LoggedUser.role === 'especialista') {
      return (this.LoggedUser as especialista).isEnabled; // Verificar habilitación si es especialista
    }

    return true; // Válido en otros casos
  }
}
