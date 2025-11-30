import { Component, input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { TndCurrencyPipe } from '../../../shared/pipes/tnd-currency.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-product',
  imports: [TndCurrencyPipe, RouterLink],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent {
  product = input.required<Product>();
}
