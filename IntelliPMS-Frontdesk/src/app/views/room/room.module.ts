// Angular
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgModule } from '@angular/core';

// Tabs Component
import { TabsModule } from 'ngx-bootstrap/tabs';

// Carousel Component
import { CarouselModule } from 'ngx-bootstrap/carousel';

// Collapse Component
import { CollapseModule } from 'ngx-bootstrap/collapse';

// Dropdowns Component
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// Pagination Component
import { PaginationModule } from 'ngx-bootstrap/pagination';

// Popover Component
import { PopoverModule } from 'ngx-bootstrap/popover';

// Progress Component
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

// Tooltip Component
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Components Routing
import { RoomRoutingModule } from './room-routing.module';
import { CheckinComponent } from './checkin/checkin.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CancelReservationComponent } from './cancel-reservation/cancel-reservation.component';
import {NgbDatepickerModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { MakeReservationComponent } from './make-reservation/make-reservation.component';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {PhoneNumberDirective} from '../../shared/phone-number.directive';
import {EmailDirective} from '../../shared/email.directive';
import {AlertModule} from 'ngx-bootstrap';
import {ValidateTakenEmailDirective} from '../../shared/taken-email.directive';
import {MinAmountDirective} from '../../shared/min-amount.directive';
import { BalanceBillsComponent } from './balance-bills/balance-bills.component';
import { ReservationCheckinComponent } from './reservation-checkin/reservation-checkin.component';
import { SelectRoomComponent } from './select-room/select-room.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RoomRoutingModule,
        BsDropdownModule.forRoot(),
        TabsModule,
        CarouselModule.forRoot(),
        CollapseModule.forRoot(),
        PaginationModule.forRoot(),
        PopoverModule.forRoot(),
        ProgressbarModule.forRoot(),
        TooltipModule.forRoot(),
        NgbDatepickerModule,
        NgbTimepickerModule,
        SweetAlert2Module.forRoot(),
        AlertModule.forRoot()
    ],
  declarations: [
    CheckinComponent,
    CheckoutComponent,
    CancelReservationComponent,
    MakeReservationComponent,
    PhoneNumberDirective,
    EmailDirective,
    ValidateTakenEmailDirective,
    MinAmountDirective,
    BalanceBillsComponent,
    ReservationCheckinComponent,
    SelectRoomComponent,
  ],
  exports: [
    PhoneNumberDirective,
    EmailDirective,
    ValidateTakenEmailDirective,
    MinAmountDirective
  ]
})
export class RoomModule { }
