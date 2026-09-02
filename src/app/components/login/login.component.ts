import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
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

  loginUser() {
    if (this.submitting || !this.username.trim() || !this.password) return;
    this.submitting = true;
    this.errorMessage = '';
    this.userService.login({ username: this.username, password: this.password }).subscribe({
      next: response => {
        this.authService.acceptSession(response);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password.';
        this.submitting = false;
      }
    });

  }
}
