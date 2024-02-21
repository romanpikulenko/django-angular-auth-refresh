import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotService } from '../../services/forgot.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css'
})
export class ForgotComponent {
  form!: FormGroup
  cls = ''
  message = ''

  constructor(
    private formBuilder: FormBuilder,
    private forgotService: ForgotService
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
    })
  }
  submit() {
    this.forgotService.forgot(this.form.getRawValue())
      .subscribe({
        next: _ => {
          this.cls = 'success'
          this.message = 'Email was sent'
        },
        error: err => {
          console.error(err);
          this.cls = 'danger'
          this.message = 'Error occurred'
        }
      });
  }
}
