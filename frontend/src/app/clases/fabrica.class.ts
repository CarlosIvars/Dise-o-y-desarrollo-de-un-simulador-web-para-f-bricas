import { timestamp } from "rxjs";
import { Fabrica } from "../interfaces/interfaces";

export class FabricaImpl implements Fabrica {
    activa: boolean;
    
    constructor(public id: number, public nombre: string, public dia: number, public hora: number, public minutos: number, public capital: number, public beneficio: number, public coste: number, public sector: string) { 
        this.activa = false;
    }
}