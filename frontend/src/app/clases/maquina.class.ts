import { Asignable, Maquina } from "../interfaces/interfaces";

export class MaquinaImpl implements Asignable, Maquina {
    activo : boolean;
    fatigado: number;
    tiempo_fatigado: number;
    fatiga_de_partida: number;
    tiempo_trabajando: number;
    fatiga: number;

    constructor(public id: string, public nombre: string, public fatiga_inicial: number, public coste_h: number, public skills: number[]) {
        this.activo = false;
        this.fatigado = 0;
        this.tiempo_fatigado = 0;
        this.fatiga_de_partida = fatiga_inicial;
        this.tiempo_trabajando = 0;
        this.fatiga = fatiga_inicial;
    }
}