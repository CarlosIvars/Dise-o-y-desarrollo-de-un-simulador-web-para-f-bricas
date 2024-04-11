import { Tarea, Trabajador, TareaDependencia } from "../interfaces/interfaces";

export class TareaImpl implements TareaDependencia, Tarea {
    private trabajador: Trabajador | undefined;
    private dependencias: TareaDependencia[] = [];
    activa: boolean;

    constructor(public id: number, public nombre: string, public cantidad: number, public tiempo: number, public tiempoActual: number) {
        this.activa = false;
    }

    // Getter y setter para trabajador
    getTrabajador(): Trabajador | undefined {
        return this.trabajador;
    }
    setTrabajador(trabajador: Trabajador): void {
        this.trabajador = trabajador;
    }

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