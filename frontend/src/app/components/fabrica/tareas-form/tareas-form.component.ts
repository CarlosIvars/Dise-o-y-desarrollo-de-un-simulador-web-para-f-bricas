import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Subscription, finalize } from 'rxjs';
import { TareasService } from '../../../services/tareas.service';
import { TareaImpl } from '../../../clases/tarea.class';
import { Tarea } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-tareas-form',
  templateUrl: './tareas-form.component.html',
  styleUrl: './tareas-form.component.css'
})
export class TareasFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  sector: string = "";
  nombre: string = "";
  duracion!: number;
  beneficio!: number;
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

      this.apiService.crearTarea(this.sector, this.nombre, this.duracion, this.beneficio, this.descripcion, this.subtask_dependencia).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear tarea.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
          this.tareasService.anyadirTarea(new TareaImpl(5, this.nombre, 10, 12, 50, 0));
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
