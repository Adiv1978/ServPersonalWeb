import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personal } from '../models/personal.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'https://localhost:32785/api/Personal';

  constructor(private http: HttpClient) { }

  getPersonal(token: string, minutos: number, id: number = 0, busqueda: string = ''): Observable<Personal[]> {
    const params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString())
      .set('id', id.toString())
      .set('busqueda', busqueda);

    return this.http.get<Personal[]>(`${this.apiUrl}/Get`, { params });
  }

  setPersonal(token: string, minutos: number, personal: Personal): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString());

    // El objeto personal viaja en el body, el token en la URL (query params)
    return this.http.post<any>(`${this.apiUrl}/Set`, personal, { params });
  }
}