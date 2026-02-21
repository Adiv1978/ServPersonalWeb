import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Licencia } from '../models/licencia.model';

@Injectable({
  providedIn: 'root'
})
export class LicenciasService {
  private apiUrl = 'https://localhost:32783/api/Licencias';

  constructor(private http: HttpClient) { }

  setLicencias(token: string, minutos: number, licencia: Licencia): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString());

    return this.http.post<any>(`${this.apiUrl}/Set`, licencia, { params });
  }

  getLicencias(token: string, minutos: number, idPersona: number = 0, fecIni?: string, fecFin?: string): Observable<Licencia[]> {
    let params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString())
      .set('idPersona', idPersona.toString());

    if (fecIni) params = params.set('fecIni', fecIni);
    if (fecFin) params = params.set('fecFin', fecFin);

    return this.http.get<Licencia[]>(`${this.apiUrl}/Get`, { params });
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