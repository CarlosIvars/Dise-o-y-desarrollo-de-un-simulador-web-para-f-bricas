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
  @Output() deleteFabrica = new EventEmitter<Fabrica>();

  @Input() fabrica: Fabrica = {} as Fabrica;

  cargando: boolean = false;

  nombre_fabrica: string = "";
  capital!: number;
  sector: string = "";
  beneficio!: number;
  coste!: number;


  constructor(private apiService: ApiService, private fabricaService: FabricaService) { }

  ngOnInit() {
    if(this.fabrica != undefined) {
      this.nombre_fabrica = this.fabrica.nombre;
      this.sector = this.fabrica.sector;
      this.capital = this.fabrica.capital;
      this.beneficio = this.fabrica.beneficio;
      this.coste = this.fabrica.coste;
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

      this.apiService.modificarFabrica(this.nombre_fabrica).pipe(
        finalize(() => {
          this.cargando = false; 
          console.log("Fin de modificar fabrica");
          this.close.emit();
        })
      ).subscribe({
        next: (response) => {
        console.log("Respuesta: ", response);

        try{
          //Comprobamos que recibimos la respuesta
          if(response.fabrica != null && response.fabrica != undefined) {

            //Si tenemos todos los datos añadimos la tarea
            const { id, nombre, capital, beneficios, costes } = response.fabrica;
            if(id != undefined && nombre != undefined && capital != undefined && beneficios != undefined && costes != undefined) {
              this.fabricaService.actualizarFabrica(new FabricaImpl(id, nombre, 1, 0, 0, capital, beneficios, costes, "Prueba"));
            } else {
              alert("Error: los datos recibidos por el servidor son erroneros o insuficientes...");
            }
          } else {
            alert("Error: no se pudo acceder a los datos recibidos por el servidor.");
          }

        } catch (error: any) {
          console.error(error);
          alert("Error al procesar la respuesta: " + error.message);
        }
          
        },
        error: (error) => {
          alert("Error: " + error); 
        }
      });
    }
  }

  borrarFabrica(fabrica: Fabrica): void {
    if(!this.cargando){
      if(confirm("¿Estás seguro que deseas eliminar la fábrica?")) {
        console.log("Eliminando la fabrica...");
        this.cargando = true;
      
        this.apiService.eliminarFabrica(fabrica.id).pipe(
          finalize(() => {
            console.log("Fin de eliminar fabrica.");
            this.cargando = false;
          })
        ).subscribe({
          next: (response) => {
            console.log("Respuesta: ", response);
            this.deleteFabrica.emit(this.fabrica);
          },
          error: (error) => {
            alert("Error: " + error); 
          }
        });
      }
    }
  }
}
