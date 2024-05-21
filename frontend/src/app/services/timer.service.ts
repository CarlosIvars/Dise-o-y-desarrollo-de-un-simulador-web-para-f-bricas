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

  private velocidadEjecucion: number = 1;

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
        this.timeoutId = setTimeout(execute, 1000 / this.velocidadEjecucion);
      };
      this.timeoutId = setTimeout(execute, 1000 / this.velocidadEjecucion);
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

  cambiarVelocidadEjecucion(tiempo: number) {
    var activa = this.fabrica?.activa
    if(activa) { this.pararEjecucion(); }
    this.velocidadEjecucion = tiempo;
    if(activa) { this.iniciarEjecucion(); }
  }

  scriptEjecucion() {
    if(this.fabrica != undefined) {
      console.log("Ejecutando script...");

      this.gestionarHora(this.fabrica);
      
      // Buscamos tareas ociosas para tratar de arrancarlas
      for (const tarea of this.tareas) {

        // Comprobamos si tiene un trabajador asignado
        if(tarea.getAsignable() == undefined) {
          console.log(`Tarea ${tarea.nombre} sin trabajador o maquina asignado...`);
          continue;
        }
        
        // Si la tarea se encuentra ociosa tratamos de iniciarla
        if(!tarea.isWorking) {

          // Buscamos en los padres para ver si puede inicarse
          if(this.puedeIniciarTarea(tarea)) {
            console.log(`Iniciando tarea ${tarea.nombre} ...`);
            let tareaPadre = tarea.tareaPadre;
            if(tareaPadre != undefined) {
              tareaPadre.cantidad--;
            }
            tarea.isWorking = true;
            tarea.tiempoActual = 0;
          }
        }
      }

      // Procesamos las tareas iniciadas
      for (const tarea of this.tareas) {

        // Comprobamos si tiene un trabajador asignado
        if(tarea.getAsignable() == undefined) {
          console.log(`Tarea ${tarea.nombre} sin trabajador o maquina asignado...`);
          continue;
        }
        
        // Comprobamos si la tarea está en macha (si ya se le ha asignado una caja)
        if(tarea.isWorking) {
          //Añadimos el tiempo a la tarea (solo se suma uno porque el script se está ejecutando x veces más rapido)
          tarea.tiempoActual += 1;

          // Comprobamos si ha terminado la tarea para proceder con la venta  
          if(tarea.tiempoActual >= tarea.duracion){
            this.fabrica.capital += tarea.beneficio;
            tarea.cantidad += 1;
            tarea.tiempoActual = 0;
            tarea.isWorking = false;
            
            console.log(`Tarea ${tarea.nombre} procesada. (+${tarea.beneficio}€)`);
          }
        }
      }

      this.fabricaService.actualizarFabrica(this.fabrica);
      this.tareasService.actualizarTareas(this.tareas);
    }
  }

  gestionarHora(fabrica: Fabrica) {
    fabrica.minutos += 1;
    if(fabrica.minutos > 59) {
      fabrica.minutos = fabrica.minutos - 60;
      fabrica.hora++;
      if(fabrica.hora > 7) {
        fabrica.hora = fabrica.hora - 8;
        fabrica.dia++;
      }
    }
  }

  puedeIniciarTarea(tarea: Tarea): boolean {
    var tareaPadre = tarea.tareaPadre;

    if(tareaPadre == undefined){
      return true;
    } else {
      if (tareaPadre.cantidad > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
  //Codigo realizado por Carlos//
  
  /*
  restarCosteInicial(tarea: Tarea) {
    if (this.fabrica.capital >= tarea.costeInicial) {
      this.fabrica.capital -= tarea.costeInicial;
    } else {
      console.log(`No hay suficiente capital para iniciar la tarea ${tarea.nombre}`);
    }
  }

  //este es el descanso para cuando la fabrica termina las 8h, para cuando el trabajador este descansando en tiempo de ejecucion debemos modificar t
  reducirFatigaTrabajadores() {
    if (!this.fabrica) return;

    const tau_r = 10; // Por ejemplo, puedes ajustar esto según sea necesario
    const t = 16; // Tiempo transcurrido en horas (puedes ajustar según el intervalo de tiempo que desees usar)
    
    this.tareas.forEach(tarea => {
      const trabajador = ;//cargar trabajador
      if (trabajador) {
        const D0 = 0; // fatiga inicial deseada que tenga el trabajador
        const Dl = trabajador.fatiga || 0;
        trabajador.fatiga = Dl - Math.exp(-t / tau_r) * (Dl - D0);
        console.log(`Fatiga del trabajador ${trabajador.nombre} reducida a ${trabajador.fatiga}`);
      }
    });
  }
*/

}
