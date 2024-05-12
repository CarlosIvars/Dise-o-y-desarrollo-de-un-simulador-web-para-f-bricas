export interface Fabrica {
    id: number,
    nombre: string,
    dia: number,
    hora: number,
    minutos: number,
    capital: number,
    beneficio: number,
    coste: number,
    activa: boolean,
    sector: string
}

export interface Trabajador {
    id: string,
    nombre: string,
    apellidos: string,
    fecha_nacimiento: string,
    trabajos_apto: number,
    fatiga: number,
    coste_h: number,
    preferencias_trabajo: number,
    activo: boolean,
    skills: number[]
}

export interface Maquina {
    id: string,
    nombre: string,
    fatiga: number,
    coste_h: number,
    skills: number[]
}

export interface Tarea {
    id: number,
    nombre: string,
    cantidad: number,
    duracion: number,
    tiempoActual: number,
    isWorking: boolean,
    beneficio: number,
    coste: number,
    descripcion: string,
    skills: number[],
    tareaPadre: Tarea | undefined,
    tareasHijas: Tarea[]

    getTrabajador(): Trabajador | undefined,
    setTrabajador(trabajador: Trabajador): void,
    removeTrabajador(): void
}

export interface Skill {
    id: number,
    nombre: string
}