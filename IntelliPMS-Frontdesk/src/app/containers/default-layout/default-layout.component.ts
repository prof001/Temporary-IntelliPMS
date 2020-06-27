import {Component, OnInit} from '@angular/core';
import { navItems } from '../../_nav';
import {AuthService} from '../../shared/auth.service';
import {EmployeeModel} from '../../models/employee.model';
import {HttpService} from '../../shared/http.service';
import {HotelModel} from '../../models/hotel.model';
import {frontDeskNavItems} from '../../_nav2';
import {adminNavItems} from '../../_nav3';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {registerOperatorNavItems} from '../../_nav4';
import * as moment from 'moment';
import {RandomListsService} from '../../shared/random-lists.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public sidebarMinimized = false;
  navItems;
  employee: EmployeeModel = new EmployeeModel();
  hotel: HotelModel = new HotelModel();
  registerId = localStorage.getItem('registerId');
  employeeId = localStorage.getItem('employeeId');

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private router: Router,
    private randomList: RandomListsService) {}

  ngOnInit() {
    this.getEmployeeDetails();
    this.getHotelInfo();
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  logOut() {
    this.registerId = localStorage.getItem('registerId');
    if (this.registerId == null) {
      this.insertLogOutDetails();
    } else {
      this.toastr.error('You forgot to close your cash register', 'Logout message', {
        timeOut: 5000,
        tapToDismiss: true
      });
      this.router.navigate(['/cash-register/manage-cash-register']);
    }
  }

  insertLogOutDetails() {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const logoutDateTime = this.randomList.parseDateTime(momentDateTime);
    const details = {
      employeeId: this.employeeId,
      logoutDateTime
    };
    this.authService.insertLogoutDetails('employees/insertLogout', details).subscribe(
      res => {
        this.authService.logOut();
      },
      err => {
        console.log(err);
      }
    );
  }

  getEmployeeDetails() {
    const employeeId = localStorage.getItem('employeeId');
    this.httpService.getEmployeeDetails(`employees/${employeeId}`).subscribe(
      res => {
        this.employee = res;
        if (this.employee.employeeRole === 'front desk') {
          this.navItems = frontDeskNavItems;
        } else if (this.employee.employeeRole === 'admin') {
          this.navItems = adminNavItems;
        } else if (this.employee.employeeRole === 'manager' && this.employee.operateRegister === 'true') {
          this.navItems = registerOperatorNavItems;
        } else {
          this.navItems = navItems;
        }
        if (this.employee.picture === null) {
          this.employee.picture = '/assets/no_pix1.png';
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getHotelInfo() {
    const hotelId = localStorage.getItem('hotelId');
    if (+hotelId === 0) {
      this.hotel.hotelName = 'No hotel';
    } else {
      this.httpService.getHotelInfo(`hotels/${hotelId}`).subscribe(
        res => {
          this.hotel = res;
        }, err => {
          console.log(err);
        }
      );
    }
  }
}
