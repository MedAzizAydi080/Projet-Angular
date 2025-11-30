import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import {
  GiftCard,
  PurchasedGiftCard,
  GiftCardPurchaseForm,
  GiftCardCategory,
} from '../../shared/models/gift-card';

@Injectable({
  providedIn: 'root',
})
export class GiftCardService {
  private purchasedCardsSubject = new BehaviorSubject<PurchasedGiftCard[]>([]);
  purchasedCards$ = this.purchasedCardsSubject.asObservable();

  private readonly giftCards: GiftCard[] = [
    {
      id: 'gc-general-1',
      name: 'Classic Gift Card',
      description: 'The perfect gift for any occasion. Let them choose what they love!',
      image: '/svg/gift-card-classic.svg',
      category: 'general',
      availableAmounts: [25, 50, 100, 150, 200],
      customAmountRange: { min: 10, max: 500 },
      backgroundColor: 'from-amber-400 to-orange-500',
      accentColor: 'amber',
    },
    {
      id: 'gc-birthday-1',
      name: 'Birthday Celebration',
      description: 'Make their birthday extra special with a gift they can use however they want.',
      image: '/svg/gift-card-birthday.svg',
      category: 'birthday',
      availableAmounts: [25, 50, 100, 200],
      backgroundColor: 'from-pink-400 to-purple-500',
      accentColor: 'pink',
    },
    {
      id: 'gc-holiday-1',
      name: 'Holiday Cheer',
      description: 'Spread holiday joy with a gift card perfect for the festive season.',
      image: '/svg/gift-card-holiday.svg',
      category: 'holiday',
      availableAmounts: [50, 100, 150, 250],
      backgroundColor: 'from-red-500 to-green-600',
      accentColor: 'red',
    },
    {
      id: 'gc-thankyou-1',
      name: 'Thank You',
      description: 'Show your appreciation with a thoughtful gift card.',
      image: '/svg/gift-card-thankyou.svg',
      category: 'thank-you',
      availableAmounts: [25, 50, 75, 100],
      backgroundColor: 'from-teal-400 to-cyan-500',
      accentColor: 'teal',
    },
    {
      id: 'gc-congrats-1',
      name: 'Congratulations!',
      description: 'Celebrate their achievements with a special gift.',
      image: '/svg/gift-card-congrats.svg',
      category: 'congratulations',
      availableAmounts: [50, 100, 200, 300],
      backgroundColor: 'from-yellow-400 to-amber-500',
      accentColor: 'yellow',
    },
    {
      id: 'gc-gaming-1',
      name: 'Gamer\'s Choice',
      description: 'For the gaming enthusiast. Level up their experience!',
      image: '/svg/gift-card-gaming.svg',
      category: 'gaming',
      availableAmounts: [25, 50, 100, 150],
      backgroundColor: 'from-violet-500 to-purple-600',
      accentColor: 'violet',
    },
  ];

  constructor() {
    this.loadPurchasedCards();
  }

  getGiftCards(): Observable<GiftCard[]> {
    return of(this.giftCards);
  }

  getGiftCardsByCategory(category: GiftCardCategory): Observable<GiftCard[]> {
    return of(this.giftCards.filter((gc) => gc.category === category));
  }

  getGiftCardById(id: string): Observable<GiftCard | undefined> {
    return of(this.giftCards.find((gc) => gc.id === id));
  }

  purchaseGiftCard(form: GiftCardPurchaseForm): Observable<PurchasedGiftCard> {
    const giftCard = this.giftCards.find((gc) => gc.id === form.giftCardId);
    
    if (!giftCard) {
      throw new Error('Gift card not found');
    }

    const purchasedCard: PurchasedGiftCard = {
      id: this.generateId(),
      giftCard,
      amount: form.amount,
      code: this.generateGiftCardCode(),
      recipientEmail: form.recipientEmail,
      recipientName: form.recipientName,
      senderName: form.senderName,
      message: form.message,
      purchaseDate: new Date(),
      expiryDate: this.getExpiryDate(),
      isRedeemed: false,
    };

    // Simulate API call
    return of(purchasedCard).pipe(
      delay(1500),
      map((card) => {
        const currentCards = this.purchasedCardsSubject.value;
        this.purchasedCardsSubject.next([...currentCards, card]);
        this.savePurchasedCards();
        return card;
      })
    );
  }

  redeemGiftCard(code: string): Observable<{ success: boolean; message: string; amount?: number }> {
    const cards = this.purchasedCardsSubject.value;
    const cardIndex = cards.findIndex((c) => c.code === code && !c.isRedeemed);

    if (cardIndex === -1) {
      return of({ success: false, message: 'Invalid or already redeemed gift card code.' }).pipe(delay(1000));
    }

    const card = cards[cardIndex];
    
    if (new Date() > card.expiryDate) {
      return of({ success: false, message: 'This gift card has expired.' }).pipe(delay(1000));
    }

    cards[cardIndex] = {
      ...card,
      isRedeemed: true,
      redeemedDate: new Date(),
    };

    this.purchasedCardsSubject.next([...cards]);
    this.savePurchasedCards();

    return of({
      success: true,
      message: `Successfully redeemed ${card.amount.toFixed(2)} D gift card!`,
      amount: card.amount,
    }).pipe(delay(1000));
  }

  getMyGiftCards(): Observable<PurchasedGiftCard[]> {
    return this.purchasedCards$;
  }

  private generateGiftCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateId(): string {
    return 'pgc-' + Math.random().toString(36).substring(2, 11);
  }

  private getExpiryDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  private savePurchasedCards(): void {
    localStorage.setItem(
      'purchased-gift-cards',
      JSON.stringify(this.purchasedCardsSubject.value)
    );
  }

  private loadPurchasedCards(): void {
    const stored = localStorage.getItem('purchased-gift-cards');
    if (stored) {
      try {
        const cards = JSON.parse(stored).map((card: any) => ({
          ...card,
          purchaseDate: new Date(card.purchaseDate),
          expiryDate: new Date(card.expiryDate),
          redeemedDate: card.redeemedDate ? new Date(card.redeemedDate) : undefined,
        }));
        this.purchasedCardsSubject.next(cards);
      } catch {
        this.purchasedCardsSubject.next([]);
      }
    }
  }
}
