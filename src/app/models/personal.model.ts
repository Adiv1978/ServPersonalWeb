export interface Personal {
    id: number;
    cedula: string;
    nombre: string;
    apellidos: string;
    nombreCompleto?: string; // Es opcional (?) porque al hacer POST (insertar) no lo enviamos
    puestoTrabajo: string;
}