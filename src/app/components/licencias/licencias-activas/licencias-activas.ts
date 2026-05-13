import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-licencias-activas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './licencias-activas.html'
})
export class LicenciasActivasComponent implements OnInit {
  listaActivas: Licencia[] = [];
  cargando = false;
  descargando = false;
  mensajeError = '';

  // Configuración de paginación
  paginaActual = 1;
  tamanioPagina = 10;

  constructor(
    private licenciasService: LicenciasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarActivas();
  }

  cargarActivas(): void {
    this.cargando = true;
    this.mensajeError = '';
    
    this.licenciasService.getLicenciasActivas(this.paginaActual, this.tamanioPagina)
      .pipe(finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => this.listaActivas = data,
        error: (err) => this.mensajeError = resolveBackendErrorMessage(err, 'Error al cargar licencias activas.')
      });
  }

  descargarExcel(): void {
    this.descargando = true;
    this.licenciasService.getExcelActivas(this.paginaActual, this.tamanioPagina)
      .pipe(finalize(() => {
        this.descargando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Reporte_Activas_${new Date().getTime()}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => this.mensajeError = resolveBackendErrorMessage(err, 'Error al generar Excel.')
      });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarActivas();
  }
}