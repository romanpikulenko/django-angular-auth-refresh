import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public static authEmitter = new EventEmitter<boolean>();

  constructor(private http: HttpClient) { }

  accessToken = ''

  register(body: any) {
    return this.http.post(`${environment.api}/register/`, body)
  }
  login(body: any) {
    const request = this.http.post(`${environment.api}/login/`, body, { withCredentials: true })

    return request
  }
  user() {
    return this.http.get(`${environment.api}/user/`)
  }
  refresh() {
    const request = this.http.post(`${environment.api}/refresh/`, {}, { withCredentials: true })

    return request
  }
  logout() {
    const request = this.http.post(`${environment.api}/logout/`, {}, { withCredentials: true })

    return request
  }

}
