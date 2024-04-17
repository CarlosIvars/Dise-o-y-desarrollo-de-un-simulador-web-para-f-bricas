import { Injectable } from '@angular/core';

import { Fabrica, Maquina, TareaInicial, Tarea, TareaFinal } from '../interfaces/interfaces';
import { FabricaImpl } from '../clases/fabrica.class';
import { MaquinaImpl } from '../clases/maquina.class';
import { TareaInicialImpl } from '../clases/tarea-inicial.class';
import { TareaFinalImpl } from '../clases/tarea-final.class';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FabricaService {

  // Variables y sus observables
  private fabricaSubject = new BehaviorSubject<Fabrica>({} as Fabrica);
  fabrica$ = this.fabricaSubject.asObservable();

  private tareasInicialesSubject = new BehaviorSubject<TareaInicial[]>([]);
  tareasIniciales$ = this.tareasInicialesSubject.asObservable();

  private tareasFinalesSubject = new BehaviorSubject<TareaFinal[]>([]);
  tareasFinales$ = this.tareasFinalesSubject.asObservable();

  constructor() { }

  // Metodos para la Fabrica
  actualizarFabrica(fabrica: Fabrica) {
    this.fabricaSubject.next(fabrica);
  }

  // Metodos para las Tareas Inciales
  actualizarTareasIniciales(tareasIniciales: TareaInicial[]) {
    this.tareasInicialesSubject.next(tareasIniciales);
  }

  // Metodos para las Tareas Finales
  actualizarTareasFinales(tareasFinales: TareaFinal[]) {
    this.tareasFinalesSubject.next(tareasFinales);
  }

  // Otros...
  inicializarFabricaDefault(): void {
    //Inicializamos una fábrica default
    const tareasIniciales: TareaInicial[] = [];
    tareasIniciales.push(new TareaInicialImpl(1, "Tornillos", 20, 5));
    this.actualizarTareasIniciales(tareasIniciales);

    const tareasFinales: TareaFinal[] = [];
    tareasFinales.push(new TareaFinalImpl(1, 100));
    //tareasFinales[0].addDependencias(tareas[0]);
    this.actualizarTareasFinales(tareasFinales);
  }
}
