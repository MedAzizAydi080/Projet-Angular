import { Component, inject } from '@angular/core';
import { ProductOfferComponent } from '../shared/components/product-offer/product-offer.component';
import { Product } from '../shared/models/product';
import { HomeProductComponent } from './components/home-product/home-product.component';
import { ProductService } from '../core/services/product.service';
import { AsyncPipe } from '@angular/common';
import { Observable, tap, switchMap, distinctUntilChanged, map } from 'rxjs';
import { initFlowbite } from 'flowbite';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [ProductOfferComponent, HomeProductComponent, AsyncPipe],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);

  searchTerm = '';
  
  private readonly searchTerm$ = this.route.queryParamMap.pipe(
    map((params) => params.get('search')?.trim() || ''),
    distinctUntilChanged(),
    tap(term => {
      console.log('DEBUG: Search term emitted:', term);
      this.searchTerm = term;
    })
  );

  products$: Observable<Product[]> = this.searchTerm$.pipe(
    switchMap((search) => {
      console.log('DEBUG: SwitchMap executing for:', search);
      return search
        ? this.productService.searchProducts(search)
        : this.productService.getAll();
    }),
    tap((products) => {
      console.log('DEBUG: Products emitted:', products.length);
    })
  );
  
  products = toSignal(this.products$, { initialValue: [] });

  productOffers$: Observable<Product[]>;

  private offersLoaded = false;
  private flowbiteInitialized = false;

  constructor() {
    console.log('DEBUG: HomeComponent instantiated');
    this.productOffers$ = this.productService.getOffers().pipe(
      tap((offers) => {
        if (offers && offers.length > 0) {
          this.offersLoaded = true;
          setTimeout(() => this.initializeFlowbite(), 0);
        }
      })
    );
  }

  private initializeFlowbite(): void {
    if (!this.flowbiteInitialized) {
      initFlowbite();
      this.flowbiteInitialized = true;
    }
  }
}
