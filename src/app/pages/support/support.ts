import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './support.html',
})
export class Support {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private support = inject(SupportService);
  readonly supportEmail = 'soporte@vetkamur.mx';
  readonly supportPhoneDisplay = '271 123 4567';
  readonly supportPhoneLink = '+522711234567';
  message = '';

  form = this.fb.nonNullable.group({
    name: [this.currentName(), [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: [this.auth.currentUser()?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(120)]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  sendEmail() {
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.support.add({ ...value, phone: this.auth.currentUser()?.phone ?? '' });
    const subject = encodeURIComponent(`[Soporte Vet-Kamur] ${value.subject}`);
    const body = encodeURIComponent(
      `Nombre: ${value.name}\nCorreo: ${value.email}\n\nMensaje:\n${value.details}`,
    );
    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
    this.message = 'Tu solicitud fue registrada y se abrió tu aplicación de correo con el mensaje preparado.';
  }

  private currentName() {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  }
}
