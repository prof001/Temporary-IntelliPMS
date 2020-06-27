import { Component, OnInit } from '@angular/core';
import {EmployeeModel} from '../../models/employee.model';
import {HttpService} from '../../shared/http.service';
import {AuthService} from '../../shared/auth.service';
import {HotelModel} from '../../models/hotel.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-hotel-display',
  templateUrl: './property-display.component.html',
  styleUrls: ['./property-display.component.css']
})
export class PropertyDisplayComponent implements OnInit {
  employee: EmployeeModel = new EmployeeModel();
  hotels: HotelModel[] = [];
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.getEmployeeDetails();
  }

  logOut() {
    this.authService.logOut();
  }

  getEmployeeDetails() {
    const employeeId = localStorage.getItem('employeeId');
    this.httpService.getEmployeeDetails(`employees/${employeeId}`).subscribe(
      res => {
        this.employee = res;
        this.getEmployeeHotels(res.emailAddress);
      },
      err => {
        console.log(err);
      }
    );
  }

  getEmployeeHotels(email) {
    this.httpService.getHotels(`hotels?email=${email}`).subscribe(
      res => {
        this.hotels = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  proceedToDashboard(hotelId) {
    localStorage.setItem('hotelId', hotelId);
    this.router.navigate(['/dashboard']);
  }

}
