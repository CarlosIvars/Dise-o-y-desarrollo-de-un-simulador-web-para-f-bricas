import { Maquina } from "../interfaces/interfaces";

export class MaquinaImpl implements Maquina {
    constructor(public id: string, public nombre: string, public fatiga: number, public coste_h: number) { }
}