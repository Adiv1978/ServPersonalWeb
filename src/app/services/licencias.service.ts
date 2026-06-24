import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Licencia } from '../models/licencia.model';

@Injectable({
  providedIn: 'root'
})
export class LicenciasService {
  private apiUrl = 'https://10.8.0.1:7180/api/Licencias';

  constructor(private http: HttpClient) { }

  setLicencias(token: string, licencia: Licencia, archivos: File[] = []): Observable<any> {
    const params = new HttpParams()
      .set('token', token);

    const formData = new FormData();
    formData.append('LicenciaId', String(licencia.licenciaId));
    formData.append('NoLicencia', licencia.noLicencia);
    formData.append('IdPersona', String(licencia.idPersona));
    formData.append('EmpleadoCedula', licencia.empleadoCedula ?? '');
    formData.append('EmpleadoNombreCompleto', licencia.empleadoNombreCompleto ?? '');
    formData.append('PuestoTrabajo', licencia.puestoTrabajo ?? '');
    formData.append('FecLicenciaIni', licencia.fecLicenciaIni.toString());
    formData.append('FecLicenciaFin', licencia.fecLicenciaFin.toString());
    formData.append('TiempoLicencia', String(licencia.tiempoLicencia ?? 0));
    formData.append('DiaFaltantes', String(licencia.diaFaltantes ?? 0));
    formData.append('Diagnostico', licencia.diagnostico);
    formData.append('Observacion', licencia.observacion ?? '');
    formData.append('Auditoria', String(licencia.auditoria));
    formData.append('FechaRegistroSistema', licencia.fechaRegistroSistema?.toString() ?? new Date().toISOString());
    formData.append('RegistradoPorId', String(licencia.registradoPorId ?? 0));
    formData.append('RegistradoPorNick', licencia.registradoPorNick ?? '');

    for (const archivo of archivos) {
      formData.append('archivosPdf', archivo, archivo.name);
    }

    return this.http.post<any>(`${this.apiUrl}/Set`, formData, { params });
  }

  getLicencias(
    token: string,
    idPersona: number = 0,
    fecIni?: string,
    fecFin?: string,
    regDesde?: string,
    regHasta?: string
  ): Observable<Licencia[]> {
    let params = new HttpParams()
      .set('token', token)
      .set('idPersona', idPersona.toString());

    if (fecIni) params = params.set('fecIni', fecIni);
    if (fecFin) params = params.set('fecFin', fecFin);
    if (regDesde) params = params.set('regDesde', regDesde);
    if (regHasta) params = params.set('regHasta', regHasta);
    

    return this.http.get<unknown>(`${this.apiUrl}/Get`, { params }).pipe(
      map((response) => this.normalizeLicencias(response))
    );
  }

  private normalizeLicencias(response: unknown): Licencia[] {
    const licenciasCrudas = this.extractArray(response);

    return licenciasCrudas.map((item) => this.mapLicencia(item));
  }

  private extractArray(response: unknown): Record<string, unknown>[] {
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        return this.extractArray(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(response)) {
      return response as Record<string, unknown>[];
    }

    if (response && typeof response === 'object') {
      const wrappedResponse = response as Record<string, unknown>;
      const posiblesColecciones = [
        'data', 'Data',
        'result', 'Result',
        'results', 'Results',
        'items', 'Items',
        'value', 'Value',
        '$values',
        'datos', 'Datos',
        'lista', 'Lista',
        'registros', 'Registros',
        'payload', 'Payload'
      ];

      for (const key of posiblesColecciones) {
        const value = wrappedResponse[key];

        if (Array.isArray(value)) {
          return value as Record<string, unknown>[];
        }

        if (typeof value === 'string') {
          const parsedValue = this.extractArray(value);
          if (parsedValue.length > 0) {
            return parsedValue;
          }
        }
      }

      for (const value of Object.values(wrappedResponse)) {
        const nestedArray = this.extractArray(value);
        if (nestedArray.length > 0) {
          return nestedArray;
        }
      }
    }

    return [];
  }

