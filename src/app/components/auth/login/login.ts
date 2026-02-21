import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SeguridadService } from '../../../services/seguridad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  mensajeError: string = '';
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private seguridadService: SeguridadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializamos el formulario con sus validaciones
    this.loginForm = this.fb.group({
      nick: ['', [Validators.required]],
      pass: ['', [Validators.required]],
      minutos: [60, [Validators.required, Validators.min(1)]] // Por defecto 60 minutos
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.seguridadService.login(this.loginForm.value).subscribe({
      next: (session) => {
        // Guardamos la sesión en el LocalStorage
        localStorage.setItem('token', session.token);
        localStorage.setItem('usuarioId', session.usuarioId.toString());
        localStorage.setItem('rol', session.rol.toString());
        
        // Redirigimos al Layout principal (lo crearemos después)
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.cargando = false;
        // Capturamos el BadRequest del backend (.NET)
        this.mensajeError = err.error?.message || 'Error de conexión con el servidor.';
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}
