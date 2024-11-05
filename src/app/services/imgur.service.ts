import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImgurService {
  private clientId = '36b5b146c066dc2'; 
  private apiUrl = 'https://api.imgur.com/3/image';

  // Método para subir una imagen y devolver la URL
  async uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${this.clientId}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      return this.getImageUrl(data); // Devuelve directamente la URL de la imagen
    } catch (error) {
      console.error('Error en la subida de la imagen:', error);
      throw error;
    }
  }

  // Método privado para obtener la URL de la imagen
  private getImageUrl(response: any): string {
    return response.data.link; // Devuelve la URL de la imagen subida
  }
}
