import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const SESSION_INVALID_MESSAGE = 'Token inválido, sesión caducada o usuario inactivo.';

function extractErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string') {
    return error.error;
  }

  if (typeof error.error?.message === 'string') {
    return error.error.message;
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  return '';
}

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = extractErrorMessage(error);

        if (message.includes(SESSION_INVALID_MESSAGE) && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioId');
          localStorage.removeItem('rol');

          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
