import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { ProductComponent } from './product/product.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { GiftCardsComponent } from './gift-cards/gift-cards.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { FindUsComponent } from './find-us/find-us.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'products/:id',
    component: ProductComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'gift-cards',
    component: GiftCardsComponent,
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
  },
  {
    path: 'PaymentSuccess',
    component: PaymentSuccessComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'find-us',
    component: FindUsComponent,
  },
];
