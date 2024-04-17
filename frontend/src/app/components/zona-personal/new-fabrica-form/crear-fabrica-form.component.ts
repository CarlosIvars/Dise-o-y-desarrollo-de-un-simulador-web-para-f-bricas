import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-crear-fabrica-form',
  templateUrl: './crear-fabrica-form.component.html',
  styleUrl: './crear-fabrica-form.component.css'
})
export class CrearFabricaFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre_fabrica: string = "";

  constructor(private apiService: ApiService) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  crearFabrica():void {
    if(!this.cargando){
      console.log("Creando la fabrica...");
      this.cargando = true;

      this.apiService.crearFabrica(this.nombre_fabrica).pipe(
        finalize(() => {
          this.cargando = false; 
          console.log("Fin de crear fabrica");
          this.close.emit();
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
