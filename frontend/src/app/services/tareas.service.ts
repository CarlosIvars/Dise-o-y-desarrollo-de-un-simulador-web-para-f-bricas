import { Injectable } from '@angular/core';
import { Tarea, Trabajador } from '../interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
import { TrabajadoresService } from './trabajadores.service';

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

  eliminarTarea(id: number) {
    const tareas_const = this.tareasSubject.getValue();
    
    // Eliminar la tarea del array tareas
    let tareas = tareas_const.filter(tarea => tarea.id !== id);

    // Iterar sobre las tareas restantes
    tareas.forEach(tarea => {
      
      // Eliminar la referencia a la tareaPadre
      if (tarea.tareaPadre != undefined && tarea.tareaPadre.id === id) {
        tarea.tareaPadre = undefined; 
      }

      // Filtrar y actualizar las tareasHijas de cada tarea
      tarea.tareasHijas.filter(hija => hija.id !== id)
    });

    this.actualizarTareas(tareas);
  }

  modificarTarea(id: number, nombre: string, duracion: number, beneficio: number, descripcion: string, coste: number, skills: number[]) {
    const tareas = this.tareasSubject.getValue();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      const tarea = tareas[index];
      tarea.nombre = nombre;
      tarea.duracion = duracion;
      tarea.beneficio = beneficio;
      tarea.descripcion = descripcion;
      tarea.coste = coste;
      tarea.skills = skills;
      this.actualizarTarea(tarea);
    }
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
