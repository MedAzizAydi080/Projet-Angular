import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Product } from '../shared/models/product';
import { AsyncPipe } from '@angular/common';
import { ProductService } from '../core/services/product.service';
import { FavoritesService } from '../core/services/favorites.service';
import { CartProduct } from '../shared/models/cart-product';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TndCurrencyPipe } from '../shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-product',
  imports: [AsyncPipe, TndCurrencyPipe],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  id = input<string>('');
  productService = inject(ProductService);
  favoritesService = inject(FavoritesService);
  router = inject(Router);
  product$!: Observable<Product | undefined>;
  isFavorite = signal(false);

  ngOnInit(): void {
    this.product$ = this.productService.getById(this.id());
    this.isFavorite.set(this.favoritesService.isFavorite(this.id()));
  }

  toggleFavorite(productId: string): void {
    const newState = this.favoritesService.toggleFavorite(productId);
    this.isFavorite.set(newState);
  }

  addToCart(product: Product) {
    const cartProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    const matched = cartProducts.find(({ product: p }) => p.id === product.id);

    if (matched) {
      matched.quantity++;
    } else {
      cartProducts.push({ product, quantity: 1 });
    }
    localStorage.setItem('cart-products', JSON.stringify(cartProducts));
    this.router.navigate(['/cart']);
  }
}
