import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import {PropertyDisplayComponent} from './views/property-display/property-display.component';
import {AuthGuard} from './shared/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'hotels',
    component: PropertyDisplayComponent,
    data: {
      title: 'Properties'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    canActivate: [AuthGuard],
    children: [
      {
        path: 'room',
        loadChildren: () => import('./views/room/room.module').then(m => m.RoomModule)
      },
      {
        path: 'guests',
        loadChildren: () => import('./views/guests/guests.module').then(m => m.GuestsModule)
      },
      {
        path: 'cash-register',
        loadChildren: () => import('./views/cash-register/cash-register.module').then(m => m.CashRegisterModule)
      },
      {
        path: 'customer-service',
        loadChildren: () => import('./views/customer-service/customer-service.module').then(m => m.CustomerServiceModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./views/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'admin-duties',
        loadChildren: () => import('./views/admin-duties/admin-duties.module').then(m => m.AdminDutiesModule)
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
