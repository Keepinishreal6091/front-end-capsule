import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CapsuleService } from '../../services/capsule.service';
import { localDateTimeToUtc } from '../../utils/date-time';

@Component({
  selector: 'app-capsule-create',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './capsule-create.component.html',
  styleUrls: ['./capsule-create.component.css']
})
export class CapsuleCreateComponent {
  title = '';
  messageInput = '';
  unlockLocal = '';
  submitting = false;
  errorMessage = '';
  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private capsuleService: CapsuleService, private router: Router) {}

  saveCapsule(): void {
    if (this.submitting || !this.title.trim() || !this.messageInput.trim()) return;
    const unlockAt = localDateTimeToUtc(this.unlockLocal);
    if (!unlockAt || Date.parse(unlockAt) <= Date.now()) {
      this.errorMessage = 'Choose a valid future unlock time.';
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    this.capsuleService.createCapsule({
      title: this.title.trim(),
      messages: [{ text: this.messageInput.trim() }],
      unlockAt
    }).subscribe({
      next: () => this.router.navigate(['/my-capsules']),
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Capsule could not be created. Please try again.';
      }
    });
  }
}
