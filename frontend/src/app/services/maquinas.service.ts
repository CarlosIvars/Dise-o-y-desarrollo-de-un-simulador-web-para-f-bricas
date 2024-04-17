import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Maquina } from '../interfaces/interfaces';
import { MaquinaImpl } from '../clases/maquina.class';

@Injectable({
  providedIn: 'root'
})
export class MaquinasService {

  private maquinasSubsject = new BehaviorSubject<Maquina[]>([]);
  maquinas$ = this.maquinasSubsject.asObservable();

  constructor() { }

  actualizarMaquinas(maquinas: Maquina[]) {
    this.maquinasSubsject.next(maquinas);
  }

  actualizarMaquina(maquina: Maquina) {
    const maquinas = this.maquinasSubsject.getValue();
    const index = maquinas.findIndex(t => t.id === maquina.id);
    if (index !== -1) {
      maquinas[index] = maquina;
      this.actualizarMaquinas(maquinas);
    }
  }

  anyadirMaquina(maquina: Maquina) {
    const maquinas = this.maquinasSubsject.getValue();
    maquinas.push(maquina);
    this.actualizarMaquinas(maquinas);
  }
}
