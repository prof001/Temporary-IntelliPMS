import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import Swal from 'sweetalert2';

import {HttpService} from '../../../shared/http.service';
import {CheckinOutModel} from '../../../models/checkin-out.model';
import {ActivatedRoute, Params} from '@angular/router';
import {RoomTypeModel} from '../../../models/room-type.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private httpService: HttpService, private route: ActivatedRoute) { }
  checkedInRooms: CheckinOutModel[] = [];
  checkInChecker = false;
  checkOutChecker = false; roomType = '';
  hotelRoomType: RoomTypeModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');

  ngOnInit(): void {
    this.getCheckedInRooms();
    this.getHotelRoomTypes();

    this.route.queryParams.subscribe((qParams: Params) => {
      if (qParams.msg) {
        this.checkInChecker = true;
      }
      if (qParams.chk) {
        this.checkOutChecker = true;
      }
    });
  }

  getCheckedInRooms() {
    this.httpService.getCurrentCheckedInRooms(`hotels/${this.hotelId}/currentCheckInRooms`).subscribe(
      res => {
        this.checkedInRooms = res;
        const daysLeft = this.checkedInRooms.map(e => this.getDaysLeft(e.freeDate));
        // tslint:disable-next-line:forin
        for (const i in this.checkedInRooms) {
          this.checkedInRooms[i].daysLeft = daysLeft[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getHotelRoomTypes() {
    this.httpService.getHotelRoomTypes(`hotels/${this.hotelId}/hotelRoomTypes`).subscribe(
      res => {
        this.hotelRoomType = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  roomTypeFilter() {
    let path;
    if (this.roomType !== 'all') {
      path = `hotels/${this.hotelId}/currentCheckInRooms?roomType=${this.roomType}`;
    } else {
      path = `hotels/${this.hotelId}/currentCheckInRooms`;
    }
    this.httpService.getCurrentCheckedInRooms(path).subscribe(
      res => {
        this.checkedInRooms = res;
        const daysLeft = this.checkedInRooms.map(e => this.getDaysLeft(e.freeDate));
        // tslint:disable-next-line:forin
        for (const i in this.checkedInRooms) {
          this.checkedInRooms[i].daysLeft = daysLeft[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getDaysLeft(checkOut) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]}`);
    let daysLeft = 0;

    const time2 = checkOut.split(/[-T.:+]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]}`);

    if (date2 >= date1) {
      // @ts-ignore
      const diffTime = Math.abs(date2 - date1);
       daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      daysLeft = -1;
    }
    return daysLeft;
  }
}
