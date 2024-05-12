import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Maquina, Skill } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { MaquinasService } from '../../../services/maquinas.service';
import { finalize } from 'rxjs';
import { MaquinaImpl } from '../../../clases/maquina.class';

@Component({
  selector: 'app-edit-maquinas-form',
  templateUrl: './edit-maquinas-form.component.html',
  styleUrl: './edit-maquinas-form.component.css'
})
export class EditMaquinasFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  @Input() maquina!: Maquina;
  @Input() hard_skills: Skill[] = [];

  nombre: string = "";
  fatiga!: number;
  coste_h!: number;
  skills: number[] = [];

  constructor(private apiService: ApiService, private maquinasService: MaquinasService) { }

  ngOnInit() {
    if(this.maquina != undefined) {
      this.nombre = this.maquina.nombre;
      this.fatiga = this.maquina.fatiga;
      this.coste_h = this.maquina.coste_h;
      this.skills = this.maquina.skills;
    }
  }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  modificarMaquina(): void {
    if(!this.cargando){
      console.log("Modificando la maquina...");
      this.cargando = true;

      this.apiService.modificarMaquina(this.maquina.id, this.nombre, this.coste_h, this.fatiga, this.skills).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de modificar maquina.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);

          //Comprobamos si tenemos la maquina en la respuesta
          if(response.maquina != null && response.maquina != undefined) {
            //const numeric_id = maquina[0];
            const alfanumeric_id = response.maquina[1];
            const nombre = response.maquina[2];
            const fatiga = response.maquina[3];
            const coste_h = response.maquina[4];
            //const fabrica_id = maquina[5];
            //const trabajo_id = maquina[6];
            const skills = response.maquina[7];

            //Si tenemos todos los datos añadimos la maquina
            if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined && skills != undefined) {
              const maquina = new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h, skills);
              this.maquinasService.actualizarMaquina(maquina);
            } else {
              console.log("Omitiendo la modificacion de la maquina por falta de datos...");
            }
          }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  borrarMaquina() {
    if(!this.cargando){
      if(confirm("¿Estás seguro que deseas eliminar la máquina?")) {
        console.log("Eliminando la máquina...");
        this.cargando = true;
      
        this.apiService.eliminarMaquina(this.maquina.id).pipe(
          finalize(() => {
            console.log("Fin de eliminar máquina.");
            this.cargando = false;
          })
        ).subscribe({
          next: (response) => {
            console.log("Respuesta: ", response);
            this.maquinasService.eliminarMaquina(this.maquina.id);
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
