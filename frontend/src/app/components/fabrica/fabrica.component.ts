import { Component, HostListener } from '@angular/core';

import { Fabrica, Trabajador, Maquina, Tarea, Skill } from '../../interfaces/interfaces';
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
import { HistorialService } from '../../services/historial.service';

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

  hard_skills: Skill[] = [];
  soft_skills: Skill[] = [];

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

  constructor(private fabricaService: FabricaService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService, private tareasService: TareasService, private timerService: TimerService, private route: ActivatedRoute, private apiService: ApiService, private router: Router, private historialService: HistorialService) {}

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

      let fabrica: Fabrica = {} as Fabrica;
      let trabajadores: Trabajador[] = [];
      let maquinas: Maquina[] = [];
      let tareas: Tarea[] = [];

      this.apiService.iniciarFabrica(fabrica_id).pipe(
        finalize(() => {   
          // Pase lo que pase se mandan los valores para asegurarnos que se vacian las variables
          this.fabricaService.actualizarFabrica(fabrica);
          this.trabajadoresService.actualizarTrabajadores(trabajadores);
          this.maquinasService.actualizarMaquinas(maquinas);
          this.tareasService.actualizarTareas(tareas);

          console.log("Fin de cargar el contenido de la fabrica.");

          this.getSkills();
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          try{
            //Se comprueba si nos llega la respuesta
            if(response.fabrica_id == null || response.fabrica_id == undefined) {
              alert("No se han podido recuperar los datos de la fábrica seleccionada.");
            } else {
              const fabrica_id = response.fabrica_id[0];
              const fabrica_nombre = response.fabrica_id[1];
              const fabrica_costes = response.fabrica_id[2];
              const fabrica_beneficios = response.fabrica_id[3];
              const fabrica_capital = response.fabrica_id[4];
              const fabrica_sector = response.fabrica_id[7];

              //Se comprueba si nos llegan todos los datos de la fabrica, sino no continuamos
              if(fabrica_id != undefined && fabrica_nombre != undefined && fabrica_costes != undefined && fabrica_beneficios != undefined && fabrica_capital != undefined && fabrica_sector != undefined) {
                fabrica = new FabricaImpl(fabrica_id, fabrica_nombre, 1, 0, 0, fabrica_capital, fabrica_beneficios, fabrica_costes, fabrica_sector);

                //Se comprueba si nos llegan los trabajadores
                if(response.trabajadores != null && response.trabajadores != undefined) {
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
                    const skills = trabajador[11];

                    //Si tenemos todos los datos añadimos el trabajador
                    if(alfanumeric_id != undefined && nombre != undefined && apellidos != undefined && trabajados_apto != undefined && fatiga != undefined && coste_h != undefined && preferencias_trabajo != undefined && skills != undefined) {
                      trabajadores.push(new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo, skills));
                    } else {
                      console.error("Omitiendo la generacion del trabajador por falta de datos...");
                    }
                  }
                } else {
                  alert("No se han podido recuperar los trabajadores de la fábrica seleccionada.");
                }

                //Comprobamos si nos llegan las maquinas
                if(response.maquinas != null && response.maquinas != undefined) {
                  for (const maquina of response.maquinas) {
                    //const numeric_id = maquina[0];
                    const alfanumeric_id = maquina[1];
                    const nombre = maquina[2];
                    const fatiga = maquina[3];
                    const coste_h = maquina[4];
                    //const fabrica_id = maquina[5];
                    //const trabajo_id = maquina[6];
                    const skills = maquina[7];

                    //Si tenemos todos los datos añadimos la maquina
                    if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined && skills != undefined) {
                      maquinas.push(new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h, skills));
                    } else {
                      console.log("Omitiendo la generacion de la maquina por falta de datos...");
                    }
                  }
                } else {
                  alert("No se han podido recuperar las maquinas de la fábrica seleccionada.");
                }

                //Comprobamos si tenemos los datos para las tareas
                if(response.subtasks != null && response.subtasks != undefined) {

                  for (const tarea of response.subtasks) {
                    const id = tarea[0];
                    const nombre = tarea[1];
                    const duracion = tarea[2];
                    const beneficio = tarea[3];
                    const descripcion = tarea[4];
                    //const fabrica_id = tarea[5];
                    const coste = tarea[6];
                    const skills = tarea[7];

                    //Si tenemos todos los datos añadimos la tarea
                    if(id != undefined && nombre != undefined && duracion != undefined && beneficio != undefined && descripcion != undefined && coste != undefined && skills != undefined) {
                      tareas.push(new TareaImpl(id, nombre, 0, duracion, beneficio, coste, 0, descripcion, skills));
                    } else {
                      console.log("Omitiendo la generacion de la tarea por falta de datos...");
                    }
                  }
                } else {
                  console.error("No se han podido recuperar las tareas de la fábrica seleccionada.");
                }

                //Comprobamos si tenemos los datos para las dependencias
                if(response.dependencias != null && response.dependencias != undefined) {
                  for( const [idTareaHija, idTareaPadre] of Object.entries(response.dependencias)) {
                    const tareaHija = tareas.find(tarea => tarea.id === parseInt(idTareaHija));
                    const tareaPadre = tareas.find(tarea => tarea.id === idTareaPadre);
                  
                    if (tareaHija && tareaPadre) {
                      tareaHija.tareaPadre = tareaPadre;
                      tareaPadre.tareasHijas.push(tareaHija);
                    }
                  };
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

          } 
        } catch (error: any) {
          console.error(error);
          alert("Error al procesar la respuesta: " + error.message);
        }
        
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  getSkills() {
    console.log("Recuperando las skills...")
    this.apiService.getSkills().pipe(
      finalize(() => {
        console.log("Fin de recuperar las skills.");
        this.cargando = false;
      })
    ).subscribe({
      next: (response) => {
        console.log("Respuesta: ", response);

        try{
          const { hard_skills, soft_skills } = response;
          if(hard_skills != undefined && soft_skills != undefined) {
            for(let skill of hard_skills) {
              this.hard_skills.push({nombre: skill[0], id: skill[1]});
            }
            for(let skill of soft_skills) {
              this.soft_skills.push({nombre: skill[0], id: skill[1]});
            }
          } else {
            alert("No se pudo recuperar los datos de las skills.");
          }
        } catch (error: any) {
          console.error(error);
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
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
        try{
          console.log("Respuesta: ", response);
          if(response.mejor_individuo != null && response.mejor_individuo != undefined) {
            for(const item of response.mejor_individuo) {
              const idTarea = item[0];
              const idAsignable = item[1];

              const tarea = this.tareas.find(tarea => tarea.id === parseInt(idTarea));

              let asignable;
              if((idAsignable + "").startsWith("H_")) {
                asignable = this.trabajadores.find(trabajador => trabajador.id === idAsignable);
              } else if((idAsignable + "").startsWith("M_")) {
                asignable = this.maquinas.find(maquina => maquina.id === idAsignable);
              }
            
              if (tarea && asignable && this.fabrica) {
                this.tareasService.asignarATarea(tarea, asignable, this.fabrica);
              } else {
                console.error("No se ha podido asignar a tarea.");
              }
            };
          }
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }

  algoritmoGeneticoRL() {
    console.log("Realizando el algoritmo genetico RL...");
  
    this.apiService.algoritmoGeneticoRL().pipe(
      finalize(() => {
        console.log("Fin del algoritmo genetico RL.");
      })
    ).subscribe({
      next: (response) => {
        try{
          console.log("Respuesta: ", response);
          if(response.mejor_individuo != null && response.mejor_individuo != undefined) {
            for( const [idTarea, idAsignable] of Object.entries(response.mejor_individuo)) {
              const tarea = this.tareas.find(tarea => tarea.id === parseInt(idTarea));

              let asignable;
              if((idAsignable + "").startsWith("H_")) {
                asignable = this.trabajadores.find(trabajador => trabajador.id === idAsignable);
              } else if((idAsignable + "").startsWith("M_")) {
                asignable = this.maquinas.find(maquina => maquina.id === idAsignable);
              }
            
              if (tarea && asignable && this.fabrica) {
                this.tareasService.asignarATarea(tarea, asignable, this.fabrica);
              } else {
                console.error("No se ha podido asignar a tarea.");
              }
            };
          }
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }

  guardarHistorial() {
    this.historialService.guardar_historial(8);
  }

  boton1() {
    console.log("Realizando la funcion del boton1...");
  
    this.apiService.funcion1().pipe(
      finalize(() => {
        console.log("Fin de la funcion");
      })
    ).subscribe({
      next: (response) => {
        try{
          console.log("Respuesta: ", response);
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }

  boton2() {
    console.log("Realizando la funcion del boton2...");
  
    this.apiService.funcion1().pipe(
      finalize(() => {
        console.log("Fin de la funcion");
      })
    ).subscribe({
      next: (response) => {
        try{
          console.log("Respuesta: ", response);
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }

  boton3() {
    console.log("Realizando la funcion del boton3...");
  
    this.apiService.funcion1().pipe(
      finalize(() => {
        console.log("Fin de la funcion");
      })
    ).subscribe({
      next: (response) => {
        try{
          console.log("Respuesta: ", response);
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }

  boton4() {
    console.log("Realizando la funcion del boton4...");
  
    this.apiService.funcion1().pipe(
      finalize(() => {
        console.log("Fin de la funcion");
      })
    ).subscribe({
      next: (response) => {
        try{
          console.log("Respuesta: ", response);
        } catch (error: any) {
          alert("Error al procesar la respuesta: " + error.message);
        }
      },
      error: (error) => {
        alert("Error: " + error); 
      }
    });
  }
}
