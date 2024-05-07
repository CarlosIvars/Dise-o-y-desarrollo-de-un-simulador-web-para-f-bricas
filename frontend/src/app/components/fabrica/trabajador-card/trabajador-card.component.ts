import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Trabajador } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';

@Component({
  selector: 'app-trabajador-card',
  templateUrl: './trabajador-card.component.html',
  styleUrl: './trabajador-card.component.css'
})
export class TrabajadorCardComponent {
  @Input() trabajador: Trabajador = {} as Trabajador;

  @Output() editarTrabajadorForm = new EventEmitter<Trabajador>();

  constructor(private apiService: ApiService, private trabajadoresService: TrabajadoresService) { }

  drag(ev: DragEvent, trabajador: Trabajador) {
    ev.dataTransfer?.setData('application/json', JSON.stringify(trabajador));
  }

  editarTrabajador() {
    this.editarTrabajadorForm.emit(this.trabajador);
  }
}
