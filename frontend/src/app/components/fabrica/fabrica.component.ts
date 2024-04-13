import { Component } from '@angular/core';

import { Fabrica, Trabajador, Maquina, TareaInicial, Tarea, TareaFinal } from '../../interfaces/interfaces';
import { FabricaService } from '../../services/fabrica.service';
import { Subscription } from 'rxjs';
import { TareasService } from '../../services/tareas.service';
import { TrabajadoresService } from '../../services/trabajadores.service';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-fabrica',
  templateUrl: './fabrica.component.html',
  styleUrl: './fabrica.component.css'
})
export class FabricaComponent {
  fabrica?: Fabrica;
  private fabricaSub?: Subscription;

  trabajadores: Trabajador[] = [];
  private trabajadoresSub?: Subscription;
  
  maquinas: Maquina[] = [];

  tareasIniciales: TareaInicial[] = [];
  private tareasInicialesSub?: Subscription;

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  tareasFinales: TareaFinal[] = [];
  private tareasFinalesSub?: Subscription;

  constructor(private fabricaService: FabricaService, private trabajadoresService: TrabajadoresService, private tareasService: TareasService, private timerService: TimerService) {}

  ngOnInit(): void {
    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.trabajadoresSub = this.trabajadoresService.trabajadores$.subscribe(trabajadores => {
      this.trabajadores = trabajadores;
    });

    this.tareasInicialesSub = this.fabricaService.tareasIniciales$.subscribe(tareasIniciales => {
      this.tareasIniciales = tareasIniciales;
    });

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.tareasFinalesSub = this.fabricaService.tareasFinales$.subscribe(tareasFinales => {
      this.tareasFinales = tareasFinales;
    });

    const data = this.fabricaService.inicializarFabricaDefault();
    this.maquinas = data.maquinas;
  }

  ngOnDestroy(): void {
    if (this.fabricaSub) {
      this.fabricaSub.unsubscribe();
    }

    if (this.trabajadoresSub) {
      this.trabajadoresSub.unsubscribe();
    }

    if (this.tareasInicialesSub) {
      this.tareasInicialesSub.unsubscribe();
    }

    if (this.tareasSub) {
      this.tareasSub.unsubscribe();
    }

    if (this.tareasFinalesSub) {
      this.tareasFinalesSub.unsubscribe();
    }
  }

  toggleFabricaEjecucion() {
    if (this.fabrica?.activa == true) {
      this.fabrica.activa = false;
      this.timerService.pararEjecucion();
    } else if (this.fabrica?.activa == false) {
      this.fabrica.activa = true;
      this.timerService.iniciarEjecucion();
    }
  }

  formatearMinutos(numero: number | undefined) {
    if(numero != undefined) {
      return numero.toString().padStart(2, '0');
    }
    return "";
  }
}
