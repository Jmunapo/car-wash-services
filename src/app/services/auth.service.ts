import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from "../models/user";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public user: firebase.User;
  constructor(private afAuth: AngularFireAuth) {}

  createAccount(credentials: User) {
    const { email, password } = credentials;
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  updateDisplayName(name: string, photo: string = null) {
    return this.afAuth.auth.currentUser.updateProfile({
      displayName: name,
      photoURL: photo
    });
  }
  verifyEmail() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  addPhone() {
    // return this.afAuth.auth.signInWithPhoneNumber("+263775696233",)
  }

  signIn(credentials: User) {
    const { email, password } = credentials;
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  resetPass(credentials) {
    const { email } = credentials;
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  signOut() {
    return this.afAuth.auth.signOut();
  }

  getUser(): Promise<firebase.User> {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  reload() {
    return this.afAuth.auth.currentUser.reload();
  }

  setUser(user: firebase.User) {
    this.user = user;
  }
}
