import {Component, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {HttpService} from '../../../shared/http.service';
import {RoomModel} from '../../../models/room.model';
import {CacheService} from '../../../shared/cache.service';
import {Router} from '@angular/router';
import {timer} from 'rxjs';
import {AvailableRoomSummaryModel} from '../../../models/available-room-summary.model';
import {RoomTypeModel} from '../../../models/room-type.model';

@Component({
  selector: 'app-select-room',
  templateUrl: './select-room.component.html',
  styleUrls: ['./select-room.component.css']
})
export class SelectRoomComponent implements OnInit, OnDestroy {

  constructor(private httpService: HttpService,
              private cacheService: CacheService,
              private router: Router) { }
  meridian = true; spinners = false;
  arrivalDate; departureDate; arrivalTime; minDate;
  roomType;
  departureTime = {
    hour: 13,
    minute: 0,
    second: 0
  };
  currentDateTimeArray = []; currentDateTime;
  availableRooms: RoomModel [] = [];
  availableRoomsSummary: AvailableRoomSummaryModel[] = [];
  checkInDateTime; checkOutDateTime;
  timerObs = timer(0, 60000); timerSub;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  hotelRoomTypes: RoomTypeModel[] = [];
  processing = false;

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.currentDateTimeArray = [];
    });
    this.getCurrentDateTime();
    this.setCurrentDate();
    this.setCurrentTime();
    this.getAvailableRoomsSummary();
    this.getRoomTypes();
  }

  setCurrentDate() {
    this.arrivalDate = {
      year: this.currentDateTimeArray[0],
      month: this.currentDateTimeArray[1],
      day: this.currentDateTimeArray[2]
    };

    this.minDate = {
      year: this.currentDateTimeArray[0],
      month: this.currentDateTimeArray[1],
      day: this.currentDateTimeArray[2]
    };
  }

  setCurrentTime() {
    this.arrivalTime = {
      hour: this.currentDateTimeArray[3],
      minute: this.currentDateTimeArray[4],
      second: this.currentDateTimeArray[5]
    };
  }

  getCurrentDateTime() {
    this.currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const tempDateTime = this.currentDateTime.split(/[-: ]/);
    // tslint:disable-next-line:forin
    for (const i of tempDateTime) {
      this.currentDateTimeArray.push(+i);
    }
  }

  getRoomTypes() {
    this.httpService.getHotelRoomTypes(`hotels/${this.hotelId}/hotelRoomTypes`).subscribe(
      res => {
        this.hotelRoomTypes = res;
        this.roomType = this.hotelRoomTypes[0].roomTypeId;
      },
      err => {
        console.log(err);
      }
    );
  }

  getAvailableRooms() {
    this.processing = true;
    this.checkInDateTime =
      `${this.arrivalDate.year}-${this.arrivalDate.month}-${this.arrivalDate.day} ${this.arrivalTime.hour}:${this.arrivalTime.minute}:00`;
    const checkOutDateTime =
      `${this.departureDate.year}-${this.departureDate.month}-${this.departureDate.day} ${this.departureTime.hour}:${this.departureTime.minute}:00`;
    this.cacheService.checkInInfo.checkInDateTime = this.checkInDateTime;
    this.cacheService.checkInInfo.checkOutDateTime = checkOutDateTime;
    this.cacheService.checkInInfo.daysNum = this.getDaysNumber(checkOutDateTime);

    this.httpService.getRooms(`hotels/${this.hotelId}/rooms?roomType=${this.roomType}&freeDate=${this.checkInDateTime}`)
      .subscribe(
        res => {
          this.processing = false;
          this.availableRooms = res;
          const daysLeft = this.availableRooms.map(e => this.getDaysLeft(e.freeDate));
          // tslint:disable-next-line:forin
          for (const i in this.availableRooms) {
            this.availableRooms[i].daysLeft = daysLeft[i];
          }
        },
        err => {
          this.processing = false;
          console.log(err);
        }
      );
  }

  getAvailableRoomsSummary() {
    const currentTime = `${this.currentDateTimeArray[0]}-${this.currentDateTimeArray[1]}-${this.currentDateTimeArray[2]} ${this.currentDateTimeArray[3]}:${this.currentDateTimeArray[4]}:00`;
    this.httpService.getAvailableRoomsSummary(`hotels/${this.hotelId}/roomAvailabilitySummary?dateTime=${currentTime}`).subscribe(
      res => {
        this.availableRoomsSummary = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getDaysLeft(checkOut) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:${time1[5]}`);
    let daysLeft;

    if (checkOut !== null) {
      const time2 = checkOut.split(/[-T.:+]/);
      const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:${time2[5]}`);

      if (date2 >= date1) {
        // @ts-ignore
        const diffTime = Math.abs(date2 - date1);
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysLeft = -1;
      }
    } else {
      daysLeft = -2;
    }
    return daysLeft;
  }

  getDaysNumber(calcDate) {
    const time1 = moment().format().split(/[-T.:+ ]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:${time1[5]}`);
    let daysSpent;

    const time2 = calcDate.split(/[-T.:+ ]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:${time2[5]}`);

    // @ts-ignore
    const diffTime = Math.abs(date2 - date1);
    daysSpent = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return daysSpent;
  }

  proceed(roomId) {
    this.router.navigate(['/room/checkin', roomId]);
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

}
