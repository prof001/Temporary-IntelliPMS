import { NgModule } from '@angular/core';
import { CreateHotelComponent } from './Hotels/create-hotel/create-hotel.component';
import { CreateEmployeeComponent } from './Employees/create-employee/create-employee.component';
import {AdminDutiesRoutingModule} from './admin-duties-routing.module';
import {AlertModule} from 'ngx-bootstrap';
import {CommonModule} from '@angular/common';
import { AdminHotelInfoComponent } from './Hotels/admin-hotel-info/admin-hotel-info.component';
import {TagInputModule} from 'ngx-chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EditHotelInfoComponent } from './Hotels/edit-hotel-info/edit-hotel-info.component';
import { HotelsListComponent } from './Hotels/hotels-list/hotels-list.component';
import { EmployeesListComponent } from './Employees/employees-list/employees-list.component';
import { EmployeesControlComponent } from './Employees/employees-control/employees-control.component';
import {MatchPasswordDirective} from '../../shared/match-password.directive';

@NgModule({
  imports: [
    AdminDutiesRoutingModule,
    AlertModule.forRoot(),
    CommonModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    CreateHotelComponent,
    CreateEmployeeComponent,
    AdminHotelInfoComponent,
    EditHotelInfoComponent,
    HotelsListComponent,
    EmployeesListComponent,
    EmployeesControlComponent,
    MatchPasswordDirective
  ],
  exports: [
    MatchPasswordDirective
  ]
})
export class AdminDutiesModule { }
