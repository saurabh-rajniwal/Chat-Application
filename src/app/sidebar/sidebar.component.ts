import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { MatRippleModule } from '@angular/material/core'
import { MatListModule } from '@angular/material/list';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatRippleModule, MatListModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  users: any[] = [];
  currentUser: any;
  chatOpenWith: any;

  async ngOnInit() {
    this.users = await this.userService.getAllUsers();
    // console.log(this.users, 'all users');

    this.currentUser = await this.userService.getCurrentUser();
    this.currentUser = this.users.filter(user => user.id === this.currentUser.uid)[0];

    this.route.paramMap.subscribe(async params => {
      const username = params.get('username');
      if (!username) {
        return;
      }
      this.chatOpenWith = username;
    });


  }

  selectUser(username: string) {
    this.router.navigate(['/chats', username]);
  }
}
