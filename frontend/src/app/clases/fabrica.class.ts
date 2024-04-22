import { timestamp } from "rxjs";
import { Fabrica } from "../interfaces/interfaces";

export class FabricaImpl implements Fabrica {
    activa: boolean;
    
    constructor(public id: number, public nombre: string, public dia: number, public hora: number, public minutos: number, public dinero: number, public beneficio: number) { 
        this.activa = false;
    }
}