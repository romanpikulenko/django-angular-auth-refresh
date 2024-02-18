import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  message = ''

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.user().subscribe({
      next: (res: any) => this.message = `Hi ${res.first_name} ${res.last_name}`,
      error: _ => this.message = "Your are not authenticated"
    })
  }
}
