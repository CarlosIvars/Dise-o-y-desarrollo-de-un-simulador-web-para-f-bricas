import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Fabrica} from '../../interfaces/interfaces';
import { ApiService } from '../../services/api.service';
import { FabricaImpl } from '../../clases/fabrica.class';

@Component({
  selector: 'app-zona-personal',
  templateUrl: './zona-personal.component.html',
  styleUrl: './zona-personal.component.css'
})
export class ZonaPersonalComponent {

  userName: string = "Usuario";

  fabricas: Fabrica[] = [];

  cargando: boolean = true;

  mostrarCrearFabrica: boolean = false;

  editarFabricaForm: boolean = false;
  fabricaEditar!: Fabrica;

  sectores = [];

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    let userName = sessionStorage.getItem("user");
    if (userName != null && userName !== "") {
      this.userName = userName;
    }

    this.cargarFabricas();
    this.cargarSectores();
  }

  abrirFabrica(id: number) {
    this.router.navigate(['/fabrica', id]);
  }

  cargarFabricas() {
    console.log("Cargando todas las fabricas...");
    this.cargando = true;

    this.apiService.getAllFabricas().pipe(
      finalize(() => {
        this.cargando = false;
        console.log("Fin de cargar todas las fabricas.");
      })
    ).subscribe({
      next: (fabricas) => {
        console.log("Respuesta: ", fabricas);

        try{
          for (let fabrica of fabricas) {
            const { id, nombre, capital, beneficios, costes, sector } = fabrica;
            if(id != undefined && nombre != undefined && capital != undefined && beneficios != undefined && costes != undefined && sector != undefined) {
              this.fabricas.push(new FabricaImpl(id, nombre, 1, 0, 0, capital, beneficios, costes, sector));
            } else {
              alert("No se pudo obtener los datos necesarios para insertar una de las fábricas.");
            }
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

  //Modal para crear fabricas
  abrirCrearFabrica() {
    this.mostrarCrearFabrica = true;
  }
  cerrarCrearFabrica() {
    this.mostrarCrearFabrica = false;
  }

  //EditMaquinasForm
  abrirEditFabricaForm(fabrica: Fabrica): void {
    this.fabricaEditar = fabrica;
    this.editarFabricaForm = true;
  }
  cerrarEditFabricaForm(): void {
    this.editarFabricaForm = false;
  }

  borrarFabrica(fabrica: Fabrica): void {
    //Eliminamos la fabrica
    const index = this.fabricas.findIndex(t => t.id === fabrica.id);
    if (index !== -1) {
      this.fabricas.splice(index, 1);
    }
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }

  cargarSectores() {
    console.log("Cargando los sectores...");

    this.apiService.getSectores().pipe(
      finalize(() => {
        console.log("Fin de cargar todos los sectores.");
      })
    ).subscribe({
      next: (response) => {
        console.log("Sectores: ", response);

        try{
          if(response.sectores != undefined) {
            this.sectores = response.sectores;
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

  crearFabrica(fabrica: Fabrica) {
    this.router.navigate(['/fabrica', fabrica.id]);
  }

  modificarFabrica(fabrica: Fabrica) {
    const index = this.fabricas.findIndex(t => t.id === fabrica.id);
    if (index !== -1) {
      this.fabricas[index] = fabrica;
    }
  }
}
