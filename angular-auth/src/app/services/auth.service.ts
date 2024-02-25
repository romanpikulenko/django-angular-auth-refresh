import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public static authEmitter = new EventEmitter<boolean>();

  accessToken = ''

  constructor(private http: HttpClient) { }


  register(body: any) {
    return this.http.post(`${environment.api}/register/`, body)
  }
  login(body: any) {
    const request = this.http.post(`${environment.api}/login/`, body)

    return request
  }
  authenticatorLogin(body: any) {
    const request = this.http.post(`${environment.api}/two-factor/`, body, { withCredentials: true })

    return request
  }

  googleLogin(body: any) {
    const request = this.http.post(`${environment.api}/google-auth/`, body, { withCredentials: true })

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

  async asyncLogin(body: any) {
    const request = this.http.post(`${environment.api}/login/`, body, { withCredentials: true })

    const promise = new Promise((resolve, reject) => {
      request.subscribe({
        next: (res: any) => {
          this.accessToken = res.token
          resolve(res)
        },
        error: (error) => {
          console.error(error)
          this.accessToken = ''
          reject(error)
        }
      })
    })

    return await promise
  }
}
