import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../../shared/models/product';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private productService = inject(ProductService);
  private readonly STORAGE_KEY = 'favorite-products';

  private favoriteIdsSubject = new BehaviorSubject<string[]>(this.loadFavorites());
  favoriteIds$ = this.favoriteIdsSubject.asObservable();

  favorites$: Observable<Product[]> = this.productService.products$.pipe(
    map((products) => products.filter((p) => this.favoriteIdsSubject.value.includes(p.id)))
  );

  private loadFavorites(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavorites(ids: string[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  }

  getFavoriteIds(): string[] {
    return this.favoriteIdsSubject.value;
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIdsSubject.value.includes(productId);
  }

  addFavorite(productId: string): void {
    const currentIds = this.favoriteIdsSubject.value;
    if (!currentIds.includes(productId)) {
      const updatedIds = [...currentIds, productId];
      this.favoriteIdsSubject.next(updatedIds);
      this.saveFavorites(updatedIds);
    }
  }

  removeFavorite(productId: string): void {
    const currentIds = this.favoriteIdsSubject.value;
    const updatedIds = currentIds.filter((id) => id !== productId);
    this.favoriteIdsSubject.next(updatedIds);
    this.saveFavorites(updatedIds);
  }

  toggleFavorite(productId: string): boolean {
    if (this.isFavorite(productId)) {
      this.removeFavorite(productId);
      return false;
    } else {
      this.addFavorite(productId);
      return true;
    }
  }

  getFavoriteCount(): number {
    return this.favoriteIdsSubject.value.length;
  }
}
