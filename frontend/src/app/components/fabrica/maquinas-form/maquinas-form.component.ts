import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { MaquinasService } from '../../../services/maquinas.service';
import { MaquinaImpl } from '../../../clases/maquina.class';

@Component({
  selector: 'app-maquinas-form',
  templateUrl: './maquinas-form.component.html',
  styleUrl: './maquinas-form.component.css'
})
export class MaquinasFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  fatiga: string = "";
  coste_h!: number;
  skills: string = "";

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
          //this.maquinasService.anyadirMaquina(new MaquinaImpl(3, this.nombre, "ROL", this.coste_h, "000"));  
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
              if(alfanumeric_id != undefined && nombre != undefined && fatiga != undefined && coste_h != undefined) {
                this.maquinasService.anyadirMaquina(new MaquinaImpl(alfanumeric_id, nombre,fatiga, coste_h));
              }
            }
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }
}
