import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GoogleLoginProvider, SocialAuthService, SocialLoginModule, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, SocialLoginModule, GoogleSigninButtonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  @Output('onLogin') onLogin = new EventEmitter();

  form!: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService
  ) {
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: '',
    })
    this.socialAuthService.authState.subscribe((user) => {
      this.authService.googleLogin({ "token": user.idToken }).subscribe(
        {
          next: (res: any) => {
            this.authService.accessToken = res.token
            AuthService.authEmitter.emit(true);
            this.router.navigate(['/'])
          },
          error: err => console.error(err)
        })
    });
  }
  submit() {
    this.authService.login(this.form.getRawValue())
      .subscribe({
        next: res => this.onLogin.emit(res),
        error: err => console.error(err)
      });
  }
}
