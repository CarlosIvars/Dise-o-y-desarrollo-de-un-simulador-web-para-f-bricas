import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { TrabajadoresService } from '../../../services/trabajadores.service';
import { TrabajadorImpl } from '../../../clases/trabajador.class';

@Component({
  selector: 'app-trabajadores-form',
  templateUrl: './trabajadores-form.component.html',
  styleUrl: './trabajadores-form.component.css'
})
export class TrabajadoresFormComponent {
  @Output() close = new EventEmitter();

  cargando: boolean = false;

  nombre: string = "";
  apellidos: string = "";
  fecha_nacimiento: string = "";
  fatiga: string = "";
  coste_h!: number;
  preferencias: string = "";
  skills: string = "";

  constructor(private apiService: ApiService, private trabajadoresService: TrabajadoresService) { }

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
          this.trabajadoresService.anyadirTrabajador(new TrabajadorImpl(1, this.nombre, "ROL", this.coste_h, "000", false));  
          this.cargando = false; 
          this.cerrarModal();
          console.log("Fin de crear trabajador.");
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
  }
}
