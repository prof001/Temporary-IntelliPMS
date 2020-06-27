import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {HotelModel} from '../../../../models/hotel.model';
import {EmployeeModel} from '../../../../models/employee.model';

@Component({
  selector: 'app-hotels-list',
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.css']
})
export class HotelsListComponent implements OnInit {
  hotelsList: HotelModel[] = [];
  employee: EmployeeModel = new EmployeeModel();
  employeeId = localStorage.getItem('employeeId');

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.getEmployeeDetails();
  }

  getHotels(emailAddress = null) {
    let path;
    if (emailAddress !== null) {
      path = `hotels?email=${emailAddress}`;
    } else {
      path = 'hotels';
    }

    this.httpService.getHotels(path).subscribe(
      res => {
        this.hotelsList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getEmployeeDetails() {
    this.httpService.getEmployeeDetails(`employees/${this.employeeId}`).subscribe(
      res => {
        this.employee = res;
        if (this.employee.emailAddress === 'admin@ontrac.com') {
          this.getHotels();
        } else {
          this.getHotels(this.employee.emailAddress);
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}
