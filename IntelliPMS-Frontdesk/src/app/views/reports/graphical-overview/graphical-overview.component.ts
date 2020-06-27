import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/http.service';
import {HotelStatsModel} from '../../../models/hotel-stats.model';
import {ChartType, ChartOptions} from 'chart.js';
import {timer} from 'rxjs';
import {Color, Label, SingleDataSet} from 'ng2-charts';
import * as moment from 'moment';
import {BillingsModel} from '../../../models/billings.model';
import {CustomerServiceStatsModel} from '../../../models/customer-service-stats.model';
import {ActivityCountModel} from '../../../models/activity-count.model';

@Component({
  selector: 'app-graphical-overview',
  templateUrl: './graphical-overview.component.html',
  styleUrls: ['./graphical-overview.component.css']
})
export class GraphicalOverviewComponent implements OnInit, OnDestroy {

  barChart1Options: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  barChart1Labels: string[] = ['Room Service', 'Laundry Service', 'House Keeping', 'Issues/Comments'];
  barChart1Legend = true;
  barChart1Data: any[];
  barChart1Ready = false;
  barChart1Colors: Color[] = [
    {
      backgroundColor: 'rgb(255,161,181)',
    },
    {
      backgroundColor: 'rgb(245, 216, 144)'
    },
    {
      backgroundColor: 'rgb(134, 199, 243)'
    }
  ];

  barChart2Labels: string[] =
    ['CheckIn', 'CheckOut', 'Reservations', 'Cancelled Reservations', 'Extend Stay', 'Changed Rooms'];
  barChart2Legend = false;
  barChart2Data: any[];
  barChart2Ready = false;

  public pieChartOptions: ChartOptions = {
    responsive: true
  };
  pieChartLabels: Label[] = ['Occupied Rooms', 'Available Rooms'];
  pieChartData: SingleDataSet;
  pieChartLegend = true;
  pieChartPlugins = [];
  pieChartReady = false;

  pieChart2Labels: Label[];
  pieChart2Data: SingleDataSet;
  pieChart2Ready = false;

  hotelStats: HotelStatsModel = new HotelStatsModel();
  hotelId = localStorage.getItem('hotelId');
  timerObs = timer(0, 30000); timerSub;
  nowDateTime;
  revenueStats: BillingsModel[] = [];
  customerServiceStats: CustomerServiceStatsModel = new CustomerServiceStatsModel();
  activityCount: ActivityCountModel = new ActivityCountModel();
  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getHotelStatistics();
      this.getRevenueStats();
    });
    this.getCurrentDateTime();
    this.getCustomerServiceStats();
    this.getTotalActivityCount();
  }

  getHotelStatistics() {
    this.httpService.getHotelStats(`reports/${this.hotelId}/hotelStats`).subscribe(
      res => {
        this.hotelStats = res;
        this.pieChartData = [this.hotelStats.occupiedRooms, this.hotelStats.availableRooms];
        this.pieChartReady = true;
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
        this.pieChart2Labels = this.revenueStats.map(e => e.billedFor);
        this.pieChart2Data = this.revenueStats.map(e => e.totalRevenue);
        this.pieChart2Ready = true;
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
        this.barChart1Data = [
          {data: [this.customerServiceStats.roomService.unprocessed, this.customerServiceStats.laundryService.unprocessed,
              this.customerServiceStats.housekeeping.unprocessed, this.customerServiceStats.issuesComments.unprocessed],
            label: 'Unprocessed'},
          {data: [this.customerServiceStats.roomService.processing, this.customerServiceStats.laundryService.processing,
              this.customerServiceStats.housekeeping.processing, this.customerServiceStats.issuesComments.processing],
            label: 'Processing'},
          {data: [this.customerServiceStats.roomService.completed, this.customerServiceStats.laundryService.completed,
              this.customerServiceStats.issuesComments.completed, this.customerServiceStats.issuesComments.completed],
            label: 'Completed'}
        ];
        this.barChart1Ready = true;
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
        // console.log(this.activityCount);
        this.barChart2Data = [{data: [this.activityCount.numCheckIn, this.activityCount.numCheckOut, this.activityCount.numOfReservation,
            this.activityCount.numOfCancelledReservation, this.activityCount.numOfExtendStay, this.activityCount.numOfRoomsChanged]}];
        // this.barChart2Data = [{data: [10, 20, 15, 25, 15, 30]}];
        this.barChart2Ready = true;
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

  chartHovered(e) {

  }

  chartClicked(e) {

  }
}
