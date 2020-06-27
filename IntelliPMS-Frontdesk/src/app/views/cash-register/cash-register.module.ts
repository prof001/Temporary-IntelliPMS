import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgModule } from '@angular/core';

import {CashRegisterRoutingModule} from './cash-register-routing.module';
import { CashRegisterAuditComponent } from './cash-register-audit/cash-register-audit.component';
import { ManageCashRegisterComponent } from './manage-cash-register/manage-cash-register.component';
import {AlertModule, TabsModule} from 'ngx-bootstrap';
import { PaymentComponent } from './payment/payment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CashRegisterRoutingModule,
    TabsModule,
    AlertModule,
    ReactiveFormsModule
  ],
  declarations: [
    CashRegisterAuditComponent,
    ManageCashRegisterComponent,
    PaymentComponent
  ]
})
export class CashRegisterModule {}
