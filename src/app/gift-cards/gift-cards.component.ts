import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftCardService } from '../core/services/gift-card.service';
import {
  GiftCard,
  GiftCardCategory,
  GiftCardPurchaseForm,
  PurchasedGiftCard,
} from '../shared/models/gift-card';
import { Observable } from 'rxjs';
import { TndCurrencyPipe } from '../shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, TndCurrencyPipe, DatePipe],
  templateUrl: './gift-cards.component.html',
})
export class GiftCardsComponent implements OnInit {
  private giftCardService = inject(GiftCardService);

  giftCards$: Observable<GiftCard[]> = this.giftCardService.getGiftCards();
  myGiftCards$: Observable<PurchasedGiftCard[]> = this.giftCardService.getMyGiftCards();

  activeTab: 'browse' | 'my-cards' | 'redeem' = 'browse';
  selectedCategory: GiftCardCategory | 'all' = 'all';
  
  // Purchase modal state
  showPurchaseModal = false;
  selectedCard: GiftCard | null = null;
  selectedAmount: number = 0;
  customAmount: number | null = null;
  useCustomAmount = false;
  deliveryMethod: 'email' | 'print' = 'email';
  recipientName = '';
  recipientEmail = '';
  senderName = '';
  personalMessage = '';
  isPurchasing = false;
  purchaseSuccess = false;
  purchasedCardCode = '';

  // Redeem state
  redeemCode = '';
  isRedeeming = false;
  redeemResult: { success: boolean; message: string } | null = null;

  categories: { value: GiftCardCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Cards' },
    { value: 'general', label: 'General' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'thank-you', label: 'Thank You' },
    { value: 'congratulations', label: 'Congratulations' },
    { value: 'gaming', label: 'Gaming' },
  ];

  ngOnInit(): void {}

  filterByCategory(category: GiftCardCategory | 'all'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.giftCards$ = this.giftCardService.getGiftCards();
    } else {
      this.giftCards$ = this.giftCardService.getGiftCardsByCategory(category);
    }
  }

  openPurchaseModal(card: GiftCard): void {
    this.selectedCard = card;
    this.selectedAmount = card.availableAmounts[0];
    this.customAmount = null;
    this.useCustomAmount = false;
    this.deliveryMethod = 'email';
    this.recipientName = '';
    this.recipientEmail = '';
    this.senderName = '';
    this.personalMessage = '';
    this.purchaseSuccess = false;
    this.showPurchaseModal = true;
  }

  closePurchaseModal(): void {
    this.showPurchaseModal = false;
    this.selectedCard = null;
    this.purchaseSuccess = false;
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.useCustomAmount = false;
  }

  toggleCustomAmount(): void {
    this.useCustomAmount = !this.useCustomAmount;
    if (this.useCustomAmount && this.selectedCard?.customAmountRange) {
      this.customAmount = this.selectedCard.customAmountRange.min;
    }
  }

  getFinalAmount(): number {
    if (this.useCustomAmount && this.customAmount) {
      return this.customAmount;
    }
    return this.selectedAmount;
  }

  isFormValid(): boolean {
    const hasAmount = this.getFinalAmount() > 0;
    const hasSender = this.senderName.trim().length > 0;
    const hasRecipient = this.deliveryMethod === 'print' || 
      (this.recipientEmail.trim().length > 0 && this.recipientName.trim().length > 0);
    
    return hasAmount && hasSender && hasRecipient;
  }

  purchaseGiftCard(): void {
    if (!this.selectedCard || !this.isFormValid()) return;

    this.isPurchasing = true;

    const form: GiftCardPurchaseForm = {
      giftCardId: this.selectedCard.id,
      amount: this.getFinalAmount(),
      deliveryMethod: this.deliveryMethod,
      recipientEmail: this.deliveryMethod === 'email' ? this.recipientEmail : undefined,
      recipientName: this.recipientName || undefined,
      senderName: this.senderName,
      message: this.personalMessage || undefined,
    };

    this.giftCardService.purchaseGiftCard(form).subscribe({
      next: (purchasedCard) => {
        this.isPurchasing = false;
        this.purchaseSuccess = true;
        this.purchasedCardCode = purchasedCard.code;
      },
      error: () => {
        this.isPurchasing = false;
      },
    });
  }

  redeemGiftCard(): void {
    if (!this.redeemCode.trim()) return;

    this.isRedeeming = true;
    this.redeemResult = null;

    this.giftCardService.redeemGiftCard(this.redeemCode.trim().toUpperCase()).subscribe({
      next: (result) => {
        this.isRedeeming = false;
        this.redeemResult = result;
        if (result.success) {
          this.redeemCode = '';
        }
      },
      error: () => {
        this.isRedeeming = false;
        this.redeemResult = { success: false, message: 'An error occurred. Please try again.' };
      },
    });
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code);
  }

  formatCode(code: string): string {
    return code;
  }
}
