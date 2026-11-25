import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ApiUserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  user: ApiUserProfile | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    this.auth.getApiProfile().subscribe({
      next: (users) => {
        const username = this.auth.currentUsername().toLowerCase();
        this.user = users.find((u) => u.username.toLowerCase() === username) || null;
        if (!this.user) this.error = 'No se encontraron los datos de esta cuenta en la API.';
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos de FakeStore API. Comprueba la conexión e inténtalo de nuevo.';
        this.loading = false;
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
