import { Injectable } from '@angular/core';

import { Fabrica} from '../interfaces/interfaces';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FabricaService {

  // Variables y sus observables
  private fabricaSubject = new BehaviorSubject<Fabrica>({} as Fabrica);
  fabrica$ = this.fabricaSubject.asObservable();

  constructor() { }

  // Metodos para la Fabrica
  actualizarFabrica(fabrica: Fabrica) {
    this.fabricaSubject.next(fabrica);
  }

}
