import { Trabajador } from "../interfaces/interfaces";

export class TrabajadorImpl implements Trabajador {
    constructor(public id: number, public nombre: string, public rol: string, public sueldo: number, public color: string, public activo: boolean) { }
}