import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Maquina } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { MaquinasService } from '../../../services/maquinas.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-maquina-card',
  templateUrl: './maquina-card.component.html',
  styleUrl: './maquina-card.component.css'
})
export class MaquinaCardComponent {
  @Input() maquina: Maquina = {} as Maquina;
  @Output() editarMaquinaForm = new EventEmitter<Maquina>();

  constructor(private apiService: ApiService, private maquinasService: MaquinasService) { }

  editarMaquina() {
    this.editarMaquinaForm.emit(this.maquina);
  }
}
