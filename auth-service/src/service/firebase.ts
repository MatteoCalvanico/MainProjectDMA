import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  UserCredential,
  Auth,
} from "firebase/auth";

export class AuthService {
  private static instance: AuthService;
  private auth: Auth;

  private constructor() {
    // Firebase configuration
    const firebaseConfig = {
      apiKey:
        process.env.FIREBASE_API || "AIzaSyAnQtwTgkAHSDC4BFqfjVFyy__s_EOLDPU",
      authDomain: "dma-internship-project.firebaseapp.com",
      projectId: "dma-internship-project",
      storageBucket: "dma-internship-project.firebasestorage.app",
      messagingSenderId: "614168240125",
      appId: "1:614168240125:web:7227c957b1a0530b7b4394",
      measurementId: "G-L8XWSHSR41",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  /**
   * Get the singleton instance of FirebaseAuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password
   */
  public async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Login using access token (custom) indefinitely
   */
  public async loginWithAccessToken(accessToken: string): Promise<UserCredential> {
    return signInWithCustomToken(this.auth, accessToken);
  }

  /**
   * Register with email and password
   */
  public async registerWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Log out the current user
   */
  public async logoutUser(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Get the auth instance
   */
  public getAuth(): Auth {
    return this.auth;
  }
}
