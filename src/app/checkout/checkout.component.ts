import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CheckoutService,
  CheckoutState,
  ShippingInfo,
} from '../core/services/checkout.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TndCurrencyPipe } from '../shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TndCurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  checkoutService = inject(CheckoutService);

  state$: Observable<CheckoutState> = this.checkoutService.state$;
  shippingForm!: FormGroup;
  currentStep = 1;

  // Gift card
  giftCardCode = '';
  isApplyingGiftCard = false;
  giftCardMessage: { type: 'success' | 'error'; text: string } | null = null;

  ngOnInit(): void {
    this.checkoutService.loadCartProducts();
    this.initShippingForm();

    // Redirect to cart if empty
    const state = this.checkoutService.getState();
    if (state.cartProducts.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  private initShippingForm(): void {
    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-+()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', [Validators.required]],
    });
  }

  onSubmitShipping(): void {
    if (this.shippingForm.valid) {
      const shippingInfo: ShippingInfo = this.shippingForm.value;
      this.checkoutService.setShippingInfo(shippingInfo);
      this.currentStep = 2;
    } else {
      this.markFormGroupTouched(this.shippingForm);
    }
  }

  goToStep(step: number): void {
    if (step === 1 || (step === 2 && this.shippingForm.valid)) {
      this.currentStep = step;
    }
  }

  processPayment(): void {
    this.checkoutService.processPayment().subscribe();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shippingForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.shippingForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['pattern']) return `Please enter a valid ${this.getFieldLabel(fieldName).toLowerCase()}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone number',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP code',
      country: 'Country',
    };
    return labels[fieldName] || fieldName;
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
    this.giftCardMessage = null;
  }
}
