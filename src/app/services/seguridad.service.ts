import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, Session, UpdatePasswordRequest } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  // NOTA: Cambia este puerto por el que te muestra Visual Studio al correr tu API
  private apiUrl = 'https://localhost:7180/api/Seguridad'; 

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/Login`, request);
  }

  validate(token: string, minutos: number, rolLevel: number): Observable<Session> {
    const params = new HttpParams()
      .set('token', token)
      .set('minutos', minutos.toString())
      .set('rolLevel', rolLevel.toString());

    return this.http.get<Session>(`${this.apiUrl}/Validate`, { params });
  }

  updatePassword(request: UpdatePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/UpdatePassword`, request);
  }
}
