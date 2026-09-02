import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionResponse } from './auth.service';
import { CsrfService } from './csrf.service';

export interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient, private csrf: CsrfService) {}

  login(user: User): Observable<SessionResponse> {
    return this.csrf.ensureToken().pipe(
      switchMap(() => this.http.post<SessionResponse>(`${this.apiUrl}/login`, user))
    );
  }

  register(user: User): Observable<SessionResponse> {
    return this.csrf.ensureToken().pipe(
      switchMap(() => this.http.post<SessionResponse>(`${this.apiUrl}/register`, user))
    );
  }
}
