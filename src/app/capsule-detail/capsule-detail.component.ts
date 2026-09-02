import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Capsule, CapsuleService } from '../services/capsule.service';
import { localDateTimeToUtc, utcToLocalDateTime } from '../utils/date-time';

@Component({
  selector: 'app-capsule-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './capsule-detail.component.html',
  styleUrl: './capsule-detail.component.css'
})
export class CapsuleDetailComponent implements OnInit {
  capsule?: Capsule;
  newMessage = '';
  editTitle = '';
  editUnlockLocal = '';
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private route: ActivatedRoute, private capsuleService: CapsuleService) {}
  ngOnInit(): void { this.loadCapsule(); }

  loadCapsule(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) { this.loading = false; this.errorMessage = 'Capsule not found.'; return; }
    this.loading = true;
    this.capsuleService.getCapsuleById(id).subscribe({
      next: capsule => { this.setCapsule(capsule); this.loading = false; },
      error: () => { this.loading = false; this.errorMessage = 'Capsule is unavailable or does not belong to you.'; }
    });
  }

  saveDetails(): void {
    if (!this.capsule || this.capsule.locked === false || this.saving || !this.editTitle.trim()) return;
    const unlockAt = this.editUnlockLocal === utcToLocalDateTime(this.capsule.unlockAt)
      ? this.capsule.unlockAt
      : localDateTimeToUtc(this.editUnlockLocal);
    if (!unlockAt || Date.parse(unlockAt) <= Date.now()) { this.errorMessage = 'Choose a valid future unlock time.'; return; }
    this.saving = true;
    this.errorMessage = '';
    this.capsuleService.updateCapsule(this.capsule.id, { title: this.editTitle.trim(), unlockAt }).subscribe({
      next: capsule => { this.setCapsule(capsule); this.saving = false; this.successMessage = 'Capsule details saved.'; },
      error: () => { this.saving = false; this.errorMessage = 'Details could not be saved. The capsule may have unlocked.'; }
    });
  }

  addMessageToCapsule(): void {
    if (!this.capsule || !this.capsule.locked || !this.newMessage.trim() || this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.capsuleService.addMessage(this.capsule.id, this.newMessage.trim()).subscribe({
      next: capsule => { this.setCapsule(capsule); this.newMessage = ''; this.saving = false; this.successMessage = 'Message added and sealed.'; },
      error: () => { this.saving = false; this.errorMessage = 'Message could not be added. The capsule may have unlocked.'; }
    });
  }

  private setCapsule(capsule: Capsule): void {
    this.capsule = capsule;
    this.editTitle = capsule.title;
    this.editUnlockLocal = utcToLocalDateTime(capsule.unlockAt);
  }
}
