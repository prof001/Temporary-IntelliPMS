import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpService} from '../../../shared/http.service';
import {ReservationModel} from '../../../models/reservation.model';
import {ActivatedRoute, Params} from '@angular/router';
import * as moment from 'moment';
import {RoomTypeModel} from '../../../models/room-type.model';
import {RandomListsService} from '../../../shared/random-lists.service';

@Component({
  selector: 'app-cancel-reservation',
  templateUrl: './cancel-reservation.component.html',
  styleUrls: ['./cancel-reservation.component.css']
})
export class CancelReservationComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private randomList: RandomListsService) { }

  reservations: ReservationModel[] = [];
  cancellationNote;
  modalRef; filterStartDate; filterRoomType = '';
  cancelReservationChecker = false;
  editReservationChecker = false;
  createReservationChecker = false;
  checkInReservationChecker = false;
  minDate; startDate; error; endDate; minDate2;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  hotelRoomTypes: RoomTypeModel[] = [];

  ngOnInit(): void {
    this.getReservations();
    this.setCurrentDate();
    this.getHotelRoomTypes();

    this.route.queryParams.subscribe((qParams: Params) => {
      if (qParams.msg) {
        this.createReservationChecker = true;
      }
      if (qParams.chk) {
        this.checkInReservationChecker = true;
      }
    });
  }

  getReservations() {
    this.httpService.getReservations(`hotels/${this.hotelId}/reservations`).subscribe(
      res => {
        this.reservations = res;
        if (this.reservations !== null) {
          const formattedDate = res.map(obj => this.formatDate(obj.reservationStartDateTime, obj.reservationEndDateTime));
          const exceedStartDate = res.map(obj => this.checkExceedStartDate(obj.reservationStartDateTime));
          // tslint:disable-next-line:forin
          for (const i in this.reservations) {
            this.reservations[i].formattedStartDate = formattedDate[i][0];
            this.reservations[i].formattedEndDate = formattedDate[i][1];
            this.reservations[i].exceedStartDate = exceedStartDate[i];
            this.reservations[i].totalPayment = this.reservations[i].billings.reduce((a, b) => a + b.amount, 0);
          }
        } else {
          this.error = 'No reservations';
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  editReservations(reservationId) {
    const reservationDetail = {
      startDate: undefined,
      endDate: undefined,
      reservationId
    };
    if (this.startDate !== undefined) {
      reservationDetail.startDate = `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} 13:00:00`;
    }
    if (this.endDate !== undefined) {
      reservationDetail.endDate = `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} 13:00:00`;
    }

    this.httpService.editReservation('guests/editReservation', reservationDetail).subscribe(
      res => {
        this.cancelReservationChecker = false;
        this.editReservationChecker = true;
        this.createReservationChecker = false;
        this.checkInReservationChecker = false;
      },
      err => {
        console.log(err);
      }
    );
    this.startDate = undefined;
    this.endDate = undefined;
    this.modalRef.close();
    this.getReservations();
  }

  cancelReservation(reservationId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);
    const cancelReservationDetails = {
      reservationId,
      cancelledBy: this.employeeId,
      cancellationNote: this.cancellationNote,
      currentDateTime
    };
    this.httpService.cancelReservation('guests/cancelReservation', cancelReservationDetails).subscribe(
      res => {
        this.getReservations();
        this.editReservationChecker = false;
        this.createReservationChecker = false;
        this.checkInReservationChecker = false;
        this.cancelReservationChecker = true;
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
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

  formatDate(startDate, endDate) {
    const start = startDate.split(/[-T.:]/);
    const end = endDate.split(/[-T.:]/);
    const formattedStart = `${start[2]}/${start[1]}/${start[0]}`;
    const formattedEnd = `${end[2]}/${end[1]}/${end[0]}`;
    return [formattedStart, formattedEnd];
  }

  filterReservations() {
    let path;
    let filterDate;
    if (this.filterRoomType !== '' && this.filterStartDate !== undefined) {
      filterDate = `${this.filterStartDate.year}-${this.filterStartDate.month}-${this.filterStartDate.day} 00:00:00`;
      if (this.filterRoomType !== 'all') {
        path = `hotels/${this.hotelId}/reservations?roomType=${this.filterRoomType}&startDate=${filterDate}`;
      } else {
        path = `hotels/${this.hotelId}/reservations?startDate=${filterDate}`;
      }
    } else if (this.filterRoomType !== '') {
      if (this.filterRoomType !== 'all') {
        path = `hotels/${this.hotelId}/reservations?roomType=${this.filterRoomType}`;
      } else {
        path = `hotels/${this.hotelId}/reservations`;
      }
    } else if (this.filterStartDate !== undefined) {
      filterDate = `${this.filterStartDate.year}-${this.filterStartDate.month}-${this.filterStartDate.day} 00:00:00`;
      path = `hotels/${this.hotelId}/reservations?startDate=${filterDate}`;
    } else {
      path = `hotels/${this.hotelId}/reservations`;
    }

    this.httpService.getReservations(path).subscribe(
      res => {
        this.reservations = res;
        if (this.reservations !== null) {
          this.error = undefined;
          const formattedDate = res.map(obj => this.formatDate(obj.reservationStartDateTime, obj.reservationEndDateTime));
          const exceedStartDate = res.map(obj => this.checkExceedStartDate(obj.reservationStartDateTime));
          // tslint:disable-next-line:forin
          for (const i in this.reservations) {
            this.reservations[i].formattedStartDate = formattedDate[i][0];
            this.reservations[i].formattedEndDate = formattedDate[i][1];
            this.reservations[i].exceedStartDate = exceedStartDate[i];
            this.reservations[i].totalPayment = this.reservations[i].billings.reduce((a, b) => a + b.amount, 0);
          }
        } else {
          this.error = 'No Reservations';
        }
      },
      err => {
        console.log(err);
        /*if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.error = err.message;
            // console.log(err.error.message);
          }
        }*/
      }
    );
  }

  cancelSearchDate() {
    this.filterStartDate = undefined;
    this.filterReservations();
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
      this.cancellationNote = '';
    }, () => {
      this.startDate = undefined;
      this.endDate = undefined;
    });
  }

  checkExceedStartDate(startDate) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]}`);
    let exceedStartDate;

    const time2 = startDate.split(/[-T.:+]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]}`);

    exceedStartDate = date1 > date2;
    return exceedStartDate;
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

    this.minDate2 = {
      year: currentDateTimeArray[0],
      month: currentDateTimeArray[1],
      day: currentDateTimeArray[2]
    };
  }

  updateStartDate() {
    if (this.startDate !== undefined) {
      this.minDate2 = this.startDate;
    }
  }
}
