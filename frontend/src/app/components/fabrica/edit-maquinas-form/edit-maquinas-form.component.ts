import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Maquina } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { MaquinasService } from '../../../services/maquinas.service';
import { finalize } from 'rxjs';
import { MaquinaImpl } from '../../../clases/maquina.class';

@Component({
  selector: 'app-edit-maquinas-form',
  templateUrl: './edit-maquinas-form.component.html',
  styleUrl: './edit-maquinas-form.component.css'
})
export class EditMaquinasFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  @Input() maquina!: Maquina;

  nuevas_habilidades: string = "";

  constructor(private apiService: ApiService, private maquinasService: MaquinasService) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  modificarMaquina(): void {
    if(!this.cargando){
      console.log("Modificando la maquina...");
      this.cargando = true;

      this.apiService.modificarMaquina(this.maquina.id, this.maquina.nombre, this.maquina.coste_h, this.maquina.fatiga, this.nuevas_habilidades).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar maquina.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          //Comprobamos si tenemos la maquina en la respuesta
          if(response.maquina != null && response.maquina != undefined) {
            //const numeric_id = maquina[0];
            const alfanumeric_id = response.maquina[1];
            const nombre = response.maquina[2];
            const fatiga = response.maquina[3];
            const coste_h = response.maquina[4];
            //const fabrica_id = maquina[5];
            //const trabajo_id = maquina[6];

            //Si tenemos todos los datos añadimos la maquina
            if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined) {
              const maquina = new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h);
              this.maquinasService.actualizarMaquina(maquina);
            } else {
              console.log("Omitiendo la modificacion de la maquina por falta de datos...");
            }
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  borrarMaquina() {
    if(confirm("¿Estás seguro que deseas eliminar la máquina?")) {
      console.log("Eliminando la máquina...");
    
      this.apiService.eliminarMaquina(this.maquina.id).pipe(
        finalize(() => {
          console.log("Fin de eliminar maquina.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
          this.maquinasService.eliminarMaquina(this.maquina.id);
          this.close.emit();
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
