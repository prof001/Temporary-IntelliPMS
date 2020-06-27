import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GuestsListComponent} from './guests-list/guests-list.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Guests'
    },
    children: [
      {
        path: '',
        redirectTo: 'guests-list'
      },
      {
        path: 'guests-list',
        component: GuestsListComponent,
        data: {
          title: 'Guests List'
        }
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuestsRoutingModule {}
