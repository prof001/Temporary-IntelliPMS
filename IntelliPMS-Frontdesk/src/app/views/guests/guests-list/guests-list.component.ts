import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GuestStayModel} from '../../../models/guest-stay.model';
import {HttpService} from '../../../shared/http.service';
import {BalanceBillModel} from '../../../models/balance-bill.model';
import * as moment from 'moment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-guests-list',
  templateUrl: './guests-list.component.html',
  styleUrls: ['./guests-list.component.css']
})
export class GuestsListComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) { }

  guestList: GuestStayModel[] = [];
  guestBills: BalanceBillModel = new BalanceBillModel();
  hotelId = localStorage.getItem('hotelId');
  totalDebits;
  currentTime = moment().format('Do/MMM/YYYY h:mm A');

  ngOnInit(): void {
    this.getCurrentGuests();
  }

  getCurrentGuests() {
    this.httpService.getCurrentGuests(`hotels/${this.hotelId}/currentGuests`).subscribe(
      res => {
        this.guestList = res;
        const checkInDate = this.guestList.map(obj => this.extractDateTime(obj.checkInDate));
        const checkOutDate = this.guestList.map(obj => this.extractDateTime(obj.checkOutDate));
        // tslint:disable-next-line:forin
        for (const i in this.guestList) {
          this.guestList[i].formattedCheckInDate = checkInDate[i];
          this.guestList[i].formattedCheckOutDate = checkOutDate[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getGuestBills(checkInId, roomId) {
    this.httpService.getGuestBillBalance(`guests/checkOutBalanceBills/${checkInId}/${roomId}`).subscribe(
      res => {
        this.guestBills = res;
        this.guestBills.daysSpent = +this.getDaysNumber(this.guestBills.checkInDate);
        const debit1 = this.guestBills.debits.reduce((a, b) => a + b.amount, 0);
        const debit2 = this.guestBills.otherRoomsStay.reduce((a, b) => a + b.amount, 0);
        const debit3 = this.guestBills.extendStay.reduce((a, b) => a + b.cost, 0);
        this.totalDebits = debit1 + debit2 + debit3;
        this.totalDebits += this.guestBills.daysSpent * this.guestBills.cost;
      },
      err => {
        console.log(err);
      }
    );
  }

  getDaysNumber(checkIn) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:${time1[5]}`);
    let daysSpent;

    const time2 = checkIn.split(/[-T.:+]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:${time2[5]}`);

    if (date2 <= date1) {
      // @ts-ignore
      const diffTime = Math.abs(date2 - date1);
      daysSpent = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      daysSpent = -1;
    }
    return daysSpent;
  }

  print() {
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,width=900,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
          //........Customized style.......
          </style>
        </head>
       <body onload="window.print();window.close()">
        <h2>IntellPMS Header Reciept</h2>
        ${printContents}
      </body>
      </html>`
    );
    popupWin.document.close();
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

  open(content, checkInId, roomId) {
    this.getGuestBills(checkInId, roomId);
    this.modalService.open(content).result.then(() => {
    }, () => {});
  }
}
