import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {NgxPrintModule} from 'ngx-print';

import {GuestsRoutingModule} from './guests-routing.module';
import {GuestsListComponent} from './guests-list/guests-list.component';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {AlertModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GuestsRoutingModule,
    NgbDatepickerModule,
    NgxPrintModule,
    AlertModule.forRoot()
  ],
  declarations: [
    GuestsListComponent
  ]
})

export class GuestsModule {}
