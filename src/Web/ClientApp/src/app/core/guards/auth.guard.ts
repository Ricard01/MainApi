// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { map, take, combineLatest } from 'rxjs';
// import * as AuthSelectors from 'src/app/features/auth/data-access/state/auth.selectors';
// import { AuthFacade } from 'src/app/features/auth/data-access/state/auth.facade';
//
// export const authGuard: CanActivateFn = (route, state) => {
//   const store = inject(Store);
//   const router = inject(Router);
//   const facade = inject(AuthFacade);
//
//   // PASO 1: "EL DESPERTADOR"
//   // Aquí le avisamos al sistema: "Oye, alguien quiere entrar, asegúrate de
//   // cargar los datos del usuario desde donde estén guardados (localstorage/cookies)".
//   // Esto dispara un proceso en segundo plano.
//
//   facade.checkSession();
//
//   // PASO 2: "LAS ALERTAS"
//   // Estos son como sensores que se quedan mirando el "cerebro" (Store) de la App.
//
//   // sessionReady$: Avisará "TRUE" cuando el sistema termine de buscar la sesión.
//   // (No importa si encontró una sesión o no, solo avisa que YA TERMINÓ de buscar).
//   const sessionReady$ = store.select(AuthSelectors.selectSessionReady);
//   const isAuth$ = store.select(AuthSelectors.selectIsAuthenticated);
//
//   // PASO 3: "LA DECISIÓN"
//   // combineLatest espera a que los dos sensores de arriba tengan información
//   return combineLatest([sessionReady$, isAuth$]).pipe(
//     // take(1): Una vez que recibimos la primera respuesta de los sensores,
//     // cerramos la conexión (no queremos seguir vigilando después de decidir).
//     take(1),
//     map(([ready, isAuth]) => {
//       // ¿El sistema todavía está buscando la sesión?
//       if (!ready) {
//         // Si no está listo, le decimos al navegador: "Espera, todavía no entres".
//         // Devolvemos false para que la pantalla no parpadee mostrando algo que no debe.
//
//         return false;
//       }
//       if (isAuth) return true;
//
//       // No autenticado: ir a login con returnUrl
//       const returnUrl = state.url || '/';
//       return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
//     })
//   );
// };
//
// // Resumen de Responsabilidades
// // Guard: El portero que pregunta "¿Puedo dejarlo pasar?".
//
// // Facade: El intercomunicador que manda el mensaje a la oficina.
//
// // Action: El sobre con el mensaje escrito.
//
// // Effect: El empleado que va a buscar el expediente al archivo (localStorage).
//
// // Reducer: El secretario que actualiza la pizarra de estado (Store).
//
// // Selector: El ojo que el Guard tiene puesto en la pizarra para ver cuándo cambia a ready
