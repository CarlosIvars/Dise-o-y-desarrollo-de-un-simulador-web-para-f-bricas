import { Asignable, Tarea, Trabajador } from "../interfaces/interfaces";

export class TareaImpl implements Tarea {
    private asignable: Asignable | undefined;
    tareaPadre: Tarea | undefined;
    tareasHijas: Tarea[];
    isWorking: boolean;
    isDragging: boolean;
    skillsMatched: number;

    constructor(public id: number, public nombre: string, public cantidad: number, public duracion: number, public beneficio: number, public coste: number, public tiempoActual: number, public descripcion: string, public skills: number[]) {
        this.isWorking = false;
        this.tareaPadre = undefined;
        this.tareasHijas = [];
        this.isDragging = false;
        this.skillsMatched = 0;
    }

    // Getter y setter para el trabajador
    getAsignable(): Asignable | undefined {
        return this.asignable;
    }
    setAsignable(asignable: Asignable | undefined): void {
        this.asignable = asignable;
    }
    removeAsignable(): void {
        this.asignable = undefined;
    }
}