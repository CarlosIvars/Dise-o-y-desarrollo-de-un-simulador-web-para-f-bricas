import { Injectable } from '@angular/core';

import { Fabrica, Trabajador, Maquina, TareaInicial, Tarea, TareaFinal } from '../interfaces/interfaces';
import { FabricaImpl } from '../clases/fabrica.class';
import { TrabajadorImpl } from '../clases/trabajador.class';
import { MaquinaImpl } from '../clases/maquina.class';
import { TareaInicialImpl } from '../clases/tarea-inicial.class';
import { TareaImpl } from '../clases/tarea.class';
import { TareaFinalImpl } from '../clases/tarea-final.class';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FabricaService {

  //Para guardar el timeout del tiempo
  private timeoutId: any;

  // Variables y sus observables
  private fabricaSubject = new BehaviorSubject<Fabrica>({} as Fabrica);
  fabrica$ = this.fabricaSubject.asObservable();

  private trabajadoresSubsject = new BehaviorSubject<Trabajador[]>([]);
  trabajadores$ = this.trabajadoresSubsject.asObservable();

  private tareasInicialesSubject = new BehaviorSubject<TareaInicial[]>([]);
  tareasIniciales$ = this.tareasInicialesSubject.asObservable();

  private tareasSubject = new BehaviorSubject<Tarea[]>([]);
  tareas$ = this.tareasSubject.asObservable();

  private tareasFinalesSubject = new BehaviorSubject<TareaFinal[]>([]);
  tareasFinales$ = this.tareasFinalesSubject.asObservable();

  constructor() { }

  // Metodos para la Fabrica
  actualizarFabrica(fabrica: Fabrica) {
    this.fabricaSubject.next(fabrica);
  }

  // Metodos para los Trabajadores
  actualizarTrabajadores(trabajadores: Trabajador[]) {
    this.trabajadoresSubsject.next(trabajadores);
  }

  actualizarTrabajador(trabajador: Trabajador) {
    const trabajadores = this.trabajadoresSubsject.getValue();
    const index = trabajadores.findIndex(t => t.id === trabajador.id);
    if (index !== -1) {
      trabajadores[index] = trabajador;
      this.actualizarTrabajadores(trabajadores);
    }
  }

  // Metodos para las Tareas Inciales
  actualizarTareasIniciales(tareasIniciales: TareaInicial[]) {
    this.tareasInicialesSubject.next(tareasIniciales);
  }

  // Metodos para las Tareas
  actualizarTareas(tareas: Tarea[]) {
    this.tareasSubject.next(tareas);
  }

  actualizarTarea(tarea: Tarea) {
    const tareas = this.tareasSubject.getValue();
    const index = tareas.findIndex(t => t.id === tarea.id);
    if (index !== -1) {
      tareas[index] = tarea;
      this.actualizarTareas(tareas);
    }
  }

  asignarTrabajadorATarea(tarea: Tarea, trabajador: Trabajador) {
    // Dejamos libre el actual trabajador de la tarea...
    const trabajadorViejo = tarea.getTrabajador();
    if(trabajadorViejo){
      trabajadorViejo.activo = false;
      this.actualizarTrabajador(trabajadorViejo);
    }
    
    // Añadimos el nuevo trabajador a la tarea
    tarea.setTrabajador(trabajador);
    this.actualizarTarea(tarea);

    // Marcamos el trabajador como activo
    trabajador.activo = true;
    this.actualizarTrabajador(trabajador);
  }

  // Metodos para las Tareas
  actualizarTareasFinales(tareasFinales: TareaFinal[]) {
    this.tareasFinalesSubject.next(tareasFinales);
  }

  //Otros...
  inicializarFabricaDefault(): { maquinas: Maquina[] } {
    //Inicializamos una fábrica default
    this.actualizarFabrica(new FabricaImpl(1, "Fabrica por defecto", 1, 7, 41, 5000, 300));

    const trabajadores: Trabajador[] = [];
    trabajadores.push(new TrabajadorImpl(1, "Carlos", "Ingeniero", 1800, "#FF0000", false));
    trabajadores.push(new TrabajadorImpl(2, "Javi", "Programador", 1600, "#0023FF", false));
    this.actualizarTrabajadores(trabajadores);

    const maquinas: Maquina[] = [];
    maquinas.push(new MaquinaImpl(1, "Picadora industrial", "Prueba", 800, "#FF0000"));
    maquinas.push(new MaquinaImpl(2, "Ensamblaje", "Prueba2", 600, "#0023FF"));

    const tareasIniciales: TareaInicial[] = [];
    tareasIniciales.push(new TareaInicialImpl(1, "Tornillos", 20, 5));
    this.actualizarTareasIniciales(tareasIniciales);

    const tareas: Tarea[] = [];
    tareas.push(new TareaImpl(1, "Procesar pieza", 0, 10, 0));
    tareas[0].addDependencias(tareasIniciales[0]);
    this.actualizarTareas(tareas);

    const tareasFinales: TareaFinal[] = [];
    tareasFinales.push(new TareaFinalImpl(1, 100));
    tareasFinales[0].addDependencias(tareas[0]);
    this.actualizarTareasFinales(tareasFinales);
    
    return { maquinas };
  }

  //Metodos relacionados con la gestion del tiempo:
  iniciarEjecucion() {
    //Marcamos la fabrica como activa
    const fabrica = this.fabricaSubject.getValue();
    fabrica.activa = true;
    this.actualizarFabrica(fabrica);

    //Mediante un timeout se ejecuta la logica cada x tiempo
    const execute = () => {
      this.scriptEjecucion();
      console.log('Script ejecutado');
      this.timeoutId = setTimeout(execute, fabrica.tiempo);
    };
    this.timeoutId = setTimeout(execute, fabrica.tiempo);
  }

  pararEjecucion() {
    //Marcamos la fabrica como parada
    const fabrica = this.fabricaSubject.getValue();
    fabrica.activa = false;
    this.actualizarFabrica(fabrica);
    
    //Limpiamos el timeout
    clearTimeout(this.timeoutId);
  }

  cambiarTimepoEjecucion(tiempo: number) {
      this.pararEjecucion();

      // Actualizamos el tiempo
      const fabrica = this.fabricaSubject.getValue();
      fabrica.tiempo = tiempo;
      this.actualizarFabrica(fabrica);

      this.iniciarEjecucion();
  }

  scriptEjecucion() {
    console.log("Ejecutando script...");
    const fabrica = this.fabricaSubject.getValue();
    const tareas = this.tareasSubject.getValue();
    const tareasFinales = this.tareasFinalesSubject.getValue();

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
