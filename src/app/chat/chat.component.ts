import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatBoxComponent } from "../chat-box/chat-box.component";


@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  imports: [SidebarComponent, ChatBoxComponent]
})
export class ChatComponent {

}
