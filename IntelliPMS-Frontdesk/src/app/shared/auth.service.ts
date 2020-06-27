import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {LoginModel} from '../models/login.model';
import {BaseHttpService} from './base-http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = this.baseHttpService.baseUrl;
  constructor(
    private http: HttpClient,
    private router: Router,
    private baseHttpService: BaseHttpService
  ) { }

  loginUser(path: string, userDetails) {
    return this.http.post<LoginModel>(`${this.baseUrl}/${path}`, userDetails);
  }

  loggedIn() {
    return !!localStorage.getItem('x-access-token');
  }

  logOut() {
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('hotelId');
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  insertLoginDetails(path: string, details) {
    return this.http.post(`${this.baseUrl}/${path}`, details);
  }

  insertLogoutDetails(path: string, details) {
    return this.http.put(`${this.baseUrl}/${path}`, details);
  }
}
