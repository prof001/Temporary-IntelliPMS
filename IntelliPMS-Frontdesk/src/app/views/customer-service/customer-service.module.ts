import { NgModule } from '@angular/core';
import {CustomerServiceRoutingModule} from './customer-service-routing.module';
import { LaundryServiceComponent } from './laundry-service/laundry-service.component';
import { HousekeepingComponent } from './housekeeping/housekeeping.component';
import { RoomServiceComponent } from './room-service/room-service.component';
import { IssuesCommentsComponent } from './issues-comments/issues-comments.component';
import {CommonModule} from '@angular/common';
import {AlertModule, TabsModule, TooltipModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDatepickerModule, NgbTimepickerModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {GuestNameValidatorDirective} from '../../shared/guest-name-validator.directive';
import {MinAmountDirective} from '../../shared/min-amount.directive';

@NgModule({
    imports: [
        CustomerServiceRoutingModule,
        CommonModule,
        TabsModule,
        FormsModule,
        NgbDatepickerModule,
        NgbTimepickerModule,
        AlertModule.forRoot(),
        TooltipModule,
        NgbTooltipModule,
        ReactiveFormsModule
    ],
  declarations: [
    LaundryServiceComponent,
    HousekeepingComponent,
    RoomServiceComponent,
    IssuesCommentsComponent,
    GuestNameValidatorDirective,
  ],
  exports: [
    GuestNameValidatorDirective,
  ]
})
export class CustomerServiceModule {}
