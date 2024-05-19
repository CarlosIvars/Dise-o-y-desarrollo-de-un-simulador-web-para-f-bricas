import { Injectable } from '@angular/core';
import { Trabajador } from '../interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';
import { TrabajadorImpl } from '../clases/trabajador.class';

@Injectable({
  providedIn: 'root'
})
export class TrabajadoresService {

  private trabajadoresSubsject = new BehaviorSubject<Trabajador[]>([]);
  trabajadores$ = this.trabajadoresSubsject.asObservable();

  constructor() { }

  actualizarTrabajadores(trabajadores: Trabajador[]) {
    this.trabajadoresSubsject.next(trabajadores);
  }

  actualizarTrabajador(trabajador: Trabajador) {
    const trabajadores = this.trabajadoresSubsject.getValue();
    const index = trabajadores.findIndex(t => t.id === trabajador.id);
    if (index !== -1) {
      trabajadores[index] = trabajador;
      this.actualizarTrabajadores(trabajadores);
    }
  }

  anyadirTrabajador(trabajador: Trabajador) {
    const trabajadores = this.trabajadoresSubsject.getValue();
    trabajadores.push(trabajador);
    this.actualizarTrabajadores(trabajadores);
  }

  eliminarTrabajador(id: string) {
    const trabajadores = this.trabajadoresSubsject.getValue();
    const index = trabajadores.findIndex(t => t.id === id);
    if (index !== -1) {
      trabajadores.splice(index, 1);
      this.actualizarTrabajadores(trabajadores);
    }
  }

  isTrabajador(obj: any): obj is Trabajador {
    return obj &&
      typeof obj.id === 'string' &&
      typeof obj.nombre === 'string' &&
      typeof obj.apellidos === 'string' &&
      typeof obj.fecha_nacimiento === 'string' &&
      typeof obj.trabajos_apto === 'number' &&
      typeof obj.fatiga === 'number' &&
      typeof obj.coste_h === 'number' &&
      typeof obj.preferencias_trabajo === 'number' &&
      typeof obj.activo === 'boolean' &&
      Array.isArray(obj.skills) &&
      obj.skills.every((skill: any) => typeof skill === 'number');
  }
}
