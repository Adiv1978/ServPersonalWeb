import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SeguridadService } from '../../../services/seguridad.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent implements OnInit {
  mostrarVentanaPassword: boolean = false;
  passwordForm!: FormGroup;
  mensajePassword: string = '';
  errorPassword: string = '';
  guardandoPassword: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      nick: [this.getStorageValue('nick'), [Validators.required]],
      passActual: ['', [Validators.required]],
      passNuevo: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPass: ['', [Validators.required]]
    });
  }

  abrirVentanaPassword(): void {
    this.mostrarVentanaPassword = true;
    this.mensajePassword = '';
    this.errorPassword = '';
  }

  cerrarVentanaPassword(): void {
    this.mostrarVentanaPassword = false;
    this.guardandoPassword = false;
    this.passwordForm.patchValue({
      passActual: '',
      passNuevo: '',
      confirmarPass: ''
    });
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
  }

  actualizarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { nick, passActual, passNuevo, confirmarPass } = this.passwordForm.value;

    if (passNuevo !== confirmarPass) {
      this.mensajePassword = '';
      this.errorPassword = 'La nueva contraseña y su confirmación no coinciden.';
      return;
    }

    const token = this.getStorageValue('token');
    if (!token) {
      this.mensajePassword = '';
      this.errorPassword = 'No hay sesión activa. Por favor inicia sesión nuevamente.';
      return;
    }

    this.guardandoPassword = true;
    this.errorPassword = '';
    this.mensajePassword = '';

    this.seguridadService.updatePassword({
      token,
      minutos: 60,
      nick,
      passActual,
      passNuevo
    }).pipe(
      finalize(() => {
        this.guardandoPassword = false;
      })
    ).subscribe({
      next: (response) => {
        this.mensajePassword = response.message || 'Contraseña actualizada exitosamente.';
        this.passwordForm.patchValue({
          passActual: '',
          passNuevo: '',
          confirmarPass: ''
        });
        this.passwordForm.markAsPristine();
        this.passwordForm.markAsUntouched();
      },
      error: (err) => {
        this.mensajePassword = '';
        this.errorPassword = err.error?.message || 'No fue posible actualizar la contraseña.';
      }
    });
  }


  private getStorageValue(key: string): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(key) || '';
  }

  private removeStorageValue(key: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(key);
  }

  logout(): void {
    this.removeStorageValue('token');
    this.removeStorageValue('usuarioId');
    this.removeStorageValue('rol');
    this.removeStorageValue('nick');
    this.router.navigate(['/login']);
  }
}
