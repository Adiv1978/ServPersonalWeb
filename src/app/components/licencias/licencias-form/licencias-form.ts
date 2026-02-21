import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LicenciasService } from '../../../services/licencias.service';
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
  personaSeleccionada: {
    idPersona: number;
    cedula: string;
    nombreCompleto: string;
    puestoTrabajo: string;
  } | null = null;
  
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private fb: FormBuilder,
    private licenciasService: LicenciasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPersonaDesdeRuta();
  }

  inicializarFormulario(): void {
    this.licenciaForm = this.fb.group({
      idPersona: [null, [Validators.required]],
      noLicencia: ['', [Validators.required, Validators.maxLength(50)]],
      fecLicenciaIni: ['', [Validators.required]],
      fecLicenciaFin: ['', [Validators.required]],
      diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
      observacion: [''],
      auditoria: [false] // Checkbox por defecto desmarcado
    });
  }

  cargarPersonaDesdeRuta(): void {
    const params = this.route.snapshot.queryParamMap;

    const idPersona = Number(params.get('idPersona') || 0);
    const cedula = params.get('cedula') || '';
    const nombreCompleto = params.get('nombreCompleto') || '';
    const puestoTrabajo = params.get('puestoTrabajo') || '';

    if (!idPersona) {
      this.mensajeError = 'Debe seleccionar una persona desde el listado de personal para registrar la licencia.';
      return;
    }

    this.personaSeleccionada = {
      idPersona,
      cedula,
      nombreCompleto,
      puestoTrabajo
    };

    this.licenciaForm.patchValue({ idPersona });
  }

  guardar(): void {
    if (this.licenciaForm.invalid) {
      this.licenciaForm.markAllAsTouched();
      return;
    }

    if (!this.personaSeleccionada) {
      this.mensajeError = 'No hay una persona seleccionada para asociar la licencia.';
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
          this.router.navigate(['/home/personal']);
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
