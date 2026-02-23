import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';

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

  ngOnInit(): void {}

  buscar(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.listaPersonal = []; 
    this.mensajeError = '';
    this.busquedaRealizada = false;
    this.cargando = true;
    this.cdr.detectChanges(); 

    const token = localStorage.getItem('token') || '';
    
    this.personalService.getPersonal(token, 60, 0, this.busqueda).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.listaPersonal = response; 
        } else if (response && Array.isArray(response.value)) {
          this.listaPersonal = response.value;
        } else if (response && Array.isArray(response.data)) {
          this.listaPersonal = response.data;
        }
        
        // Se apaga inmediatamente al recibir los datos
        this.cargando = false;
        this.busquedaRealizada = true;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.listaPersonal = [];
        this.mensajeError = resolveBackendErrorMessage(err, 'No se encontraron resultados.');
        this.cargando = false;
        this.busquedaRealizada = true;
        this.cdr.detectChanges(); 
      }
    });
  }
}