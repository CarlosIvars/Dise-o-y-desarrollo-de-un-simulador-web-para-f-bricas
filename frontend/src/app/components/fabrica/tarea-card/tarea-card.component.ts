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

