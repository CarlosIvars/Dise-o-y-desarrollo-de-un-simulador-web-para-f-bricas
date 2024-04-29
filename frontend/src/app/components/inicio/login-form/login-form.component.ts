import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';

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

  constructor(private apiService: ApiService, private router: Router) { }

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
          
          //Encapsulamos todo en un try catch por si las moscas...
          try {
            //Solo avanzamos si nos llega el userName
            if(response.user != undefined) {
              sessionStorage.setItem("user", response.user);
              this.router.navigate(['/zona-personal']);
            } else {
              alert("Error interno al obtener el nombre de usuario.")
            }
          } catch (error: any) {
            console.error(error);
            alert("Error al procesar la respuesta: " + error.message);
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  puedeEnviar() {
    return (this.username != "" && this.password != "")
  }
}