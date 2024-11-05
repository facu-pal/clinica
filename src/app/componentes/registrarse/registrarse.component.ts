import { Component } from '@angular/core';
import { RegistrarseTemplateComponent } from '../registrarse-template/registrarse-template.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [RegistrarseTemplateComponent],
  templateUrl: './registrarse.component.html',
  styleUrl: './registrarse.component.css'
})
export class RegistrarseComponent {
  constructor(private router: Router) {}

  
  navigate(route: string) {
    this.router.navigate([route]); // Navega a la ruta proporcionada
  }
}
