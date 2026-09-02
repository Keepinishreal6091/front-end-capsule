import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService, SessionResponse } from './auth.service';
import { CsrfService } from './csrf.service';

let refreshRequest$: Observable<SessionResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const csrf = inject(CsrfService);
  const isApiRequest = environment.apiUrl
    ? request.url.startsWith(`${environment.apiUrl}/api/`)
    : request.url.startsWith('/api/');

  if (!isApiRequest) {
    return next(request);
  }

  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const authenticatedRequest = request.clone({
    withCredentials: true,
    setHeaders: isMutation && csrf.token ? { 'X-XSRF-TOKEN': csrf.token } : {}
  });
  const isAuthRequest = request.url.startsWith(`${environment.apiUrl}/api/auth/`);

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = auth.refreshSession().pipe(
          shareReplay({ bufferSize: 1, refCount: false }),
          finalize(() => refreshRequest$ = null)
        );
      }

      return refreshRequest$.pipe(
        switchMap(() => next(authenticatedRequest))
      );
    })
  );
};
