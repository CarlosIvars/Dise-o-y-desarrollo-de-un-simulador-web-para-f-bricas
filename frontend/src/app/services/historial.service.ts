import { Injectable } from '@angular/core';
import { Fabrica, Maquina, Tarea, Trabajador } from '../interfaces/interfaces';
import { Subscription, finalize } from 'rxjs';
import { FabricaService } from './fabrica.service';
import { TareasService } from './tareas.service';
import { TrabajadoresService } from './trabajadores.service';
import { MaquinasService } from './maquinas.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  //Guardamos todas la variables necesarias mediante un observable
  fabrica?: Fabrica;
  private fabricaSub?: Subscription;

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  trabajadores: Trabajador[] = [];
  private trabajadoresSub?: Subscription;
  
  maquinas: Maquina[] = [];
  private maquinasSub?: Subscription;

  constructor(private fabricaService: FabricaService, private tareasService: TareasService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private apiService: ApiService) { 
    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.trabajadoresSub = this.trabajadoresService.trabajadores$.subscribe(trabajadores => {
      this.trabajadores = trabajadores;
    });

    this.maquinasSub = this.maquinasService.maquinas$.subscribe(maquinas => {
      this.maquinas = maquinas;
    });
  }

  guardar_historial() {
    if(this.fabrica != undefined) {
      console.log("Guardando el historial...")
      this.apiService.addHistorial(this.fabrica.coste, this.fabrica.beneficio, this.fabrica.capital, this.trabajadores, this.maquinas, this.tareas).pipe(
        finalize(() => {
          console.log("Fin de guardar historial.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Historial guardado: ", response);
        },
        error: (error) => {
          console.error("Error al guardar el historial: " + error); 
        }
      });
    }
  }
}
