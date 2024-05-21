import { Injectable } from '@angular/core';
import { Asignable, Maquina, Tarea, Trabajador } from '../interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
import { TrabajadoresService } from './trabajadores.service';
import { TrabajadorImpl } from '../clases/trabajador.class';
import { MaquinaImpl } from '../clases/maquina.class';
import { MaquinasService } from './maquinas.service';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private tareasSubject = new BehaviorSubject<Tarea[]>([]);
  tareas$ = this.tareasSubject.asObservable();

  constructor(private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService) { }

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

  modificarTarea(id: number, nombre: string, tiempoBase: number, beneficio: number, descripcion: string, coste: number, skills: number[]) {
    const tareas = this.tareasSubject.getValue();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      const tarea = tareas[index];
      tarea.nombre = nombre;
      tarea.tiempoBase = tiempoBase;
      tarea.beneficio = beneficio;
      tarea.descripcion = descripcion;
      tarea.coste = coste;
      tarea.skills = skills;
      this.actualizarTarea(tarea);
    }
  }

  startDrag(asignable: Asignable) {
    const tareas = this.tareasSubject.getValue();
    for(const tarea of tareas) {
      tarea.isDragging = true;

      let skillsMatched = 0;

      for (let i = 0; i < asignable.skills.length; i++) {
        if (tarea.skills.includes(asignable.skills[i])) {
          skillsMatched++;
        }
      }

      tarea.skillsMatched = skillsMatched;
    }

    this.actualizarTareas(tareas);
  }

  stopDrag() {
    const tareas = this.tareasSubject.getValue();
    for(const tarea of tareas) {
      tarea.isDragging = false;
      tarea.skillsMatched = 0;
    }
    this.actualizarTareas(tareas);
  }

  //TODO: crear metodo desasignar

  asignarATarea(tarea: Tarea, nuevo_asignable: Asignable) {
    // Ponemos inactivo el asignable actual de la tarea...
    const asignable_actual = tarea.getAsignable();
    if(asignable_actual != undefined){
      asignable_actual.activo = false;
      if(this.trabajadoresService.isTrabajador(asignable_actual)) {
        this.trabajadoresService.actualizarTrabajador(asignable_actual);
      } else if ( this.maquinasService.isMaquina(asignable_actual)) {
        this.maquinasService.actualizarMaquina(asignable_actual);
      }
    }

    // Se recorren las tareas para quitar el drag y cambiar el asignable
    const tareas = this.tareasSubject.getValue();
    for(const tarea of tareas) {
      tarea.isDragging = false;
      tarea.skillsMatched = 0;

      const tarea_asignable = tarea.getAsignable();
      if(tarea_asignable != undefined && tarea_asignable.id === nuevo_asignable.id) {
        tarea.removeAsignable();
      }
    }
    this.actualizarTareas(tareas);
    
    // Añadimos el nuevo trabajador a la tarea y calculamos su duracion
    tarea.setAsignable(nuevo_asignable);
    tarea.duracion = tarea.tiempoBase + this.calcularDuracion(tarea, nuevo_asignable);
    this.actualizarTarea(tarea);

    // Marcamos el trabajador como activo
    nuevo_asignable.activo = true;

    if(this.trabajadoresService.isTrabajador(nuevo_asignable)) {
      this.trabajadoresService.actualizarTrabajador(nuevo_asignable);
    } else if (this.maquinasService.isMaquina(nuevo_asignable)) {
      this.maquinasService.actualizarMaquina(nuevo_asignable);
    }
  }

  desasignarATarea(tarea: Tarea) { 
    const asignable = tarea.getAsignable();
    if(asignable != undefined) {
      asignable.activo = false;

      tarea.duracion = 0;
      tarea.isWorking = false;
      tarea.tiempoActual = 0;
      tarea.removeAsignable();

      this.actualizarTarea(tarea);
      if(this.trabajadoresService.isTrabajador(asignable)) {
        this.trabajadoresService.actualizarTrabajador(asignable);
      } else if (this.maquinasService.isMaquina(asignable)) {
        this.maquinasService.actualizarMaquina(asignable);
      }
    }
  }

  calcularDuracion(tarea: Tarea, asignable: Asignable) {
    let skillsMatched = 0;
    for (let i = 0; i < asignable.skills.length; i++) {
      if (tarea.skills.includes(asignable.skills[i])) {
        skillsMatched++;
      }
    }

    let D = tarea.tiempoBase;
    let M = skillsMatched / tarea.skills.length;
    const k = 0.5; // 1 para que la nueva duracion sea mayor
    let F = asignable.fatiga / 100;
    let H = (F - 0.5) > 0 ? 1 : 0;
    let S = 1; //Cambiar por el factor_duracion

    const duracion = (D * (1 - M) * (1 + (Math.exp(k * (F - 0.5)) - 1) * H) * S);
    
    return Math.round(duracion);
  }
}
