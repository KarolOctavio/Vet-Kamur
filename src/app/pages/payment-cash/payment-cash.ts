import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SalesService } from '../../services/sales.service';
@Component({
  selector: 'app-payment-cash',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payment-cash.html',
})
export class PaymentCash {
  private cart = inject(CartService);
  private sales = inject(SalesService);
  private router = inject(Router);
  save() {
    const a = document.createElement('a');
    a.href = 'imagenes/qr-pago.png';
    a.download = 'vet-kamur-pago-efectivo.png';
    a.click();
  }
  finish() {
    this.sales.record(this.cart.items(), 'Efectivo');
    this.cart.clear();
    this.router.navigateByUrl('/inicio');
  }
}
