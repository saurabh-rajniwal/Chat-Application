import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, query, where, getDocs, addDoc, Timestamp, onSnapshot, updateDoc, Unsubscribe, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private fireStore = inject(Firestore);
  private unsubscribe: Unsubscribe | null = null;

  constructor() { }

  async getChatRoom(username1: string, username2: string) {
    const chatRoomId = this.getChatRoomId(username1, username2);
    const chatRoomDoc = doc(this.fireStore, 'chatRooms', chatRoomId);
    const chatRoomSnapshot = await getDoc(chatRoomDoc);

    if (!chatRoomSnapshot.exists()) {
      await this.createChatRoom(chatRoomId, username1, username2);
    }

    return chatRoomId;
  }

  async createChatRoom(chatRoomId: string, username1: string, username2: string) {
    const chatRoomDoc = doc(this.fireStore, 'chatRooms', chatRoomId);
    return setDoc(chatRoomDoc, {
      participants: [username1, username2],
      createdAt: Timestamp.now(),
      lastMessage: null,
    });
  }

  getChatRoomId(username1: string, username2: string): string {
    return [username1, username2].sort().join('_');
  }

  async getMessages(chatRoomId: string) {
    const messagesCollection = collection(this.fireStore, 'chatRooms', chatRoomId, 'messages');
    const messagesQuery = query(messagesCollection, where('deleted', '==', false), orderBy('timestamp', 'asc'));
    const messageSnapshots = await getDocs(messagesQuery);
    return messageSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async sendMessage(chatRoomId: string, senderUsername: string, content: string) {
    // console.log(chatRoomId, senderUsername, content);

    const messagesCollection = collection(this.fireStore, 'chatRooms', chatRoomId, 'messages');
    return addDoc(messagesCollection, {
      senderUsername,
      content,
      timestamp: Timestamp.now(),
      deleted: false,
      reactions: {}
    });
  }

  listenForNewMessages(chatRoomId: string, callback: (message: any) => void) {
    const messagesCollection = collection(this.fireStore, 'chatRooms', chatRoomId, 'messages');
    const messagesQuery = query(messagesCollection, where('deleted', '==', false), orderBy('timestamp', 'asc'));

    this.unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        callback({ id: change.doc.id, ...change.doc.data(), type: change.type });
      });
    });
  }

  stopListeningForNewMessages() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async deleteMessage(chatRoomId: string, messageId: string) {
    const messageDoc = doc(this.fireStore, 'chatRooms', chatRoomId, 'messages', messageId);
    return updateDoc(messageDoc, { deleted: true });
  }

  async editMessage(chatRoomId: string, messageId: string, content: string) {
    const messageDoc = doc(this.fireStore, 'chatRooms', chatRoomId, 'messages', messageId);
    return updateDoc(messageDoc, { content });
  }

  async reactionMessage(chatRoomId: string, messageId: string, reactions: any) {
    const messageDoc = doc(this.fireStore, 'chatRooms', chatRoomId, 'messages', messageId);
    return updateDoc(messageDoc, { reactions });
  }
}
