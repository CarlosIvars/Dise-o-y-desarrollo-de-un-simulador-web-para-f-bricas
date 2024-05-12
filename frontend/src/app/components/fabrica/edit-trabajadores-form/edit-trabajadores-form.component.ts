import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Skill, Tarea, Trabajador } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { Subscription, finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { TrabajadorImpl } from '../../../clases/trabajador.class';
import { TareaCardComponent } from '../tarea-card/tarea-card.component';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-edit-trabajadores-form',
  templateUrl: './edit-trabajadores-form.component.html',
  styleUrl: './edit-trabajadores-form.component.css'
})
export class EditTrabajadoresFormComponent {
  @Input() trabajador!: Trabajador;

  @Input() hard_skills: Skill[] = [];
  @Input() soft_skills: Skill[] = [];
  
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  apellidos: string = "";
  fecha_nacimiento: string = "";
  fatiga: number = 0;
  coste_h!: number;
  preferencias!: number;
  skills: number[] = [];

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  constructor(private apiService: ApiService, private tareasService: TareasService, private trabajadoresService: TrabajadoresService) { }

  ngOnInit() {
    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    if(this.trabajador != undefined) {
      this.nombre = this.trabajador.nombre;
      this.apellidos = this.trabajador.apellidos;
      this.fatiga = this.trabajador.fatiga;
      this.coste_h = this.trabajador.coste_h;
      this.preferencias = this.trabajador.preferencias_trabajo;
      this.skills = this.trabajador.skills;

      //Gestionamos la fecha
      const date = new Date(this.trabajador.fecha_nacimiento);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      this.fecha_nacimiento = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log("Fecha_nacimiento: " + this.fecha_nacimiento);
    }
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

  modificarTrabajador(): void {
    if(!this.cargando){
      console.log("Modificando el trabajador...");
      this.cargando = true;

      this.apiService.modificarTrabajador(this.trabajador.id, this.nombre, this.apellidos, this.fecha_nacimiento, this.fatiga, this.coste_h, this.preferencias, this.trabajador.trabajos_apto, this.skills).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar trabajador.");
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
              const trabajador = new TrabajadorImpl(alfanumeric_id, nombre, apellidos, fecha_nacimiento, trabajados_apto, fatiga, coste_h, preferencias_trabajo, skills);
              this.trabajadoresService.actualizarTrabajador(trabajador);
            } else {
              console.error("Datos insuficionestes para modificar trabajador...");
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

  borrarTrabajador() {
    if(!this.cargando){
      if(confirm("¿Estás seguro que deseas eliminar el trabajador?")) {
        console.log("Eliminando el trabajador...");
        this.cargando = true;
      
        this.apiService.eliminarTrabajador(this.trabajador.id).pipe(
          finalize(() => {
            console.log("Fin de eliminar trabajador.");
            this.cargando = false;
          })
        ).subscribe({
          next: (response) => {
            console.log("Respuesta: ", response);
            this.trabajadoresService.eliminarTrabajador(this.trabajador.id);
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
