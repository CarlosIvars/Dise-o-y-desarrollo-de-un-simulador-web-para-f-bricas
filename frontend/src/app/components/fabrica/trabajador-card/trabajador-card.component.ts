import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Asignable, Trabajador } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-trabajador-card',
  templateUrl: './trabajador-card.component.html',
  styleUrl: './trabajador-card.component.css'
})
export class TrabajadorCardComponent {
  @Input() trabajador: Trabajador = {} as Trabajador;

  @Output() editarTrabajadorForm = new EventEmitter<Trabajador>();

  constructor(private apiService: ApiService, private trabajadoresService: TrabajadoresService, private tareasService: TareasService) { }

  drag(ev: DragEvent, asignable: Asignable) {
    this.tareasService.startDrag(asignable);
    ev.dataTransfer?.setData('application/json', JSON.stringify(asignable));
  }

  dragEnd(ev: DragEvent) {
    ev.preventDefault();
    // Verificar si ev.target no es nulo y es un Element antes de usar closest()
    if (ev.target instanceof Element) {
      // Verificar si el elemento se soltó fuera de las áreas de destino (tareas y máquinas)
      if (!ev.target.closest('.tareas') && !ev.target.closest('.maquinas')) {
        this.tareasService.stopDrag();
      }
    }
  }

  editarTrabajador() {
    this.editarTrabajadorForm.emit(this.trabajador);
  }
}
