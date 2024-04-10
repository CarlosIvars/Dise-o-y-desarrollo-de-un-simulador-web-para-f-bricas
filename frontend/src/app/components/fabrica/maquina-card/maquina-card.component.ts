import { Component, Input } from '@angular/core';
import { Maquina } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-maquina-card',
  templateUrl: './maquina-card.component.html',
  styleUrl: './maquina-card.component.css'
})
export class MaquinaCardComponent {
  @Input() maquina: Maquina = {} as Maquina;
}
