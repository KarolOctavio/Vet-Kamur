import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
@Component({
  selector: 'app-payment-transfer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-transfer.html',
})
export class PaymentTransfer {
  account = '0123 4567 8901 2345';
  copied = false;
  fileName = '';
  private cart = inject(CartService);
  private sales = inject(SalesService);
  private router = inject(Router);
  async copy() {
    try {
      await navigator.clipboard.writeText(this.account);
      this.copied = true;
    } catch {
      this.copied = false;
    }
  }
  file(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    this.fileName = f?.name || '';
  }
  finish() {
    if (!this.fileName) return;
    this.sales.record(this.cart.items(), 'Transferencia');
    this.cart.clear();
    this.router.navigateByUrl('/inicio');
  }
}
