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

}
