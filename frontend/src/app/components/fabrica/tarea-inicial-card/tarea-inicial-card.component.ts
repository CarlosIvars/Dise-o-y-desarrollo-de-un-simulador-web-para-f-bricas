import { Component, Input } from '@angular/core';
import { TareaInicial } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-tarea-inicial-card',
  templateUrl: './tarea-inicial-card.component.html',
  styleUrl: './tarea-inicial-card.component.css'
})
export class TareaInicialCardComponent {
  @Input() tareaInciial: TareaInicial = {} as TareaInicial;
}
