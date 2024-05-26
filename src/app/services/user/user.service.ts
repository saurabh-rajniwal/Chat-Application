import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private fireStore = inject(Firestore);
  private fireAuth = inject(Auth);

  async getCurrentUser() {
    return this.fireAuth.currentUser;
  }

  async getAllUsers() {
    const usersCollection = collection(this.fireStore, 'users');
    const userSnapshots = await getDocs(usersCollection);
    return userSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getUserDetails(userId: string) {
    const userDoc = doc(this.fireStore, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    return userSnapshot.exists() ? userSnapshot.data() : null;
  }

  async checkUsernameExists(username: string) {
    const usersCollection = collection(this.fireStore, 'users');
    const usernameQuery = query(usersCollection, where('username', '==', username));
    const usernameSnapshots = await getDocs(usernameQuery);
    return !usernameSnapshots.empty;
  }


  async createUser(userId: string, user: any) {
    const userDoc = doc(this.fireStore, 'users', userId);

    return setDoc(userDoc, {
      ...user,
      createdAt: new Date(),
      lastActive: new Date(),
    });
  }
}
