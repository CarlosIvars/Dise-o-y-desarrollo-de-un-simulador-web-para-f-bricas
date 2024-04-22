import { Injectable } from '@angular/core';
import { Tarea, Trabajador } from '../interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
import { TrabajadoresService } from './trabajadores.service';
import { TareaImpl } from '../clases/tarea.class';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private tareasSubject = new BehaviorSubject<Tarea[]>([]);
  tareas$ = this.tareasSubject.asObservable();

  constructor(private trabajadoresService: TrabajadoresService) { }

  actualizarTareas(tareas: Tarea[]) {
    this.tareasSubject.next(tareas);
  }

  actualizarTarea(tarea: Tarea) {
    const tareas = this.tareasSubject.getValue();
    const index = tareas.findIndex(t => t.id === tarea.id);
    if (index !== -1) {
      tareas[index] = tarea;
      this.actualizarTareas(tareas);
    }
  }

  anyadirTarea(tarea: Tarea) {
    const tareas = this.tareasSubject.getValue();
    tareas.push(tarea);
    this.actualizarTareas(tareas);
  }

  asignarTrabajadorATarea(tarea: Tarea, trabajador: Trabajador) {
    // Dejamos libre el actual trabajador de la tarea...
    const trabajadorViejo = tarea.getTrabajador();
    if(trabajadorViejo != undefined){
      trabajadorViejo.activo = false;
      this.trabajadoresService.actualizarTrabajador(trabajadorViejo);
    }

    //Eliminamos el nuevo trabajador de todas las tareas
    const tareas = this.tareasSubject.getValue();
    for(const tarea of tareas) {
      const tareaTrabajador = tarea.getTrabajador();
      if(tareaTrabajador != undefined && tareaTrabajador.id === trabajador.id) {
        tarea.removeTrabajador();
      }
    }
    this.actualizarTareas(tareas);
    
    // Añadimos el nuevo trabajador a la tarea
    tarea.setTrabajador(trabajador);
    this.actualizarTarea(tarea);

    // Marcamos el trabajador como activo
    trabajador.activo = true;
    this.trabajadoresService.actualizarTrabajador(trabajador);
  }
}
