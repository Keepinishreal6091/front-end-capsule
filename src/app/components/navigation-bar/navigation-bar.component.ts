import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent {
  logoutError = '';
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.logoutError = '';
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.logoutError = 'Logout failed. Please retry while connected.'
    });
  }

  get username(): string | null {
    return this.authService.getUsername();
  }
}
