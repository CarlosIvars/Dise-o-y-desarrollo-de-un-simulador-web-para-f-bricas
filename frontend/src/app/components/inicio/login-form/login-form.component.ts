import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  @Output() loginClosed = new EventEmitter<boolean>();

  constructor(private router: Router) { }

  cerrarModal(): void {
    this.loginClosed.emit(false);
  }

  iniciarSesion() {
    this.router.navigate(['/zona-personal']);
  }
}
