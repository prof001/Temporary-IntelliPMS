import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RoomServiceModel} from '../../../models/room-service.model';
import {HttpService} from '../../../shared/http.service';
import {CheckinOutModel} from '../../../models/checkin-out.model';
import {formatDate} from '@angular/common';
import {EmployeeModel} from '../../../models/employee.model';
import {RandomListsService} from '../../../shared/random-lists.service';

@Component({
  selector: 'app-room-service',
  templateUrl: './room-service.component.html',
  styleUrls: ['./room-service.component.css']
})
export class RoomServiceComponent implements OnInit {
  roomServiceRequest: RoomServiceModel = new RoomServiceModel();
  modalRef; minDate;
  roomServiceRequestAlert = false;
  unprocessedRoomServiceRequest: RoomServiceModel[] = [];
  processingRoomServiceRequest: RoomServiceModel[] = [];
  completedRoomServiceRequest: RoomServiceModel[] = [];
  unprocessedRoomServiceRequestsNumber; paymentStatus = 'unpaid';
  waiters: EmployeeModel[] = [];
  chosenRoom: CheckinOutModel = new CheckinOutModel();
  checkedInRooms: CheckinOutModel[] = [];
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  processing = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private randomList: RandomListsService) { }

  ngOnInit(): void {
    this.getCheckedInRooms();
    this.getUnprocessedRoomServiceRequest();
    this.getProcessingRoomServiceRequest();
    this.getCompletedRoomServiceRequest();
    this.countUnprocessedRequests();
    this.getWaiters();

    this.roomServiceRequest.paymentStatus = 'unpaid';
  }

  submitRoomServiceRequest() {
    this.processing = true;
    const createdDateTime =
      `${this.roomServiceRequest.date.year}-${this.roomServiceRequest.date.month}-${this.roomServiceRequest.date.day} ${this.roomServiceRequest.time.hour}:${this.roomServiceRequest.time.minute}:${this.roomServiceRequest.time.second}`;
    const roomServiceRequestDetails = {
      guestId: this.chosenRoom.payingGuestId,
      checkInId: this.chosenRoom.checkInId,
      createdBy: this.employeeId,
      createdDateTime,
      ...this.roomServiceRequest
    };

    this.httpService.createRoomService(`customer-service/${this.hotelId}/room-service/create`, roomServiceRequestDetails).subscribe(
      res => {
        this.processing = false;
        this.roomServiceRequestAlert = true;
        this.getUnprocessedRoomServiceRequest();
        this.countUnprocessedRequests();
        this.getProcessingRoomServiceRequest();
        this.getCompletedRoomServiceRequest();
        this.roomServiceRequest = new RoomServiceModel();
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  getWaiters() {
    this.httpService.getHotelStaffs(`hotels/${this.hotelId}/staffs?role=waiter`).subscribe(
      res => {
        this.waiters = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getGuestName() {
    this.chosenRoom = this.checkedInRooms.filter(e => e.roomId === +this.roomServiceRequest.roomId)[0];
    const minDateArr = this.chosenRoom.checkInDate.split(/[-T.: ]/);
    this.minDate = {
      year: +minDateArr[0],
      month: +minDateArr[1],
      day: +minDateArr[2]
    };

    if (this.chosenRoom.currentOccupant !== null) {
      this.roomServiceRequest.guestName = this.chosenRoom.currentOccupant;
    } else {
      this.roomServiceRequest.guestName = 'Multiple Occupants';
    }
  }

  getCheckedInRooms() {
    this.httpService.getCurrentCheckedInRooms(`hotels/${this.hotelId}/currentCheckInRooms`).subscribe(
      res => {
        this.checkedInRooms = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getUnprocessedRoomServiceRequest() {
    this.httpService.getRoomServiceList(`customer-service/${this.hotelId}/room-services?statuss=unprocessed`).subscribe(
      res => {
        this.unprocessedRoomServiceRequest = res;
        const createdDateTime = this.unprocessedRoomServiceRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        // tslint:disable-next-line:forin
        for (const i in this.unprocessedRoomServiceRequest) {
          this.unprocessedRoomServiceRequest[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  countUnprocessedRequests() {
    this.httpService.countUnprocessedRoomServiceRequests(`customer-service/${this.hotelId}/room-services/countUnprocessed`)
      .subscribe(
      res => {
        // @ts-ignore
        this.unprocessedRoomServiceRequestsNumber = res.num;
      },
      err => {
        console.log(err);
      }
    );
  }

  getProcessingRoomServiceRequest() {
    this.httpService.getRoomServiceList(`customer-service/${this.hotelId}/room-services?statuss=processing`).subscribe(
      res => {
        this.processingRoomServiceRequest = res;
        const createdDateTime = this.processingRoomServiceRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        // tslint:disable-next-line:forin
        for (const i in this.processingRoomServiceRequest) {
          this.processingRoomServiceRequest[i].createdDateTime = createdDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getCompletedRoomServiceRequest() {
    this.httpService.getRoomServiceList(`customer-service/${this.hotelId}/room-services?statuss=completed`).subscribe(
      res => {
        this.completedRoomServiceRequest = res;
        const createdDateTime = this.completedRoomServiceRequest.map(obj => this.extractDateTime(obj.createdDateTime));
        const completedDateTime = this.completedRoomServiceRequest.map(obj => this.extractDateTime(obj.completedDateTime));
        // tslint:disable-next-line:forin
        for (const i in this.completedRoomServiceRequest) {
          this.completedRoomServiceRequest[i].createdDateTime = createdDateTime[i][0];
          this.completedRoomServiceRequest[i].completedDateTime = completedDateTime[i][0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  updateRoomServiceRequest(action, roomServiceId) {
    this.processing = true;
    let roomServiceDetails;
    const fDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:SS', 'en');
    const completedDateTime = this.randomList.parseDateTime(fDateTime);
    if (action === 'processing') {
      const processingBy = this.employeeId;
      roomServiceDetails = {action, processingBy, roomServiceId};
    } else if (action === 'completed') {
      const completedBy = this.employeeId;
      roomServiceDetails = {action, completedBy, roomServiceId, completedDateTime};
    }

    this.httpService.updateRoomServiceRequest(`customer-service/${this.hotelId}/room-service/update`, roomServiceDetails)
      .subscribe(
      res => {
        this.processing = false;
        this.getUnprocessedRoomServiceRequest();
        this.countUnprocessedRequests();
        this.getProcessingRoomServiceRequest();
        this.getCompletedRoomServiceRequest();
      },
      err => {
        this.processing = false;
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

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
    }, () => {});
  }
}
