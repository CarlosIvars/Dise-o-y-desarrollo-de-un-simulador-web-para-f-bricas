import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  @Output() close = new EventEmitter();
  @Output() registroUsuario = new EventEmitter();

  cargando: boolean = false;

  username: string = "";
  password: string = "";

  constructor(private apiService: ApiService, private userService: UserService, private router: Router) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  registarUsuario(): void {
    if(!this.cargando) {
      this.registroUsuario.emit();
    }
  }

  iniciarSesion(): void {
    if(!this.cargando){
      console.log("Iniciando sesión...");
      this.cargando = true;

      this.apiService.login(this.username, this.password).pipe(
        finalize(() => {
          this.cargando = false; 
          console.log("Finalizado");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          if(response.user != undefined) {
            sessionStorage.setItem("user", response.user);
          }
          
          this.router.navigate(['/zona-personal']);
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}