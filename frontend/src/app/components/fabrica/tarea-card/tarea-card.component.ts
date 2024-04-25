import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea, Trabajador } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tarea-card',
  templateUrl: './tarea-card.component.html',
  styleUrl: './tarea-card.component.css'
})
export class TareaCardComponent {
  @Input() tarea: Tarea = {} as Tarea;
  @Output() editarTareaForm = new EventEmitter<Tarea>();

  constructor(private apiService: ApiService, private tareaServce: TareasService) {}

  editarTarea() {
    this.editarTareaForm.emit(this.tarea);
  }

  borrarTarea() {
    if(confirm("¿Estás seguro que deseas eliminar la tarea?")) {
      console.log("Eliminando la tarea...");
    
      this.apiService.eliminarTarea(this.tarea.id+"").pipe(
        finalize(() => {
          console.log("Fin de eliminar tarea.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
          this.tareaServce.eliminarTarea(this.tarea.id);
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  drop(ev: DragEvent, tarea: Tarea) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('application/json');
    if (data) {
      const trabajador: Trabajador = JSON.parse(data);
      this.tareaServce.asignarTrabajadorATarea(tarea, trabajador);
    }
  }

  allowDrop(ev: DragEvent) {
    ev.preventDefault();
  }

  formatearDecimales(numero: number) {
    return numero.toFixed(1);
  }
}

