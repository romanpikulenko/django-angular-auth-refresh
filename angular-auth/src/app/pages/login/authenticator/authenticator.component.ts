import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-authenticator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './authenticator.component.html',
  styleUrl: './authenticator.component.css'
})
export class AuthenticatorComponent {
  form!: FormGroup
  @Input('loginData') loginData = {
    id: 0,
    img: ''
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      code: '',
    })
  }
  submit() {
    const formData = this.form.getRawValue()

    const data = {
      ...formData,
      ...this.loginData
    }
    this.authService.authenticatorLogin(data)
      .subscribe({
        next: (res: any) => {
          this.authService.accessToken = res.token
          AuthService.authEmitter.emit(true);
          this.router.navigate(['/'])
        },
        error: err => console.error(err)
      });
  }
}
