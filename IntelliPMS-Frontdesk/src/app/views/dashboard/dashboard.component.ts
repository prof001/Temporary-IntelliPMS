import {Component, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpService} from '../../shared/http.service';
import {RoomModel} from '../../models/room.model';
import {timer} from 'rxjs';
import {EmployeeModel} from '../../models/employee.model';
import {ToastrService} from 'ngx-toastr';
import {RandomListsService} from '../../shared/random-lists.service';
import {RoomTypeModel} from '../../models/room-type.model';
import {RegisterModel} from '../../models/register.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  rooms: RoomModel[] = [];
  lostKeyNote; dropOffKeyNote;
  currentTime;
  modalRef;
  roomAlertChecker = false;
  timerObs = timer(0, 1000); timerSub;
  customizeDisplay = false;
  extendOptionChecker = false;
  extendOption = 'hour';
  availableRoomChecker = true;
  employee: EmployeeModel = new EmployeeModel();
  hotelRoomTypes: RoomTypeModel[] = [];
  availableRooms: RoomModel [] = [];
  chosenRoomType; changeRoomReason;
  newRoomId = 0; extendStayRate = 0;
  extendStayCost = 0; extendStayHours = 1;
  extendNewDate; minDate;

  hotelId = localStorage.getItem('hotelId');
  registerId = localStorage.getItem('registerId');
  employeeId = localStorage.getItem('employeeId');
  openedCashRegister: RegisterModel = new RegisterModel();

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private toastr: ToastrService,
    private randomList: RandomListsService) {
  }
  ngOnInit(): void {
    this.timerSub = this.timerObs.subscribe(val => {
      this.currentTime = moment().format('Do MMMM YYYY, h:mm:ss a');
    });
    this.getRooms();
    this.getEmployeeDetails();
    this.getRoomTypes();
    this.getCurrentDate();
    this.getOpenedRegister();
  }

  getRooms() {
    this.httpService.getAllHotelRooms(`hotels/${this.hotelId}/allRooms`).subscribe(
      res => {
        this.rooms = res;
        const daysLeft = this.rooms.map(e => this.calculateDaysLeft(e.freeDate));
        const daysSpent = this.rooms.map(e => this.calculateDaysSpent(e.checkInDate));

        // tslint:disable-next-line:forin
        for (const i in this.rooms) {
          if (daysLeft[i] === null) {
            this.rooms[i].daysLeft = null;
          } else {
            this.rooms[i].daysLeft = daysLeft[i];
          }

          if (daysSpent[i] === null) {
            this.rooms[i].daysSpent = null;
          } else {
            this.rooms[i].daysSpent = daysSpent[i] - 1;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  dropOffRoomKey(roomId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);

    const dropOffKeyDetail = {
      roomId,
      dropOffNote: this.dropOffKeyNote,
      dropOffDateTime: currentDateTime,
      createdBy: this.employeeId
    };

    this.httpService.dropOffKey(`guests/dropOffKey`, dropOffKeyDetail).subscribe(
      res => {
        this.dropOffKeyNote = '';
        this.roomAlertChecker = true;
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  pickUpKey(roomId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);

    const pickUpKeyDetails = {
      roomId,
      pickupKeyDateTime: currentDateTime,
      pickedUpBy: this.employeeId
    };

    this.httpService.pickUpKey('guests/pickUpKey', pickUpKeyDetails).subscribe(
      res => {
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
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

  getAvailableRooms(freeDate) {
    const checkOutDateTime = this.randomList.parseDateTime(freeDate);
    this.httpService.getRooms(`hotels/${this.hotelId}/rooms?roomType=${this.chosenRoomType}&freeDate=${checkOutDateTime}`)
      .subscribe(
        res => {
          this.availableRooms = res;
          if (this.availableRooms.length > 0) {
            this.newRoomId = this.availableRooms[0].roomId;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  executeChangeRoom(oldRoomId, oldRoomStayDays, checkInId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);

    const changeRoomDetails = {
      reason: this.changeRoomReason,
      newRoomId: this.newRoomId,
      createdBy: this.employeeId,
      oldRoomId,
      changedDateTime: currentDateTime,
      oldRoomStayDays,
      checkInId
    };

    this.httpService.changeRoom('guests/changeRoom', changeRoomDetails).subscribe(
      res => {
        console.log(res);
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  lostRoomKey(roomId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);

    const roomDetail = {
      roomId,
      createdBy: this.employeeId,
      lostKeyNote: this.lostKeyNote,
      lostKeyDateTime: currentDateTime
    };

    this.httpService.lostRoomKey(`guests/lostKey`, roomDetail).subscribe(
      res => {
        this.lostKeyNote = '';
        this.roomAlertChecker = true;
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  updateRoomSaleStatus(roomId, status) {
    const roomSaleDetails = {roomId, status};
    this.httpService.updateRoomSaleStatus(`hotels/${this.hotelId}/notForSale`, roomSaleDetails).subscribe(
      res => {
        console.log(res);
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
  }

  onRoomAlertClose() {
    this.roomAlertChecker = false;
  }

  getEmployeeDetails() {
    const employeeId = localStorage.getItem('employeeId');
    this.httpService.getEmployeeDetails(`employees/${employeeId}`).subscribe(
      res => {
        this.employee = res;
        if (this.employee.employeeRole !== 'admin') {
          if (this.registerId === null) {
            this.toastr.success(`You are logged in as ${this.employee.employeeName}. Please open a cash register.`,
              'Login Message', {
                timeOut: 500000
              });
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  calculateDaysLeft(dateToCalculate) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]}`);
    let daysLeft;

    if (dateToCalculate !== null) {
      const time2 = dateToCalculate.split(/[-T.:+]/);
      const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]}`);

      if (date2 >= date1) {
        // @ts-ignore
        const diffTime = Math.abs(date2 - date1);
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysLeft = -1;
      }
    } else {
      daysLeft = null;
    }
    return daysLeft;
  }

  calculateDaysSpent(dateToCalculate) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:00`);
    let daysSpent;

    if (dateToCalculate !== null) {
      const time2 = dateToCalculate.split(/[-T.:+]/);
      const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:00`);

      if (date1 >= date2) {
        // @ts-ignore
        const diffTime = Math.abs(date1 - date2);
        daysSpent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysSpent = -1;
      }
    } else {
      daysSpent = null;
    }
    return daysSpent;
  }

  getExtendStayCost(freeDate, roomCost) {
    const length = this.extendStayHours;
    if (this.customizeDisplay === true) {
      this.extendStayCost = (this.extendStayRate / 100) * roomCost;
    } else {
      if (length <= 3) {
        this.extendStayRate = 0;
        this.extendStayCost = 0;
      } else if (length > 3 && length <= 6) {
        this.extendStayRate = 30;
        const cost = (this.extendStayRate / 100) * roomCost;
        this.extendStayCost = +cost;
      } else {
        this.extendStayRate = 50;
        const cost = (this.extendStayRate / 100) * roomCost;
        this.extendStayCost = +cost;
      }
    }
  }

  extendGuestStay(roomId) {
    const chosenRoom = this.rooms.filter(e => e.roomId === roomId)[0];
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const extensionDateTime = this.randomList.parseDateTime(momentDateTime);
    const initialDetails = {
      checkInId: chosenRoom.checkInId,
      guestId: chosenRoom.guestId,
      createdBy: this.employeeId,
      extendOption: this.extendOption,
      extensionDateTime
    };
    let otherDetails;

    if (this.extendOption === 'hour') {
      otherDetails = {
        extendLength: this.extendStayHours,
        rate: this.extendStayRate,
        cost: this.extendStayCost
      };
    } else {
      const newFreeDate = `${this.extendNewDate.year}-${this.extendNewDate.month}-${this.extendNewDate.day} 1:0:0`;
      const daysDiff = this.calculateDatesDiff(chosenRoom.freeDate, newFreeDate);
      otherDetails = {
        newFreeDate,
        extendLength: daysDiff
      };
    }
    const extensionDetails = {...initialDetails, ...otherDetails};
    this.httpService.extendStay(`guests/extendStay`, extensionDetails).subscribe(
      res => {
        this.getRooms();
        this.extendStayHours = 0;
        this.extendStayRate = 0;
        this.extendStayCost = 0;
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  changeRoomKey(roomId) {
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const changeKeyDateTime = this.randomList.parseDateTime(momentDateTime);
    const changeRoomDetails = {
      roomId,
      changeKeyDateTime,
      changedBy: this.employeeId
    };
    this.httpService.changeKey('guests/changeKey', changeRoomDetails).subscribe(
      res => {
        console.log(res);
        this.getRooms();
      },
      err => {
        console.log(err);
      }
    );
    this.modalRef.close();
  }

  calculateDatesDiff(date1, date2) {
    const time1 = date1.split(/[-T.:+ ]/);
    const time2 = date2.split(/[-T.:+ ]/);

    const dateParse1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]}`);
    const dateParse2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]}`);

    // @ts-ignore
    const diffTime = Math.abs(dateParse2 - dateParse1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCurrentDate() {
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

  getOpenedRegister() {
    if (this.registerId) {
      this.httpService.getOpenedCashRegister(`employees/${this.employeeId}/getOpenedRegister`).subscribe(
        res => {
          this.openedCashRegister = res;
          const hour = this.getHoursDifference(this.openedCashRegister.dateTimeOpened);
          if (hour > 24) {
            this.toastr.error(`Your current cash register has been opened for more than 24 hours. Please close it and open a new one.`,
              'Cash Register Error', {
                timeOut: 500000
              });
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  getHoursDifference(dateTime) {
    const time1 = moment().format().split(/[-T.:+ ]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:${time1[5]}`);
    const time2 = dateTime.split(/[-T.:+ ]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:${time2[5]}`);

    // @ts-ignore
    const milliseconds = Math.abs(date1 - date2);
    return Math.floor(milliseconds / 36e5);
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then(() => {
      }, () => {
      this.customizeDisplay = false;
    });
  }

  customizeDisplayHandler() {
    this.customizeDisplay = !this.customizeDisplay;
    this.extendStayCost = 0;
  }

  extendOptionToggle() {
    this.extendOptionChecker = this.extendOption !== 'hour';
  }

  availableRoomHandler() {
    this.availableRoomChecker = false;
  }

  ngOnDestroy() {
    this.timerSub.unsubscribe();
  }
}
