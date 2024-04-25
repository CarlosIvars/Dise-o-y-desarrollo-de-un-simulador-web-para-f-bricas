import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

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

  modificarFabrica(nombre_fabrica: string, sector: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.patch<any>(`${environment.apiUrlBase}/update_fabrica`, {nombre_fabrica, sector}, httpOptions);
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

  crearTrabajador(nombre: string, apellidos: string, fecha_nacimiento: string, fatiga: string, coste_h: number, preferencias: string, skills: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true

    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_trabajador`, {nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias, skills}, httpOptions);
  }

  modificarTrabajador(trabajador_id: string, nombre: string, apellidos: string, fecha_nacimiento: string, fatiga: number, coste_h: number, preferencias_trabajo: number, trabajos_apto: number, nuevas_habilidades: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true

    };

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

  crearMaquina(nombre: string, fatiga: string, coste_h: number, skills: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_maquina`, {nombre, fatiga, coste_h, skills}, httpOptions);
  }

  modificarMaquina(id: string, nombre: string, coste_h: number, fatiga: number, nuevas_habilidades: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

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

  crearTarea(sector: string, nombre: string, duracion: number, beneficio: number, descripcion: string, subtask_dependencia: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_subtask`, {sector, nombre, duracion, beneficio, descripcion, subtask_dependencia}, httpOptions);
  }

  modificarTarea(id: number, nombre: string, duracion: number, beneficio: number, descripcion: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.patch<any>(`${environment.apiUrlBase}/update_subtask`, {id, nombre, duracion, beneficio, descripcion}, httpOptions);
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
}
