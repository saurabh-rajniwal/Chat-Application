import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'real-time-chat';
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fireAuth = inject(Auth);



  isUserLoggedIn() {
    return this.authService.isUserLoggedIn();
  }

  logout() {
    this.authService.logout();
  }

}
