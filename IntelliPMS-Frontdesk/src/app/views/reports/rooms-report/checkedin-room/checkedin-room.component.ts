import {Component, OnDestroy, OnInit} from '@angular/core';
import {CheckedInRoomReportModel} from '../../../../models/checkedIn-room-report.model';
import {HttpService} from '../../../../shared/http.service';
import {timer} from 'rxjs';

@Component({
  selector: 'app-checkedin-room',
  templateUrl: './checkedin-room.component.html',
  styleUrls: ['./checkedin-room.component.css']
})
export class CheckedinRoomComponent implements OnInit, OnDestroy {
  checkedInRooms: CheckedInRoomReportModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  totalDeposit;
  totalBills;
  timerObs = timer(0, 30000); timerSub;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getCheckedInRoomsReport();
    });
  }

  getCheckedInRoomsReport() {
    this.httpService.getCheckedInRoomsReport(`reports/${this.hotelId}/getCheckedInRooms`).subscribe(
      res => {
        this.checkedInRooms = res;
        const checkInDate = this.checkedInRooms.map(obj => this.extractDateTime(obj.checkInDate));
        const checkOutDate = this.checkedInRooms.map(obj => this.extractDateTime(obj.checkOutDate));
        this.totalDeposit = this.checkedInRooms.reduce((a, b) => a + b.totalDeposit, 0);
        this.totalBills = this.checkedInRooms.reduce((a, b) => a + b.totalBill, 0);
        // tslint:disable-next-line:forin
        for (const i in this.checkedInRooms) {
          this.checkedInRooms[i].formattedCheckInDate = checkInDate[i];
          this.checkedInRooms[i].formattedCheckOutDate = checkOutDate[i];
        }
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

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

}
