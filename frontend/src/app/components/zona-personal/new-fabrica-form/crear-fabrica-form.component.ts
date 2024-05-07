import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { Fabrica } from '../../../interfaces/interfaces';
import { FabricaImpl } from '../../../clases/fabrica.class';

@Component({
  selector: 'app-crear-fabrica-form',
  templateUrl: './crear-fabrica-form.component.html',
  styleUrl: './crear-fabrica-form.component.css'
})
export class CrearFabricaFormComponent {
  @Input() sectores = [];
  @Output() close = new EventEmitter();
  @Output() fabricaCreada = new EventEmitter<Fabrica>();

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

            try{
              if(response.fabrica != null && response.fabrica != undefined) {
                const fabrica_id = response.fabrica[0];
                const fabrica_nombre = response.fabrica[1];
                const fabrica_costes = response.fabrica[2];
                const fabrica_beneficios = response.fabrica[3];
                const fabrica_capital = response.fabrica[4];
                const fabrica_sector = response.fabrica[7];

                if(fabrica_id != undefined && fabrica_nombre != undefined && fabrica_costes != undefined && fabrica_beneficios != undefined && fabrica_capital != undefined && fabrica_sector != undefined) {
                  let fabrica = new FabricaImpl(fabrica_id, fabrica_nombre, 1, 0, 0, fabrica_capital, fabrica_beneficios, fabrica_costes, fabrica_sector);
                  this.fabricaCreada.emit(fabrica);
                } else {
                  alert("No se han recibido los datos esperados de la fábrica creada.");
                }
              } else {
                alert("No se han podido recuperar los datos de la fábrica creada.");
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
      } else {
        alert("Debe rellenar todos los datos para crear una nueva fábrica.");
      }
    }
  }

  puedeEnviar() {
    return (this.nombre_fabrica != undefined && this.capital_inicial != undefined && this.sector != undefined);
  }
}
