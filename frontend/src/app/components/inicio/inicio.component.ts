import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})

export class InicioComponent {
  mostarlogin = false;
  mostrarRegistro = false;
  
  constructor(private apiService: ApiService ) {}

  iniciarSesion() {
    this.mostarlogin = true;
  }
  
  onLoginClosed(abrir: boolean) {
    this.mostarlogin = false;
  }

  login() {
    this.apiService.login().subscribe({
      next: (response) => console.log("Respuesta: ", response),
      error: (error) => alert("Error: " + error)
    });
  }
}
