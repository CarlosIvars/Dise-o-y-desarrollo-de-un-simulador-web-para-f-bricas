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

  constructor() { 

    const trabajadores: Trabajador[] = [];
    trabajadores.push(new TrabajadorImpl(1, "Carlos", "Ingeniero", 1800, "#FF0000", false));
    trabajadores.push(new TrabajadorImpl(2, "Javi", "Programador", 1600, "#0023FF", false));
    this.actualizarTrabajadores(trabajadores);

  }

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

}
