import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GptLicencias } from '../models/gpt-licencias.model';

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private apiUrl = 'https://10.8.0.1:7180/api/Gpt';

  constructor(private http: HttpClient) { }

  analizarLicenciaPdf(token: string, rolLevel: number, archivo: File): Observable<GptLicencias> {
    const params = new HttpParams()
      .set('token', token)
      .set('rolLevel', rolLevel.toString());

    const formData = new FormData();
    formData.append('archivoPng', archivo, archivo.name);

    return this.http.post<GptLicencias>(
      `${this.apiUrl}/AnalizarLicenciaPdfAsync`,
      formData,
      { params }
    );
  }
}
