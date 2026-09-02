import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CapsuleMessage {
  text: string;
  timestamp: string;
}

export interface Capsule {
  id: number;
  title: string;
  messages: CapsuleMessage[];
  unlockAt: string;
  createdAt: string;
  locked: boolean;
}

export interface NewCapsule {
  title: string;
  messages: Array<{ text: string }>;
  unlockAt: string;
}

@Injectable({ providedIn: 'root' })
export class CapsuleService {
  private readonly apiUrl = `${environment.apiUrl}/api/capsules`;

  constructor(private http: HttpClient) {}

  getAllCapsules(): Observable<Capsule[]> {
    return this.http.get<Capsule[]>(this.apiUrl);
  }

  getCapsuleById(id: number): Observable<Capsule> {
    return this.http.get<Capsule>(`${this.apiUrl}/${id}`);
  }

  createCapsule(capsule: NewCapsule): Observable<Capsule> {
    return this.http.post<Capsule>(this.apiUrl, capsule);
  }

  updateCapsule(id: number, capsule: Pick<NewCapsule, 'title' | 'unlockAt'>): Observable<Capsule> {
    return this.http.put<Capsule>(`${this.apiUrl}/${id}`, capsule);
  }

  addMessage(id: number, message: string): Observable<Capsule> {
    return this.http.patch<Capsule>(`${this.apiUrl}/${id}/messages`, { text: message });
  }

  deleteCapsule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
