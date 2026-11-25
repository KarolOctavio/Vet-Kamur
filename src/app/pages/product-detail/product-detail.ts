import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  catalog = inject(CatalogService);
  cart = inject(CartService);
  auth = inject(AuthService);
  get product() { return this.catalog.getById(Number(this.route.snapshot.paramMap.get('id'))); }
  quantity = 1;

  dec() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  inc() {
    if (!this.product) return;
    this.quantity = Math.min(this.product.stock, this.quantity + 1);
  }

  add() {
    if (!this.auth.loggedIn() || !this.product || this.product.stock <= 0) return;
    this.cart.add(this.product, Math.min(this.quantity, this.product.stock));
  }
}
