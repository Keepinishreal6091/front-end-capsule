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
  showList = true;

  constructor(private capsuleService: CapsuleService) {}

  ngOnInit() {
    this.loadCapsules();
  }

  loadCapsules() {
    this.capsuleService.getAllCapsules().subscribe(data => {
      this.capsules = data;
    });
  }

  toggleList() {
    this.showList = !this.showList;
  }

  deleteCapsule(id: number) {
    if (confirm('Are you sure you want to delete this capsule?')) {
      this.capsuleService.deleteCapsule(id).subscribe(() => {
        this.loadCapsules(); // Refresh list after deletion
      });
    }
  }
isUnlocked(unlockDate: string): boolean {
  return new Date() >= new Date(unlockDate);
}
}
