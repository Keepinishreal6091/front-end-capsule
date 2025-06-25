import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:9090/api/users';

  constructor(private http: HttpClient) {}

login(user: { username: string; password: string }) {
  console.log('Sending login request with:', user);
  return this.http.post('http://localhost:9090/api/users/login', user, {
    responseType: 'text'
  });
}

  register(user: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }
}
