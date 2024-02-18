import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  accessToken = ''

  register(body: any) {
    return this.http.post(`${environment.api}/register/`, body)
  }
  login(body: any) {
    const request = this.http.post(`${environment.api}/login/`, body, { withCredentials: true })
    request.subscribe((res: any) => this.accessToken = res.token);

    return request
  }
  user() {
    return this.http.get(`${environment.api}/user/`)
  }
}
