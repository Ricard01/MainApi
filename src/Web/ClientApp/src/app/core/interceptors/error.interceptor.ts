import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {SnackbarService} from '../../shared/services/snackbar.service'; // Opcional

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>; // Diccionario de FluentValidation
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const snackBar = inject(SnackbarService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let errorMessages: string[] = [];
      const problem: ProblemDetails = err.error;

      switch (err.status) {

        case 0:
          // El servidor está apagado, no hay internet, o bloqueado por CORS
          errorMessages = ['No se pudo establecer conexión con el servidor. Verifica tu internet.'];
          snackBar.error(errorMessages[0]);
          break;

        case 400:
          // Bad Request: Validaciones de negocio (FluentValidation)
          if (problem?.errors) {
            errorMessages = Object.values(problem.errors).flat();
          } else if (problem?.detail) {
            errorMessages = [problem.detail];
          } else {
            errorMessages = ['Se enviaron datos inválidos al servidor.'];
          }
          break;

        case 401:
          // Unauthorized: Token faltante, expirado o inválido
          errorMessages = ['Tu sesión ha expirado o no estás autenticado.'];
          snackBar.error(errorMessages[0]);
          router.navigate(['/login']); // Redirección automática global
          break;

        case 403:
          // Forbidden: Tiene token, pero no tiene el Rol necesario
          errorMessages = ['No tienes los permisos necesarios para realizar esta acción.'];
          snackBar.error(errorMessages[0]);
          break;

        case 404:
          // Not Found: No se encontró el registro en la BD o la ruta del endpoint
          errorMessages = [problem?.detail || problem?.title || 'El recurso solicitado no fue encontrado.'];
          break;

        case 500:
        default:
          // Errores Internos Críticos (NullReferenceException, Base de datos caída, etc.)
          console.error('Error Crítico No Controlado:', err);
          errorMessages = ['Ocurrió un error inesperado en el servidor. Por favor, intenta más tarde.'];
          break;
      }

      // 4. Retornamos la lista de errores para que el componente la pinte si lo necesita (como el formulario)
      return throwError(() => errorMessages);
    })
  );
};
