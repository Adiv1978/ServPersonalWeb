import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';
import { finalize } from 'rxjs';

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

  constructor(
    private licenciasService: LicenciasService,
    private personalService: PersonalService
  ) {}

  ngOnInit(): void {
    this.cargarLicencias();
  }

  cargarLicencias(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.mensajeInfo = '';

    const token = localStorage.getItem('token') || '';
    const minutos = 60;

    // Pasamos los filtros (si están vacíos, se enviarán como undefined gracias a la lógica del servicio)
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
            return;
          }

          this.consultarLicencias(token, minutos, persona.id, fecIni, fecFin, regDesde, regHasta);
        },
        error: (err) => {
          this.listaLicencias = [];
          this.mensajeError = resolveBackendErrorMessage(err, 'Error al validar la cédula de la persona.');
          this.cargando = false;
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
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => {
          this.listaLicencias = data;

          if (this.listaLicencias.length === 0) {
            this.mensajeInfo = 'Registro no encontrado.';
          }
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
    this.filtroFecIni = '';
    this.filtroFecFin = '';
    this.filtroRegDesde = '';
    this.filtroRegHasta = '';
    this.filtroCedulaPersona = '';
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.listaLicencias = [];
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

    const token = localStorage.getItem('token') || '';
    const minutos = 60;
    const fecIni = this.filtroFecIni ? this.filtroFecIni : undefined;
    const fecFin = this.filtroFecFin ? this.filtroFecFin : undefined;

    this.licenciasService.getExcel(token, minutos, 0, fecIni, fecFin).subscribe({
      next: (blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Licencias_${new Date().getTime()}.xlsx`; // Nombre dinámico
        document.body.appendChild(a);
        a.click();
        
        // Limpiar el DOM
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.mensajeError = resolveBackendErrorMessage(err, 'Error al generar el archivo Excel.');
        this.descargando = false;
      },
      complete: () => {
        this.descargando = false;
      }
    });
  }
}
