import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Subscription, finalize } from 'rxjs';
import { TareasService } from '../../../services/tareas.service';
import { TareaImpl } from '../../../clases/tarea.class';
import { Skill, Tarea } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrl: './tareas-form.component.css'
})
export class TareasFormComponent {  
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  duracion!: number;
  beneficio!: number;
  coste!: number;
  descripcion: string = "";
  subtask_dependencia: string = "";

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  constructor(private apiService: ApiService, private tareasService: TareasService) { }

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

  crearTarea(): void {
    if(!this.cargando){
      console.log("Creando tarea...");
      this.cargando = true;

      this.apiService.crearTarea(this.nombre, this.duracion, this.beneficio, this.coste, this.descripcion, this.subtask_dependencia).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear tarea.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

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
              const tareaHija = new TareaImpl(id, nombre, 0, duracion, beneficio, coste, 0, descripcion, skills);
              this.tareasService.anyadirTarea(tareaHija);

              debugger;
              if(response.dependencia != null && response.dependencia != undefined) {
                const tareaPadre = this.tareas.find(tarea => tarea.id == response.dependencia);
              
                if (tareaHija && tareaPadre) {
                  tareaHija.tareaPadre = tareaPadre;
                  tareaPadre.tareasHijas.push(tareaHija);
                  this.tareasService.actualizarTarea(tareaHija);
                  this.tareasService.actualizarTarea(tareaPadre);
                }
              }
            } else {
              console.log("Datos recibidos insuficientes para crear el trabajador...");
            }

          } else {
            console.error("No se ha recibido los datos esperados...")
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
