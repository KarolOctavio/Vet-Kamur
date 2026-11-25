import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './checkout.html',
})
export class Checkout {
  cart = inject(CartService);
  private router = inject(Router);
  method = '';
  error = '';
  pay() {
    this.error = '';
    if (!this.method) {
      this.error = 'Selecciona un método de pago.';
      return;
    }
    this.router.navigateByUrl(this.method);
  }
}
