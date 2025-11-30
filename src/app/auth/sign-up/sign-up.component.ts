import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  signUpForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.signUpForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator(),
      }
    );
  }

  /**
   * Custom validator: Password strength
   * - At least 8 characters
   * - Contains uppercase letter
   * - Contains lowercase letter
   * - Contains number
   */
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);

      const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumeric;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasMinLength,
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
          },
        };
      }

      return null;
    };
  }

  /**
   * Cross-field validator: Password confirmation match
   */
  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      // Clear the error if passwords match (but keep other errors)
      const confirmControl = group.get('confirmPassword');
      if (confirmControl?.errors?.['passwordMismatch']) {
        const errors = { ...confirmControl.errors };
        delete errors['passwordMismatch'];
        confirmControl.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { name, email, password } = this.signUpForm.value;

    this.authService.signUp({ name, email, password }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.signUpForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['passwordStrength']) {
        return 'Password does not meet requirements';
      }
    }
    return '';
  }

  getPasswordStrength(): { hasMinLength: boolean; hasUpperCase: boolean; hasLowerCase: boolean; hasNumeric: boolean } {
    const value = this.signUpForm.get('password')?.value || '';
    return {
      hasMinLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumeric: /[0-9]/.test(value),
    };
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Password confirmation',
      agreeToTerms: 'Terms agreement',
    };
    return labels[fieldName] || fieldName;
  }
}
