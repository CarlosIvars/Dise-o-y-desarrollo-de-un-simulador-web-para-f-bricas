import { Asignable, Trabajador } from "../interfaces/interfaces";

export class TrabajadorImpl implements Asignable, Trabajador {
    activo: boolean;
    fatigado: number;
    tiempo_fatigado: number;
    fatiga_de_partida: number;
    tiempo_trabajando: number;
    fatiga: number;

    constructor(public id: string, public nombre: string, public apellidos: string, public fecha_nacimiento: string, public trabajos_apto: number, public fatiga_inicial: number, public coste_h: number, public preferencias_trabajo: number, public skills: number[]) { 
        this.activo = false;
        this.fatigado = 0;
        this.tiempo_fatigado = 0;
        this.fatiga_de_partida = fatiga_inicial;
        this.tiempo_trabajando = 0;
        this.fatiga = fatiga_inicial;
    }
}