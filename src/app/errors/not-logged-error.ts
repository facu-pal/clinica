export class NotLoggedError extends Error {
	constructor(message: string = 'Ningún usuario ha iniciado sesión.') {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, NotLoggedError.prototype);
  }
}