  private getFirstExistingValue(item: Record<string, unknown>, keys: string[]): unknown {
    const lowerCaseMap = new Map<string, unknown>(
      Object.entries(item).map(([k, v]) => [k.toLowerCase(), v])
    );

    for (const key of keys) {
      const value = lowerCaseMap.get(key.toLowerCase());
      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return undefined;
  }

 private mapLicencia(item: Record<string, unknown>): Licencia {
    const valor = (...keys: string[]) => this.getFirstExistingValue(item, keys);

    return {
      licenciaId: Number(valor('licenciaId', 'LicenciaId') ?? 0),
      noLicencia: String(valor('noLicencia', 'NoLicencia', 'numeroLicencia', 'NumeroLicencia') ?? ''),
      idPersona: Number(valor('idPersona', 'IdPersona', 'personaId', 'PersonaId') ?? 0),
      empleadoCedula: String(valor('empleadoCedula', 'EmpleadoCedula', 'cedula', 'Cedula') ?? ''),
      empleadoNombreCompleto: String(valor('empleadoNombreCompleto', 'EmpleadoNombreCompleto', 'nombreCompleto', 'NombreCompleto') ?? ''),
      puestoTrabajo: String(valor('puestoTrabajo', 'PuestoTrabajo', 'puesto', 'Puesto') ?? ''),
      fecLicenciaIni: (valor('fecLicenciaIni', 'FecLicenciaIni', 'fechaInicio', 'FechaInicio') as string | Date) ?? '',
      fecLicenciaFin: (valor('fecLicenciaFin', 'FecLicenciaFin', 'fechaFin', 'FechaFin') as string | Date) ?? '',
      tiempoLicencia: Number(valor('tiempoLicencia', 'TiempoLicencia', 'diasLicencia', 'DiasLicencia') ?? 0),
      diaFaltantes: Number(valor('diaFaltantes', 'DiaFaltantes') ?? 0), // <--- NUEVA LÍNEA AGREGADA
      diagnostico: String(valor('diagnostico', 'Diagnostico') ?? ''),
      observacion: String(valor('observacion', 'Observacion') ?? ''),
      auditoria: Boolean(valor('auditoria', 'Auditoria') ?? false),
      fechaRegistroSistema: (valor('fechaRegistroSistema', 'FechaRegistroSistema', 'fechaRegistro', 'FechaRegistro') as string | Date) ?? '',
      registradoPorId: Number(valor('registradoPorId', 'RegistradoPorId', 'usuarioId', 'UsuarioId') ?? 0),
      registradoPorNick: String(valor('registradoPorNick', 'RegistradoPorNick', 'usuarioNick', 'UsuarioNick') ?? '')
    };
  }

  updateLicencia(request: {
    token: string;
    idLicencia: number;
    fecLicenciaIni: string;
    fecLicenciaFin: string;
    diagnostico: string;
    auditoria: boolean;
    observacion: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/Update`, request);
  }

  getExcel(token: string, idPersona: number = 0, fecIni?: string, fecFin?: string): Observable<Blob> {
    let params = new HttpParams()
      .set('token', token)
      .set('idPersona', idPersona.toString());

    if (fecIni) params = params.set('fecIni', fecIni);
    if (fecFin) params = params.set('fecFin', fecFin);

    // responseType 'blob' indica que esperamos un archivo
    return this.http.get(`${this.apiUrl}/GetExcel`, { params, responseType: 'blob' });
  }

  getLicenciasActivas(numeroPagina: number, tamanioPagina: number): Observable<Licencia[]> {
  const params = new HttpParams()
    .set('numeroPagina', numeroPagina.toString())
    .set('tamanioPagina', tamanioPagina.toString());

  return this.http.get<unknown>(`${this.apiUrl}/GetActivas`, { params }).pipe(
    map((response) => this.normalizeLicencias(response))
  );
}

getExcelActivas(numeroPagina: number, tamanioPagina: number): Observable<Blob> {
  const params = new HttpParams()
    .set('numeroPagina', numeroPagina.toString())
    .set('tamanioPagina', tamanioPagina.toString());

  return this.http.get(`${this.apiUrl}/GetExcelActivas`, { 
    params, 
    responseType: 'blob' 
  });
}

}
