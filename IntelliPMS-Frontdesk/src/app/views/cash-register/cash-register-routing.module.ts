import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ManageCashRegisterComponent} from './manage-cash-register/manage-cash-register.component';
import {CashRegisterAuditComponent} from './cash-register-audit/cash-register-audit.component';
import {PaymentComponent} from './payment/payment.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Cash Register'
    },
    children: [
      {
        path: 'manage-cash-register',
        component: ManageCashRegisterComponent,
        data: {
          title: 'Manage Cash Register'
        }
      },
      {
        path: 'cash-register-audit',
        component: CashRegisterAuditComponent,
        data: {
          title: 'Cash Register Audit'
        }
      },
      {
        path: 'payment/:checkInId',
        component: PaymentComponent
      }
    ]
  }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashRegisterRoutingModule {}
