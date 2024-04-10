import { Maquina } from "../interfaces/interfaces";

export class MaquinaImpl implements Maquina {
    constructor(public id: number, public nombre: string, public rol: string, public sueldo: number, public color: string) { }
}