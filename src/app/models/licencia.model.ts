export interface Licencia {
    // Datos de la Licencia
    licenciaId: number;
    noLicencia: string;
    idPersona: number;
    
    // Datos del Empleado (Autogenerados por la vista en BD)
    empleadoCedula?: string;
    empleadoNombreCompleto?: string;
    puestoTrabajo?: string;
    
    // Fechas y Tiempos
    fecLicenciaIni: string | Date;
    fecLicenciaFin: string | Date;
    tiempoLicencia?: number; // Autocalculado
    
    // Detalles Médicos y Auditoría
    diagnostico: string;
    observacion?: string;
    auditoria: boolean;
    
    // Datos de Registro (Autogenerados)
    fechaRegistroSistema?: string | Date;
    registradoPorId?: number;
    registradoPorNick?: string;
}