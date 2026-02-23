import { HttpErrorResponse } from '@angular/common/http';

const SESSION_INVALID_MESSAGE = 'Token inválido, sesión caducada o usuario inactivo.';

function extractCandidateMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }

    if (typeof error.error?.title === 'string') {
      return error.error.title;
    }

    if (Array.isArray(error.error?.errors) && typeof error.error.errors[0] === 'string') {
      return error.error.errors[0];
    }

    if (typeof error.message === 'string') {
      return error.message;
    }
  }

  if (typeof (error as { error?: { message?: string } })?.error?.message === 'string') {
    return (error as { error: { message: string } }).error.message;
  }

  if (typeof (error as { message?: string })?.message === 'string') {
    return (error as { message: string }).message;
  }

  return '';
}

export function isSessionError(error: unknown): boolean {
  const message = extractCandidateMessage(error);
  return message.includes(SESSION_INVALID_MESSAGE);
}

export function resolveBackendErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = extractCandidateMessage(error).trim();

  if (!message || isSessionError(error)) {
    return fallbackMessage;
  }

  return message;
}
