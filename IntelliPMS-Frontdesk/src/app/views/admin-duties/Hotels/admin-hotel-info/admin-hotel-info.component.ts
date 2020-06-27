import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

import {HttpService} from '../../../../shared/http.service';
import {HotelModel} from '../../../../models/hotel.model';
import {ServiceModel} from '../../../../models/service.model';
import {RoomModel} from '../../../../models/room.model';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {RandomListsService} from '../../../../shared/random-lists.service';
import {RoomTypeModel} from '../../../../models/room-type.model';
import {BuildingModel} from '../../../../models/building.model';

@Component({
  selector: 'app-admin-hotel-info',
  templateUrl: './admin-hotel-info.component.html',
  styleUrls: ['./admin-hotel-info.component.css']
})
export class AdminHotelInfoComponent implements OnInit {
  attributes = [];
  services: ServiceModel = new ServiceModel();
  modalRef; imageUrl; hotelId; successChecker = false;
  getRoomError: any = ''; roomForm: FormGroup; roomPicture: File = null;
  hotelDetails: HotelModel = new HotelModel();
  roomsList: RoomModel[] = [];
  banksList = this.randomList.nigerianBanks;
  roomTypeDetail: RoomTypeModel = new RoomTypeModel();
  buildingDetail: BuildingModel = new BuildingModel();
  hotelRoomTypes: RoomTypeModel[] = [];
  hotelBuildings: BuildingModel[] = [];
  roomTypeChecker = false; buildingChecker = false;
  roomChecker = false;
  roomTypeBasePrice = 0;
  employeeId = localStorage.getItem('employeeId');
  icons = this.randomList.icons;
  processing = false;
  roomNumbersList; roomNumberConflict = false;
  roomTypesList; roomTypeConflict = false;

  constructor(private modalService: NgbModal,
              private httpService: HttpService,
              private route: ActivatedRoute,
              private randomList: RandomListsService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe( (params: Params) => {
      this.hotelId = params.hotelId;
      this.getHotelInfo(this.hotelId);
      this.getRooms();
    });

    this.route.queryParams.subscribe((qParams: Params) => {
      if (qParams.msg) {
        this.successChecker = true;
      }
    });

    this.roomForm = new FormGroup( {
      roomNumber: new FormControl(null, [Validators.required]),
      roomType: new FormControl(null, [Validators.required]),
      building: new FormControl(null, [Validators.required]),
      adjustedPrice: new FormControl(null, [
        Validators.required
      ]),
      attributes: new FormControl(null),
      picture: new FormControl(null)
    });
    this.getHotelBuildings();
    this.getHotelRoomTypes();
    this.getRoomNumbers();
    this.getRoomTypes();
  }

