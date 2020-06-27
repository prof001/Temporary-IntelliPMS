import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HouseKeepingModel} from '../../../models/housekeeping.model';
import {HttpService} from '../../../shared/http.service';
import {CheckinOutModel} from '../../../models/checkin-out.model';
import {ServiceModel} from '../../../models/service.model';
import {formatDate} from '@angular/common';
import {RandomListsService} from '../../../shared/random-lists.service';

@Component({
  selector: 'app-housekeeping',
  templateUrl: './housekeeping.component.html',
  styleUrls: ['./housekeeping.component.css']
})
export class HousekeepingComponent implements OnInit {
  itemsForm: FormGroup;
  itemsFormArray: FormArray;
  guestName;
  unprocessedHousekeepingRequest: HouseKeepingModel[] = [];
  processingHousekeepingRequest: HouseKeepingModel[] = [];
  completedHousekeepingRequest: HouseKeepingModel[] = [];
  checkedInRooms: CheckinOutModel[] = [];
  houseKeepingRequest: HouseKeepingModel = new HouseKeepingModel();
  chosenRoom: CheckinOutModel = new CheckinOutModel();
  hotelServices: ServiceModel[] = [];
  unprocessedHousekeepingNum;
  modalRef;
  totalCost = 0;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  processing = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private randomList: RandomListsService) { }

  ngOnInit(): void {
    this.itemsForm = this.formBuilder.group({
      itemDetail: this.formBuilder.array([
        this.item()
      ])
    });
    this.getCurrentCheckedInRooms();
    this.getHouseKeepingServices();
    this.getUnprocessedHousekeepingRequest();
    this.getProcessingHousekeepingRequest();
    this.getCompletedHousekeepingRequest();
    this.countUnprocessedRequests();
    this.houseKeepingRequest.paymentStatus = 'unpaid';
  }

  item(): FormGroup {
    return this.formBuilder.group({
      itemName: [null, Validators.required],
      quantity: [null, Validators.required]
    });
  }

  addItem(): void {
    this.itemsFormArray = this.itemsForm.get('itemDetail') as FormArray;
    this.itemsFormArray.push(this.item());
    this.calculateTotalAmount();
  }

  removeItem(i: number){
    this.itemsFormArray = this.itemsForm.get('itemDetail') as FormArray;
    this.itemsFormArray.removeAt(i);
    this.calculateTotalAmount();
  }

  getGuestsName() {
    this.chosenRoom = this.checkedInRooms.filter(e => e.roomId === +this.houseKeepingRequest.roomId)[0];
    if (this.chosenRoom.currentOccupant !== null) {
      this.houseKeepingRequest.guestName = this.chosenRoom.currentOccupant;
    } else {
      this.houseKeepingRequest.guestName = 'Multiple Occupants';
    }
  }

  getCurrentCheckedInRooms() {
    this.httpService.getCurrentCheckedInRooms(`hotels/${this.hotelId}/currentCheckInRooms`).subscribe(
      res => {
        this.checkedInRooms = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getHouseKeepingServices() {
    this.httpService.getHotelServices(`hotels/${this.hotelId}/services?serviceType=housekeeping`).subscribe(
      res => {
        this.hotelServices = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getUnprocessedHousekeepingRequest() {
    this.httpService.getHousekeepingList(`customer-service/${this.hotelId}/housekeeping?statuss=unprocessed`).subscribe(
      res => {
        this.unprocessedHousekeepingRequest = res;
        const createdDateTime = this.unprocessedHousekeepingRequest.map(obj => this.extractDateTime(obj.createdDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.unprocessedHousekeepingRequest) {
          this.unprocessedHousekeepingRequest[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getProcessingHousekeepingRequest() {
    this.httpService.getHousekeepingList(`customer-service/${this.hotelId}/housekeeping?statuss=processing`).subscribe(
      res => {
        this.processingHousekeepingRequest = res;
        const createdDateTime = this.processingHousekeepingRequest.map(obj => this.extractDateTime(obj.createdDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.processingHousekeepingRequest) {
          this.processingHousekeepingRequest[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getCompletedHousekeepingRequest() {
    this.httpService.getHousekeepingList(`customer-service/${this.hotelId}/housekeeping?statuss=completed`).subscribe(
      res => {
        this.completedHousekeepingRequest = res;
        const createdDateTime = this.completedHousekeepingRequest.map(obj => this.extractDateTime(obj.createdDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.completedHousekeepingRequest) {
          this.completedHousekeepingRequest[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  updateHousekeepingRequest(action, houseKeepingId) {
    this.processing = true;
    let houseKeepingDetails;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const completedDateTime = this.randomList.parseDateTime(fDateTime);
    if (action === 'processing') {
      const processingBy = this.employeeId;
      houseKeepingDetails = {action, houseKeepingId, processingBy};
    } else if (action === 'completed') {
      const completedBy = this.employeeId;
      houseKeepingDetails = {action, houseKeepingId, completedBy, completedDateTime};
    }

    this.httpService.updateHousekeepingRequest(`customer-service/${this.hotelId}/housekeeping/update`, houseKeepingDetails).subscribe(
      res => {
        this.processing = false;
        this.getUnprocessedHousekeepingRequest();
        this.countUnprocessedRequests();
        this.getProcessingHousekeepingRequest();
        this.getCompletedHousekeepingRequest();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  countUnprocessedRequests() {
    this.httpService.countUnprocessedHousekeepingRequest(`customer-service/${this.hotelId}/housekeeping/countUnprocessed`).subscribe(
      res => {
        // @ts-ignore
        this.unprocessedHousekeepingNum = res.num;
      },
      err => {
        console.log(err);
      }
    );
  }

  extractDateTime(dateTime) {
    const resDateTime = dateTime.split(/[-T.: ]/);

    if (resDateTime[3] <= 12) {
      return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${resDateTime[3]}:${resDateTime[4]} AM`];
    } else {
      let adjustedTime = resDateTime[3] % 12;
      if (adjustedTime < 10) {
        // @ts-ignore
        adjustedTime = '0' + adjustedTime;
      }
      return [`${resDateTime[2]}/${resDateTime[1]}/${resDateTime[0]} ${adjustedTime}:${resDateTime[4]} PM`];
    }
  }

  submitHouseKeepingRequest() {
    this.processing = true;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const createdDateTime = this.randomList.parseDateTime(fDateTime);
    this.houseKeepingRequest.amount = this.totalCost;

    const laundryRequestDetails = {
      guestId: this.chosenRoom.payingGuestId,
      checkInId: this.chosenRoom.checkInId,
      createdDateTime,
      createdBy: this.employeeId,
      ...this.houseKeepingRequest,
      items: this.itemsForm.value.itemDetail
    };

    this.httpService.createHouseKeepingRequest(`customer-service/${this.hotelId}/housekeeping/create`, laundryRequestDetails)
      .subscribe(
      res => {
        this.processing = false;
        this.getUnprocessedHousekeepingRequest();
        this.countUnprocessedRequests();
        this.getProcessingHousekeepingRequest();
        this.getCompletedHousekeepingRequest();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.clearLaundryRequest();
  }

  calculateTotalAmount() {
    const items = this.itemsForm.value.itemDetail.filter(e => e.itemName !== null).map(e => e.itemName);
    const quantity = this.itemsForm.value.itemDetail.filter(e => e.quantity !== null).map(e => e.quantity);
    this.totalCost = 0;
    // tslint:disable-next-line:forin
    for (const i in items) {
      const cost = this.hotelServices.filter(e => e.serviceId === +items[i])[0].serviceCost;
      this.totalCost += cost * quantity[i];
    }
  }

  clearLaundryRequest() {
    this.houseKeepingRequest = new HouseKeepingModel();
    this.itemForm.reset();
    this.modalRef.close();
    if (this.itemsFormArray !== undefined) {
      this.itemsFormArray.clear();
      this.addItem();
    }
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {});
  }

  get itemForm() {
    return <FormArray>this.itemsForm.get('itemDetail');
  }
}
