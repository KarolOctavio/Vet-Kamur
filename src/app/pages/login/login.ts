import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = '';
  info = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit() {
    this.error = '';
    this.info = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => {
        if (this.auth.isAdmin()) this.router.navigateByUrl('/admin');
        else this.router.navigateByUrl('/inicio');
      },
      error: (err: HttpErrorResponse) => {
        if (err instanceof TimeoutError) this.error = 'La API tardó demasiado en responder. Inténtalo de nuevo.';
        else if (err.status === 403) {
          this.error = 'Solo johnd y kevinryan pueden iniciar sesión.';
        }
        else if (err.status === 401 || err.status === 400) {
          this.error = 'Usuario o contraseña incorrectos.';
        }
        else if (err.status === 0) this.error = 'Error de conexión con la API.';
        else this.error = 'Error del servidor: ' + err.status;
      }
    });
  }

  forgot() {
    this.info =
      'Para recuperar el acceso, comunícate con Vet-Kamur en soporte@vetkamur.mx o al 271 123 4567.';
  }

  social(provider: string) {
    this.info = `El acceso con ${provider} no está disponible mediante FakeStore API.`;
  }
}
