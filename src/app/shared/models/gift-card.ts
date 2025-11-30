export interface GiftCard {
  id: string;
  name: string;
  description: string;
  image: string;
  category: GiftCardCategory;
  availableAmounts: number[];
  customAmountRange?: { min: number; max: number };
  backgroundColor: string;
  accentColor: string;
}

export interface PurchasedGiftCard {
  id: string;
  giftCard: GiftCard;
  amount: number;
  code: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  purchaseDate: Date;
  expiryDate: Date;
  isRedeemed: boolean;
  redeemedDate?: Date;
}

export type GiftCardCategory = 
  | 'general' 
  | 'birthday' 
  | 'holiday' 
  | 'thank-you' 
  | 'congratulations'
  | 'gaming';

export interface GiftCardPurchaseForm {
  giftCardId: string;
  amount: number;
  deliveryMethod: 'email' | 'print';
  recipientEmail?: string;
  recipientName?: string;
  senderName: string;
  message?: string;
}
