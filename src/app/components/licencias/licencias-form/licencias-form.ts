import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LicenciasService } from '../../../services/licencias.service';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';
import { Licencia } from '../../../models/licencia.model';

@Component({
  selector: 'app-licencias-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './licencias-form.html',
  styleUrls: ['./licencias-form.css']
})
export class LicenciasFormComponent implements OnInit {
  licenciaForm!: FormGroup;
  listaEmpleados: Personal[] = [];
  
  cargando: boolean = false;
  cargandoEmpleados: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private fb: FormBuilder,
    private licenciasService: LicenciasService,
    private personalService: PersonalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEmpleadosSelect();
  }

  inicializarFormulario(): void {
    this.licenciaForm = this.fb.group({
      idPersona: ['', [Validators.required]],
      noLicencia: ['', [Validators.required, Validators.maxLength(50)]],
      fecLicenciaIni: ['', [Validators.required]],
      fecLicenciaFin: ['', [Validators.required]],
      diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
      observacion: [''],
      auditoria: [false] // Checkbox por defecto desmarcado
    });
  }

  cargarEmpleadosSelect(): void {
    this.cargandoEmpleados = true;
    const token = localStorage.getItem('token') || '';
    
    // Traemos todo el personal activo para llenar el <select>
    this.personalService.getPersonal(token, 60).subscribe({
      next: (data) => {
        this.listaEmpleados = data;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar la lista de empleados. Verifique su conexión.';
      },
      complete: () => {
        this.cargandoEmpleados = false;
      }
    });
  }

  guardar(): void {
    if (this.licenciaForm.invalid) {
      this.licenciaForm.markAllAsTouched();
      return;
    }

    // Validación extra en frontend (PostgreSQL también lo valida, pero mejoramos la UX)
    const ini = new Date(this.licenciaForm.value.fecLicenciaIni);
    const fin = new Date(this.licenciaForm.value.fecLicenciaFin);
    
    if (fin < ini) {
      this.mensajeError = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || '';
    
    // Mapeamos los datos al modelo
    const licenciaGuardar: Licencia = {
      licenciaId: 0, // 0 porque es una inserción nueva
      idPersona: Number(this.licenciaForm.value.idPersona),
      noLicencia: this.licenciaForm.value.noLicencia,
      fecLicenciaIni: this.licenciaForm.value.fecLicenciaIni,
      fecLicenciaFin: this.licenciaForm.value.fecLicenciaFin,
      diagnostico: this.licenciaForm.value.diagnostico,
      observacion: this.licenciaForm.value.observacion,
      auditoria: this.licenciaForm.value.auditoria
    };

    this.licenciasService.setLicencias(token, 60, licenciaGuardar).subscribe({
      next: (res) => {
        this.mensajeExito = res.message || 'Licencia registrada exitosamente.';
        setTimeout(() => {
          this.router.navigate(['/home/licencias']);
        }, 1500);
      },
      error: (err) => {
        // Captura excepciones de BD como "El número de licencia ya fue registrado"
        this.mensajeError = err.error?.message || 'Error al guardar la licencia.';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}
