import { Component, Input } from '@angular/core';
import { Trabajador } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-trabajador-card',
  templateUrl: './trabajador-card.component.html',
  styleUrl: './trabajador-card.component.css'
})
export class TrabajadorCardComponent {
  @Input() trabajador: Trabajador = {} as Trabajador;

  drag(ev: DragEvent, trabajador: Trabajador) {
    ev.dataTransfer?.setData('application/json', JSON.stringify(trabajador));
  }
}
