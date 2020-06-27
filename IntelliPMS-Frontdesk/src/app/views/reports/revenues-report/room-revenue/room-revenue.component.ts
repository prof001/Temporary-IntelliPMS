import {Component, OnDestroy, OnInit} from '@angular/core';
import {RevenueReportModel} from '../../../../models/revenue-report.model';
import {HttpService} from '../../../../shared/http.service';
import * as moment from 'moment';
import {timer} from 'rxjs';
import {ExportToCsv} from 'export-to-csv';

@Component({
  selector: 'app-room-revenue',
  templateUrl: './room-revenue.component.html',
  styleUrls: ['./room-revenue.component.css']
})
export class RoomRevenueComponent implements OnInit, OnDestroy {

  roomsList: RevenueReportModel[] = [];
  roomTypesList: RevenueReportModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  grandTotalRevenue: number;
  totalRoomRevenue: number;
  totalLaundryRevenue: number;
  totalRoomServiceRevenue: number;
  totalHouseKeepingRevenue: number;
  totalNumberCheckIn: number;
  grandAverageRevenue: number;
  startDate; endDate; nowDateTime;
  showNotice = true; showNotice2 = true;

  grandTotalRevenue2: number;
  totalRoomRevenue2: number;
  totalLaundryRevenue2: number;
  totalRoomServiceRevenue2: number;
  totalHouseKeepingRevenue2: number;
  totalNumberCheckIn2: number;
  grandAverageRevenue2: number;
  startDate2; endDate2;
  timerObs = timer(0, 30000); timerSub;
  showExportError = false;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getCurrentDate();
      this.getInitialRoomRevenueReport();
      this.getInitialRoomTypeRevenueReport();
    });
  }

  getInitialRoomRevenueReport() {
    const currentStartDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const currentEndDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endPoint = `reports/${this.hotelId}/getRoomRevenue?startDate=${currentStartDate}&endDate=${currentEndDate}`;
    this.getRoomsReports(endPoint);
  }

  filterRoomRevenueReport() {
    this.showNotice = false;
    this.timerSub.unsubscribe();
    let endPoint;
    let searchStart;
    let searchEnd;
    if (this.startDate && this.endDate) {
      searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getRoomRevenue?startDate=${searchStart}&endDate=${searchEnd}`;
    } else if (this.startDate) {
      searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      endPoint = `reports/${this.hotelId}/getRoomRevenue?startDate=${searchStart}`;
    } else {
      searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getRoomRevenue?endDate=${searchEnd}`;
    }
    this.getRoomsReports(endPoint);
  }

  getRoomsReports(endPoint) {
    this.httpService.getRevenueReport(endPoint).subscribe(
      res => {
        this.roomsList = res;
        // tslint:disable-next-line:forin
        for (const i in this.roomsList) {
          this.roomsList[i].totalRevenue = this.roomsList[i].roomServiceRevenue + this.roomsList[i].laundryServiceRevenue
            + this.roomsList[i].roomRevenue + this.roomsList[i].houseKeepingRevenue;
          this.roomsList[i].averageRevenue = this.roomsList[i].totalRevenue / this.roomsList[i].numberCheckedIn;
        }
        this.grandTotalRevenue = this.roomsList.reduce((a, b) => a + b.totalRevenue, 0);
        this.totalRoomRevenue = this.roomsList.reduce((a, b) => a + b.roomRevenue, 0);
        this.totalLaundryRevenue = this.roomsList.reduce((a, b) => a + b.laundryServiceRevenue, 0);
        this.totalRoomServiceRevenue = this.roomsList.reduce((a, b) => a + b.roomServiceRevenue, 0);
        this.totalHouseKeepingRevenue = this.roomsList.reduce((a, b) => a + b.houseKeepingRevenue, 0);
        this.totalNumberCheckIn = this.roomsList.reduce((a, b) => a + b.numberCheckedIn, 0);
        this.grandAverageRevenue = Math.floor(this.grandTotalRevenue / this.totalNumberCheckIn);
      },
      err => {
        console.log(err);
      }
    );
  }

  getInitialRoomTypeRevenueReport() {
    const currentStartDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const currentEndDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endPoint = `reports/${this.hotelId}/getRoomTypeRevenue?startDate=${currentStartDate}&endDate=${currentEndDate}`;
    this.getRoomTypesReport(endPoint);
  }

  filterRoomTypeReport() {
    this.showNotice2 = false;
    this.timerSub.unsubscribe();
    let endPoint;
    let searchStart;
    let searchEnd;
    if (this.startDate2 && this.endDate2) {
      searchStart = `${this.startDate2.year}-${this.startDate2.month}-${this.startDate2.day} 00:00:01`;
      searchEnd = `${this.endDate2.year}-${this.endDate2.month}-${this.endDate2.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getRoomTypeRevenue?startDate=${searchStart}&endDate=${searchEnd}`;
    } else if (this.startDate2) {
      searchStart = `${this.startDate2.year}-${this.startDate2.month}-${this.startDate2.day} 00:00:01`;
      endPoint = `reports/${this.hotelId}/getRoomTypeRevenue?startDate=${searchStart}`;
    } else {
      searchEnd = `${this.endDate2.year}-${this.endDate2.month}-${this.endDate2.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getRoomTypeRevenue?endDate=${searchEnd}`;
    }
    this.getRoomTypesReport(endPoint);
  }

  getRoomTypesReport(endPoint) {
    this.httpService.getRevenueReport(endPoint).subscribe(
      res => {
        this.roomTypesList = res;
        // tslint:disable-next-line:forin
        for (const i in this.roomTypesList) {
          this.roomTypesList[i].totalRevenue = this.roomTypesList[i].roomServiceRevenue + this.roomTypesList[i].laundryServiceRevenue
            + this.roomTypesList[i].roomRevenue + this.roomTypesList[i].houseKeepingRevenue;
          const typesAvg = this.roomTypesList[i].totalRevenue / this.roomTypesList[i].numberCheckedIn;
          if (!isNaN(typesAvg)) {
            this.roomTypesList[i].averageRevenue = typesAvg;
          } else {
            this.roomTypesList[i].averageRevenue = 0;
          }
        }

        this.grandTotalRevenue2 = this.roomTypesList.reduce((a, b) => a + b.totalRevenue, 0);
        this.totalRoomRevenue2 = this.roomTypesList.reduce((a, b) => a + b.roomRevenue, 0);
        this.totalLaundryRevenue2 = this.roomTypesList.reduce((a, b) => a + b.laundryServiceRevenue, 0);
        this.totalRoomServiceRevenue2 = this.roomTypesList.reduce((a, b) => a + b.roomServiceRevenue, 0);
        this.totalHouseKeepingRevenue2 = this.roomTypesList.reduce((a, b) => a + b.houseKeepingRevenue, 0);
        this.totalNumberCheckIn2 = this.roomTypesList.reduce((a, b) => a + b.numberCheckedIn, 0);
        const tempAvg = Math.floor(this.grandTotalRevenue2 / this.totalNumberCheckIn2);
        if (!isNaN(tempAvg)) {
          this.grandAverageRevenue2 = tempAvg;
        } else {
          this.grandAverageRevenue2 = 0;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getCurrentDate() {
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

  exportDataToCsv1() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'ROOM REVENUES REPORT',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(csvOptions);
    if (this.roomsList.length === 0) {
      this.showExportError = true;
    } else {
      csvExporter.generateCsv(this.roomsList);
    }
  }

  exportDataToCsv2() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'ROOM TYPES REVENUES REPORT',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(csvOptions);
    if (this.roomTypesList.length === 0) {
      this.showExportError = true;
    } else {
      csvExporter.generateCsv(this.roomTypesList);
    }
  }

  onAlertClosed() {
    this.showExportError = false;
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

}
