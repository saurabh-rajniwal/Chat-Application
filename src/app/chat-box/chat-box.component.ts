import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat/chat.service';
import { UserService } from '../services/user/user.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [
    MatInputModule,
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  chatRoomId: string | null = null;
  selectedUsername: string | null = null;
  noUsernameProvided: boolean = false;
  newMessage: string = '';
  messages: any[] = [];
  currentUserId: string | null = null;
  currentUsername: string | null = null;
  isEditing: boolean = false;
  editMessageId: string | null = null;

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.selectedUsername = params.get('username');

      if (!this.selectedUsername) {
        this.noUsernameProvided = true;
        return;
      }

      const isUsernameExists = await this.userService.checkUsernameExists(
        this.selectedUsername,
      );
      const currentUser = await this.userService.getCurrentUser();

      if (!isUsernameExists || !currentUser) {
        console.error('Username does not exist or user is not authenticated');
        return;
      }

      this.currentUserId = currentUser.uid;
      this.currentUsername = (
        await this.userService.getUserDetails(this.currentUserId)
      )?.['username'];

      if (!this.currentUsername) {
        console.error('Username does not exist or user is not authenticated');
        return;
      }

      this.cleanupPreviousChat();

      this.chatRoomId = await this.chatService.getChatRoom(
        this.currentUsername,
        this.selectedUsername,
      );
      this.noUsernameProvided = false;

      this.loadMessages();
    });
  }

  async ngOnDestroy() {
    this.cleanupPreviousChat();
  }

  async loadMessages() {
    if (this.chatRoomId) {
      this.chatService.listenForNewMessages(this.chatRoomId, (message) => {
        if (message.type === 'added') {
          this.messages.push(message);
          this.messages.sort((a, b) => a.timestamp - b.timestamp);
        } else if (message.type === 'removed') {
          this.messages = this.messages.filter((msg) => msg.id !== message.id);
        } else if (message.type === 'modified') {
          const index = this.messages.findIndex((msg) => msg.id === message.id);
          if (index !== -1) {
            this.messages[index] = message;
          }
        }
      });
    }
  }

  async sendMessage() {
    // console.log(this.chatRoomId, this.currentUsername, this.newMessage.trim());
    if (this.newMessage.trim() && this.chatRoomId && this.currentUsername) {
      if (this.editMessageId) {
        await this.chatService.editMessage(
          this.chatRoomId,
          this.editMessageId,
          this.newMessage.trim(),
        );
        this.editMessageId = null;
        this.isEditing = false;
        this.newMessage = '';
      } else {
        await this.chatService.sendMessage(
          this.chatRoomId,
          this.currentUsername,
          this.newMessage.trim(),
        );
        this.newMessage = '';
      }
    }
  }

  async deleteMessage(messageId: string) {
    if (this.chatRoomId) {
      await this.chatService.deleteMessage(this.chatRoomId, messageId);
      this.messages = this.messages.filter(
        (message) => message.id !== messageId,
      );
    }
  }

  editMessageInit(message: any) {
    this.isEditing = true;
    this.editMessageId = message.id;
    this.newMessage = message.content;
  }

  async reactionMessage(message: any) {
    if (this.chatRoomId) {
      await this.chatService.reactionMessage(
        this.chatRoomId,
        message.id,
        message.reactions,
      );
    }
  }

  cleanupPreviousChat() {
    this.messages = [];
    this.newMessage = '';
    this.chatService.stopListeningForNewMessages();
  }
}
