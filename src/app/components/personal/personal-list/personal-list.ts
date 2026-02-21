import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-personal-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './personal-list.html',
  styleUrls: ['./personal-list.css']
})
export class PersonalListComponent implements OnInit {
  listaPersonal: Personal[] = [];
  busqueda: string = '';
  cargando: boolean = false;
  mensajeError: string = '';
  busquedaRealizada: boolean = false;

  constructor(
    private personalService: PersonalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Se mantiene vacío para evitar llamadas automáticas al refrescar
  }

  buscar(): void {
    // Protección para no tocar localStorage en el servidor (Node.js)
    if (!isPlatformBrowser(this.platformId)) return;

    this.cargando = true;
    this.busquedaRealizada = false; // Reset para el estado visual
    this.mensajeError = '';
    this.listaPersonal = []; // Limpieza preventiva

    const token = localStorage.getItem('token') || '';
    
    this.personalService.getPersonal(token, 60, 0, this.busqueda)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.busquedaRealizada = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del Backend:', response);
          // Mapeo flexible para evitar que la tabla rompa si el formato cambia
          if (Array.isArray(response)) {
            this.listaPersonal = response;
          } else if (response && response.value) {
            this.listaPersonal = response.value;
          } else if (response && response.data) {
            this.listaPersonal = response.data;
          } else {
            this.listaPersonal = [];
          }
        },
        error: (err) => {
          console.error('Error en la petición:', err);
          this.mensajeError = 'No se pudo conectar con el servidor.';
          this.listaPersonal = [];
          this.busquedaRealizada = true;
        }
      });
  }
}
