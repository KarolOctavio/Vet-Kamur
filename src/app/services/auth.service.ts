import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, timeout, throwError } from 'rxjs';

export interface VetUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: {
    postalCode: string;
    city: string;
    neighborhood: string;
    street: string;
    exterior: string;
    interior?: string;
  };
}

export interface ApiUserProfile {
  id: number;
  username: string;
  email: string;
  name: { firstname: string; lastname: string };
  phone: string;
  address: { city: string; street: string; number: number; zipcode: string };
}

export type SessionRole = 'user' | 'admin' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionKey = 'vetkamur_session';
  private readonly usersKey = 'vetkamur_users';
  private readonly draftKey = 'vetkamur_registration_draft';
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://fakestoreapi.com/auth/login';
  private readonly tokenKey = 'fakestore_token';
  private readonly adminUsername = 'johnd';

  private readonly sessionRole = signal<SessionRole>(null);

  constructor() {

  const usuario = this.currentUsername().toLowerCase();
  const token = localStorage.getItem(this.tokenKey);

  if (token && usuario === 'johnd') {
    this.sessionRole.set('admin');
  }
  else if (token && usuario === 'kevinryan') {
    this.sessionRole.set('user');
  }
  else {
    this.logout();
  }

}
  loggedIn = computed(() => this.sessionRole() !== null);
  isAdmin = computed(() => this.sessionRole() === 'admin');
  isUser = computed(() => this.sessionRole() === 'user');

 
login(username: string, password: string) {

  const usuario = username.trim().toLowerCase();

  // Solo se permiten estas dos cuentas
  if (usuario !== 'johnd' && usuario !== 'kevinryan') {

    return throwError(() => new HttpErrorResponse({
      status: 403,
      statusText: 'Usuario no autorizado'
    }));

  }

  // Validar contraseña mediante Fake Store API
  return this.http.post<{ token: string }>(
    this.apiUrl,
    {
      username: usuario,
      password: password
    }
  ).pipe(

    timeout(12000),

    tap((response) => {

      localStorage.setItem(this.tokenKey, response.token);

      if (usuario === 'johnd') {
        this.setSession('admin', usuario);
      } else {
        this.setSession('user', usuario);
      }

    })

  );
}


  currentUsername(): string {
    return localStorage.getItem('vetkamur_current_email') || '';
  }

  getApiProfile() {
    return this.http.get<ApiUserProfile[]>('https://fakestoreapi.com/users').pipe(timeout(12000));
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('vetkamur_current_email');
    this.sessionRole.set(null);
  }

  saveDraft(user: VetUser) {
    localStorage.setItem(this.draftKey, JSON.stringify(user));
  }

  getDraft(): VetUser | null {
    const raw = localStorage.getItem(this.draftKey);
    return raw ? JSON.parse(raw) : null;
  }

  hasRegistrationDraft(): boolean {
    return this.getDraft() !== null;
  }

  finishRegistration(address: NonNullable<VetUser['address']>): boolean {
    const draft = this.getDraft();
    if (!draft) return false;

    const users = this.users().filter((u) => u.email.toLowerCase() !== draft.email.toLowerCase());
    const complete = { ...draft, address };
    users.push(complete);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    localStorage.removeItem(this.draftKey);
    // El registro local no crea credenciales en FakeStore API.
    return true;
  }

  registeredUsers(): VetUser[] {
    return this.users();
  }

  currentUser(): VetUser | null {
    const email = localStorage.getItem('vetkamur_current_email');
    if (!email || this.isAdmin()) return null;


    return this.users().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
  currentName(): string {
  if (this.isAdmin()) {
    return 'Administrador';
  }

  const user = this.currentUser();

  if (user) {
    return `${user.firstName} ${user.lastName}`;
  }

  return localStorage.getItem('vetkamur_current_email') || 'Cliente';
}

  private setSession(role: Exclude<SessionRole, null>, email: string) {
    localStorage.setItem(this.sessionKey, role);
    localStorage.setItem('vetkamur_current_email', email);
    this.sessionRole.set(role);
  }

  private readStoredRole(): SessionRole {
    const value = localStorage.getItem(this.sessionKey);
    // Compatibilidad con la versión anterior, que guardaba "1" para una sesión de usuario.
    if (value === '1') return 'user';
    if (value === 'user' || value === 'admin') return value;
    return null;
  }

  private users(): VetUser[] {
    try {
      return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    } catch {
      return [];
    }
  }
}
