import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CapsuleMessage {
  text: string;
  timestamp: string;
}

export interface Capsule {
  id: number;
  title: string;
  messages: CapsuleMessage[];
  unlockDate: string;
  createdAt: string;
}

export interface NewCapsule {
  title: string;
  messages: CapsuleMessage[];
  unlockDate: string;
}


@Injectable({
  providedIn: 'root'
})
export class CapsuleService {
  private apiUrl = 'http://localhost:9090/api/capsules';

  constructor(private http: HttpClient) {}

  getAllCapsules(): Observable<Capsule[]> {
    return this.http.get<Capsule[]>(this.apiUrl);
  }

  createCapsule(capsule: NewCapsule): Observable<Capsule> {
    return this.http.post<Capsule>(this.apiUrl, capsule);
  }

  deleteCapsule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
getCapsuleById(id: number): Observable<Capsule> {
  return this.http.get<Capsule>(`${this.apiUrl}/${id}`);
}

addMessage(id: number, message: string): Observable<Capsule> {
  return this.http.patch<Capsule>(`${this.apiUrl}/${id}/messages`, message, {
    headers: { 'Content-Type': 'application/json' }
  });
}

}

