import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Capsule, CapsuleService } from '../../services/capsule.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-capsule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './capsule-list.component.html',
  styleUrls: ['./capsule-list.component.css']
})
export class CapsuleListComponent implements OnInit {
  capsules: Capsule[] = [];
  loading = true;
  errorMessage = '';
  deletingId: number | null = null;

  constructor(private capsuleService: CapsuleService) {}
  ngOnInit(): void { this.loadCapsules(); }

  loadCapsules(): void {
    this.loading = true;
    this.errorMessage = '';
    this.capsuleService.getAllCapsules().subscribe({
      next: data => { this.capsules = data; this.loading = false; },
      error: () => { this.loading = false; this.errorMessage = 'Capsules could not be loaded. Please retry.'; }
    });
  }

  deleteCapsule(id: number): void {
    if (this.deletingId !== null || !confirm('Permanently delete this capsule?')) return;
    this.deletingId = id;
    this.capsuleService.deleteCapsule(id).subscribe({
      next: () => { this.capsules = this.capsules.filter(capsule => capsule.id !== id); this.deletingId = null; },
      error: () => { this.deletingId = null; this.errorMessage = 'Capsule could not be deleted. Please retry.'; }
    });
  }
}
