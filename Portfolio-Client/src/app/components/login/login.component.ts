import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Add a loading state to prevent double submission
  isLoading = false;

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  onLogin() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;

      const credentials = this.loginForm.getRawValue();

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          console.log('Login successful!');
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.isLoading = false;
          // Clear password on failure for security
          this.loginForm.controls.password.reset();

          const errorMessage = err.error?.message || 'Invalid username or password';
          alert('Login failed: ' + errorMessage);
        }
      });
    }
  }
}
