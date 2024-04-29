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
  capital_inicial!: number;
  sector: string = "";

  constructor(private apiService: ApiService) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  crearFabrica():void {
    if(!this.cargando){
      if(this.puedeEnviar()) {
        console.log("Creando la fabrica...");
        this.cargando = true;

        this.apiService.crearFabrica(this.nombre_fabrica, this.capital_inicial, this.sector).pipe(
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
      } else {
        alert("Debe rellenar todos los datos para crear una nueva fábrica.");
      }
    }
  }

  puedeEnviar() {
    return (this.nombre_fabrica != undefined && this.capital_inicial != undefined && this.sector != undefined);
  }
}
