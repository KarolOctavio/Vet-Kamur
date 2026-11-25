
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

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly http = inject(HttpClient);

  private readonly key = 'vetkamur_fakestore_catalog';

  // Guarda los identificadores de productos eliminados
  private readonly deletedKey = 'vetkamur_productos_eliminados';

  private readonly productState = signal<Product[]>([]);

  private readonly deletedIds = new Set<number>(
    this.readDeletedIds()
  );

  constructor() {

    // Recuperar productos guardados anteriormente
    const saved = this.read() ?? [];

    this.productState.set(
      saved.filter(product => !this.deletedIds.has(product.id))
    );

    // Consultar los productos de FakeStore API
    this.http.get<FakeStoreProduct[]>(
      'https://fakestoreapi.com/products'
    ).subscribe({

      next: (data) => {

        const localProducts = this.read() ?? [];

        const localById = new Map(
          localProducts.map(product => [product.id, product])
        );

        // No cargar productos eliminados
        const apiProducts: Product[] = data
          .filter(product => !this.deletedIds.has(product.id))
          .map(product => {

            const local = localById.get(product.id);

            return {
              id: product.id,
              name: local?.name ?? product.title,
              category: local?.category ?? product.category,
              price: local?.price ?? product.price,
              stock: local?.stock ?? 20,
              image: local?.image ?? product.image,
              description: local?.description ?? product.description,
              badge: local?.badge,
              fallback: local?.fallback ??
                'imagenes/producto-alimento.svg'
            };

          });

        // Conservar productos creados desde Panel Admin
        const apiIds = new Set(
          data.map(product => product.id)
        );

        const customProducts = localProducts.filter(
          product =>
            !apiIds.has(product.id) &&
            !this.deletedIds.has(product.id)
        );

        this.save([
          ...apiProducts,
          ...customProducts
        ]);

      },

      error: (error) => {
        console.error(
          'No se pudieron cargar los productos de FakeStore API',
          error
        );
      }

    });

  }

  // OBTENER TODOS LOS PRODUCTOS

  get products(): Product[] {
    return this.productState();
  }

  // BUSCAR PRODUCTO POR ID

  getById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  // AGREGAR PRODUCTO

  add(product: ProductInput): Product {

    const created: Product = {
      ...product,
      id: Date.now()
    };

    this.save([
      ...this.products,
      created
    ]);

    return created;
  }

  // ACTUALIZAR PRODUCTO

  update(
    id: number,
    changes: Partial<Omit<Product, 'id'>>
  ): Product | null {

    let updated: Product | null = null;

    const products = this.products.map(product => {

      if (product.id !== id) {
        return product;
      }

      updated = {
        ...product,
        ...changes,
        price: changes.price !== undefined
          ? Math.max(0, Number(changes.price))
          : product.price,
        stock: changes.stock !== undefined
          ? Math.max(0, Math.floor(Number(changes.stock)))
          : product.stock
      };

      return updated;
    });

    if (updated !== null) {
      this.save(products);
    }

    return updated;
  }

  // ELIMINAR PRODUCTO

  remove(id: number): boolean {

    const exists = this.products.some(
      product => product.id === id
    );

    if (!exists) {
      return false;
    }

    // Recordar el producto eliminado
    this.deletedIds.add(id);

    localStorage.setItem(
      this.deletedKey,
      JSON.stringify([...this.deletedIds])
    );

    // Quitar el producto de la tienda
    const products = this.products.filter(
      product => product.id !== id
    );

    this.save(products);

    return true;
  }

  // REDUCIR EXISTENCIAS

  reduceStock(
    items: Array<{ id: number; quantity: number }>
  ): void {

    const quantityById = new Map(
      items.map(item => [item.id, item.quantity])
    );

    const products = this.products.map(product => {

      const quantity = quantityById.get(product.id) ?? 0;

      return quantity > 0
        ? {
            ...product,
            stock: Math.max(0, product.stock - quantity)
          }
        : product;

    });

    this.save(products);
  }

  // IMAGEN ALTERNATIVA

  imageFallback(event: Event, product: Product): void {

    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(product.fallback)) {
      return;
    }

    image.src = product.fallback;
  }

  // LEER PRODUCTOS GUARDADOS

  private read(): Product[] | null {

    try {

      const raw = localStorage.getItem(this.key);

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed : null;

    } catch {
      return null;
    }
  }

  // LEER IDENTIFICADORES DE PRODUCTOS ELIMINADOS

  private readDeletedIds(): number[] {

    try {

      const raw = localStorage.getItem(this.deletedKey);

      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (id): id is number =>
          typeof id === 'number' &&
          Number.isInteger(id) &&
          id > 0
      );

    } catch {
      return [];
    }
  }

  // GUARDAR CAMBIOS EN EL CATALOGO

  private save(products: Product[]): void {

    this.productState.set(products);

    localStorage.setItem(
      this.key,
      JSON.stringify(products)
    );
  }

}
