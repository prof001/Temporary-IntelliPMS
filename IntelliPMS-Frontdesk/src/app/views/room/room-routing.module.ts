import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CheckinComponent} from './checkin/checkin.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {CancelReservationComponent} from './cancel-reservation/cancel-reservation.component';
import {MakeReservationComponent} from './make-reservation/make-reservation.component';
import {BalanceBillsComponent} from './balance-bills/balance-bills.component';
import {ReservationCheckinComponent} from './reservation-checkin/reservation-checkin.component';
import {SelectRoomComponent} from './select-room/select-room.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Room'
    },
    children: [
      {
        path: 'checkin',
        component: SelectRoomComponent,
        data: {
          title: 'Check in'
        }
      },
      {
        path: 'checkin/:roomId',
        component: CheckinComponent,
        data: {
          title: 'Check in'
        }
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        data: {
          title: 'Check out'
        }
      },
      {
        path: 'make-reservation',
        component: MakeReservationComponent,
        data: {
          title: 'Make Reservation'
        }
      },
      {
        path: 'reservations',
        component: CancelReservationComponent,
        data: {
          title: 'Reservations'
        }
      },
      {
        path: 'balance-bills/:checkInId/:roomId',
        component: BalanceBillsComponent,
        data: {
          title: 'Balance Bills'
        }
      },
      {
        path: 'reservation/:reservationId',
        component: ReservationCheckinComponent,
        data: {
          title: 'Reservation Checkin'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomRoutingModule {}
