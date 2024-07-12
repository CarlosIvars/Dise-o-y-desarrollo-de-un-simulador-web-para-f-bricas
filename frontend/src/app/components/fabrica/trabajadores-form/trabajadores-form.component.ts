import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Subscription, finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { TrabajadorImpl } from '../../../clases/trabajador.class';
import { Skill, Tarea } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-trabajadores-form',
  templateUrl: './trabajadores-form.component.html',
  styleUrl: './trabajadores-form.component.css'
})
export class TrabajadoresFormComponent {
  @Input() hard_skills: Skill[] = [];
  @Input() soft_skills: Skill[] = [];

  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  apellidos: string = "";
  fecha_nacimiento: string = "";
  fatiga: number = 0;
  coste_h!: number;
  preferencias: string = "";
  skills: number[] = [];

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;
  
  constructor(private apiService: ApiService, private trabajadoresService: TrabajadoresService, private tareasService: TareasService) { }

  ngOnInit(): void {
    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });
  }

  ngOnDestroy(): void {
    if (this.tareasSub) {
      this.tareasSub.unsubscribe();
    }
  }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  crearTrabajador(): void {
    if(!this.cargando){
      console.log("Creando trabajador...");
      this.cargando = true;

      this.apiService.crearTrabajador(this.nombre, this.apellidos, this.fecha_nacimiento, this.fatiga, this.coste_h, this.preferencias, this.skills).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear trabajador.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
          if(response.trabajador != null && response.trabajador != undefined) {
            //const numeric_id = response.trabajador[0];
            const alfanumeric_id = response.trabajador[1];
            const nombre = response.trabajador[2];
            const apellidos = response.trabajador[3];
            const fecha_nacimiento = response.trabajador[4];
            const trabajados_apto = response.trabajador[5];
            const fatiga = response.trabajador[6];
            const coste_h = response.trabajador[7];
            const preferencias_trabajo = response.trabajador[8];
            //const fabrica_id = response.trabajador[9];
            //const trabajo_id = response.trabajador[10];
            const skills = response.trabajador[11];

            if(alfanumeric_id != undefined && nombre != undefined && apellidos != undefined && trabajados_apto != undefined && fatiga != undefined && coste_h != undefined && preferencias_trabajo != undefined && skills != undefined) {
              this.trabajadoresService.anyadirTrabajador(new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo, skills));
            }
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  crearTrabajadorAleatorio(): void {
    if(!this.cargando){
      console.log("Creando trabajador aleatorio...");
      this.cargando = true;

      this.apiService.crearTrabajadorAleatorio(1).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear trabajador aleatorio.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          if(response.trabajadores != null && response.trabajadores != undefined && response.trabajadores[0] != null && response.trabajadores[0] != undefined) {
            //const numeric_id = response.trabajadores[0][0];
            const alfanumeric_id = response.trabajadores[0][1];
            const nombre = response.trabajadores[0][2];
            const apellidos = response.trabajadores[0][3];
            const fecha_nacimiento = response.trabajadores[0][4];
            const trabajados_apto = response.trabajadores[0][5];
            const fatiga = response.trabajadores[0][6];
            const coste_h = response.trabajadores[0][7];
            const preferencias_trabajo = response.trabajadores[0][8];
            //const fabrica_id = response.trabajadores[0][9];
            //const trabajo_id = response.trabajadores[0][10];
            const skills = response.trabajadores[0][11];

            if(alfanumeric_id != undefined && nombre != undefined && apellidos != undefined && trabajados_apto != undefined && fatiga != undefined && coste_h != undefined && preferencias_trabajo != undefined && skills != undefined) {
              this.trabajadoresService.anyadirTrabajador(new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo, skills));
            }
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  checkSkill(id: number) {
    const index = this.skills.indexOf(id);
    if (index !== -1) {
      // Si el valor ya está presente, lo quitamos
      this.skills.splice(index, 1);
    } else {
      // Si el valor no está presente, lo agregamos
      this.skills.push(id);
    }
  }
}
