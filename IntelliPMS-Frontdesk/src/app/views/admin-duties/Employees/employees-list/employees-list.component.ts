import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {EmployeeModel} from '../../../../models/employee.model';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit {

  constructor(private httpService: HttpService) { }
  employees: EmployeeModel[] = [];

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.httpService.getEmployees('employees').subscribe(
      res => {
        this.employees = res;
      },
      err => {
        console.log(err);
      }
    );
  }

}
