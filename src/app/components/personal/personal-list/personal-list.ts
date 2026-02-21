import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Se mantiene vacío para evitar llamadas automáticas al refrescar
  }

  buscar(): void {
    // Protección para no tocar localStorage en el servidor (Node.js)
    if (!isPlatformBrowser(this.platformId)) return;

    // 1. LIMPIEZA ABSOLUTA: Vaciamos la plantilla inmediatamente
    this.listaPersonal = []; 
    this.mensajeError = '';
    this.busquedaRealizada = false;
    this.cargando = true;
    
    // 2. FORZAR REPINTADO: Obligamos a Angular a ocultar la tabla antigua AHORA
    this.cdr.detectChanges(); 

    const token = localStorage.getItem('token') || '';
    
    this.personalService.getPersonal(token, 60, 0, this.busqueda)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.cargando = false;
            this.busquedaRealizada = true;
            this.cdr.detectChanges(); // Repintado final (muestra tabla nueva o mensaje)
          }, 10);
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del Backend:', response);
          
          if (Array.isArray(response)) {
            this.listaPersonal = [...response]; 
          } else if (response && Array.isArray(response.value)) {
            this.listaPersonal = [...response.value];
          } else if (response && Array.isArray(response.data)) {
            this.listaPersonal = [...response.data];
          } else {
            // Si el backend responde 200 OK pero sin datos útiles
            this.listaPersonal = [];
          }
        },
        error: (err) => {
          console.error('Error en la petición:', err);
          // Si enviamos datos incorrectos y .NET arroja error (ej. 400 o 404)
          // Garantizamos que la lista se mantenga vacía y mostramos un error amigable
          this.listaPersonal = [];
          
          // Muestra el mensaje de error del backend si existe, o uno genérico
          this.mensajeError = err.error?.message || 'No se encontraron resultados con esos datos.';
        }
      });
  }

  obtenerIdPersona(persona: Personal | Record<string, any>): number | null {
    const personaLike = persona as Personal & { idPersona?: number | string };
    const idRaw = personaLike?.id ?? personaLike?.idPersona;
    const id = Number(idRaw);

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  obtenerNombreCompleto(persona: Personal | Record<string, any>): string {
    const nombreCompleto = (persona?.nombreCompleto || '').trim();
    if (nombreCompleto) return nombreCompleto;

    const nombre = (persona?.nombre || '').trim();
    const apellidos = (persona?.apellidos || '').trim();
    return `${nombre} ${apellidos}`.trim();
  }
}
