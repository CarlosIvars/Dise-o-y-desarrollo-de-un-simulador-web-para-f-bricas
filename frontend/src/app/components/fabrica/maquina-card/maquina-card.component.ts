import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Asignable, Maquina } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { MaquinasService } from '../../../services/maquinas.service';
import { finalize } from 'rxjs';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-maquina-card',
  templateUrl: './maquina-card.component.html',
  styleUrl: './maquina-card.component.css'
})
export class MaquinaCardComponent {
  @Input() maquina: Maquina = {} as Maquina;
  @Output() editarMaquinaForm = new EventEmitter<Maquina>();

  constructor(private apiService: ApiService, private maquinasService: MaquinasService, private tareasService: TareasService) { }

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

  editarMaquina() {
    this.editarMaquinaForm.emit(this.maquina);
  }

  formatearDigitos(numero: number, decimales: number) {
    return numero.toFixed(decimales);
  } 
}
