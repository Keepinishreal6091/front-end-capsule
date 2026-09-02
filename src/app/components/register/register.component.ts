import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  successMessage = '';
  errorMessage = '';
  submitting = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  registerUser() {
    if (this.submitting || !this.username.trim() || this.password.length < 8) return;
    this.submitting = true;
    this.errorMessage = '';
    this.userService.register({ username: this.username, password: this.password }).subscribe({
      next: response => {
        this.authService.acceptSession(response);
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMessage = 'Username already taken.';
        } else {
          this.errorMessage = 'Registration failed. Check the form and try again.';
        }
        this.submitting = false;
      }
    });
  }
}
