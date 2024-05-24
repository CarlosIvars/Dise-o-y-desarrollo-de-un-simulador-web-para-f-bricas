import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Asignable, Fabrica, Tarea, Trabajador } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';
import { ApiService } from '../../../services/api.service';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { MaquinasService } from '../../../services/maquinas.service';
import { HistorialService } from '../../../services/historial.service';
import { Subscription } from 'rxjs';
import { FabricaService } from '../../../services/fabrica.service';

@Component({
  selector: 'app-tarea-card',
  templateUrl: './tarea-card.component.html',
  styleUrl: './tarea-card.component.css'
})
export class TareaCardComponent {
  @Input() tarea: Tarea = {} as Tarea;
  @Output() editarTareaForm = new EventEmitter<Tarea>();

  fabrica: Fabrica = {} as Fabrica;
  private fabricaSub?: Subscription;

  constructor(private apiService: ApiService, private fabricaService: FabricaService, private tareasService: TareasService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private historialService: HistorialService) {}

  ngOnInit(): void {
    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });
  }

  editarTarea() {
    this.editarTareaForm.emit(this.tarea);
  }

  drop(ev: DragEvent, tarea: Tarea) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('application/json');
    if (data) {
      const asignable: Asignable = JSON.parse(data);
      this.tareasService.asignarATarea(tarea, asignable, this.fabrica);
      console.log("Trabajador/maquina asignado.");
      this.historialService.guardar_historial();
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
      this.tareasService.desasignarATarea(this.tarea, this.fabrica);
      console.log("Trabajador/máquina desasignado.")
      this.historialService.guardar_historial();
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
  
  formatearDigitos(numero: number, decimales: number) {
    return numero.toFixed(decimales);
  } 
}

