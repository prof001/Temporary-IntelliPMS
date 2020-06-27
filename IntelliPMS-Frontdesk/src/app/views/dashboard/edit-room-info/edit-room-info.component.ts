import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../shared/http.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {RoomTypeModel} from '../../../models/room-type.model';

@Component({
  selector: 'app-edit-room-info',
  templateUrl: './edit-room-info.component.html',
  styleUrls: ['./edit-room-info.component.css']
})
export class EditRoomInfoComponent implements OnInit {
  imageUrl: string;
  roomForm: FormGroup; roomPicture;
  roomId;
  hotelId = localStorage.getItem('hotelId');
  hotelRoomTypes: RoomTypeModel[] = [];
  processing = false;

  constructor(private httpService: HttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.roomId = params.roomId;
      this.getRoomInfo(this.roomId);
      this.getRoomTypes();
    });
    this.roomForm = new FormGroup({
      roomNumber: new FormControl(null, [Validators.required]),
      roomType: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      attributes: new FormControl(null, [Validators.required])
    });
  }

  showPreview(event) {
    this.roomPicture = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(this.roomPicture);
  }

  getRoomTypes() {
    this.httpService.getHotelRoomTypes(`hotels/${this.hotelId}/hotelRoomTypes`).subscribe(
      res => {
        this.hotelRoomTypes = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getRoomInfo(roomId) {
    this.httpService.getRoomInfo(`hotels/${this.hotelId}/rooms/${roomId}`).subscribe(
      res => {
        this.roomForm.setValue({
          roomNumber: res.roomNumber,
          roomType: res.roomTypeId,
          cost: res.cost,
          attributes: res.attributes,
        });
        this.imageUrl = res.picture;
      },
      err => {
        console.log(err);
      }
    );
  }

  updateRoomInfo() {
    const roomData = new FormData();
    let roomAttributes;
    roomAttributes = this.roomForm.value.attributes.map(i => {
      if (!i.value) return i;
      else return i.value;
    });
    const roomName = this.roomForm.value.roomType + this.roomForm.value.roomNumber;

    roomData.append('roomNumber', this.roomForm.value.roomNumber);
    roomData.append('roomType', this.roomForm.value.roomType);
    roomData.append('cost', this.roomForm.value.cost);
    roomData.append('attributes', roomAttributes);
    if (this.roomPicture !== undefined) {
      roomData.append('picture', this.roomPicture, roomName);
    }
    this.processing = true;

    this.httpService.editRoomInfo(`hotels/${this.hotelId}/rooms/${this.roomId}`, roomData).subscribe(
      res => {
        // console.log(res);
        this.router.navigate(['/dashboard/room-info', this.roomId], {queryParams: {msg: 'updated'}});
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  get roomNumber() {
    return this.roomForm.get('roomNumber');
  }

  get roomType() {
    return this.roomForm.get('roomType');
  }

  get cost() {
    return this.roomForm.get('cost');
  }

  get attributes() {
    return this.roomForm.get('attributes');
  }

}
