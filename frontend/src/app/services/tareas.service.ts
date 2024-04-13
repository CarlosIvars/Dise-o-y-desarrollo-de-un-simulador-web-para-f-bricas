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

  constructor(private trabajadoresService: TrabajadoresService) { 

    const tareas: Tarea[] = [];
    tareas.push(new TareaImpl(1, "Preparar", 10, 5, 0));
    tareas.push(new TareaImpl(2, "Procesar", 0, 15, 0));
    tareas.push(new TareaImpl(3, "Embalar", 0, 7, 0));
    //tareas[0].addDependencias(tareasIniciales[0]);
    this.actualizarTareas(tareas);

  }

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

  asignarTrabajadorATarea(tarea: Tarea, trabajador: Trabajador) {
    // Dejamos libre el actual trabajador de la tarea...
    const trabajadorViejo = tarea.getTrabajador();
    if(trabajadorViejo){
      trabajadorViejo.activo = false;
      this.trabajadoresService.actualizarTrabajador(trabajadorViejo);
    }
    
    // Añadimos el nuevo trabajador a la tarea
    tarea.setTrabajador(trabajador);
    this.actualizarTarea(tarea);

    // Marcamos el trabajador como activo
    trabajador.activo = true;
    this.trabajadoresService.actualizarTrabajador(trabajador);
  }
}
