import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import {ReportsRoutingModule} from './reports-routing.module';

import { OverviewComponent } from './overview/overview.component';
import {AlertModule, ButtonsModule, PaginationModule, TabsModule} from 'ngx-bootstrap';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { GraphicalOverviewComponent } from './graphical-overview/graphical-overview.component';
import {ChartsModule} from 'ng2-charts';
import { RoomsReportComponent } from './rooms-report/rooms-report.component';
import { RevenuesReportComponent } from './revenues-report/revenues-report.component';
import { RoomRevenueComponent } from './revenues-report/room-revenue/room-revenue.component';
import { DailyRevenueComponent } from './revenues-report/daily-revenue/daily-revenue.component';
import { SalesAvenueRevenueComponent } from './revenues-report/sales-avenue-revenue/sales-avenue-revenue.component';
import { CheckedinRoomComponent } from './rooms-report/checkedin-room/checkedin-room.component';
import { CheckedinCheckedoutDetailsComponent } from './rooms-report/checkedin-checkedout-details/checkedin-checkedout-details.component';
import {RoomStatusComponent} from './rooms-report/room-status/room-status.component';
import { CustomersComponent } from './customers-report/customers/customers.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReportsRoutingModule,
        TabsModule,
        NgbDatepickerModule,
        ChartsModule,
        PaginationModule,
        ButtonsModule,
        AlertModule
    ],
  declarations: [
    OverviewComponent,
    GraphicalOverviewComponent,
    RoomsReportComponent,
    RevenuesReportComponent,
    RoomRevenueComponent,
    DailyRevenueComponent,
    SalesAvenueRevenueComponent,
    RoomStatusComponent,
    CheckedinRoomComponent,
    CheckedinCheckedoutDetailsComponent,
    CustomersComponent,
  ]
})

export class ReportsModule {}
