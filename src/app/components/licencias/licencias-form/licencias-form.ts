import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';

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
  
  archivosSeleccionados: File[] = [];
  mostrarSeccionArchivos = false;
  errorArchivos = '';

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
      cantidadDias: [null, [Validators.required, Validators.min(1)]],
      fecLicenciaFin: ['', [Validators.required]],
      diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
      observacion: [''],
      auditoria: [false]
    });

    this.licenciaForm.get('fecLicenciaIni')!.valueChanges.subscribe(() => this.calcularFechaFin());
    this.licenciaForm.get('cantidadDias')!.valueChanges.subscribe(() => this.calcularFechaFin());
  }

  calcularFechaFin(): void {
    const fecIni = this.licenciaForm.get('fecLicenciaIni')?.value as string;
    const dias = Number(this.licenciaForm.get('cantidadDias')?.value);

    if (fecIni && dias > 0) {
      const [year, month, day] = fecIni.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      fecha.setDate(fecha.getDate() + dias);

      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');

      this.licenciaForm.get('fecLicenciaFin')!.setValue(`${yyyy}-${mm}-${dd}`, { emitEvent: false });
    } else {
      this.licenciaForm.get('fecLicenciaFin')!.setValue('', { emitEvent: false });
    }
  }

  toggleSeccionArchivos(): void {
    this.mostrarSeccionArchivos = !this.mostrarSeccionArchivos;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.errorArchivos = '';
    const seleccionados = Array.from(input.files);
    const soloPNG = seleccionados.filter(f => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png'));

    if (soloPNG.length !== seleccionados.length) {
      this.errorArchivos = 'Solo se permiten archivos PNG. Los archivos de otro tipo fueron ignorados.';
    }

    this.archivosSeleccionados = [...this.archivosSeleccionados, ...soloPNG];
    input.value = '';
  }

  removerArchivo(index: number): void {
    this.archivosSeleccionados = this.archivosSeleccionados.filter((_, i) => i !== index);
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

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || '';
    const registradoPorId = Number(localStorage.getItem('usuarioId') || 0);
    const registradoPorNick = localStorage.getItem('nick') || '';

    const licenciaGuardar: Licencia = {
      licenciaId: 0,
      idPersona: Number(this.licenciaForm.value.idPersona),
      noLicencia: this.licenciaForm.value.noLicencia,
      empleadoCedula: this.personaSeleccionada!.cedula,
      empleadoNombreCompleto: this.personaSeleccionada!.nombreCompleto,
      puestoTrabajo: this.personaSeleccionada!.puestoTrabajo,
      fecLicenciaIni: this.licenciaForm.value.fecLicenciaIni,
      fecLicenciaFin: this.licenciaForm.value.fecLicenciaFin,
      tiempoLicencia: Number(this.licenciaForm.value.cantidadDias),
      diaFaltantes: 0,
      diagnostico: this.licenciaForm.value.diagnostico,
      observacion: this.licenciaForm.value.observacion,
      auditoria: this.licenciaForm.value.auditoria,
      fechaRegistroSistema: new Date().toISOString(),
      registradoPorId,
      registradoPorNick
    };

    this.licenciasService.setLicencias(token, 60, licenciaGuardar, this.archivosSeleccionados).subscribe({
      next: (res) => {
        this.mensajeExito = res.message || 'Licencia registrada exitosamente.';
        setTimeout(() => {
          this.router.navigate(['/home/personal']);
        }, 1500);
      },
      error: (err) => {
        // Captura excepciones de BD como "El número de licencia ya fue registrado"
        this.mensajeError = resolveBackendErrorMessage(err, 'Error al guardar la licencia.');
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}
