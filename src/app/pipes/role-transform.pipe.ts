import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTransform'
})
export class RoleTransformPipe implements PipeTransform {

  transform(value: string): string {
    switch(value.toUpperCase()) {
      case 'ADMIN':
        return 'Admin';
      case 'SPECIALIST':
        return 'Especialista';
      case 'PATIENT':
        return 'Paciente';
      default:
        return value;
    }
  }
}
