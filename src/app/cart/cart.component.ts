import { Component, OnInit, inject } from '@angular/core';
import { CartProductComponent } from './components/cart-product/cart-product.component';
import { TndCurrencyPipe } from '../shared/pipes/tnd-currency.pipe';
import { CartProduct } from '../shared/models/cart-product';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CheckoutService, AppliedGiftCard } from '../core/services/checkout.service';

@Component({
  selector: 'app-cart',
  imports: [CartProductComponent, TndCurrencyPipe, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  
  cartProducts: CartProduct[] = [];
  total: number = 0;
  
  // Gift card
  giftCardCode = '';
  isApplyingGiftCard = false;
  giftCardMessage: { type: 'success' | 'error'; text: string } | null = null;
  appliedGiftCard: AppliedGiftCard | null = null;
  giftCardDiscount = 0;
  finalTotal = 0;

  ngOnInit(): void {
    this.updateCart();
    this.loadAppliedGiftCard();
  }

  private loadAppliedGiftCard(): void {
    this.appliedGiftCard = this.checkoutService.getAppliedGiftCard();
    this.calculateFinalTotal();
  }

  private calculateFinalTotal(): void {
    if (this.appliedGiftCard) {
      this.giftCardDiscount = Math.min(this.appliedGiftCard.amount, this.total);
      this.finalTotal = Math.max(0, this.total - this.giftCardDiscount);
    } else {
      this.giftCardDiscount = 0;
      this.finalTotal = this.total;
    }
  }

  updateCart() {
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    this.cartProducts = storagedProducts;

    if (this.cartProducts.length > 0) {
      this.total = this.cartProducts.reduce(
        (acc, val) => acc + val.product.price * val.quantity,
        0
      );
    } else {
      this.total = 0;
    }
    
    this.calculateFinalTotal();
  }

  applyGiftCard(): void {
    if (!this.giftCardCode.trim()) return;

    this.isApplyingGiftCard = true;
    this.giftCardMessage = null;

    this.checkoutService.applyGiftCard(this.giftCardCode.trim()).subscribe({
      next: (result) => {
        this.isApplyingGiftCard = false;
        this.giftCardMessage = {
          type: result.success ? 'success' : 'error',
          text: result.message,
        };
        if (result.success) {
          this.giftCardCode = '';
          this.loadAppliedGiftCard();
        }
      },
      error: () => {
        this.isApplyingGiftCard = false;
        this.giftCardMessage = {
          type: 'error',
          text: 'Failed to apply gift card. Please try again.',
        };
      },
    });
  }

  removeGiftCard(): void {
    this.checkoutService.removeGiftCard();
    this.appliedGiftCard = null;
    this.giftCardMessage = null;
    this.calculateFinalTotal();
  }
}
