import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {EmployeeModel} from '../../../../models/employee.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employees-control',
  templateUrl: './employees-control.component.html',
  styleUrls: ['./employees-control.component.css']
})
export class EmployeesControlComponent implements OnInit {
  constructor(
    private httpService: HttpService,
    private modalService: NgbModal) { }
  employees: EmployeeModel[] = [];
  modalRef;
  password1; password2;
  showSuccessAlert = false;

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

  updateLoginAccess(employeeId, status) {
    const statusDetails = {status};
    this.httpService.updateLoginAccess(`employees/${employeeId}/updateLoginAccess`, statusDetails).subscribe(
      res => {
        console.log(res);
        this.getEmployees();
      },
      err => {
        console.log(err);
      }
    );
  }

  resetEmployeePassword(employeeId) {
    const passwordDetails = {
      employeeId,
      newPassword: this.password1
    };
    this.httpService.resetPassword('employees/resetPassword', passwordDetails).subscribe(
      res => {
        this.showSuccessAlert = true;
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  onAlertClosed() {
    this.showSuccessAlert = false;
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {});
  }

}
