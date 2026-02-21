import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // En funciones standalone inyectamos dependencias así:
  const router = inject(Router);
  
  // Buscamos si existe el token en el almacenamiento local
  const token = localStorage.getItem('token');

  if (token) {
    // Si hay token, la sesión existe (al menos localmente), dejamos pasar.
    return true;
  } else {
    // Si no hay token, el usuario no ha hecho login. Lo enviamos de vuelta.
    router.navigate(['/login']);
    return false;
  }
};