import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  registerUser() {
    console.log('Registering:', this.username);

    this.userService.register({ username: this.username, password: this.password }).subscribe({
      next: (response: any) => {
        console.log('Registration success:', response);
        this.successMessage = response.message || 'Registration successful!';
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration error:', err);
        if (err.status === 400 && err.error?.error === 'Username already taken') {
          this.errorMessage = 'Username already taken.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    });
  }
}
