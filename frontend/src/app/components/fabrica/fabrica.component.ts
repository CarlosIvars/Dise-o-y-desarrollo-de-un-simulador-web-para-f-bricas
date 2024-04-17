import { Component } from '@angular/core';

import { Fabrica, Trabajador, Maquina, TareaInicial, Tarea, TareaFinal } from '../../interfaces/interfaces';
import { FabricaService } from '../../services/fabrica.service';
import { Subscription, finalize } from 'rxjs';
import { TareasService } from '../../services/tareas.service';
import { TrabajadoresService } from '../../services/trabajadores.service';
import { TimerService } from '../../services/timer.service';
import { MaquinasService } from '../../services/maquinas.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FabricaImpl } from '../../clases/fabrica.class';
import { TrabajadorImpl } from '../../clases/trabajador.class';
import { MaquinaImpl } from '../../clases/maquina.class';
import { TareaImpl } from '../../clases/tarea.class';

@Component({
  selector: 'app-fabrica',
  templateUrl: './fabrica.component.html',
  styleUrl: './fabrica.component.css'
})
export class FabricaComponent {
  fabrica_id?: number;

  cargando = true;

  fabrica?: Fabrica;
  private fabricaSub?: Subscription;

  trabajadores: Trabajador[] = [];
  private trabajadoresSub?: Subscription;
  
  maquinas: Maquina[] = [];
  private maquinasSub?: Subscription;

  tareasIniciales: TareaInicial[] = [];
  private tareasInicialesSub?: Subscription;

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  tareasFinales: TareaFinal[] = [];
  private tareasFinalesSub?: Subscription;

  trabajadoresForm: boolean = false;
  maquinasForm: boolean = false;
  tareasForm: boolean = false;

  constructor(private fabricaService: FabricaService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private tareasService: TareasService, private timerService: TimerService, private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fabrica_id = Number(this.route.snapshot.paramMap.get('id'));

    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.trabajadoresSub = this.trabajadoresService.trabajadores$.subscribe(trabajadores => {
      this.trabajadores = trabajadores;
    });

    this.maquinasSub = this.maquinasService.maquinas$.subscribe(maquinas => {
      this.maquinas = maquinas;
    })

    this.tareasInicialesSub = this.fabricaService.tareasIniciales$.subscribe(tareasIniciales => {
      this.tareasIniciales = tareasIniciales;
    });

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.tareasFinalesSub = this.fabricaService.tareasFinales$.subscribe(tareasFinales => {
      this.tareasFinales = tareasFinales;
    });

    this.iniciarFabrica(this.fabrica_id);
  }

  ngOnDestroy(): void {
    if (this.fabricaSub) {
      this.fabricaSub.unsubscribe();
    }

    if (this.trabajadoresSub) {
      this.trabajadoresSub.unsubscribe();
    }

    if (this.maquinasSub) {
      this.maquinasSub.unsubscribe();
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

  //TrabajadoresForm
  abrirTrabajadoresForm(): void {
    this.trabajadoresForm = true;
  }
  cerrarTrabajadoresForm(): void {
    this.trabajadoresForm = false;
  }

  //MaquinasForm
  abrirMaquinasForm(): void {
    this.maquinasForm = true;
  }
  cerrarMaquinasForm(): void {
    this.maquinasForm = false;
  }

  //TareasForm
  abrirTareasForm(): void {
    this.tareasForm = true;
  }
  cerrarTareasForm(): void {
    this.tareasForm = false;
  }

  iniciarFabrica(fabrica_id: number) {
    if (fabrica_id != null && fabrica_id != undefined) {
      console.log("Cargando el contenido de la fabrica...");
      this.cargando = true;

      this.apiService.getAllFabricas().pipe(
        finalize(() => {          
          this.fabricaService.actualizarFabrica(new FabricaImpl(1, "Fabrica por defecto", 1, 7, 41, 5000, 300));

          const trabajadores: Trabajador[] = [];
          trabajadores.push(new TrabajadorImpl(1, "Carlos", "Ingeniero", 1800, "#FF0000", false));
          trabajadores.push(new TrabajadorImpl(2, "Javi", "Programador", 1600, "#0023FF", false));
          this.trabajadoresService.actualizarTrabajadores(trabajadores);

          const maquinas: Maquina[] = [];
          maquinas.push(new MaquinaImpl(1, "Picadora industrial", "Prueba", 800, "#FF0000"));
          maquinas.push(new MaquinaImpl(2, "Ensamblaje", "Prueba2", 600, "#0023FF"));
          this.maquinasService.actualizarMaquinas(maquinas);

          const tareas: Tarea[] = [];
          tareas.push(new TareaImpl(1, "Preparar", 10, 5, 0));
          tareas.push(new TareaImpl(2, "Procesar", 0, 15, 0));
          tareas.push(new TareaImpl(3, "Embalar", 0, 7, 0));
          this.tareasService.actualizarTareas(tareas);

          this.cargando = false;
          console.log("Fin de cargar el contenido de la fabrica.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
