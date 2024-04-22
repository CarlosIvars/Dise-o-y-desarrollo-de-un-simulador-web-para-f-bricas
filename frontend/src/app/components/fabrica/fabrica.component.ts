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
          tareas.push(new TareaImpl(1, "Preparar", 10, 2, 5, 0));
          tareas.push(new TareaImpl(2, "Procesar", 0, 5, 30,0));
          tareas.push(new TareaImpl(3, "Terminar", 0, 7, 10, 0));
          tareas[1].setTareaPadre(tareas[0]);
          tareas[2].setTareaPadre(tareas[1]);
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
