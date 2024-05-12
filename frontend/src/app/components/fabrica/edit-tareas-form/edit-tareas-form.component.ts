import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Skill, Tarea } from '../../../interfaces/interfaces';
import { TareasService } from '../../../services/tareas.service';
import { ApiService } from '../../../services/api.service';
import { Subscription, finalize } from 'rxjs';
import { TareaImpl } from '../../../clases/tarea.class';

@Component({
  selector: 'app-edit-tareas-form',
  templateUrl: './edit-tareas-form.component.html',
  styleUrl: './edit-tareas-form.component.css'
})
export class EditTareasFormComponent {
  @Input() hard_skills: Skill[] = [];
  @Input() soft_skills: Skill[] = [];

  @Output() close = new EventEmitter();

  cargando: boolean = false;

  @Input() tarea!: Tarea;

  nombre: string = "";
  duracion!: number;
  beneficio!: number;
  coste!: number;
  descripcion: string = "";
  skills: number[] = [];
  subtask_dependencia: string = "";

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  constructor(private apiService: ApiService, private tareasService: TareasService) { }

  ngOnInit(): void {
    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.nombre = this.tarea.nombre;
    this.duracion = this.tarea.duracion;
    this.beneficio = this.tarea.beneficio;
    this.coste = this.tarea.coste;
    this.descripcion = this.tarea.descripcion;
    this.skills = this.tarea.skills;
    this.subtask_dependencia = this.tarea.tareaPadre?.nombre != undefined ? "" + this.tarea.tareaPadre?.nombre : "Sin tarea padre";
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

  modificarTarea(): void {
    if(!this.cargando){
      console.log("Modificando la tarea...");
      this.cargando = true;

      this.apiService.modificarTarea(this.tarea.id, this.nombre, this.duracion, this.beneficio, this.coste, this.descripcion, this.skills).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar tarea.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          //Comprobamos que recibimos la respuesta
          if(response.subtask != null && response.subtask != undefined) {
            const id = response.subtask[0];
            const nombre = response.subtask[1];
            const duracion = response.subtask[2];
            const beneficio = response.subtask[3];
            const descripcion = response.subtask[4];
            //const fabrica_id = response.tarea[5];
            const coste = response.subtask[6];
            const skills = response.subtask[7];

            //Si tenemos todos los datos añadimos la tarea
            if(id != undefined && nombre != undefined && duracion != undefined && beneficio != undefined && descripcion != undefined && coste != undefined && skills != undefined) {
              this.tareasService.modificarTarea(id, nombre, duracion, beneficio, coste, descripcion, skills);
            } else {
              console.log("Omitiendo la modificacion de la tarea por falta de datos...");
            }
          } else {
            console.log("No se ha recibido la respuesta esperada...");
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  borrarTarea() {
    if(!this.cargando){
      if(confirm("¿Estás seguro que deseas eliminar la tarea?")) {
        console.log("Eliminando la tarea...");
        this.cargando = true;
      
        this.apiService.eliminarTarea(this.tarea.id).pipe(
          finalize(() => {
            console.log("Fin de eliminar tarea.");
            this.cargando = false;
          })
        ).subscribe({
          next: (response) => {
            console.log("Respuesta: ", response);
            this.tareasService.eliminarTarea(this.tarea.id);
            this.close.emit();
          },
          error: (error) => {
            alert("Error: " + error); 
          }
        });
      }
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
