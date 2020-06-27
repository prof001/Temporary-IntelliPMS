import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../../shared/http.service';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-edit-hotel-info',
  templateUrl: './edit-hotel-info.component.html',
  styleUrls: ['./edit-hotel-info.component.css']
})
export class EditHotelInfoComponent implements OnInit {
  imageUrl: string | ArrayBuffer;
  display = false; hotelId;
  form: FormGroup;
  hotelPicture: File = null;

  constructor(private httpService: HttpService, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.hotelId = params.hotelId;
    });

    this.form = new FormGroup({
      hotelName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      numOfRooms: new FormControl(null, {
        validators: [Validators.required]
      }),
      address: new FormControl(null, {
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      picture: new FormControl(null)
    });
    this.getHotelInfo();
  }

  getHotelInfo() {
    this.httpService.getHotelInfo(`hotels/${this.hotelId}`).subscribe(
      res => {
        this.form.setValue({
          hotelName: res.hotelName,
          numOfRooms: res.numOfRooms,
          address: res.address,
          location: res.location,
          picture: res.picture
        });
        this.imageUrl = res.picture;
      },
      err => {
        console.log(err);
      }
    );
  }

  // TODO This is sending empty formdata to the backend
  onSave() {
    // console.log(this.form.value);
    const hotelData = new FormData();
    hotelData.append('hotelName', this.form.value.hotelName);
    hotelData.append('numOfRooms', this.form.value.numOfRooms);
    hotelData.append('address', this.form.value.address);
    hotelData.append('location', this.form.value.location);

    if (this.hotelPicture !== null) {
      hotelData.append('picture', this.hotelPicture, this.form.value.hotelName);
    }
    // console.log(hotelData);

    this.httpService.editHotelInfo(`hotels/${this.hotelId}/edit`, hotelData).subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  showPreview(event) {
    this.hotelPicture = (event.target as HTMLInputElement).files[0];
    console.log(this.hotelPicture);
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(this.hotelPicture);
  }

  get hotelName() {
    return this.form.get('hotelName');
  }

  get numOfRooms() {
    return this.form.get('numOfRooms');
  }

  get address() {
    return this.form.get('address');
  }

  get location() {
    return this.form.get('location');
  }

  get picture() {
    return this.form.get('picture');
  }

}
