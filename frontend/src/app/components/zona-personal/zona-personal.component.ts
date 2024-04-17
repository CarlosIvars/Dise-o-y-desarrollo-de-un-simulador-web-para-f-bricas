import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { Fabrica, User } from '../../interfaces/interfaces';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { FabricaImpl } from '../../clases/fabrica.class';

@Component({
  selector: 'app-zona-personal',
  templateUrl: './zona-personal.component.html',
  styleUrl: './zona-personal.component.css'
})
export class ZonaPersonalComponent {

  user?: User;
  private userSub?: Subscription;

  fabricas: Fabrica[] = [];

  cargando = true;

  mostrarCrearFabrica = false;

  constructor(private router: Router, private userService: UserService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.userSub = this.userService.user$.subscribe((user) => {
      this.user = user;
    });

    this.cargarFabricas();
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  abrirFabrica(id: number) {
    this.router.navigate(['/fabrica', id]);
  }

  cargarFabricas() {
    console.log("Cargando todas las fabricas...");
    this.cargando = true;

    this.apiService.getAllFabricas().pipe(
      finalize(() => {
        this.fabricas.push(new FabricaImpl(1, "Fabrica añadida a mano", 33, 7, 30, 3000, 500));
        this.cargando = false;
        
        console.log("Fin de cargar todas las fabricas.");
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

  //Modal para crear fabricas
  abrirCrearFabrica() {
    this.mostrarCrearFabrica = true;
  }
  cerrarCrearFabrica() {
    this.mostrarCrearFabrica = false;
  }
}
