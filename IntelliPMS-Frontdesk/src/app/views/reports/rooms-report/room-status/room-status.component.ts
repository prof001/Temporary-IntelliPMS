import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/http.service';
import {RoomModel} from '../../../../models/room.model';
import {timer} from 'rxjs';


@Component({
  selector: 'app-room-status',
  templateUrl: './room-status.component.html',
  styleUrls: ['./room-status.component.css']
})
export class RoomStatusComponent implements OnInit, OnDestroy {
  roomReports: RoomModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  timerObs = timer(0, 30000); timerSub;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.getRoomStatusReport();
    });
  }

  getRoomStatusReport() {
    this.httpService.getRoomStatusReport(`reports/${this.hotelId}/getRoomStatus`).subscribe(
      res => {
        this.roomReports = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }

}
