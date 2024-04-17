import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent {
  mostrarlogin = false;
  mostrarRegistro = false;
  
  constructor(private apiService: ApiService ) {}

  //Iniciar sesion
  abrirIncioSesion() {
    this.mostrarRegistro = false;
    this.mostrarlogin = true;
  }
  
  cerrarIncioSesion() {
    this.mostrarlogin = false;
  }

  //Registrarse
  abrirRegistroUsuario() {
    this.mostrarlogin = false;
    this.mostrarRegistro = true;
  }

  cerrarRegistroUsuario() {
    this.mostrarRegistro = false;
  }

  login() {
    console.log("Click login");
    this.apiService.login("Prueba", "1").subscribe({
      next: (response) => console.log("Respuesta: ", response),
      error: (error) => {alert("Error: " + error);}
    });
  }
}