  addService() {
    this.processing = true;
    this.httpService.createService(`hotels/${this.hotelId}/createService`, this.services).subscribe(
      res => {
        this.processing = false;
        this.getHotelInfo(this.hotelId);
        this.services = new ServiceModel();
      }, err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  addRoomType() {
    this.processing = true;
    this.httpService.createRoomType(`hotels/${this.hotelId}/createRoomType`, this.roomTypeDetail).subscribe(
      res => {
        this.processing = false;
        this.roomTypeChecker = true;
        this.successChecker = false;
        this.buildingChecker = false;
        this.roomChecker = false;
        this.roomTypeDetail = new RoomTypeModel();
        this.getHotelRoomTypes();
        this.getRoomTypes();
      }, err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  addRoom() {
    this.processing = true;
    const roomData = new FormData();
    let roomAttributes;
    if (this.roomForm.value.attributes !== null) {
      roomAttributes = this.roomForm.value.attributes.map(i => {
        return i.value;
      });
      roomData.append('attributes', roomAttributes);
    }

    if (this.roomPicture !== null) {
      const roomPixName = this.roomForm.value.roomType + this.roomForm.value.roomNumber;
      roomData.append('picture', this.roomPicture, roomPixName);
    }

    roomData.append('roomNumber', this.roomForm.value.roomNumber);
    roomData.append('roomType', this.roomForm.value.roomType);
    roomData.append('adjustedPrice', this.roomForm.value.adjustedPrice);
    roomData.append('building', this.roomForm.value.building);
    roomData.append('createdBy', this.employeeId);

    this.httpService.createRoom(`hotels/${this.hotelId}/createRoom`, roomData).subscribe(
      res => {
        this.processing = false;
        this.getRooms();
        this.getRoomNumbers();
        this.getRoomTypes();
        this.roomForm.reset();
        this.imageUrl = '';
        this.roomTypeChecker = false;
        this.successChecker = false;
        this.buildingChecker = false;
        this.roomChecker = true;
      },
      err => {
        this.processing = false;
        console.log(err);
        this.imageUrl = '';
      }
    );
    this.modalRef.close();
  }

  addBuilding() {
    this.processing = true;
    this.httpService.createBuilding(`hotels/${this.hotelId}/createBuilding`, this.buildingDetail).subscribe(
      res => {
        this.processing = false;
        this.roomTypeChecker = false;
        this.successChecker = false;
        this.buildingChecker = true;
        this.buildingDetail = new BuildingModel();
        this.getHotelBuildings();
      }, err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result
      .then((result) => {
        this.roomForm.reset();
        }, (reason) => {
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

  getHotelInfo(hotelId) {
    this.httpService.getHotelInfo(`hotels/${hotelId}`).subscribe(
      res => {
        this.hotelDetails = res;
        // console.log(res);
      },
      err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.getRoomError = err.error.message;
          }
        }
      }
    );
  }

  getRooms() {
    this.httpService.getRooms(`hotels/${this.hotelId}/allRooms`).subscribe(
      res => {
        this.roomsList = res;
      },
      err => {
        console.log(err);
        /*if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.getRoomError = err.error.message;
            console.log(err.error.message);
          }
        }*/
      }
    );
  }

  getHotelRoomTypes() {
    this.httpService.getHotelRoomTypes(`hotels/${this.hotelId}/hotelRoomTypes`).subscribe(
      res => {
        this.hotelRoomTypes = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getRoomNumbers() {
    this.httpService.getRoomNumbersList(`hotels/${this.hotelId}/roomNumbers`).subscribe(
      res => {
        // @ts-ignore
        this.roomNumbersList = res.roomNumbers;
      },
      err => {
        console.log(err);
      }
    );
  }

  validateRoomNumber() {
    const roomNumber = this.roomForm.value.roomNumber;
    this.roomNumberConflict = this.roomNumbersList.indexOf(roomNumber) > -1;
  }

  getRoomTypes() {
    this.httpService.getRoomTypesList(`hotels/${this.hotelId}/roomTypes`).subscribe(
      res => {
        // @ts-ignore
        this.roomTypesList = res.roomtypes.map(e => e.toLowerCase());
      },
      err => {
        console.log(err);
      }
    );
  }

  validateRoomType() {
    const roomTypeName = this.roomTypeDetail.roomTypeName.toLowerCase();
    this.roomTypeConflict = this.roomTypesList.indexOf(roomTypeName) > -1;
  }

  onTypeChanged() {
    const typeId = this.roomForm.value.roomType;
    this.roomTypeBasePrice = this.hotelRoomTypes.filter(e => e.roomTypeId === +typeId)[0].basePrice;
  }

  getHotelBuildings() {
    this.httpService.getHotelBuildings(`hotels/${this.hotelId}/hotelBuildings`).subscribe(
      res => {
        this.hotelBuildings = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  closeRoomTypeAlert() {
    this.roomTypeChecker = false;
  }
  closeBuildingAlert() {
    this.buildingChecker = false;
  }

  closeCreateRoomAlert() {
    this.roomChecker = false;
  }

  get roomNumber() {
    return this.roomForm.get('roomNumber');
  }

  get roomType() {
    return this.roomForm.get('roomType');
  }

  get adjustedPrice() {
    return this.roomForm.get('adjustedPrice');
  }

  get building() {
    return this.roomForm.get('building');
  }

  get attributesList() {
    return this.roomForm.get('attributes');
  }
}
