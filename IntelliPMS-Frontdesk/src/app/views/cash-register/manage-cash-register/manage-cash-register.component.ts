import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {EmployeeModel} from '../../../models/employee.model';
import {HttpService} from '../../../shared/http.service';
import {RandomListsService} from '../../../shared/random-lists.service';
import {RegisterModel} from '../../../models/register.model';
import {CashRegisterDetailsModel} from '../../../models/cashRegisterDetails';

@Component({
  selector: 'app-open-cash-register',
  templateUrl: './manage-cash-register.component.html',
  styleUrls: ['./manage-cash-register.component.css']
})
export class ManageCashRegisterComponent implements OnInit {
  modalRef;
  showCashRegister = false;
  cashOnHand;
  employee: EmployeeModel = new EmployeeModel();
  openedRegister: RegisterModel = new RegisterModel();
  cashRegisterSummary: CashRegisterDetailsModel[] = [];
  openedDateTime; totalAmount;
  currentTime = moment().format('Do MMM YYYY h:mm A');
  closingSummary = '';
  registerClosedChecker = false;

  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');
  hotelId = localStorage.getItem('hotelId');

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private randomList: RandomListsService) { }

  ngOnInit(): void {
    this.getEmployeeDetails();
    this.showCashRegister = this.registerId !== null;
    if (this.showCashRegister === true) {
      this.getOpenedRegister();
    }
  }

  getEmployeeDetails() {
    this.httpService.getEmployeeDetails(`employees/${this.employeeId}`).subscribe(
      res => {
        this.employee = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  openCashRegister() {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);
    const registerDetails = {
      employeeId: this.employeeId,
      hotelId: this.hotelId,
      dateTimeOpened: currentDateTime,
      cashOnHand: this.cashOnHand
    };
    this.httpService.openCashRegister('employees/openCashRegister', registerDetails).subscribe(
      res => {
        this.getOpenedRegister();
        this.showCashRegister = true;
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  getCashRegisterSummary() {
    this.httpService.getCashRegisterSummary(`employees/${this.registerId}/cashRegisterSummary`).subscribe(
      res => {
        this.cashRegisterSummary = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  closeCashRegister() {
    const registerId = localStorage.getItem('registerId');
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);
    const cashRegisterDetails = {
      registerId,
      employeeId: this.employeeId,
      dateTimeClosed: currentDateTime,
      totalAmountOnClose: this.totalAmount,
      closingSummary: this.closingSummary
    };

    this.httpService.closeCashRegister('employees/closeCashRegister', cashRegisterDetails).subscribe(
      res => {
        localStorage.removeItem('registerId');
        this.registerClosedChecker = true;
        this.showCashRegister = false;
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  getOpenedRegister() {
    this.httpService.getOpenedCashRegister(`employees/${this.employeeId}/getOpenedRegister`).subscribe(
      res => {
        this.openedRegister = res;
        localStorage.setItem('registerId', this.openedRegister.registerId.toString());
        this.openedDateTime = this.extractDateTime(this.openedRegister.dateTimeOpened);
        const times = this.openedRegister.registerDetails.map(e => this.extractDateTime(e.paymentDate));

        // tslint:disable-next-line:forin
        for (const i in this.openedRegister.registerDetails) {
          this.openedRegister.registerDetails[i].formattedDate = times[i];
        }
        const registerTotal = this.openedRegister.registerDetails.reduce((a, b) => a + b.amount, 0);
        this.totalAmount = registerTotal + this.openedRegister.cashOnHand;
        this.getCashRegisterSummary();
      },
      err => {
        console.log(err);
      }
    );
  }

  extractDateTime(dateTime) {
    const resDateTime = dateTime.split(/[-T.: ]/);

    if (resDateTime[3] <= 12) {
      return `${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${resDateTime[3]}:${resDateTime[4]} AM`;
    } else {
      let adjustedTime = resDateTime[3] % 12;
      if (adjustedTime < 10) {
        // @ts-ignore
        adjustedTime = '0' + adjustedTime;
      }
      return `${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${adjustedTime}:${resDateTime[4]} PM`;
    }
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {
    });
  }

}
