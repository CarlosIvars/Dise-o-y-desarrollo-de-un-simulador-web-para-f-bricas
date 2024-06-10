import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Maquina, Tarea, Trabajador } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/login`, {username, password}, httpOptions);
  }

  registerUser(username: string, name: string, surname: string, password: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/register`, {username, name, surname, password}, httpOptions);
  }

  getAllFabricas(): Observable<any> {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/fabricas`, httpOptions);
  }

  iniciarFabrica(fabrica_id: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/select_fabrica`, {fabrica_id}, httpOptions);
  }

  crearFabrica(nombre_fabrica: string, capital_inicial: number, sector: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/fabricas`, {nombre_fabrica, capital_inicial, sector}, httpOptions);
  }

  modificarNombreFabrica(id: number, nombre_fabrica: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.patch<any>(`${environment.apiUrlBase}/update_fabrica`, {id, nombre_fabrica}, httpOptions);
  }

  eliminarFabrica(fabrica_id: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true,
      body: {fabrica: fabrica_id}
    };

    return this.http.delete<any>(`${environment.apiUrlBase}/delete_fabrica`, httpOptions);
  }

  crearTrabajador(nombre: string, apellidos: string, fecha_nacimiento: string, fatiga: number, coste_h: number, preferencias: string, skills: number[]) {
    console.log({nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias, skills});

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true

    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_trabajador`, {nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias, skills}, httpOptions);
  }

  modificarTrabajador(trabajador_id: string, nombre: string, apellidos: string, fecha_nacimiento: string, fatiga: number, coste_h: number, preferencias_trabajo: number, trabajos_apto: number, nuevas_habilidades: number[]) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true

    };

    console.log({trabajador_id, nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias_trabajo, trabajos_apto, nuevas_habilidades});

    return this.http.patch<any>(`${environment.apiUrlBase}/update_trabajador`, {trabajador_id, nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias_trabajo, trabajos_apto, nuevas_habilidades}, httpOptions);
  }

  eliminarTrabajador(trabajador_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true,
      body: {trabajador: trabajador_id}
    };

    return this.http.delete<any>(`${environment.apiUrlBase}/delete_trabajador`, httpOptions);
  }

  crearMaquina(nombre: string, fatiga: number, coste_h: number, skills: number[]) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    console.log({nombre, fatiga, coste_h, skills});

    return this.http.post<any>(`${environment.apiUrlBase}/add_maquina`, {nombre, fatiga, coste_h, skills}, httpOptions);
  }

  modificarMaquina(id: string, nombre: string, coste_h: number, fatiga: number, nuevas_habilidades: number[]) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    console.log({id, nombre, fatiga, coste_h, nuevas_habilidades});

    return this.http.patch<any>(`${environment.apiUrlBase}/update_maquina`, {id, nombre, fatiga, coste_h, nuevas_habilidades}, httpOptions);
  }

  eliminarMaquina(maquina_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true,
      body: {maquina: maquina_id}
    };

    return this.http.delete<any>(`${environment.apiUrlBase}/delete_maquina`, httpOptions);
  }

  crearTarea( nombre: string, duracion: number, beneficio: number, coste: number, descripcion: string, subtask_dependencia: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    console.log({nombre, duracion, beneficio, coste, descripcion, subtask_dependencia});

    return this.http.post<any>(`${environment.apiUrlBase}/add_subtask`, {nombre, duracion, beneficio, coste, descripcion, subtask_dependencia}, httpOptions);
  }

  modificarTarea(id: number, nombre: string, duracion: number, beneficio: number, coste: number, descripcion: string, skills: number[]) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    console.log({id, nombre, duracion, beneficio, coste, descripcion, skills});

    return this.http.patch<any>(`${environment.apiUrlBase}/update_subtask`, {id, nombre, duracion, beneficio, coste, descripcion, skills}, httpOptions);
  }

  eliminarTarea(tarea_id: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true,
      body: {subtask: tarea_id}
    };

    return this.http.delete<any>(`${environment.apiUrlBase}/delete_subtask`, httpOptions);
  }

  getSectores() {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/sectores`, httpOptions);
  }

  getSkills() {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/get_skills`, httpOptions);
  }

  skillMatching() {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/skills_matching`, httpOptions);
  }

  algoritmoGenetico() {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/alg_genetico`, httpOptions);
  }

  algoritmoGeneticoRL() {
    const httpOptions = {
      withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlBase}/alg_genetico_RL`, httpOptions);
  }

  addHistorial(costes: number, beneficios: number, capital: number, trabajadores: Trabajador[], maquinas: Maquina[], subtasks: Tarea[]) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    const trabajadores_formated = [];
    for(const trabajador of trabajadores) {
      const trabajador_formated = {
        id: trabajador.id,
        nombre: trabajador.nombre,
        apellidos: trabajador.apellidos,
        fecha_nacimiento: trabajador.fecha_nacimiento,
        trabajos_apto: trabajador.trabajos_apto,
        fatiga: trabajador.fatiga,
        coste_h: trabajador.coste_h,
        preferencias_trabajo: trabajador.preferencias_trabajo,
        activo: trabajador.activo,
        fatigado: trabajador.fatigado,
        skills: trabajador.skills,
        tiempo_fatigado: trabajador.tiempo_fatigado
      };
      trabajadores_formated.push(trabajador_formated);
    }

    const maquinas_formated = [];
    for(const maquina of maquinas) {
      const maquina_formated = {
        id: maquina.id.replace("M_", ""),
        nombre: maquina.nombre,
        fatiga: maquina.fatiga,
        coste_h: maquina.coste_h,
        skills: maquina.skills,
        activo: maquina.activo,
        fatigado: maquina.fatigado,
        tiempo_fatigado: maquina.tiempo_fatigado
      }
      maquinas_formated.push(maquina_formated);
    }

    const subtasks_formated = [];
    for(const tarea of subtasks) {
      const tarea_formated = {
        id: tarea.id,
        nombre: tarea.nombre,
        cantidad: tarea.cantidad, //Numero de "cajas"
        tiempoBase: tarea.tiempoBase,
        duracion: tarea.duracion, //Duracion calculada mediante la formula
        tiempoActual: tarea.tiempoActual, // Tiempo que ya se ha procesado en la tarea
        isWorking: tarea.isWorking,
        beneficio: tarea.beneficio,
        coste: tarea.coste,
        descripcion: tarea.descripcion,
        skills: tarea.skills,
        factorFatiga: tarea.factorFatiga,
        factorDuracion: tarea.factorDuracion //Tener en cuenta que puede no ser el que se ha usado para calcular la duracion porque se ha cambiado a posteriori
      }
      subtasks_formated.push(tarea_formated);
    }

    const asignaciones = [];
    for(const tarea of subtasks) {
      const asignable = tarea.getAsignable();
      if(asignable != undefined) {
        const asignacion = {
          asignable_id: asignable.id,
          tarea_id: tarea.id
        }
        asignaciones.push(asignacion);
      }
    }

    console.log({costes, beneficios, capital, trabajadores: trabajadores_formated, maquinas: maquinas_formated, subtasks: subtasks_formated, asignaciones});

    return this.http.post<any>(`${environment.apiUrlBase}/add_historial`, {costes, beneficios, capital, trabajadores: trabajadores_formated, maquinas: maquinas_formated, subtasks: subtasks_formated, asignaciones}, httpOptions);
  }
}
