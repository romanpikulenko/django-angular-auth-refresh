import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  authenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    AuthService.authEmitter.subscribe(authenticated => this.authenticated = authenticated)
  }


  logout() {
    this.authService.logout().subscribe(_ => {
      this.authService.accessToken = ''
      AuthService.authEmitter.emit(false)
    })
  }
}
