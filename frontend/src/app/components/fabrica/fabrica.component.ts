import { Component } from '@angular/core';

import { Fabrica, Trabajador, Maquina, Tarea } from '../../interfaces/interfaces';
import { FabricaService } from '../../services/fabrica.service';
import { Subscription, finalize } from 'rxjs';
import { TareasService } from '../../services/tareas.service';
import { TrabajadoresService } from '../../services/trabajadores.service';
import { TimerService } from '../../services/timer.service';
import { MaquinasService } from '../../services/maquinas.service';
import { ActivatedRoute, Router } from '@angular/router';
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

  //Forms para los trabajadores
  trabajadoresForm: boolean = false;
  editTrabajadoresForm: boolean = false;
  trabajadorEditando!: Trabajador;

  //Forms para las maquinas
  maquinasForm: boolean = false;
  editMaquinasForm: boolean = false;
  maquinaEditando!: Maquina;

  //Forms para las tareas
  tareasForm: boolean = false;
  editTareasForm: boolean = false;
  tareaEditando!: Tarea;

  constructor(private fabricaService: FabricaService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private tareasService: TareasService, private timerService: TimerService, private route: ActivatedRoute, private apiService: ApiService, private router: Router) {}

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

  //EditTrabajadoresForm
  abrirEditTrabajadoresForm(trabajador: Trabajador): void {
    this.trabajadorEditando = trabajador;
    this.editTrabajadoresForm = true;
  }
  cerrarEditTrabajadoresForm(): void {
    this.editTrabajadoresForm = false;
  }

  //MaquinasForm
  abrirMaquinasForm(): void {
    this.maquinasForm = true;
  }
  cerrarMaquinasForm(): void {
    this.maquinasForm = false;
  }

  //EditMaquinasForm
  abrirEditMaquinasForm(maquina: Maquina): void {
    this.maquinaEditando = maquina;
    this.editMaquinasForm = true;
  }
  cerrarEditMaquinasForm(): void {
    this.editMaquinasForm = false;
  }

  //TareasForm
  abrirTareasForm(): void {
    this.tareasForm = true;
  }
  cerrarTareasForm(): void {
    this.tareasForm = false;
  }

  //EditTareasForm
  abrirEditTareasForm(tarea: Tarea): void {
    this.tareaEditando = tarea;
    this.editTareasForm = true;
  }
  cerrarEditTareasForm(): void {
    this.editTareasForm = false;
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

          //Comprobamos si nos llega la respuesta
          if(response.fabrica_id != null && response.fabrica_id != undefined) {

            const fabrica_id = this.fabrica_id;
            const fabrica_nombre = response.fabrica_id[0];
            const fabrica_costes = response.fabrica_id[1];
            const fabrica_beneficios = response.fabrica_id[2];
            const fabrica_capital = response.fabrica_id[3];

            //Si tenemos todos los datos añadimos la fabrica
            if(fabrica_id != undefined && fabrica_nombre != undefined && fabrica_costes != undefined && fabrica_beneficios != undefined && fabrica_capital != undefined) {
              this.fabricaService.actualizarFabrica(new FabricaImpl(fabrica_id, fabrica_nombre, 1, 0, 0, fabrica_capital, fabrica_beneficios));

              //Comprobamos si tenemos los datos para los trabajadores
              if(response.trabajadores != null && response.trabajadores != undefined) {
                const trabajadores: Trabajador[] = [];

                for (const trabajador of response.trabajadores) {
                  //const numeric_id = trabajador[0];
                  const alfanumeric_id = trabajador[1];
                  const nombre = trabajador[2];
                  const apellidos = trabajador[3];
                  const fecha_nacimiento = trabajador[4];
                  const trabajados_apto = trabajador[5];
                  const fatiga = trabajador[6];
                  const coste_h = trabajador[7];
                  const preferencias_trabajo = trabajador[8];
                  //const fabrica_id = trabajador[9];
                  //const trabajo_id = trabajador[10];

                  //Si tenemos todos los datos añadimos el trabajador
                  if(alfanumeric_id != undefined && nombre != undefined && apellidos != undefined && trabajados_apto != undefined && fatiga != undefined && coste_h != undefined && preferencias_trabajo != undefined) {
                    trabajadores.push(new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo));
                  } else {
                    console.log("Omitiendo la generacion del trabajador por falta de datos...");
                  }
                }
                if (trabajadores.length > 0) {
                  this.trabajadoresService.actualizarTrabajadores(trabajadores);
                }
              } else {
                console.error("No se ha podido obtener el array de trabajadores");
              }

              //Comprobamos si tenemos los datos para las maquinas
              if(response.maquinas != null && response.maquinas != undefined) {
                const maquinas: Maquina[] = [];

                for (const maquina of response.maquinas) {
                  //const numeric_id = maquina[0];
                  const alfanumeric_id = maquina[1];
                  const nombre = maquina[2];
                  const fatiga = maquina[3];
                  const coste_h = maquina[4];
                  //const fabrica_id = maquina[5];
                  //const trabajo_id = maquina[6];

                  //Si tenemos todos los datos añadimos la maquina
                  if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined) {
                    maquinas.push(new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h));
                  } else {
                    console.log("Omitiendo la generacion de la maquina por falta de datos...");
                  }
                }
                if (maquinas.length > 0) {
                  this.maquinasService.actualizarMaquinas(maquinas);
                }
              } else {
                console.error("No se ha podido obtener el array de maquinas");
              }

              //Comprobamos si tenemos los datos para las tareas
              if(response.subtasks != null && response.subtasks != undefined) {
                const tareas: Tarea[] = [];

                for (const tarea of response.subtasks) {
                  const id = tarea[0];
                  const nombre = tarea[1];
                  const duracion = tarea[2];
                  const beneficio = tarea[3];
                  const descripcion = tarea[4];

                  //Si tenemos todos los datos añadimos la tarea
                  if(id != undefined && nombre != undefined && duracion != undefined && beneficio != undefined && descripcion != undefined) {
                    tareas.push(new TareaImpl(id, nombre, 0, duracion, beneficio, 0, descripcion));
                  } else {
                    console.log("Omitiendo la generacion de la tarea por falta de datos...");
                  }
                }
                if (tareas.length > 0) {
                  this.tareasService.actualizarTareas(tareas);
                }
              } else {
                console.error("No se ha podido obtener el array de tareas");
              }

            } else {
              alert("Faltan datos para la incialización de la fábrica.")
            }

            //Añadimos las tareas
            /*
            const tareas: Tarea[] = [];
            tareas.push(new TareaImpl(1, "Preparar", 10, 2, 5, 0));
            tareas.push(new TareaImpl(2, "Procesar", 0, 5, 30,0));
            tareas.push(new TareaImpl(3, "Terminar", 0, 7, 10, 0));
            tareas[1].setTareaPadre(tareas[0]);
            tareas[2].setTareaPadre(tareas[1]);
            this.tareasService.actualizarTareas(tareas);
            */

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

  skillMatching() {
    console.log("Realizando el skill matching...");
  
    this.apiService.skillMatching().pipe(
      finalize(() => {
        console.log("Fin del skill matching.");
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

  algoritmoGenetico() {
    console.log("Realizando el algoritmo genetico...");
  
    this.apiService.algoritmoGenetico().pipe(
      finalize(() => {
        console.log("Fin del algoritmo genetico.");
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

  cerrarSesion() {
    this.router.navigate(['/']);
  }
}
