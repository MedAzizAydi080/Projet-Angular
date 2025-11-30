import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../core/services/favorites.service';
import { ProductService } from '../core/services/product.service';
import { Product } from '../shared/models/product';
import { TndCurrencyPipe } from '../shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, TndCurrencyPipe],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private productService = inject(ProductService);

  favorites = signal<Product[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadFavorites();
    
    // Subscribe to changes in favorites
    this.favoritesService.favoriteIds$.subscribe(() => {
      this.loadFavorites();
    });
  }

  private loadFavorites() {
    this.productService.getAll().subscribe((products) => {
      const favoriteIds = this.favoritesService.getFavoriteIds();
      const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));
      this.favorites.set(favoriteProducts);
      this.isLoading.set(false);
    });
  }

  removeFromFavorites(productId: string) {
    this.favoritesService.removeFavorite(productId);
  }
}
