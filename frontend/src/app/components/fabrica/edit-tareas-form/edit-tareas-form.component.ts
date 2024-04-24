import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { TareaImpl } from '../../../clases/tarea.class';

@Component({
  selector: 'app-edit-tareas-form',
  templateUrl: './edit-tareas-form.component.html',
  styleUrl: './edit-tareas-form.component.css'
})
export class EditTareasFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  @Input() tarea!: Tarea;

  constructor(private apiService: ApiService, private tareasService: TareasService) { }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  modificarTarea(): void {
    if(!this.cargando){
      console.log("Modificando la tarea...");
      this.cargando = true;

      this.apiService.modificarTarea(this.tarea.id, this.tarea.nombre, this.tarea.duracion, this.tarea.precioVenta, this.tarea.descripcion).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar tarea.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          //Comprobamos que recibimos la respuesta
          if(response.subtask != null && response.subtask != undefined) {
            const id = response.subtask[0];
            const nombre = response.subtask[1];
            const duracion = response.subtask[2];
            const beneficio = response.subtask[3];
            const descripcion = response.subtask[4];

            //Si tenemos todos los datos añadimos la tarea
            if(id != undefined && nombre != undefined && duracion != undefined && beneficio != undefined && descripcion != undefined) {
              this.tareasService.actualizarTarea(new TareaImpl(id, nombre, 0, duracion, beneficio, 0, descripcion));
            } else {
              console.log("Omitiendo la modificacion de la tarea por falta de datos...");
            }
          } else {
            console.log("No se ha recibido la respuesta esperada...");
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
