import { Component, OnInit } from '@angular/core';
import { FormComponent } from './form/form.component';
import { AuthenticatorComponent } from './authenticator/authenticator.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormComponent, AuthenticatorComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginData = {
    id: 0
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
