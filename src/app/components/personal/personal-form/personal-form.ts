import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PersonalService } from '../../../services/personal.service';
import { Personal } from '../../../models/personal.model';

@Component({
  selector: 'app-personal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './personal-form.html',
  styleUrls: ['./personal-form.css']
})
export class PersonalFormComponent implements OnInit {
  personalForm!: FormGroup;
  idPersonal: number = 0;
  esEdicion: boolean = false;
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();

    // Verificamos si la URL trae un ID para saber si es edición
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.esEdicion = true;
        this.idPersonal = +id; // Convertimos a número
        this.cargarDatosEmpleado(this.idPersonal);
      }
    });
  }

  inicializarFormulario(): void {
    this.personalForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      puestoTrabajo: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  cargarDatosEmpleado(id: number): void {
    this.cargando = true;
    const token = localStorage.getItem('token') || '';
    const minutos = 60;

    this.personalService.getPersonal(token, minutos, id).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const empleado = data[0];
          // Llenamos el formulario con los datos recibidos de PostgreSQL
          this.personalForm.patchValue({
            cedula: empleado.cedula,
            nombre: empleado.nombre,
            apellidos: empleado.apellidos,
            puestoTrabajo: empleado.puestoTrabajo
          });
        }
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar los datos del empleado.';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || '';
    const minutos = 60;

    // Construimos el objeto DTO para enviarlo a la API
    const empleadoGuardar: Personal = {
      id: this.idPersonal, // Será 0 si es nuevo, o el ID real si es edición
      cedula: this.personalForm.value.cedula,
      nombre: this.personalForm.value.nombre,
      apellidos: this.personalForm.value.apellidos,
      puestoTrabajo: this.personalForm.value.puestoTrabajo
    };

    this.personalService.setPersonal(token, minutos, empleadoGuardar).subscribe({
      next: (res) => {
        this.mensajeExito = res.message || 'Registro guardado exitosamente.';
        // Retrasamos la redirección 1.5 segundos para que el usuario lea el mensaje
        setTimeout(() => {
          this.router.navigate(['/home/personal']);
        }, 1500);
      },
      error: (err) => {
        // Aquí capturamos el RAISE EXCEPTION si la cédula está duplicada
        this.mensajeError = err.error?.message || 'Error al guardar el registro.';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}