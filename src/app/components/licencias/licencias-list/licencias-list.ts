import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';

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
  
  cargando: boolean = false;
  descargando: boolean = false;
  mensajeError: string = '';

  constructor(private licenciasService: LicenciasService) {}

  ngOnInit(): void {
    this.cargarLicencias();
  }

  cargarLicencias(): void {
    this.cargando = true;
    this.mensajeError = '';

    const token = localStorage.getItem('token') || '';
    const minutos = 60;

    // Pasamos los filtros (si están vacíos, se enviarán como undefined gracias a la lógica del servicio)
    const fecIni = this.filtroFecIni ? this.filtroFecIni : undefined;
    const fecFin = this.filtroFecFin ? this.filtroFecFin : undefined;

    this.licenciasService.getLicencias(token, minutos, 0, fecIni, fecFin).subscribe({
      next: (data) => {
        this.listaLicencias = data;
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al cargar las licencias médicas.';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.cargarLicencias();
  }

  limpiarFiltros(): void {
    this.filtroFecIni = '';
    this.filtroFecFin = '';
    this.cargarLicencias();
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
        this.mensajeError = 'Error al generar el archivo Excel.';
        this.descargando = false;
      },
      complete: () => {
        this.descargando = false;
      }
    });
  }
}
