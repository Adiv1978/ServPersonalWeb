import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-licencias-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './licencias-list.html',
  styleUrls: ['./licencias-list.css']
})
export class LicenciasListComponent implements OnInit {
  listaLicencias: Licencia[] = [];
  
  // Filtros
  filtroFecIni: string = '';
  filtroFecFin: string = '';
  filtroRegDesde: string = '';
  filtroRegHasta: string = '';
  filtroCedulaPersona: string = '';
  
  cargando: boolean = false;
  descargando: boolean = false;
  mensajeError: string = '';
  mensajeInfo: string = '';

  // Bandera para saber si el usuario ya presionó "Filtrar"
  busquedaRealizada: boolean = false;

  constructor(
    private licenciasService: LicenciasService,
    private personalService: PersonalService,
    private cdr: ChangeDetectorRef // Inyectamos el detector de cambios
  ) {}

  ngOnInit(): void {
    // Lo dejamos vacío para que no cargue datos al refrescar la página
  }

  cargarLicencias(): void {
    // 1. Limpieza absoluta y activación de estado de carga
    this.cargando = true;
    this.busquedaRealizada = true; // Indicamos que se inició una búsqueda manual
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.listaLicencias = []; 
    this.cdr.detectChanges(); // Forzamos mostrar el spinner

    const token = localStorage.getItem('token') || '';
    const minutos = 60;

    const fecIni = this.filtroFecIni ? this.filtroFecIni : undefined;
    const fecFin = this.filtroFecFin ? this.filtroFecFin : undefined;
    const regDesde = this.filtroRegDesde ? this.filtroRegDesde : undefined;
    const regHasta = this.filtroRegHasta ? this.filtroRegHasta : undefined;
    const cedula = this.filtroCedulaPersona.trim();

    if (cedula) {
      this.personalService.getPersonal(token, minutos, 0, cedula).subscribe({
        next: (personas: Personal[]) => {
          const persona = personas?.[0];

          if (!persona) {
            this.listaLicencias = [];
            this.mensajeInfo = 'La cédula indicada no existe.';
            this.cargando = false;
            this.cdr.detectChanges();
            return;
          }

          this.consultarLicencias(token, minutos, persona.id, fecIni, fecFin, regDesde, regHasta);
        },
        error: (err) => {
          this.listaLicencias = [];
          this.mensajeError = resolveBackendErrorMessage(err, 'Error al validar la cédula de la persona.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.consultarLicencias(token, minutos, 0, fecIni, fecFin, regDesde, regHasta);
  }

  private consultarLicencias(
    token: string,
    minutos: number,
    idPersona: number,
    fecIni?: string,
    fecFin?: string,
    regDesde?: string,
    regHasta?: string
  ): void {
    this.mensajeError = '';
    this.mensajeInfo = '';

    this.licenciasService
      .getLicencias(token, minutos, idPersona, fecIni, fecFin, regDesde, regHasta)
      .pipe(
        finalize(() => {
          // Un pequeño delay asegura que Angular termine el ciclo actual antes de apagar el spinner
          setTimeout(() => {
            this.cargando = false;
            this.cdr.detectChanges(); 
          }, 10);
        })
      )
      .subscribe({
        next: (data) => {
          // Clonamos el array para forzar una nueva referencia de memoria en la tabla
          this.listaLicencias = [...data];
        },
        error: (err) => {
          this.listaLicencias = [];
          this.mensajeError = resolveBackendErrorMessage(err, 'Error al cargar las licencias médicas.');
        }
      });
  }

  buscar(): void {
    this.cargarLicencias();
  }

  limpiarFiltros(): void {
    // Vaciamos los inputs
    this.filtroFecIni = '';
    this.filtroFecFin = '';
    this.filtroRegDesde = '';
    this.filtroRegHasta = '';
    this.filtroCedulaPersona = '';
    
    // Limpieza total visual sin llamar al backend
    this.listaLicencias = [];
    this.busquedaRealizada = false;
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.cdr.detectChanges();
  }

  onCedulaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '').slice(0, 11);

    let formateada = soloDigitos;
    if (soloDigitos.length > 3) {
      formateada = `${soloDigitos.slice(0, 3)}-${soloDigitos.slice(3)}`;
    }
    if (soloDigitos.length > 10) {
      formateada = `${soloDigitos.slice(0, 3)}-${soloDigitos.slice(3, 10)}-${soloDigitos.slice(10, 11)}`;
    }

    this.filtroCedulaPersona = formateada;
  }

  descargarExcel(): void {
    this.descargando = true;
    this.mensajeError = '';
    this.cdr.detectChanges();

    const token = localStorage.getItem('token') || '';
    const minutos = 60;
    const fecIni = this.filtroFecIni ? this.filtroFecIni : undefined;
    const fecFin = this.filtroFecFin ? this.filtroFecFin : undefined;

    this.licenciasService.getExcel(token, minutos, 0, fecIni, fecFin)
      .pipe(
        finalize(() => {
          this.descargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Reporte_Licencias_${new Date().getTime()}.xlsx`; 
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.mensajeError = resolveBackendErrorMessage(err, 'Error al generar el archivo Excel.');
        }
      });
  }
}