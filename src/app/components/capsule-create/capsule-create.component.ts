import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CapsuleService } from '../../services/capsule.service';
import { NewCapsule } from '../../services/capsule.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-capsule-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './capsule-create.component.html',
  styleUrls: ['./capsule-create.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapsuleCreateComponent {
  capsule: NewCapsule = {
    title: '',
    messages: [],
    unlockDate: ''
  };

messageInput = '';

  constructor(
    private capsuleService: CapsuleService,
    private router: Router
  ) {}

  saveCapsule() {
    const formattedCapsule: NewCapsule = {
      title: this.capsule.title,
      messages: [{
        text: this.messageInput,
        timestamp: new Date().toISOString()
      }],

      unlockDate: this.formattedDate(this.capsule.unlockDate)
    };

    console.log('Submitting Capsule: ', formattedCapsule);

    this.capsuleService.createCapsule(formattedCapsule).subscribe(() => {
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
      });
    });
  }

  private formattedDate(date: string): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
}

