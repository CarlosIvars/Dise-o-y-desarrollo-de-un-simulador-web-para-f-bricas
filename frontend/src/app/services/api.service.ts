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

    return this.http.post<any>(`${environment.apiUrlBase}/login`, {username, password}, httpOptions, );
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

  crearFabrica(nombre_fabrica: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      withCredentials: true
    };

    return this.http.post<any>(`${environment.apiUrlBase}/fabricas`, {nombre_fabrica}, httpOptions);
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

  crearMaquina(nombre: string, fatiga: string, coste_h: number, skills: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_maquina`, {nombre, fatiga, coste_h, skills}, httpOptions);
  }

  crearTarea(sector: string, nombre: string, duracion: number, beneficio: number, descripcion: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<any>(`${environment.apiUrlBase}/add_subtask`, {sector, nombre, duracion, beneficio, descripcion}, httpOptions);
  }
}
