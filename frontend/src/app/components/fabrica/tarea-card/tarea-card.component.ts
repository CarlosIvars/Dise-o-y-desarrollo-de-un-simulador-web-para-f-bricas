import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Asignable, Tarea, Trabajador } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { MaquinasService } from '../../../services/maquinas.service';

@Component({
  selector: 'app-tarea-card',
  templateUrl: './tarea-card.component.html',
  styleUrl: './tarea-card.component.css'
})
export class TareaCardComponent {
  @Input() tarea: Tarea = {} as Tarea;
  @Output() editarTareaForm = new EventEmitter<Tarea>();

  constructor(private apiService: ApiService, private tareasService: TareasService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService) {}

  editarTarea() {
    this.editarTareaForm.emit(this.tarea);
  }

  drop(ev: DragEvent, tarea: Tarea) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('application/json');
    if (data) {
      const asignable: Asignable = JSON.parse(data);
      this.tareasService.asignarATarea(tarea, asignable);
    }
  }

  allowDrop(ev: DragEvent) {
    ev.preventDefault();
  }

  formatearDecimales(numero: number) {
    return numero.toFixed(1);
  }

  isTrabajador(): boolean {
    return this.trabajadoresService.isTrabajador(this.tarea.getAsignable());
  }

  isMaquina(): boolean {
    return this.maquinasService.isMaquina(this.tarea.getAsignable());
  }

  desasignarATarea() {
    if(confirm("Se desasignará el trabajador/maquina de esta tarea. ¿Quiere continuar?")) {
      this.tareasService.desasignarATarea(this.tarea);
    }
  }

  cambiarDuracion(tarea: Tarea) {
    if(!this.tarea.isWorking) {
      //Volvemos a calcular la duracion
      const asignable = tarea.getAsignable();
      if(asignable != undefined) {
        tarea.duracion = Math.round(tarea.tiempoBase + this.tareasService.calcularDuracion(tarea, asignable));
      }
    }
  }
}

