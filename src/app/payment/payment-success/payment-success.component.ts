import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartProduct } from '../../shared/models/cart-product';
import { PurchaseService } from '../../core/services/purchase.service';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  ngOnInit(): void {
    const cartProductsJson = localStorage.getItem('cart-products');
    
    // Handle case where cart is already cleared (page refresh after checkout)
    if (!cartProductsJson) {
      console.log('Cart already cleared - purchase was processed');
      return;
    }

    const cartProducts: CartProduct[] = JSON.parse(cartProductsJson);
    
    if (!cartProducts || cartProducts.length === 0) {
      console.log('No products in cart');
      return;
    }

    const mappedProducts = cartProducts.map(({ quantity, product }) => {
      return {
        id: product.id,
        quantity,
      };
    });

    const total = cartProducts.reduce((acc, current) => {
      return acc + current.product.price * current.quantity;
    }, 0);

    localStorage.removeItem('cart-products');

    this.purchaseService.save({ total, products: mappedProducts }).subscribe({
      next: () => {
        console.log('Purchase saved successfully');
      },
      error: (err) => {
        console.error('Failed to save purchase:', err);
        // In a real app, you might want to store the failed purchase
        // and retry later or notify the user
      },
    });
  }
}
