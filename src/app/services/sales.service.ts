import { Injectable, inject } from '@angular/core';
import { CartItem } from './cart.service';
import { CatalogService } from './catalog.service';

export type PaymentMethod = 'Tarjeta' | 'Transferencia' | 'Efectivo';

export interface SaleRecord {
  id: number;
  date: string;
  total: number;
  method: PaymentMethod;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly key = 'vetkamur_sales';
  private catalog = inject(CatalogService);

  list(): SaleRecord[] {
    const saved = this.read();
    if (saved.length) return saved;

    const seed: SaleRecord[] = [
      {
        id: 1001,
        date: '2026-09-04T11:20:00',
        total: 530,
        method: 'Tarjeta',
        items: [
          { id: 1, name: 'Alimento seco premium', quantity: 1, price: 350 },
          { id: 2, name: 'Shampoo dermatológico', quantity: 1, price: 180 },
        ],
      },
      {
        id: 1002,
        date: '2026-09-12T16:45:00',
        total: 320,
        method: 'Efectivo',
        items: [
          { id: 4, name: 'Pasta dental para mascotas (50 ml)', quantity: 1, price: 80 },
          { id: 5, name: 'Kit de paseo', quantity: 1, price: 240 },
        ],
      },
      {
        id: 1003,
        date: '2026-09-23T10:10:00',
        total: 390,
        method: 'Transferencia',
        items: [
          { id: 3, name: 'Desparasitante veterinario', quantity: 1, price: 270 },
          { id: 6, name: 'Premios de entrenamiento', quantity: 1, price: 120 },
        ],
      },
    ];
    this.save(seed);
    return seed;
  }

  record(items: CartItem[], method: PaymentMethod): SaleRecord | null {
    if (!items.length) return null;
    const sale: SaleRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      method,
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      items: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };
    const sales = this.list();
    sales.unshift(sale);
    this.save(sales);
    this.catalog.reduceStock(sale.items);
    return sale;
  }

  private read(): SaleRecord[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  }

  private save(items: SaleRecord[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
