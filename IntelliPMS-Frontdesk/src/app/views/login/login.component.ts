import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../shared/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import * as moment from 'moment';
import {RandomListsService} from '../../shared/random-lists.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  userLoginDetail = {
    email: '',
    reqPassword: ''
  };
  loginError; showError = false;
  hotelId = localStorage.getItem('hotelId');
  processing = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private randomList: RandomListsService) {
  }

  ngOnInit(){
    if (this.authService.loggedIn() && this.hotelId !== undefined) {
      this.router.navigate(['/dashboard']);
    } else if (this.authService.loggedIn()) {
      this.router.navigate(['/hotels']);
    }
  }

  loginUser() {
    this.processing = true;
    this.authService.loginUser('employees/login', this.userLoginDetail).subscribe(
      res => {
        localStorage.setItem('x-access-token', res.token);
        localStorage.setItem('employeeId', res.employeeId);
        this.insertLoginDetails(res.employeeId);
        if (res.numOfHotels === 1) {
          localStorage.setItem('hotelId', res.hotelId.toString());
          this.router.navigate(['/dashboard']);
        } else if (res.numOfHotels > 1 && res.employeeRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/hotels']);
        }
      },
      err => {
        this.processing = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.showError = true;
            this.loginError = err.error.message;
          } else if (err.status === 0) {
            this.showError = true;
            this.loginError = 'An error occurred while connecting to server';
          }
        }
      }
    );
  }

  insertLoginDetails(employeeId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const loginDateTime = this.randomList.parseDateTime(momentDateTime);

    const details = {
      employeeId,
      loginDateTime
    };
    this.authService.insertLoginDetails('employees/insertLogin', details).subscribe(
      res => {},
      err => {
        console.log(err);
      }
    );
  }

  onDismissError() {
    this.showError = false;
  }
}
