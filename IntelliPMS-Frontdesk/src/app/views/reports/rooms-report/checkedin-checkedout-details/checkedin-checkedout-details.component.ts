import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {CheckinOutModel} from '../../../../models/checkin-out.model';
import * as moment from 'moment';
import {timer} from 'rxjs';
import {ExportToCsv} from 'export-to-csv';

@Component({
  selector: 'app-checkedin-checkedout-details',
  templateUrl: './checkedin-checkedout-details.component.html',
  styleUrls: ['./checkedin-checkedout-details.component.css']
})
export class CheckedinCheckedoutDetailsComponent implements OnInit, OnDestroy {
  checkedInOutRooms: CheckinOutModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  startDate; endDate; nowDateTime;
  showNotice = true;
  timerObs = timer(0, 30000); timerSub;
  showExportError = false;
  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getCurrentDate();
      this.getCheckedInOutRoomsReport();
    });
  }

  getCheckedInOutRoomsReport() {
    const currentStartDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day - 1} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const currentEndDate = `${this.nowDateTime.year}-${this.nowDateTime.month}-${this.nowDateTime.day} ${this.nowDateTime.hour}:${this.nowDateTime.minute}:00`;
    const endPoint = `reports/${this.hotelId}/getCheckInOut?startDate=${currentStartDate}&endDate=${currentEndDate}`;
    this.getCheckedInReport(endPoint);
  }

  filterCheckedInRooms() {
    this.showNotice = false;
    this.timerSub.unsubscribe();
    let endPoint;
    let searchStart;
    let searchEnd;
    if (this.startDate && this.endDate) {
      searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getCheckInOut?startDate=${searchStart}&endDate=${searchEnd}`;
    } else if (this.startDate) {
      searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      endPoint = `reports/${this.hotelId}/getCheckInOut?startDate=${searchStart}`;
    } else {
      searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getCheckInOut?endDate=${searchEnd}`;
    }
    this.getCheckedInReport(endPoint);
  }

  getCheckedInReport(endPoint) {
    this.httpService.getCheckedInOutRoomsReport(endPoint).subscribe(
      res => {
        this.checkedInOutRooms = res;
        const checkInDate = this.checkedInOutRooms.map(obj => this.extractDateTime(obj.checkInDate));
        const checkOutDate = this.checkedInOutRooms.map(obj => this.extractDateTime(obj.checkOutDate));
        const actualCheckOutDate = this.checkedInOutRooms.map(obj => this.extractDateTime(obj.actualCheckOutDate));

        // tslint:disable-next-line:forin
        for (const i in this.checkedInOutRooms) {
          this.checkedInOutRooms[i].checkInDate = checkInDate[i];
          this.checkedInOutRooms[i].checkOutDate = checkOutDate[i];
          this.checkedInOutRooms[i].actualCheckOutDate = actualCheckOutDate[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  extractDateTime(dateTime) {
    if (dateTime === null) {
      return '-1';
    } else {
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

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

  exportDataToCsv() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'DAILY REVENUES REPORT',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(csvOptions);
    if (this.checkedInOutRooms.length === 0) {
      this.showExportError = true;
    } else {
      csvExporter.generateCsv(this.checkedInOutRooms);
    }
  }

  onAlertClosed() {
    this.showExportError = false;
  }

}
