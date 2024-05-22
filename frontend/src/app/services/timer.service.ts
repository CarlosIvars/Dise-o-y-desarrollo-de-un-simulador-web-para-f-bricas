import { Injectable } from '@angular/core';
import { Asignable, Fabrica, Maquina, Tarea, Trabajador } from '../interfaces/interfaces';
import { Subscription } from 'rxjs';
import { FabricaService } from './fabrica.service';
import { TareasService } from './tareas.service';
import { MaquinasService } from './maquinas.service';
import { TrabajadoresService } from './trabajadores.service';

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

  trabajadores: Trabajador[] = [];
  private trabajadoresSub?: Subscription;
  
  maquinas: Maquina[] = [];
  private maquinasSub?: Subscription;

  //Iniciamos los observables
  constructor(private fabricaService: FabricaService, private tareasService: TareasService, private trabajadoresService: TrabajadoresService, private maquinasService: MaquinasService) { 
    
    this.fabricaSub = this.fabricaService.fabrica$.subscribe(fabrica => {
      this.fabrica = fabrica;
    });

    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      this.tareas = tareas;
    });

    this.trabajadoresSub = this.trabajadoresService.trabajadores$.subscribe(trabajadores => {
      this.trabajadores = trabajadores;
    });

    this.maquinasSub = this.maquinasService.maquinas$.subscribe(maquinas => {
      this.maquinas = maquinas;
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
          var tareaPadre = tarea.tareaPadre;

          if(tareaPadre == undefined){
            this.iniciarTarea(tarea);
          } else {
            const numero_cajas = tareaPadre.cantidad;
            
            // Se comprueba que haya al menos una caja disponible...
            if (numero_cajas > 0) {
              const tareas_hijas_ociosas = tareaPadre.tareasHijas.filter(tarea => tarea.isWorking === false);

              // Si hay menos tareas que cajas realizamos una asignacion
              if(tareaPadre.cantidad >= tareas_hijas_ociosas.length) {
                this.iniciarTarea(tarea);
              } else {
                const tareas_hijas_seleccionadas = this.asignacionAleatoriaTareas(tareas_hijas_ociosas, numero_cajas);
                for(let tarea_hija of tareas_hijas_seleccionadas) {
                  this.iniciarTarea(tarea_hija);
                }
              }
            }
          }
        }
      }

      // Procesamos las tareas iniciadas
      for (const tarea of this.tareas) {

        // Comprobamos si tiene un trabajador asignado
        const asignable = tarea.getAsignable();
        if(asignable == undefined) {
          console.log(`Tarea ${tarea.nombre} sin trabajador o maquina asignado...`);
          continue;
        }

        // Comprobamos si la tarea está en macha (si ya se le ha asignado una caja)
        if(tarea.isWorking) {
          //Añadimos el tiempo a la tarea (solo se suma uno porque el script se está ejecutando x veces más rapido)
          tarea.tiempoActual += 1;

          // Comprobamos si ha terminado la tarea para proceder con la venta  
          if(tarea.tiempoActual >= tarea.duracion){
            //Restamos el salario del trabajador/maquina
            const salario = this.calcularSalario(tarea.tiempoBase, asignable.coste_h);
            this.fabrica.capital -= salario;
            this.fabrica.coste -= salario;

            //Sumamos beneficios
            this.fabrica.capital += tarea.beneficio;
            this.fabrica.beneficio += tarea.beneficio;

            //Cerramos la tarea
            tarea.cantidad += 1;
            tarea.tiempoActual = 0;
            tarea.isWorking = false;
            
            console.log(`Tarea ${tarea.nombre} procesada. (+${tarea.beneficio}€)`);
          }

          // Aumentamos la fatiga del trabajador/maquina y lo actualizamos
          asignable.fatiga += this.aumentarFatiga(tarea);
          if(this.trabajadoresService.isTrabajador(asignable)) {
            this.trabajadoresService.actualizarTrabajador(asignable);
          } else if(this.maquinasService.isMaquina(asignable)) {
            this.maquinasService.actualizarMaquina(asignable);
          }

          //Se comprueba si se ha fatigado el trabajador/maquina
          if(asignable.fatiga >= 100) {
            console.log(`Se ha fatigado el trabajador/maquina ${asignable.nombre}`);
            asignable.fatigado = true;

            const salario_parcial = this.calcularSalario(tarea.tiempoActual, asignable.coste_h);
            this.fabrica.beneficio -+ salario_parcial;
            this.fabrica.coste -= salario_parcial;

            this.tareasService.desasignarATarea(tarea); // Se encarga de actualizar a los services
          }
        }
      }

      for(const trabajador of this.trabajadores) {
        if(trabajador.fatigado) {
          trabajador.fatiga = this.reducirFatiga(trabajador);
          //TODO: revisar numero minimo de fatiga
          if(trabajador.fatiga <= 0) {
            trabajador.fatigado = false;
          }
        }
      }

      for(const maquiana of this.maquinas) {
        if(maquiana.fatigado) {
          maquiana.fatiga = this.reducirFatiga(maquiana);
          //TODO: revisar numero minimo de fatiga
          if(maquiana.fatiga <= 0) {
            maquiana.fatigado = false;
          }
        }
      }

      this.gestionarHora(this.fabrica);

      this.fabricaService.actualizarFabrica(this.fabrica);
      this.tareasService.actualizarTareas(this.tareas);
      this.trabajadoresService.actualizarTrabajadores(this.trabajadores);
      this.maquinasService.actualizarMaquinas(this.maquinas);
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
        this.siguienteDia();
      }
    }
  }

  asignacionAleatoriaTareas(tareas: Tarea[], X: number): Tarea[] {
    const tareasAleatorias = [];
    const tareasCopia = [...tareas]; // Creamos una copia del array original
    
    // Obtener 'X' posiciones aleatorias del array original sin repetir
    for (let i = 0; i < X; i++) {
      const posicionAleatoria = Math.floor(Math.random() * tareasCopia.length);
      tareasAleatorias.push(tareasCopia[posicionAleatoria]);
      tareasCopia.splice(posicionAleatoria, 1); // Eliminamos el elemento seleccionado
    }
    
    return tareasAleatorias;
  }

  iniciarTarea(tarea: Tarea)  {
    if(this.fabrica) {
      console.log(`Iniciando tarea ${tarea.nombre} ...`);
      let tareaPadre = tarea.tareaPadre;
      if(tareaPadre != undefined) {
        tareaPadre.cantidad--;
      }
      
      //Volvemos a calcular la duracion
      const asignable = tarea.getAsignable();
      if(asignable != undefined) {
        tarea.duracion = Math.round(tarea.tiempoBase + this.tareasService.calcularDuracion(tarea, asignable));
      }

      // Restamos el coste de la tarea
      this.fabrica.capital -= tarea.coste;
      this.fabrica.coste -= tarea.coste;

      // Arrancamos tarea
      tarea.isWorking = true;
      tarea.tiempoActual = 0;

      this.tareasService.actualizarTarea(tarea);
    }
  }
 
  calcularSalario(duracion: number, coste_h: number) {
    const horas = duracion / 60;
    const coste = horas * coste_h;

    return Math.round(coste);
  }

  aumentarFatiga(tarea: Tarea) {
    const asignable = tarea.getAsignable();

    let skills_tarea = tarea.skills;
    let skills_asignable = asignable?.skills;
    let tarea_preferencia = null;
    if(this.trabajadoresService.isTrabajador(asignable)) {
      tarea_preferencia = asignable.preferencias_trabajo
    }
    let factor_fatiga = tarea.factorFatiga;

    // TODO:
    return 1;
  }

  reducirFatiga(asignable: Asignable) {
    return this.reducirFatigaTiempo(asignable, (1/60));
  }

  reducirFatigaDia(asignable: Asignable) {
    return this.reducirFatigaTiempo(asignable, 16);
  }

  //este es el descanso para cuando la fabrica termina las 8h, para cuando el trabajador este descansando en tiempo de ejecucion debemos modificar t
  reducirFatigaTiempo(asignable: Asignable, t: number) {
    const tau_r = 10; // Por ejemplo, puedes ajustar esto según sea necesario

    const D0 = 0; // fatiga inicial deseada que tenga el trabajador
    const Dl = asignable.fatiga || 0;
    const fatiga = Dl - Math.exp(-t / tau_r) * (Dl - D0);
    console.log(`Fatiga del trabajador ${asignable.nombre} reducida a ${fatiga}`);

    return fatiga;
  }

  siguienteDia() {
    for(const trabajador of this.trabajadores) {
      if(trabajador.fatigado) {
        trabajador.fatiga = this.reducirFatigaDia(trabajador);
        //TODO: revisar numero minimo de fatiga
        if(trabajador.fatiga <= 0) {
          trabajador.fatigado = false;
        }
      }
    }

    for(const maquiana of this.maquinas) {
      if(maquiana.fatigado) {
        maquiana.fatiga = this.reducirFatigaDia(maquiana);
        //TODO: revisar numero minimo de fatiga
        if(maquiana.fatiga <= 0) {
          maquiana.fatigado = false;
        }
      }
    }
  }
}
