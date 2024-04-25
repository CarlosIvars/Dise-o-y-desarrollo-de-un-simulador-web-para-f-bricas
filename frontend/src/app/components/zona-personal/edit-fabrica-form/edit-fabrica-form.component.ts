import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Fabrica } from '../../../interfaces/interfaces';
import { ApiService } from '../../../services/api.service';
import { finalize } from 'rxjs';
import { FabricaService } from '../../../services/fabrica.service';
import { FabricaImpl } from '../../../clases/fabrica.class';

@Component({
  selector: 'app-edit-fabrica-form',
  templateUrl: './edit-fabrica-form.component.html',
  styleUrl: './edit-fabrica-form.component.css'
})
export class EditFabricaFormComponent {
  @Output() close = new EventEmitter();
  @Input() fabrica: Fabrica = {} as Fabrica;

  cargando: boolean = false;

  nombre_fabrica: string = "";
  sector: string = "";

  constructor(private apiService: ApiService, private fabricaService: FabricaService) { }

  ngOnInit() {
    if(this.fabrica != undefined) {
      this.nombre_fabrica = this.fabrica.nombre;
      //this.sector = this.fabrica.sector;
    }
  }

  ngOnchanges(changes: SimpleChanges) {
    console.log(changes)
  }

  cerrarModal(): void {
    if(!this.cargando) {
      this.close.emit();
    }
  }

  editarFabrica() {
    if(!this.cargando){
      console.log("Modificando la fabrica...");
      this.cargando = true;

      this.apiService.modificarFabrica(this.nombre_fabrica, this.sector).pipe(
        finalize(() => {
          this.cargando = false; 
          console.log("Fin de modificar fabrica");
          this.close.emit();
        })
      ).subscribe({
        next: (response) => {
        console.log("Respuesta: ", response);

        //Comprobamos que recibimos la respuesta
        if(response.fabrica != null && response.fabrica != undefined) {

          //Si tenemos todos los datos añadimos la tarea
          const { id, nombre, capital, beneficios } = response.fabrica;
          if(id != undefined && nombre != undefined && capital != undefined && beneficios != undefined) {
            this.fabricaService.actualizarFabrica(new FabricaImpl(id, nombre, 1, 0, 0, capital, beneficios));
          } else {
            console.log("Omitiendo la modificacion de la fabrica por falta de datos...");
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
}
