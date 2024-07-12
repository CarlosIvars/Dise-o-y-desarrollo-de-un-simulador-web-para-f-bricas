import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { MaquinasService } from '../../../services/maquinas.service';
import { MaquinaImpl } from '../../../clases/maquina.class';
import { Skill } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-maquinas-form',
  templateUrl: './maquinas-form.component.html',
  styleUrl: './maquinas-form.component.css'
})
export class MaquinasFormComponent {
  @Input() hard_skills: Skill[] = [];

  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  fatiga: number = 0;
  coste_h!: number;
  skills: number[] = [];

  constructor(private apiService: ApiService, private maquinasService: MaquinasService) {}

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  crearMaquina(): void {
    if(!this.cargando){
      console.log("Creando maquina...");
      this.cargando = true;

      this.apiService.crearMaquina(this.nombre, this.fatiga, this.coste_h, this.skills).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear maquina.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
            if(response.maquina != undefined) {
              //const numeric_id = response.maquina[0];
              const alfanumeric_id = response.maquina[1];
              const nombre = response.maquina[2];
              const fatiga = response.maquina[3];
              const coste_h = response.maquina[4];
              //const fabrica_id = response.maquina[5];
              //const trabajo_id = response.maquina[6];
              const skills = response.maquina[7];

              if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined && skills != undefined) {
                this.maquinasService.anyadirMaquina(new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h, skills));
              }
            }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  crearMaquinaAleatoria(): void {
    if(!this.cargando){
      console.log("Creando maquina aleatoria...");
      this.cargando = true;

      this.apiService.crearMaquinaAleatoria(1).pipe(
        finalize(() => {
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear maquina aleatoria.");
        })
      ).subscribe({
        next: (response) => {
          console.log("Respuesta: ", response);
            if(response.maquinas != undefined && response.maquinas[0] != undefined) {
              //const numeric_id = response.maquinas[0][0];
              const alfanumeric_id = response.maquinas[0][1];
              const nombre = response.maquinas[0][2];
              const fatiga = response.maquinas[0][3];
              const coste_h = response.maquinas[0][4];
              //const fabrica_id = response.maquinas[0][5];
              //const trabajo_id = response.maquinas[0][6];
              const skills = response.maquinas[0][7];

              if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined && skills != undefined) {
                this.maquinasService.anyadirMaquina(new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h, skills));
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
