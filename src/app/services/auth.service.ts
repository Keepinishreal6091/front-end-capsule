import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CsrfService } from './csrf.service';

export interface SessionResponse {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly currentUsername = signal<string | null>(null);

  readonly username = this.currentUsername.asReadonly();

  constructor(private http: HttpClient, private csrf: CsrfService) {}

  initialize(): Observable<void> {
    // Upgrade cleanup only: never read or persist an authentication credential in Web Storage.
    try {
      localStorage.removeItem('capsule_access_token');
      localStorage.removeItem('username');
    } catch {
      // Cookie sessions still work when browser storage is unavailable.
    }
    return this.csrf.ensureToken().pipe(
      switchMap(() => this.http.get<SessionResponse>(`${this.apiUrl}/session`)),
      catchError((error: HttpErrorResponse) =>
        error.status === 401 ? this.refreshSession() : of(null)
      ),
      catchError(() => of(null)),
      tap(session => this.currentUsername.set(session?.username ?? null)),
      map(() => undefined)
    );
  }

  acceptSession(session: SessionResponse): void {
    this.currentUsername.set(session.username);
  }

  refreshSession(): Observable<SessionResponse> {
    return this.csrf.ensureToken().pipe(
      switchMap(() => this.http.post<SessionResponse>(`${this.apiUrl}/refresh`, {})),
      tap(session => this.acceptSession(session)),
      catchError(error => {
        this.currentUsername.set(null);
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    return this.csrf.ensureToken().pipe(
      switchMap(() => this.http.post<void>(`${this.apiUrl}/logout`, {})),
      tap(() => this.currentUsername.set(null))
    );
  }

  getUsername(): string | null {
    return this.currentUsername();
  }

  isLoggedIn(): boolean {
    return this.currentUsername() !== null;
  }
}
