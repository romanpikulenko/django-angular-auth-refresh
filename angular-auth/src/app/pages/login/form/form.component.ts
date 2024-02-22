import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  @Output('onLogin') onLogin = new EventEmitter();

  form!: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: '',
    })
  }
  submit() {
    this.authService.login(this.form.getRawValue())
      .subscribe({
        next: res => this.onLogin.emit(res),
        error: err => console.error(err)
      });
  }
}
