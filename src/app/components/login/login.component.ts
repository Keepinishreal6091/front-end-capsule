import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  loginUser() {
    this.userService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        localStorage.setItem('username', this.username);
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password.';
      }
    });

  }
}
