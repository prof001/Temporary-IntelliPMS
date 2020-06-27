import { Component, OnInit } from '@angular/core';
import {RegisterModel} from '../../../models/register.model';
import {HttpService} from '../../../shared/http.service';
import * as moment from 'moment';
import {CashRegisterDetailsModel} from '../../../models/cashRegisterDetails';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cash-register-audit',
  templateUrl: './cash-register-audit.component.html',
  styleUrls: ['./cash-register-audit.component.css']
})
export class CashRegisterAuditComponent implements OnInit {
  activeCashRegisters: RegisterModel[] = [];
  closedCashRegisters: RegisterModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  currentTime = moment().format('Do MMM YYYY h:mm A');
  cashRegisterSummary: CashRegisterDetailsModel[] = [];
  totalAmount; modalRef;

  constructor(
    private httpService: HttpService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getActiveCashRegisters();
    this.getClosedCashRegisters();
  }

  getActiveCashRegisters() {
    this.httpService.getCashRegisters(`hotels/${this.hotelId}/cashRegisters?status=active`).subscribe(
      res => {
        this.activeCashRegisters = res;
        const dateTimeOpened = this.activeCashRegisters.map(obj => this.extractDateTime(obj.dateTimeOpened));

        // tslint:disable-next-line:forin
        for (const i in this.activeCashRegisters) {
          this.activeCashRegisters[i].dateTimeOpened = dateTimeOpened[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getClosedCashRegisters() {
    this.httpService.getCashRegisters(`hotels/${this.hotelId}/cashRegisters?status=closed`).subscribe(
      res => {
        this.closedCashRegisters = res;
        const dateTimeOpened = this.closedCashRegisters.map(obj => this.extractDateTime(obj.dateTimeOpened));
        const dateTimeClosed = this.closedCashRegisters.map(obj => this.extractDateTime(obj.dateTimeClosed));

        // tslint:disable-next-line:forin
        for (const i in this.closedCashRegisters) {
          this.closedCashRegisters[i].dateTimeOpened = dateTimeOpened[i][0];
          this.closedCashRegisters[i].dateTimeClosed = dateTimeClosed[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  extractDateTime(dateTime) {
    if (dateTime !== null) {
      const resDateTime = dateTime.split(/[-T.: ]/);
      if (resDateTime[3] <= 12) {
        return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${resDateTime[3]}:${resDateTime[4]} AM`];
      } else {
        let adjustedTime = resDateTime[3] % 12;
        if (adjustedTime < 10) {
          // @ts-ignore
          adjustedTime = '0' + adjustedTime;
        }
        return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${adjustedTime}:${resDateTime[4]} PM`];
      }
    } else {
      return [`-1`];
    }
  }

  getCashRegisterSummary(content, registerId) {
    this.modalRef = this.modalService.open(content).result.then(
      () => {}, () => {});

    this.httpService.getCashRegisterSummary(`employees/${registerId}/cashRegisterSummary`).subscribe(
      res => {
        this.cashRegisterSummary = res;
        this.totalAmount = res.reduce((a, b) => a + b.totalAmount, 0);
      },
      err => {
        console.log(err);
      }
    );
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {
    });
  }
  // getRegisterDetails(regis)

}
