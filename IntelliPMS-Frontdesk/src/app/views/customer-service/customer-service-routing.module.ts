import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LaundryServiceComponent} from './laundry-service/laundry-service.component';
import {HousekeepingComponent} from './housekeeping/housekeeping.component';
import {RoomServiceComponent} from './room-service/room-service.component';
import {IssuesCommentsComponent} from './issues-comments/issues-comments.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'laundry-service'
  },
  {
    path: 'laundry-service',
    component: LaundryServiceComponent,
    data: {
      title: 'Laundry Service'
    }
  },
  {
    path: 'housekeeping',
    component: HousekeepingComponent,
    data: {
      title: 'House Keeping'
    }
  },
  {
    path: 'room-service',
    component: RoomServiceComponent,
    data: {
      title: 'Room Service'
    }
  },
  {
    path: 'issues-comments',
    component: IssuesCommentsComponent,
    data: {
      title: 'Issues and Comments'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerServiceRoutingModule { }
