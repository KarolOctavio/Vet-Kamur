import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  badge?: string;
  fallback: string;
}
export type ProductInput = Omit<Product, 'id'>;

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly key = 'vetkamur_fakestore_catalog';
  private readonly productState = signal<Product[]>([]);

  constructor() {
    // Se consulta la API en cada inicio; no se usan productos predefinidos.
    this.http.get<FakeStoreProduct[]>('https://fakestoreapi.com/products').subscribe({
      next: (data) => {
        const saved = this.read();
        const products = data.map((p): Product => {
          const local = saved?.find((item) => item.id === p.id);
          return {
            id: p.id,
            name: p.title,
            category: p.category,
            price: p.price,
            stock: local?.stock ?? 20,
            image: p.image,
            description: p.description,
            fallback: 'imagenes/producto-alimento.svg',
          };
        });
        this.productState.set(products);
      },
      error: (error) => console.error('No se pudieron cargar los productos de FakeStore API', error),
    });
  }

  get products(): Product[] {
    return this.productState();
  }

  getById(id: number) {
    return this.products.find((p) => p.id === id);
  }

  add(product: ProductInput): Product {
    const products = this.products;
    const created: Product = { ...product, id: Date.now() };
    products.push(created);
    this.save(products);
    return created;
  }

  update(id: number, changes: Partial<Omit<Product, 'id'>>): Product | null {
    let updated: Product | null = null;
    const products = this.products.map((product) => {
      if (product.id !== id) return product;
      updated = {
        ...product,
        ...changes,
        price: changes.price !== undefined ? Math.max(0, Number(changes.price)) : product.price,
        stock: changes.stock !== undefined ? Math.max(0, Math.floor(Number(changes.stock))) : product.stock,
      };
      return updated;
    });
    this.save(products);
    return updated;
  }

  remove(id: number): boolean {
    const products = this.products;
    const next = products.filter((product) => product.id !== id);
    if (next.length === products.length) return false;
    this.save(next);
    return true;
  }

  reduceStock(items: Array<{ id: number; quantity: number }>) {
    const quantityById = new Map(items.map((item) => [item.id, item.quantity]));
    const products = this.products.map((product) => {
      const quantity = quantityById.get(product.id) ?? 0;
      return quantity > 0 ? { ...product, stock: Math.max(0, product.stock - quantity) } : product;
    });
    this.save(products);
  }

  imageFallback(event: Event, product: Product) {
    const image = event.target as HTMLImageElement;
    if (image.src.endsWith(product.fallback)) return;
    image.src = product.fallback;
  }

  private read(): Product[] | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }

  private save(products: Product[]) {
    this.productState.set(products);
    localStorage.setItem(this.key, JSON.stringify(products));
  }
}
