import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {OverviewComponent} from './overview/overview.component';
import {GraphicalOverviewComponent} from './graphical-overview/graphical-overview.component';
import {RoomsReportComponent} from './rooms-report/rooms-report.component';
import {RevenuesReportComponent} from './revenues-report/revenues-report.component';
import {RoomStatusComponent} from './rooms-report/room-status/room-status.component';
import {CheckedinCheckedoutDetailsComponent} from './rooms-report/checkedin-checkedout-details/checkedin-checkedout-details.component';
import {CheckedinRoomComponent} from './rooms-report/checkedin-room/checkedin-room.component';
import {RoomRevenueComponent} from './revenues-report/room-revenue/room-revenue.component';
import {DailyRevenueComponent} from './revenues-report/daily-revenue/daily-revenue.component';
import {SalesAvenueRevenueComponent} from './revenues-report/sales-avenue-revenue/sales-avenue-revenue.component';
import {CustomersComponent} from './customers-report/customers/customers.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Reports'
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent,
        data: {
          title: 'Overview'
        }
      },
      {
        path: 'graphical-overview',
        component: GraphicalOverviewComponent,
        data: {
          title: 'Graphical Overview'
        }
      },
      {
        path: 'rooms-report',
        component: RoomsReportComponent,
        data: {
          title: 'Rooms Report'
        }
      },
      {
        path: 'rooms-report/room-status',
        component: RoomStatusComponent,
        data: {
          title: 'Rooms Status'
        }
      },
      {
        path: 'rooms-report/checkedin',
        component: CheckedinRoomComponent,
        data: {
          title: 'Checked-in Rooms'
        }
      },
      {
        path: 'rooms-report/checkedin-checkedout',
        component: CheckedinCheckedoutDetailsComponent,
        data: {
          title: 'Room Status'
        }
      },
      {
        path: 'revenues-report',
        component: RevenuesReportComponent,
        data: {
          title: 'Revenues Report'
        }
      },
      {
        path: 'revenues-report/room-revenue',
        component: RoomRevenueComponent,
        data: {
          title: 'Room Revenue'
        }
      },
      {
        path: 'revenues-report/daily-revenue',
        component: DailyRevenueComponent,
        data: {
          title: 'Daily Revenue'
        }
      },
      {
        path: 'customers-report'
      },
      {
        path: 'revenues-report/sales-avenue-revenue',
        component: SalesAvenueRevenueComponent,
        data: {
          title: 'Sales Avenue Revenue'
        }
      },
      {
        path: 'customers-report/customers',
        component: CustomersComponent,
        data: {
          title: 'Customers Reports'
        }
      }
    ]
  }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReportsRoutingModule {}
