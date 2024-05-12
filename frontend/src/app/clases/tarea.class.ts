import { Tarea, Trabajador } from "../interfaces/interfaces";

export class TareaImpl implements Tarea {
    private trabajador: Trabajador | undefined;
    tareaPadre: Tarea | undefined;
    tareasHijas: Tarea[];
    isWorking: boolean;

    constructor(public id: number, public nombre: string, public cantidad: number, public duracion: number, public beneficio: number, public coste: number, public tiempoActual: number, public descripcion: string, public skills: number[]) {
        this.isWorking = false;
        this.tareaPadre = undefined;
        this.tareasHijas = [];
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
}