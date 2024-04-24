import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Trabajador } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { TrabajadorImpl } from '../../../clases/trabajador.class';

@Component({
  selector: 'app-edit-trabajadores-form',
  templateUrl: './edit-trabajadores-form.component.html',
  styleUrl: './edit-trabajadores-form.component.css'
})
export class EditTrabajadoresFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  @Input() trabajador!: Trabajador;

  nuevas_habilidades: string = "";

  constructor(private apiService: ApiService, private trabajadoresService: TrabajadoresService) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  modificarTrabajador(): void {
    if(!this.cargando){
      console.log("Modificando el trabajador...");
      this.cargando = true;

      this.apiService.modificarTrabajador(this.trabajador.id, this.trabajador.nombre, this.trabajador.apellidos, this.trabajador.fecha_nacimiento, this.trabajador.fatiga, this.trabajador.coste_h, this.trabajador.preferencias_trabajo, this.trabajador.trabajos_apto, this.nuevas_habilidades).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar trabajador.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
          if(response.trabajador != null && response.trabajador != undefined) {
            //const numeric_id = response.trabajador[0];
            const alfanumeric_id = response.trabajador[1];
            const nombre = response.trabajador[2];
            const apellidos = response.trabajador[3];
            const fecha_nacimiento = response.trabajador[4];
            const trabajados_apto = response.trabajador[5];
            const fatiga = response.trabajador[6];
            const coste_h = response.trabajador[7];
            const preferencias_trabajo = response.trabajador[8];
            //const fabrica_id = response.trabajador[9];
            //const trabajo_id = response.trabajador[10];

            if(alfanumeric_id != undefined && nombre != undefined && apellidos != undefined && trabajados_apto != undefined && fatiga != undefined && coste_h != undefined && preferencias_trabajo != undefined) {
              const trabajador = new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo);
              this.trabajadoresService.actualizarTrabajador(trabajador);
            }
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
