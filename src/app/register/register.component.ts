import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthErrorCodes } from '@angular/fire/auth';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  isLoading = false;
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);
  private _authService = inject(AuthService);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      this.passwordMatchValidator(),
    ]),
  });

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = this.registerForm?.get('password')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword ? null : { mustMatch: true };
    };
  }

  async register() {
    if (this.registerForm.valid) {
      try {
        this.isLoading = true;
        const { username, email, password } = this.registerForm.value;

        if (!username || !email || !password) return;

        await this._authService.signup(username, email, password);

        this._snackBar.open('Registered successfully', 'OK', {
          duration: 3000,
        });

        this._router.navigate(['/login']);
      } catch (error: any) {


        if (error.message === 'Username already exists') {
          this.registerForm.get('username')?.setErrors({ usernameExists: true });

        }

        if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
          this.registerForm.get('email')?.setErrors({ emailExists: true });
        }
      } finally {
        this.isLoading = false;
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
