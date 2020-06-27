import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import {RoomInfoComponent} from './room-info/room-info.component';
import {EditRoomInfoComponent} from './edit-room-info/edit-room-info.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      title: 'Dashboard'
    }
  },
  {
    path: 'room-info/:roomId',
    component: RoomInfoComponent,
    data: {
      title: 'Room Info'
    }
  },
  {
    path: 'edit-room-info/:roomId',
    component: EditRoomInfoComponent,
    data: {
      title: 'Edit Room Info'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
