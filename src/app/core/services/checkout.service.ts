import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, delay, tap, switchMap } from 'rxjs';
import { CartProduct } from '../../shared/models/cart-product';
import { GiftCardService } from './gift-card.service';

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface AppliedGiftCard {
  code: string;
  amount: number;
}

export interface CheckoutState {
  cartProducts: CartProduct[];
  shippingInfo: ShippingInfo | null;
  paymentInfo: PaymentInfo | null;
  subtotal: number;
  shipping: number;
  tax: number;
  giftCardDiscount: number;
  appliedGiftCard: AppliedGiftCard | null;
  total: number;
  isProcessing: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  cartProducts: [],
  shippingInfo: null,
  paymentInfo: null,
  subtotal: 0,
  shipping: 0,
  tax: 0,
  giftCardDiscount: 0,
  appliedGiftCard: null,
  total: 0,
  isProcessing: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private router = inject(Router);
  private giftCardService = inject(GiftCardService);
  private stateSubject = new BehaviorSubject<CheckoutState>(initialState);
  state$ = this.stateSubject.asObservable();

  private readonly TAX_RATE = 0.08; // 8% tax
  private readonly FREE_SHIPPING_THRESHOLD = 100;
  private readonly SHIPPING_COST = 9.99;

  constructor() {
    this.loadAppliedGiftCard();
    this.loadCartProducts();
  }

  private loadAppliedGiftCard(): void {
    const stored = localStorage.getItem('applied-gift-card');
    if (stored) {
      try {
        const appliedGiftCard = JSON.parse(stored);
        this.updateState({
          appliedGiftCard,
          giftCardDiscount: appliedGiftCard.amount,
        });
      } catch {
        // Invalid data, ignore
      }
    }
  }

  private saveAppliedGiftCard(card: AppliedGiftCard | null): void {
    if (card) {
      localStorage.setItem('applied-gift-card', JSON.stringify(card));
    } else {
      localStorage.removeItem('applied-gift-card');
    }
  }

  getAppliedGiftCard(): AppliedGiftCard | null {
    return this.stateSubject.value.appliedGiftCard;
  }

  loadCartProducts(): void {
    const cartProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    const subtotal = cartProducts.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const shipping = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
    const tax = subtotal * this.TAX_RATE;
    const giftCardDiscount = this.stateSubject.value.giftCardDiscount;
    const total = Math.max(0, subtotal + shipping + tax - giftCardDiscount);

    this.updateState({
      cartProducts,
      subtotal,
      shipping,
      tax,
      total,
    });
  }

  private recalculateTotal(): void {
    const state = this.stateSubject.value;
    const total = Math.max(0, state.subtotal + state.shipping + state.tax - state.giftCardDiscount);
    this.updateState({ total });
  }

  applyGiftCard(code: string): Observable<{ success: boolean; message: string; amount?: number }> {
    const state = this.stateSubject.value;
    
    // Check if a gift card is already applied
    if (state.appliedGiftCard) {
      return of({ success: false, message: 'A gift card is already applied. Remove it first to use a different one.' });
    }

    return this.giftCardService.redeemGiftCard(code).pipe(
      tap((result) => {
        if (result.success && result.amount) {
          const subtotalWithTaxAndShipping = state.subtotal + state.shipping + state.tax;
          const discountToApply = Math.min(result.amount, subtotalWithTaxAndShipping);
          
          const appliedGiftCard = { code, amount: result.amount };
          this.updateState({
            appliedGiftCard,
            giftCardDiscount: discountToApply,
          });
          this.saveAppliedGiftCard(appliedGiftCard);
          this.recalculateTotal();
        }
      })
    );
  }

  removeGiftCard(): void {
    this.updateState({
      appliedGiftCard: null,
      giftCardDiscount: 0,
    });
    this.saveAppliedGiftCard(null);
    this.recalculateTotal();
  }

  setShippingInfo(info: ShippingInfo): void {
    this.updateState({ shippingInfo: info });
  }

  setPaymentInfo(info: PaymentInfo): void {
    this.updateState({ paymentInfo: info });
  }

  processPayment(): Observable<boolean> {
    const state = this.stateSubject.value;

    if (!state.shippingInfo) {
      this.updateState({ error: 'Please fill in shipping information' });
      return of(false);
    }

    if (state.cartProducts.length === 0) {
      this.updateState({ error: 'Your cart is empty' });
      return of(false);
    }

    this.updateState({ isProcessing: true, error: null });

    // Simulate payment processing
    return of(true).pipe(
      delay(2000), // Simulate network delay
      tap((success) => {
        if (success) {
          // Clear the applied gift card after successful payment
          this.saveAppliedGiftCard(null);
          this.updateState({ isProcessing: false });
          this.router.navigate(['/PaymentSuccess']);
        } else {
          this.updateState({
            isProcessing: false,
            error: 'Payment failed. Please try again.',
          });
        }
      })
    );
  }

  clearCheckout(): void {
    this.stateSubject.next(initialState);
  }

  getState(): CheckoutState {
    return this.stateSubject.value;
  }

  private updateState(partial: Partial<CheckoutState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }
}
