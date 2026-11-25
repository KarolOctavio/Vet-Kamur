import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './address.html',
})
export class Address {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  form = this.fb.nonNullable.group({
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    neighborhood: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    street: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    exterior: ['', [Validators.required, Validators.maxLength(20)]],
    interior: ['', Validators.maxLength(20)],
  });
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.auth.finishRegistration(this.form.getRawValue())) this.router.navigateByUrl('/login');
    else this.router.navigateByUrl('/registro');
  }
}
