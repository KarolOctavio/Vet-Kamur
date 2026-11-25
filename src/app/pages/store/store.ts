import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CatalogService, Product } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './store.html',
})
export class Store implements OnInit {
  catalog = inject(CatalogService);
  cart = inject(CartService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  q = '';
  category = 'Todos';
  get categories() { return ['Todos', ...new Set(this.catalog.products.map(p => p.category))]; }

  ngOnInit() {
    this.q = this.route.snapshot.queryParamMap.get('q') || '';
  }

  get products() {
    return this.catalog.products.filter(
      (p) =>
        (this.category === 'Todos' || p.category === this.category) &&
        p.name.toLowerCase().includes(this.q.toLowerCase()),
    );
  }

  add(p: Product) {
    if (!this.auth.loggedIn() || p.stock <= 0) return;
    this.cart.add(p);
  }
}
