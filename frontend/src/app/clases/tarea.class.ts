import { Tarea, Trabajador } from "../interfaces/interfaces";

export class TareaImpl implements Tarea {
    private trabajador: Trabajador | undefined;
    private tareaPadre: Tarea | undefined;
    isWorking: boolean;

    constructor(public id: number, public nombre: string, public cantidad: number, public duracion: number, public beneficio: number, public coste: number, public tiempoActual: number, public descripcion: string) {
        this.isWorking = false;
    }

    // Getter y setter para el trabajador
    getTrabajador(): Trabajador | undefined {
        return this.trabajador;
    }
    setTrabajador(trabajador: Trabajador | undefined): void {
        this.trabajador = trabajador;
    }
    removeTrabajador(): void {
        this.trabajador = undefined;
    }

    // Getter y setter para la tareaPadre
    getTareaPadre(): Tarea | undefined {
        return this.tareaPadre;
    }
    setTareaPadre(tarea: Tarea): void {
        this.tareaPadre = tarea;
    }
}