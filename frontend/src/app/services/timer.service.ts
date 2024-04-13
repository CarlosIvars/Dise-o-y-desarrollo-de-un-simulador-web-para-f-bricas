import { Injectable } from '@angular/core';
import { Fabrica, Tarea } from '../interfaces/interfaces';
import { Subscription } from 'rxjs';
import { FabricaService } from './fabrica.service';
import { TareasService } from './tareas.service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  //Para guardar el timeout del tiempo
  private timeoutId: any;


  //Guardamos todas la variables necesarias mediante un observable
  fabrica?: Fabrica;
  private fabricaSub?: Subscription;

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  //Iniciamos los observables
  constructor(private fabricaService: FabricaService, private tareasService: TareasService) { 
    
    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

  }



  //Metodos relacionados con la gestion del tiempo:
  iniciarEjecucion() {
    //Marcamos la fabrica como activa
    if(this.fabrica != undefined){
      this.fabrica.activa = true;
      this.fabricaService.actualizarFabrica(this.fabrica);

      //Mediante un timeout se ejecuta la logica cada x tiempo
      const execute = () => {
        this.scriptEjecucion();
        console.log('Script ejecutado');
        this.timeoutId = setTimeout(execute, this.fabrica?.tiempo);
      };
      this.timeoutId = setTimeout(execute, this.fabrica.tiempo);
    }
  }

  pararEjecucion() {
    //Marcamos la fabrica como parada
    if(this.fabrica != undefined){
      this.fabrica.activa = false;
      this.fabricaService.actualizarFabrica(this.fabrica);
    
      //Limpiamos el timeout
      clearTimeout(this.timeoutId);
    }
  }

  cambiarTimepoEjecucion(tiempo: number) {
    if(this.fabrica != undefined) {
      this.pararEjecucion();

      // Actualizamos el tiempo
      this.fabrica.tiempo = tiempo;
      this.fabricaService.actualizarFabrica(this.fabrica);

      this.iniciarEjecucion();
    }
  }

  scriptEjecucion() {
    if(this.fabrica != undefined) {
      console.log("Ejecutando script...");

      /*

      this.gestionarHora(fabrica);
      
      const tiempo = fabrica.tiempo / 1000; // Pasamos el tiempo a segundos (minutos ficticios)
      
      // Preparamos cada tarea:
      for (const tarea of tareas) {

        // Si no tiene un trabajador asignado continuamos
        if(tarea.getTrabajador() == undefined) {
          console.log("Sin trabajador...");
          continue;
        }
        
        // Probamos a mover la caja da la tarea padre a la hija
        if(tarea.activa == false) {
          console.log("Buscando dependencias...");
          if(this.buscaDependencias(tarea) == false) {
            console.log("No se han encontrado cajas disponibles.");
            continue;
          }
        }
      }

      // Procesamos cada tarea
      for (const tarea of tareas) {

        // Si no tiene un trabajador asignado continuamos
        if(tarea.getTrabajador() == undefined) {
          console.log("Sin trabajador...");
          continue;
        }
        
        // Si no tiene cajas que procesar continuamos
        if(tarea.activa == false) {
          console.log("Sin cajas que procesar.");
          continue;
        }

        //Añadimos el tiempo a la tarea
        tarea.tiempoActual += tiempo;

        //Si ya ha terminado con la ejcucion, nos guardamos la caja
        if(tarea.tiempoActual >= tarea.tiempo){
          tarea.cantidad++;
          tarea.tiempoActual = 0;
          tarea.activa = false;
          console.log("Caja procesada...");
        }
      
      }

      // Vendemos las cajas que tenemos 
      for (const tareaFinal of tareasFinales) {
        const dependencias = tareaFinal.obtenerDependencias();
        if(dependencias.length == 1) {
          if(dependencias[0].cantidad > 0) {
            dependencias[0].cantidad--;
            fabrica.dinero += tareaFinal.precio;
          }
        }
      } 
      */
    }
  }

  gestionarHora(fabrica: Fabrica) {
    const tiempo = fabrica.tiempo / 1000;

    fabrica.minutos += tiempo;
    if(fabrica.minutos > 59) {
      fabrica.minutos = fabrica.minutos - 60;
      fabrica.hora++;
      if(fabrica.hora > 7) {
        fabrica.hora = fabrica.hora - 8;
        fabrica.dia++;
      }
    }
  }

  buscaDependencias(tarea: Tarea){
    let cajaEncontrada = false;

    const dependencias = tarea.obtenerDependencias();
    if(dependencias.length == 1){
      if (dependencias[0].cantidad > 0) {
        dependencias[0].cantidad--;
        tarea.activa = true;
        cajaEncontrada = true;
      } else {
        tarea.activa = false;
      }
    }

    return cajaEncontrada;
  };
}
