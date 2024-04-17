import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  @Output() close = new EventEmitter();
  @Output() inicioSesion = new EventEmitter();

  constructor(private router: Router) { }

  cerrarModal(): void {
    this.close.emit();
  }

  iniciarSesion(): void {
    this.inicioSesion.emit();
  }

  registrarUsuario(): void {
    this.router.navigate(['/zona-personal']);
  }
}
