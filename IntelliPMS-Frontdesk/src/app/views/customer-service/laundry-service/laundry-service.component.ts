import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LaundryServiceModel} from '../../../models/laundry-service.model';
import {HttpService} from '../../../shared/http.service';
import {GuestModel} from '../../../models/guest.model';
import {formatDate} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CheckinOutModel} from '../../../models/checkin-out.model';
import {ServiceModel} from '../../../models/service.model';
import {RandomListsService} from '../../../shared/random-lists.service';
import * as moment from 'moment';

@Component({
  selector: 'app-laundry-service',
  templateUrl: './laundry-service.component.html',
  styleUrls: ['./laundry-service.component.css']
})
export class LaundryServiceComponent implements OnInit {
  modalRef; unprocessedLaundryRequestsNumber: number;
  laundryRequest: LaundryServiceModel = new LaundryServiceModel();
  unprocessedLaundryRequest: LaundryServiceModel[] = [];
  processingLaundryRequest: LaundryServiceModel[] = [];
  completedLaundryRequest: LaundryServiceModel[] = [];
  checkedInRooms: CheckinOutModel[] = [];
  hotelServices: ServiceModel[] = [];
  chosenRoom: CheckinOutModel = new CheckinOutModel();
  totalCost = 0; minDate;

  laundryInsertedAlert = false;
  itemsForm: FormGroup;
  itemsFormArray: FormArray;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  processing = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    private randomList: RandomListsService) { }

  ngOnInit(): void {
    this.getUnprocessedLaundryRequest();
    this.countUnprocessedRequests();
    this.getProcessingLaundryRequest();
    this.getCompletedLaundryRequest();
    this.getCurrentCheckedInRooms();
    this.getLaundryServices();
    this.setCurrentDate();

    this.itemsForm = this.formBuilder.group({
      itemDetail: this.formBuilder.array([
        this.item()
      ])
    });
    this.laundryRequest.paymentStatus = 'unpaid';
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
    this.chosenRoom = this.checkedInRooms.filter(e => e.roomId === +this.laundryRequest.roomId)[0];

    if (this.chosenRoom.currentOccupant !== null) {
      this.laundryRequest.guestName = this.chosenRoom.currentOccupant;
    } else {
      this.laundryRequest.guestName = 'Multiple Occupants';
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

  getLaundryServices() {
    this.httpService.getHotelServices(`hotels/${this.hotelId}/services?serviceType=laundry`).subscribe(
      res => {
        this.hotelServices = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  submitLaundryRequest() {
    this.processing = true;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const createdDateTime = this.randomList.parseDateTime(fDateTime);
    const dueDateTime =
      `${this.laundryRequest.date.year}-${this.laundryRequest.date.month}-${this.laundryRequest.date.day} ${this.laundryRequest.time.hour}:${this.laundryRequest.time.minute}:00`;
    this.calculateTotalAmount();
    this.laundryRequest.amount = this.totalCost;

    const laundryRequestDetails = {
      guestId: this.chosenRoom.payingGuestId,
      checkInId: this.chosenRoom.checkInId,
      dueDateTime,
      createdDateTime,
      createdBy: this.employeeId,
      ...this.laundryRequest,
      items: this.itemsForm.value.itemDetail
    };

    this.httpService.createLaundryService(`customer-service/${this.hotelId}/laundry-service/create`, laundryRequestDetails)
      .subscribe(
      res => {
        this.processing = false;
        this.laundryInsertedAlert = true;
        this.getUnprocessedLaundryRequest();
        this.countUnprocessedRequests();
        this.getProcessingLaundryRequest();
        this.getCompletedLaundryRequest();
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

  getUnprocessedLaundryRequest() {
    this.httpService.getLaundryList(`customer-service/${this.hotelId}/laundry-services?statuss=unprocessed`)
      .subscribe(
      res => {
        this.unprocessedLaundryRequest = res;
        const createdDateTime = this.unprocessedLaundryRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        const dueDateTime = this.unprocessedLaundryRequest.map(obj => this.extractDateTime(obj.dueDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.unprocessedLaundryRequest) {
          this.unprocessedLaundryRequest[i].createdDateTime = createdDateTime[i][0];
          this.unprocessedLaundryRequest[i].dueDateTime = dueDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  countUnprocessedRequests() {
    this.httpService.countUnprocessedLaundryRequests(`customer-service/${this.hotelId}/laundry-services/countUnprocessed`).subscribe(
      res => {
        // @ts-ignore
        this.unprocessedLaundryRequestsNumber = res.num;
      },
      err => {
        console.log(err);
      }
    );
  }

  getProcessingLaundryRequest() {
    this.httpService.getLaundryList(`customer-service/${this.hotelId}/laundry-services?statuss=processing`).subscribe(
      res => {
        this.processingLaundryRequest = res;
        const createdDateTime = this.processingLaundryRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        const dueDateTime = this.processingLaundryRequest.map(obj => this.extractDateTime(obj.dueDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.processingLaundryRequest) {
          this.processingLaundryRequest[i].createdDateTime = createdDateTime[i][0];
          this.processingLaundryRequest[i].dueDateTime = dueDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getCompletedLaundryRequest() {
    this.httpService.getLaundryList(`customer-service/${this.hotelId}/laundry-services?statuss=completed`).subscribe(
      res => {
        this.completedLaundryRequest = res;
        const createdDateTime = this.completedLaundryRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        const dueDateTime = this.completedLaundryRequest.map(obj => this.extractDateTime(obj.dueDateTime));
        const completedDateTime = this.completedLaundryRequest.map(obj => this.extractDateTime(obj.completedDateTime));

        // tslint:disable-next-line:forin
        for (const i in this.completedLaundryRequest) {
          this.completedLaundryRequest[i].createdDateTime = createdDateTime[i][0];
          this.completedLaundryRequest[i].dueDateTime = dueDateTime[i][0];
          this.completedLaundryRequest[i].completedDateTime = completedDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  setCurrentDate() {
    const currentDateTimeArray = [];
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const tempDateTime = currentDateTime.split(/[-: ]/);
    // tslint:disable-next-line:forin
    for (const i of tempDateTime) {
      currentDateTimeArray.push(+i);
    }

    this.minDate = {
      year: currentDateTimeArray[0],
      month: currentDateTimeArray[1],
      day: currentDateTimeArray[2]
    };
  }

  updateLaundryRequest(action, laundryId) {
    this.processing = true;
    let laundryDetails;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const completedDateTime = this.randomList.parseDateTime(fDateTime);
    if (action === 'processing') {
      const processingBy = this.employeeId;
      laundryDetails = {action, laundryId, processingBy};
    } else if (action === 'completed') {
      const completedBy = this.employeeId;
      laundryDetails = {action, completedBy, laundryId, completedDateTime};
    }

    this.httpService.updateLaundryRequest(`customer-service/${this.hotelId}/laundry-service/update`, laundryDetails).subscribe(
      res => {
        this.processing = false;
        this.getUnprocessedLaundryRequest();
        this.countUnprocessedRequests();
        this.getProcessingLaundryRequest();
        this.getCompletedLaundryRequest();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  clearLaundryRequest() {
    this.laundryRequest = new LaundryServiceModel();
    this.itemForm.reset();
    this.modalRef.close();
    if (this.itemsFormArray !== undefined) {
      this.itemsFormArray.clear();
      this.addItem();
    }
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

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
      }, () => {});
  }

  get itemForm() {
    return <FormArray>this.itemsForm.get('itemDetail');
  }
}
