import {Component, OnDestroy, OnInit} from '@angular/core';
import {HotelStatsModel} from '../../../models/hotel-stats.model';
import {HttpService} from '../../../shared/http.service';
import {CustomerServiceStatsModel} from '../../../models/customer-service-stats.model';
import {RegisterModel} from '../../../models/register.model';
import * as moment from 'moment';
import {timer} from 'rxjs';
import {ActivityCountModel} from '../../../models/activity-count.model';
import {BillingsModel} from '../../../models/billings.model';
import {GuestsStatsModel} from '../../../models/guests-stats.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {
  selectDate;
  hotelStats: HotelStatsModel = new HotelStatsModel();
  hotelId = localStorage.getItem('hotelId');
  customerServiceStats: CustomerServiceStatsModel = new CustomerServiceStatsModel();
  cashRegisterStats: RegisterModel = new RegisterModel();
  nowDateTime;
  activityCount: ActivityCountModel = new ActivityCountModel();
  revenueStats: BillingsModel[] = [];
  guestsStats: GuestsStatsModel = new GuestsStatsModel();
  timerObs = timer(0, 30000); timerSub;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getCurrentDateTime();
      this.getHotelStatistics();
      this.getCustomerServiceStats();
      this.getCashRegisterStats();
      this.getTotalActivityCount();
      this.getRevenueStats();
      this.getGuestsStatistics();
    });
  }

  getHotelStatistics() {
    this.httpService.getHotelStats(`reports/${this.hotelId}/hotelStats`).subscribe(
      res => {
        this.hotelStats = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getGuestsStatistics() {
    this.httpService.getGuestsStats(`reports/${this.hotelId}/guestsStats`).subscribe(
      res => {
        this.guestsStats = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getCustomerServiceStats() {
    this.httpService.getCustomerServiceStats(`reports/${this.hotelId}/getCustomerServiceStats`).subscribe(
      res => {
        this.customerServiceStats = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getCashRegisterStats() {
    const startDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    this.httpService.getCashRegisterStats(`reports/${this.hotelId}/cashRegister?startDate=${startDate}&endDate=${endDate}`).subscribe(
      res => {
        this.cashRegisterStats = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getTotalActivityCount() {
    const startDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    this.httpService.getActivityCount(`reports/${this.hotelId}/totalActivityCount?startDate=${startDate}&endDate=${endDate}`).subscribe(
      res => {
        this.activityCount = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getRevenueStats() {
    const startDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    this.httpService.getRevenueStats(`reports/${this.hotelId}/revenueStats?startDate=${startDate}&endDate=${endDate}`).subscribe(
      res => {
        this.revenueStats = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getCurrentDateTime() {
    const currentDateTimeArray = [];
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const tempDateTime = currentDateTime.split(/[-: ]/);
    // tslint:disable-next-line:forin
    for (const i of tempDateTime) {
      currentDateTimeArray.push(+i);
    }

    this.nowDateTime = {
      year: currentDateTimeArray[0],
      month: currentDateTimeArray[1],
      day: currentDateTimeArray[2],
      hour: currentDateTimeArray[3],
      minute: currentDateTimeArray[4],
      second: currentDateTimeArray[5],
    };
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }
}
