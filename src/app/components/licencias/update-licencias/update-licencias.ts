import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LicenciasService } from '../../../services/licencias.service';
import { Licencia } from '../../../models/licencia.model';
import { resolveBackendErrorMessage } from '../../../utils/http-error.utils';

@Component({
  selector: 'app-update-licencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-licencias.html',
  styleUrls: ['./update-licencias.css']
})
export class UpdateLicenciasComponent implements OnChanges {
  @Input() licencia: Licencia | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  updateForm!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private licenciasService: LicenciasService
  ) {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['licencia'] && this.licencia) {
      this.mensajeError = '';
      this.mensajeExito = '';
      this.cargando = false;
      this.cargarDatosEnFormulario();
    }
  }

  private inicializarFormulario(): void {
    this.updateForm = this.fb.group({
      fecLicenciaIni: ['', [Validators.required]],
      fecLicenciaFin: ['', [Validators.required]],
      diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
      auditoria: [false],
      observacion: ['']
    });
  }

  private toDateInputValue(value: string | Date): string {
    if (!value) return '';
    if (typeof value === 'string') return value.substring(0, 10);
    const d = value as Date;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private cargarDatosEnFormulario(): void {
    this.updateForm.patchValue({
      fecLicenciaIni: this.toDateInputValue(this.licencia!.fecLicenciaIni),
      fecLicenciaFin: this.toDateInputValue(this.licencia!.fecLicenciaFin),
      diagnostico: this.licencia!.diagnostico,
      auditoria: this.licencia!.auditoria,
      observacion: this.licencia!.observacion ?? ''
    });
    this.updateForm.markAsUntouched();
  }

  guardar(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const ini = new Date(this.updateForm.value.fecLicenciaIni);
    const fin = new Date(this.updateForm.value.fecLicenciaFin);
    if (fin < ini) {
      this.mensajeError = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || '';

    this.licenciasService.updateLicencia({
      token,
      idLicencia: this.licencia!.licenciaId,
      fecLicenciaIni: this.updateForm.value.fecLicenciaIni,
      fecLicenciaFin: this.updateForm.value.fecLicenciaFin,
      diagnostico: this.updateForm.value.diagnostico,
      auditoria: this.updateForm.value.auditoria,
      observacion: this.updateForm.value.observacion
    }).subscribe({
      next: (res) => {
        this.mensajeExito = res.message || 'Licencia actualizada exitosamente.';
        setTimeout(() => {
          this.actualizado.emit();
          this.cerrar.emit();
        }, 1200);
      },
      error: (err) => {
        this.mensajeError = resolveBackendErrorMessage(err, 'Error al actualizar la licencia.');
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  onCerrar(): void {
    if (!this.cargando) {
      this.cerrar.emit();
    }
  }
}
