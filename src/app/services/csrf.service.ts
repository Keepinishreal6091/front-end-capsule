import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface CsrfResponse {
  headerName: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly endpoint = `${environment.apiUrl}/api/auth/csrf`;
  private tokenValue: string | null = null;
  private request$: Observable<string> | null = null;

  constructor(private http: HttpClient) {}

  ensureToken(): Observable<string> {
    if (this.tokenValue) {
      return of(this.tokenValue);
    }
    if (!this.request$) {
      this.request$ = this.http.get<CsrfResponse>(this.endpoint).pipe(
        tap(response => this.tokenValue = response.token),
        map(response => response.token),
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => this.request$ = null)
      );
    }
    return this.request$;
  }

  get token(): string | null {
    return this.tokenValue;
  }

  clear(): void {
    this.tokenValue = null;
  }
}
