import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import {TagInputModule} from 'ngx-chips';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { RoomInfoComponent } from './room-info/room-info.component';
import { EditRoomInfoComponent } from './edit-room-info/edit-room-info.component';
import {CommonModule} from '@angular/common';
import {AngularFileUploaderModule} from 'angular-file-uploader';
import {AlertModule, ProgressbarModule, TooltipModule} from 'ngx-bootstrap';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
      FormsModule,
      DashboardRoutingModule,
      BsDropdownModule,
      ButtonsModule.forRoot(),
      TagInputModule,
      ReactiveFormsModule,
      CommonModule,
      AngularFileUploaderModule,
      TooltipModule.forRoot(),
      ProgressbarModule.forRoot(),
      AlertModule.forRoot(),
      NgbDatepickerModule
    ],
  declarations: [
    DashboardComponent,
    RoomInfoComponent,
    EditRoomInfoComponent
  ],
  providers: [
  ]
})
export class DashboardModule { }
