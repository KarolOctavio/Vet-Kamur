import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogService, Product } from './catalog.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly key = 'vetkamur_cart';
  private catalog = inject(CatalogService);

  items = signal<CartItem[]>(this.load());
  totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  add(product: Product, quantity = 1) {
    const current = this.catalog.getById(product.id) ?? product;
    if (current.stock <= 0) return;

    const items = [...this.items()];
    const found = items.find((i) => i.product.id === current.id);
    if (found) {
      found.product = current;
      found.quantity = Math.min(current.stock, found.quantity + quantity);
    } else {
      items.push({ product: current, quantity: Math.min(current.stock, Math.max(1, quantity)) });
    }
    this.set(items);
  }

  update(productId: number, change: number) {
    const current = this.catalog.getById(productId);
    const items = this.items().map((item) => {
      if (item.product.id !== productId) return item;
      const stock = current?.stock ?? item.product.stock;
      return {
        ...item,
        product: current ?? item.product,
        quantity: Math.min(Math.max(1, stock), Math.max(1, item.quantity + change)),
      };
    });
    this.set(items);
  }

  remove(productId: number) {
    this.set(this.items().filter((i) => i.product.id !== productId));
  }

  clear() {
    this.set([]);
  }

  private set(items: CartItem[]) {
    this.items.set(items);
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  }
}
