import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpService} from '../../../shared/http.service';
import {RoomModel} from '../../../models/room.model';

@Component({
  selector: 'app-room-info',
  templateUrl: './room-info.component.html',
  styleUrls: ['./room-info.component.css']
})
export class RoomInfoComponent implements OnInit {
  roomId; successChecker = false;
  roomGeneralInfo: RoomModel = new RoomModel();
  hotelId = localStorage.getItem('hotelId');

  constructor(private route: ActivatedRoute, private httpService: HttpService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.roomId = params.roomId;
      this.getRoomInfo(this.roomId);
    });

    this.route.queryParams.subscribe((qParams: Params) => {
      if (qParams.msg) {
        this.successChecker = true;
      }
    });
  }

  getRoomInfo(roomId) {
    this.httpService.getRoomInfo(`hotels/${this.hotelId}/rooms/${roomId}`).subscribe(
      res => {
        this.roomGeneralInfo = res;
      },
      err => {
        console.log(err);
      }
    );
  }

}
