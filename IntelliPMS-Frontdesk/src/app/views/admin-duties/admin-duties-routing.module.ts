import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateHotelComponent} from './Hotels/create-hotel/create-hotel.component';
import {CreateEmployeeComponent} from './Employees/create-employee/create-employee.component';
import {AdminHotelInfoComponent} from './Hotels/admin-hotel-info/admin-hotel-info.component';
import {EditHotelInfoComponent} from './Hotels/edit-hotel-info/edit-hotel-info.component';
import {HotelsListComponent} from './Hotels/hotels-list/hotels-list.component';
import {EmployeesListComponent} from './Employees/employees-list/employees-list.component';
import {EmployeesControlComponent} from './Employees/employees-control/employees-control.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Admin Duties'
    },
    children: [
      {
        path: '',
        redirectTo: 'create-hotel',
        pathMatch: 'full'
      },
      {
        path: 'create-hotel',
        component: CreateHotelComponent,
        data: {
          title: 'Create Hotel'
        }
      },
      {
        path: 'hotels-list',
        component: HotelsListComponent,
        data: {
          title: 'Hotels List'
        }
      },
      {
        path: 'employees',
        component: EmployeesListComponent,
        data: {
          title: 'Employees'
        }
      },
      {
        path: 'create-employee',
        component: CreateEmployeeComponent,
        data: {
          title: 'Create Employee'
        }
      },
      {
        path: 'employees-control',
        component: EmployeesControlComponent,
        data: {
          title: 'Employees Control'
        }
      },
      {
        path: 'hotel-info/:hotelId',
        component: AdminHotelInfoComponent,
        data: {
          title: 'Hotel Info'
        }
      },
      {
        path: 'hotel-info/:hotelId/edit',
        component: EditHotelInfoComponent,
        data: {
          title: 'Edit Hotel Info'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDutiesRoutingModule {}
