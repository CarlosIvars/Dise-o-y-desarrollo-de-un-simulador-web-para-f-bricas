export interface Fabrica {
    id: number,
    nombre: string,
    dia: number,
    hora: number,
    minutos: number,
    dinero: number,
    beneficio: number,
    tiempo: number,
    activa: boolean
}

export interface Trabajador {
    id: number,
    nombre: string,
    rol: string,
    sueldo: number,
    color: string,
    activo: boolean
}

export interface Maquina {
    id: number,
    nombre: string,
    rol: string,
    sueldo: number,
    color: string
}

export interface TareaInicial {
    id: number,
    nombre: string,
    precio: number,
    cantidad: number
}

export interface Tarea {
    id: number,
    nombre: string,
    cantidad: number,
    tiempo: number,
    tiempoActual: number,
    activa: boolean

    getTrabajador(): Trabajador | undefined,
    setTrabajador(trabajador: Trabajador): void,
    

    addDependencias(tarea: TareaDependencia): void,
    eliminarIdDependencia(id: number): void,
    obtenerDependencias(): TareaDependencia[]
}

export interface TareaFinal {
    id: number,
    precio: number,

    addDependencias(tarea: TareaDependencia): void,
    eliminarIdDependencia(id: number): void,
    obtenerDependencias(): TareaDependencia[]
}

export interface TareaDependencia {
    id: number,
    cantidad: number
}

export interface User {
    id: number,
    nombre: string,
    apellidos: string,
    password: string,
    username: string
}