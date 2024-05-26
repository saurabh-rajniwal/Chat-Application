import { Injectable, inject } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { UserService } from '../user/user.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private fireAuth = inject(Auth);
  private userService = inject(UserService);

  constructor() { }

  isUserLoggedIn() {
    return !!this.fireAuth.currentUser;
  }

  async signup(username: string, email: string, password: string) {
    const isUsernameExists = await this.userService.checkUsernameExists(username);

    if (isUsernameExists) {
      throw new Error('Username already exists');
    }


    const userCredential = await createUserWithEmailAndPassword(this.fireAuth, email, password);
    const user = userCredential.user;


    await this.userService.createUser(user.uid, { email: user.email, username });
    return userCredential;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.fireAuth, email, password);
  }

  logout() {
    return signOut(this.fireAuth);
  }

  getAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.fireAuth, callback);
  }
}
