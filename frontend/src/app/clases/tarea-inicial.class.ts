import { TareaDependencia, TareaInicial } from "../interfaces/interfaces";

export class TareaInicialImpl implements TareaDependencia, TareaInicial {
    constructor (public id: number, public nombre: string, public precio: number, public cantidad: number) { }
}