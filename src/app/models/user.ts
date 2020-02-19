export interface FireUser {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  fcmTokens?: { [token: string]: true };
}

export interface User {
  password: string;
  email: string;
}
