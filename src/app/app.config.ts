import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"clinica-97505","appId":"1:844730787559:web:08a2f857916a8887806442","storageBucket":"clinica-97505.firebasestorage.app","apiKey":"AIzaSyCDBrTKFrSXxwQyzwrF93mwWrzwbhH8kns","authDomain":"clinica-97505.firebaseapp.com","messagingSenderId":"844730787559"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
