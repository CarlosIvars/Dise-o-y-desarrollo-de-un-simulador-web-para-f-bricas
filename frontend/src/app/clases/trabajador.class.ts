import { Trabajador } from "../interfaces/interfaces";

export class TrabajadorImpl implements Trabajador {
    activo: boolean;

    constructor(public id: string, public nombre: string, public apellidos: string, public fecha_nacimiento: string, public trabajos_apto: number, public fatiga: number, public coste_h: number, public preferencias_trabajo: number) { 
        this.activo = false;
    }
}