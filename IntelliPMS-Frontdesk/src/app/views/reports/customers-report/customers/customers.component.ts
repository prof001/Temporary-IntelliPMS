import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {CustomerReportModel} from '../../../../models/customer-report.model';
import {ExportToCsv} from 'export-to-csv';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  constructor(private httpService: HttpService) { }
  customers: CustomerReportModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  showExportError = false;

  ngOnInit(): void {
    this.getCustomersList();
  }

  getCustomersList() {
    this.httpService.getCustomersList(`reports/${this.hotelId}/customers`).subscribe(
      res => {
        this.customers = res;
        const lastCheckIn = this.customers.map(obj => this.extractDateTime(obj.lastCheckIn));
        // tslint:disable-next-line:forin
        for (const i in this.customers) {
          // tslint:disable-next-line:max-line-length
          this.customers[i].totalRevenue = this.customers[i].roomRevenue + this.customers[i].laundryServiceRevenue +
            this.customers[i].roomServiceRevenue + this.customers[i].houseKeepingRevenue;
          this.customers[i].lastCheckIn = lastCheckIn[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  exportDataToCsv() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'CUSTOMERS REPORT',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(csvOptions);
    if (this.customers.length === 0) {
      this.showExportError = true;
    } else {
      csvExporter.generateCsv(this.customers);
    }
  }

  extractDateTime(dateTime) {
    if (dateTime === null || dateTime === undefined) {
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

  onAlertClosed() {
    this.showExportError = false;
  }
}
