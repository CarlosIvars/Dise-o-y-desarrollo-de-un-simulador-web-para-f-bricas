import { TareaFinal, TareaDependencia } from "../interfaces/interfaces";

export class TareaFinalImpl implements TareaFinal {
    
    private dependencias: TareaDependencia[] = [];
    
    constructor(public id: number, public precio: number) {}
    
    // Añadir, modificar y eliminar dependencias.
    addDependencias(tarea: TareaDependencia): void {
        this.dependencias.push(tarea);
    }
    eliminarIdDependencia(id: number): void {        
        this.dependencias = this.dependencias.filter(tarea => tarea.id !== id);
    }
    obtenerDependencias(): TareaDependencia[] {
        return this.dependencias;
    }
}