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

export interface Asignable {
    id: string,
    nombre: string,
    fatiga: number,
    coste_h: number,
    skills: number[],
    activo: boolean,
    fatigado: boolean
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
    fatigado: boolean,
    skills: number[]
}

export interface Maquina {
    id: string,
    nombre: string,
    fatiga: number,
    coste_h: number,
    skills: number[],
    activo: boolean,
    fatigado: boolean
}

export interface Tarea {
    id: number,
    nombre: string,
    cantidad: number,
    tiempoBase: number,
    duracion: number,
    tiempoActual: number,
    isWorking: boolean,
    beneficio: number,
    coste: number,
    descripcion: string,
    skills: number[],
    tareaPadre: Tarea | undefined,
    tareasHijas: Tarea[],
    isDragging: boolean,
    skillsMatched: number

    getAsignable(): Asignable | undefined,
    setAsignable(asignable: Asignable): void,
    removeAsignable(): void
}

export interface Skill {
    id: number,
    nombre: string
}