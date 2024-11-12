import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
	providedIn: 'root'
})
export class StorageService {
	constructor(private storage: Storage) { }

	async uploadImage(imagen: File, path: string): Promise<string> {
		const imgRef = ref(this.storage, `images/${path}`);

		try {
			await uploadBytes(imgRef, imagen);
			return await getDownloadURL(imgRef);
		} catch (error) {
			throw Error('Hubo un problema al cargar la imagen.', { cause: error });
		}

	}
}
