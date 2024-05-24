import { Asignable, Maquina } from "../interfaces/interfaces";

export class MaquinaImpl implements Asignable, Maquina {
    activo : boolean;
    fatigado: boolean;
    tiempo_fatigado: number;
    fatiga_de_partida: number;

    constructor(public id: string, public nombre: string, public fatiga: number, public coste_h: number, public skills: number[]) {
        this.activo = false;
        this.fatigado = fatiga >= 100;
        this.tiempo_fatigado = 0;
        this.fatiga_de_partida = 100;
    }
}