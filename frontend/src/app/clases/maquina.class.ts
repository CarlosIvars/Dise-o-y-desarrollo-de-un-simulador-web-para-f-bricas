import { Asignable, Maquina } from "../interfaces/interfaces";

export class MaquinaImpl implements Asignable, Maquina {
    activo : boolean;
    fatigado: boolean;

    constructor(public id: string, public nombre: string, public fatiga: number, public coste_h: number, public skills: number[]) {
        this.activo = false;
        this.fatigado = fatiga >= 100;
    }
}