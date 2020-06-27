import {Component, OnDestroy, OnInit} from '@angular/core';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {RevenueReportModel} from '../../../../models/revenue-report.model';
import {HttpService} from '../../../../shared/http.service';
import * as moment from 'moment';
import {timer} from 'rxjs';
import {ExportToCsv} from 'export-to-csv';

@Component({
  selector: 'app-daily-revenue',
  templateUrl: './daily-revenue.component.html',
  styleUrls: ['./daily-revenue.component.css']
})
export class DailyRevenueComponent implements OnInit, OnDestroy {
  mainChartElements = 27;
  mainChartData1: Array<number> = [];
  radioModel: string = 'Month';
  startDate;
  endDate;

  mainChartData: Array<any> = [
    {
      data: this.mainChartData1,
      label: 'Current'
    }
  ];
  /* tslint:disable:max-line-length */
  mainChartLabels: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Thursday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  /* tslint:enable:max-line-length */
  mainChartOptions: any = {
    tooltips: {
      enabled: false,
      custom: CustomTooltips,
      intersect: true,
      mode: 'index',
      position: 'nearest',
      callbacks: {
        labelColor: function(tooltipItem, chart) {
          return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return value.charAt(0);
          }
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5),
          max: 250
        }
      }]
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      }
    },
    legend: {
      display: false
    }
  };
  public mainChartColours: Array<any> = [
    { // brandInfo
      backgroundColor: '#EFF9FC',
      borderColor: '#63C2DE',
      pointHoverBackgroundColor: '#fff'
    },
  ];
  public mainChartLegend = false;
  public mainChartType = 'line';

  revenuesList: RevenueReportModel[] = [];
  showNotice = true;
  nowDate;
  hotelId = localStorage.getItem('hotelId');
  grandTotalRevenue: number;
  totalRoomRevenue: number;
  totalLaundryRevenue: number;
  totalRoomServiceRevenue: number;
  totalHouseKeepingRevenue: number;
  timerObs = timer(0, 30000); timerSub;
  searchStart; searchEnd;
  showExportError = false;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    for (let i = 0; i <= this.mainChartElements; i++) {
      this.mainChartData1.push(this.random(50, 200));
    }
    this.timerSub = this.timerObs.subscribe(val => {
      this.getCurrentDate();
      this.getDailyRevenues();
    });
  }

  getDailyRevenues() {
    const nowDateStart = `${this.nowDate.year}-${this.nowDate.month}-${this.nowDate.day} 00:00:01`;
    const nowDateEnd = `${this.nowDate.year}-${this.nowDate.month}-${this.nowDate.day} 23:59:59`;
    const endPoint = `reports/${this.hotelId}/getDailyRevenue?startDate=${nowDateStart}&endDate=${nowDateEnd}`;
    this.getReport(endPoint);
  }

  filterDailyRevenue() {
    this.showNotice = false;
    this.timerSub.unsubscribe();
    let endPoint;
    if (this.startDate && this.endDate) {
      this.searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      this.searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getDailyRevenue?startDate=${this.searchStart}&endDate=${this.searchEnd}`;
    } else if (this.startDate) {
      this.searchStart = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 00:00:01`;
      endPoint = `reports/${this.hotelId}/getDailyRevenue?startDate=${this.searchStart}`;
    } else {
      this.searchEnd = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 23:59:59`;
      endPoint = `reports/${this.hotelId}/getDailyRevenue?endDate=${this.searchEnd}`;
    }
    this.getReport(endPoint);
  }

  getReport(endPoint) {
    this.httpService.getRevenueReport(endPoint).subscribe(
      res => {
        this.revenuesList = res;

        // tslint:disable-next-line:forin
        for (const i in this.revenuesList) {
          this.revenuesList[i].totalRevenue = this.revenuesList[i].roomServiceRevenue + this.revenuesList[i].laundryServiceRevenue
            + this.revenuesList[i].roomRevenue + this.revenuesList[i].houseKeepingRevenue;
        }
        this.grandTotalRevenue = this.revenuesList.reduce((a, b) => a + b.totalRevenue, 0);
        this.totalHouseKeepingRevenue = this.revenuesList.reduce((a, b) => a + b.houseKeepingRevenue, 0);
        this.totalLaundryRevenue = this.revenuesList.reduce((a, b) => a + b.laundryServiceRevenue, 0);
        this.totalRoomRevenue = this.revenuesList.reduce((a, b) => a + b.roomRevenue, 0);
        this.totalRoomServiceRevenue = this.revenuesList.reduce((a, b) => a + b.roomServiceRevenue, 0);
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

    this.nowDate = {
      year: currentDateTimeArray[0],
      month: currentDateTimeArray[1],
      day: currentDateTimeArray[2]
    };
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
    if (this.revenuesList.length === 0) {
      this.showExportError = true;
    } else {
      csvExporter.generateCsv(this.revenuesList);
    }
  }

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  onAlertClosed() {
    this.showExportError = false;
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

}
