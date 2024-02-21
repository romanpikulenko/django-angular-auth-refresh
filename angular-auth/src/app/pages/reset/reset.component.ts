import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotService } from '../../services/forgot.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css'
})
export class ResetComponent {
  form!: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private forgotService: ForgotService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      password: '',
      password_confirm: '',
    })
  }
  submit() {
    const formData = this.form.getRawValue()
    const data = {
      ...formData,
      token: this.route.snapshot.params['token']
    }

    this.forgotService.reset(data)
      .subscribe({
        next: _ => this.router.navigate(['/login']),
        error: err => console.error(err)
      });
  }
}
