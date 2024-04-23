import { Component } from '@angular/core';

import { Fabrica, Trabajador, Maquina, Tarea } from '../../interfaces/interfaces';
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

  velocidadEjecucion: number = 1;

  userName: string = "Usuario";

  fabrica?: Fabrica;
  private fabricaSub?: Subscription;

  trabajadores: Trabajador[] = [];
  private trabajadoresSub?: Subscription;
  
  maquinas: Maquina[] = [];
  private maquinasSub?: Subscription;

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  cargando = true;

  trabajadoresForm: boolean = false;
  maquinasForm: boolean = false;
  tareasForm: boolean = false;

  constructor(private fabricaService: FabricaService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private tareasService: TareasService, private timerService: TimerService, private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fabrica_id = Number(this.route.snapshot.paramMap.get('id'));

    //Recuperamos el nombre de usuario
    let userName = sessionStorage.getItem("user");
    if (userName != null && userName !== "") {
      this.userName = userName;
    }

    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.trabajadoresSub = this.trabajadoresService.trabajadores$.subscribe(trabajadores => {
      this.trabajadores = trabajadores;
    });

    this.maquinasSub = this.maquinasService.maquinas$.subscribe(maquinas => {
      this.maquinas = maquinas;
    })

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.iniciarFabrica(this.fabrica_id);

    this.cambiarVelocidadEjecucion();
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

    if (this.tareasSub) {
      this.tareasSub.unsubscribe();
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

  cambiarVelocidadEjecucion() {
    this.timerService.cambiarVelocidadEjecucion(this.velocidadEjecucion);
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

      this.apiService.iniciarFabrica(fabrica_id).pipe(
        finalize(() => {   
          this.cargando = false;
          console.log("Fin de cargar el contenido de la fabrica.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          if(response.fabrica_id != null && response.fabrica_id != undefined) {
            //Añadimos la fabrica
            this.fabricaService.actualizarFabrica(new FabricaImpl(response.fabrica_id, "Fabrica por defecto", 1, 7, 41, 5000, 300));

            //Añadimos los trabajadores
            if(response.trabajadores != null && response.trabajadores != undefined) {
              const trabajadores: Trabajador[] = [];
              for (const trabajador of response.trabajadores) {
                trabajadores.push(new TrabajadorImpl(trabajador[0], "Trabajador" + trabajador[1], "Ingeniero", 1800, "#FF0000", false));
              }
              if (trabajadores.length > 0) {
                this.trabajadoresService.actualizarTrabajadores(trabajadores);
              }
            }

            //Añadimos las maquinas
            if(response.maquinas != null && response.maquinas != undefined) {
              const maquinas: Maquina[] = [];
              for (const maquina of response.maquinas) {
                maquinas.push(new MaquinaImpl(maquina[0], "Máquina" + maquina[0], "Prueba", 800, "#FF0000"));
              }
              if (maquinas.length > 0) {
                this.maquinasService.actualizarMaquinas(maquinas);
              }
            }

            //Añadimos las tareas
            /*
            if(response.subtasks != null && response.subtasks != undefined) {
              const tareas: Tarea[] = [];
              for (const tarea of response.subtasks) {
                if(tarea.id != undefined) {
                  tareas.push(new TareaImpl(1, "Preparar", 10, 2, 5, 0));
                } 
              }
              if (tareas.length > 0) {
                this.tareasService.actualizarTareas(tareas);
              }
            }
            */
            const tareas: Tarea[] = [];
            tareas.push(new TareaImpl(1, "Preparar", 10, 2, 5, 0));
            tareas.push(new TareaImpl(2, "Procesar", 0, 5, 30,0));
            tareas.push(new TareaImpl(3, "Terminar", 0, 7, 10, 0));
            tareas[1].setTareaPadre(tareas[0]);
            tareas[2].setTareaPadre(tareas[1]);
            this.tareasService.actualizarTareas(tareas);

          } else {
            alert("No se ha podido recuperar los datos de la fábrica seleccionada.");
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
