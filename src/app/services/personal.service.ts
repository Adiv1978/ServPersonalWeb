import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personal } from '../models/personal.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'https://localhost:7180/api/Personal';

  constructor(private http: HttpClient) { }

  getPersonal(token: string, id: number = 0, busqueda: string = ''): Observable<Personal[]> {
    const params = new HttpParams()
      .set('token', token)
      .set('id', id.toString())
      .set('busqueda', busqueda);

    return this.http.get<Personal[]>(`${this.apiUrl}/Get`, { params });
  }

  setPersonal(token: string, personal: Personal): Observable<any> {
    const params = new HttpParams()
      .set('token', token);

    return this.http.post<any>(`${this.apiUrl}/Set`, personal, { params });
  }
}