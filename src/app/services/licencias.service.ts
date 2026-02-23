import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Licencia } from '../models/licencia.model';

@Injectable({
  providedIn: 'root'
})
export class LicenciasService {
  private apiUrl = 'https://localhost:32787/api/Licencias';

  constructor(private http: HttpClient) { }

  setLicencias(token: string, minutos: number, licencia: Licencia): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString());

    return this.http.post<any>(`${this.apiUrl}/Set`, licencia, { params });
  }

  getLicencias(
    token: string,
    minutos: number,
    idPersona: number = 0,
    fecIni?: string,
    fecFin?: string,
    regDesde?: string,
    regHasta?: string
  ): Observable<Licencia[]> {
    let params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString())
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
    if (Array.isArray(response)) {
      return response as Record<string, unknown>[];
    }

    if (response && typeof response === 'object') {
      const wrappedResponse = response as Record<string, unknown>;
      const posiblesColecciones = ['data', 'result', 'results', 'items', 'value', 'datos', 'lista', 'registros', 'payload'];

      for (const key of posiblesColecciones) {
        const value = wrappedResponse[key];
        if (Array.isArray(value)) {
          return value as Record<string, unknown>[];
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

  private mapLicencia(item: Record<string, unknown>): Licencia {
    const valor = (camelCaseKey: string, pascalCaseKey: string) =>
      item[camelCaseKey] ?? item[pascalCaseKey];

    return {
      licenciaId: Number(valor('licenciaId', 'LicenciaId') ?? 0),
      noLicencia: String(valor('noLicencia', 'NoLicencia') ?? ''),
      idPersona: Number(valor('idPersona', 'IdPersona') ?? 0),
      empleadoCedula: String(valor('empleadoCedula', 'EmpleadoCedula') ?? ''),
      empleadoNombreCompleto: String(valor('empleadoNombreCompleto', 'EmpleadoNombreCompleto') ?? ''),
      puestoTrabajo: String(valor('puestoTrabajo', 'PuestoTrabajo') ?? ''),
      fecLicenciaIni: (valor('fecLicenciaIni', 'FecLicenciaIni') as string | Date) ?? '',
      fecLicenciaFin: (valor('fecLicenciaFin', 'FecLicenciaFin') as string | Date) ?? '',
      tiempoLicencia: Number(valor('tiempoLicencia', 'TiempoLicencia') ?? 0),
      diagnostico: String(valor('diagnostico', 'Diagnostico') ?? ''),
      observacion: String(valor('observacion', 'Observacion') ?? ''),
      auditoria: Boolean(valor('auditoria', 'Auditoria') ?? false),
      fechaRegistroSistema: (valor('fechaRegistroSistema', 'FechaRegistroSistema') as string | Date) ?? '',
      registradoPorId: Number(valor('registradoPorId', 'RegistradoPorId') ?? 0),
      registradoPorNick: String(valor('registradoPorNick', 'RegistradoPorNick') ?? '')
    };
  }

  getExcel(token: string, minutos: number, idPersona: number = 0, fecIni?: string, fecFin?: string): Observable<Blob> {
    let params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString())
      .set('idPersona', idPersona.toString());

    if (fecIni) params = params.set('fecIni', fecIni);
    if (fecFin) params = params.set('fecFin', fecFin);

    // responseType 'blob' indica que esperamos un archivo
    return this.http.get(`${this.apiUrl}/GetExcel`, { params, responseType: 'blob' });
  }
}
