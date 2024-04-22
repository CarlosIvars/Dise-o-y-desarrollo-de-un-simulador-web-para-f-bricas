export interface Fabrica {
    id: number,
    nombre: string,
    dia: number,
    hora: number,
    minutos: number,
    dinero: number,
    beneficio: number,
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

export interface Tarea {
    id: number,
    nombre: string,
    cantidad: number,
    duracion: number,
    tiempoActual: number,
    isWorking: boolean,
    precioVenta: number

    getTrabajador(): Trabajador | undefined,
    setTrabajador(trabajador: Trabajador): void,
    removeTrabajador(): void

    getTareaPadre(): Tarea | undefined,
    setTareaPadre(tarea: Tarea): void
}

export interface User {
    id: number,
    nombre: string,
    apellidos: string,
    password: string,
    username: string
}