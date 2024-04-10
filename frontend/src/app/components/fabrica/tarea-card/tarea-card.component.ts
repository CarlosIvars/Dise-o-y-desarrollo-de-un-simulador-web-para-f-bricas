import { Component, Input } from '@angular/core';
import { Tarea, Trabajador } from '../../../interfaces/interfaces';
import { FabricaService } from '../../../services/fabrica.service';

@Component({
  selector: 'app-tarea-card',
  templateUrl: './tarea-card.component.html',
  styleUrl: './tarea-card.component.css'
})
export class TareaCardComponent {
  @Input() tarea: Tarea = {} as Tarea;

  constructor(private fabricaService: FabricaService) {}

  drop(ev: DragEvent, tarea: Tarea) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('application/json');
    if (data) {
      const trabajador: Trabajador = JSON.parse(data);
      this.fabricaService.asignarTrabajadorATarea(tarea, trabajador);
    }
  }

  allowDrop(ev: DragEvent) {
    ev.preventDefault();
  }

  formatearDecimales(numero: number) {
    return numero.toFixed(1);
  }
}
