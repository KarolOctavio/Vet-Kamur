import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './payment-card.html',
})
export class PaymentCard {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cart = inject(CartService);
  private sales = inject(SalesService);
  paid = false;
  form = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    holder: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  });
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sales.record(this.cart.items(), 'Tarjeta');
    this.paid = true;
    this.cart.clear();
  }
  done() {
    this.router.navigateByUrl('/inicio');
  }
}
