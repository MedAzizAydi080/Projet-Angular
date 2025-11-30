import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import {
  User,
  SignInCredentials,
  SignUpData,
  AuthResponse,
} from '../../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';
  private readonly USERS_KEY = 'registered_users';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.currentUser$.pipe(map((user) => !!user));

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  signIn(credentials: SignInCredentials): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(this.performSignIn(credentials)).pipe(delay(800));
  }

  signUp(data: SignUpData): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(this.performSignUp(data)).pipe(delay(1000));
  }

  signOut(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private performSignIn(credentials: SignInCredentials): AuthResponse {
    const users = this.getRegisteredUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (user) {
      const authenticatedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.createdAt),
      };

      this.currentUserSubject.next(authenticatedUser);

      if (credentials.rememberMe) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authenticatedUser));
      }

      return {
        success: true,
        message: 'Successfully signed in!',
        user: authenticatedUser,
      };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please try again.',
    };
  }

  private performSignUp(data: SignUpData): AuthResponse {
    const users = this.getRegisteredUsers();

    // Check if email already exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists.',
      };
    }

    // Create new user
    const newUser = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      password: data.password, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    const authenticatedUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: new Date(newUser.createdAt),
    };

    this.currentUserSubject.next(authenticatedUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authenticatedUser));

    return {
      success: true,
      message: 'Account created successfully!',
      user: authenticatedUser,
    };
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
        };
      }
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return null;
  }

  private getRegisteredUsers(): Array<{
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: string;
  }> {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
