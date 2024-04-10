import { Component, Input } from '@angular/core';
import { TareaFinal } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-tarea-final-card',
  templateUrl: './tarea-final-card.component.html',
  styleUrl: './tarea-final-card.component.css'
})
export class TareaFinalCardComponent {
  @Input() tareaFinal: TareaFinal = {} as TareaFinal;
}
