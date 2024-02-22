import { Component, OnInit } from '@angular/core';
import { FormComponent } from './form/form.component';
import { AuthenticatorComponent } from './authenticator/authenticator.component';
import { CommonModule } from '@angular/common';
import * as qrcode from 'qrcode'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormComponent, AuthenticatorComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginData = {
    id: 0,
    img: ''
  }
  ngOnInit(): void {
  }
  onLogin(data: any) {
    this.loginData = data
    if (data.otpauth_url) {
      qrcode.toDataURL(data.otpauth_url, (err: any, img: string) => {
        this.loginData.img = img
      })
    }

  }
}
