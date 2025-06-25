import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-capsule-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './capsule-detail.component.html',
  styleUrl: './capsule-detail.component.css'
})
export class CapsuleDetailComponent {
capsule:any;
isUnlocked = false;
newMessage: string = '';

constructor(private route: ActivatedRoute, private http: HttpClient) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  this.http.get(`http://localhost:9090/api/capsules/${id}`).subscribe((data: any) => {
    this.capsule = data;
    this.isUnlocked = new Date () >= new Date(this.capsule.unlockDate);
    });
}

addMessageToCapsule(): void {
    if (!this.newMessage.trim()) return;

const messagePayload = {
    text: this.newMessage,
    timestamp: new Date().toISOString()
  };

    this.http.patch(`http://localhost:9090/api/capsules/${this.capsule.id}/messages`, this.newMessage, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (updatedCapsule: any) => {
        this.capsule = updatedCapsule;
        this.newMessage = '';
      },
      error: (err) => console.error('Error adding message:', err)
    });
  }
}
