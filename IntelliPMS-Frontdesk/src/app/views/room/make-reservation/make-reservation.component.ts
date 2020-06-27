import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import {RandomListsService} from '../../../shared/random-lists.service';
import {GuestModel} from '../../../models/guest.model';
import {PaymentDetailsModel} from '../../../models/payment-detail.model';
import {HttpService} from '../../../shared/http.service';
import {Router} from '@angular/router';
import {AccountDetailModel} from '../../../models/account-detail.model';
import {PosDetailModel} from '../../../models/pos-detail.model';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PaymentChoiceModel} from '../../../models/payment-choice.model';
import {AvailableRoomSummaryModel} from '../../../models/available-room-summary.model';
import {ReservationModel} from '../../../models/reservation.model';
import {RoomTypeModel} from '../../../models/room-type.model';
import {EmployeeModel} from '../../../models/employee.model';
import {RegisterModel} from '../../../models/register.model';

@Component({
  selector: 'app-make-reservation',
  templateUrl: './make-reservation.component.html',
  styleUrls: ['./make-reservation.component.css']
})
export class MakeReservationComponent implements OnInit {

  constructor(private randomList: RandomListsService,
              private httpService: HttpService,
              private router: Router,
              private formBuilder: FormBuilder) { }
  startDate; endDate; numOfRooms;
  countryList = this.randomList.countryList; minDate1;
  minDate2;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');

  phoneNumberList: GuestModel[] = [];
  autocompleteDivDisplay = 'none';

  meridian = true;
  spinners = false;
  startTime;
  endTime = {
    hour: 13,
    minute: 0,
    second: 0
  };

  billingForm: FormGroup;
  paymentDetailsArray: FormArray;
  paymentChoices: PaymentChoiceModel[] = [];
  inputsDisplay = [
    {
      showCardInput: 'block',
      showTransferInput: 'none',
      showCashInput: 'none',
      showManagerInput: 'none'
    }
  ];

  payingGuestInfo: GuestModel = new GuestModel();
  reservationInfo: ReservationModel = new ReservationModel();
  paymentDetails: PaymentDetailsModel = new PaymentDetailsModel();
  hotelAccountDetails: AccountDetailModel[] = [];
  selectedBankAccount: AccountDetailModel = new AccountDetailModel();
  hotelPosDetails: PosDetailModel[] = [];
  selectedPos: PosDetailModel = new PosDetailModel();
  availableRoomsSummary: AvailableRoomSummaryModel[] = [];
  hotelRoomTypes: RoomTypeModel[] = [];
  processing = false;
  registerHourExceeded = false;
  managers: EmployeeModel[] = [];
  openedCashRegister: RegisterModel = new RegisterModel();

  ngOnInit(): void {
    this.getHotelAccountDetails();
    this.getHotelPosDetails();
    this.getCurrentDate();
    this.getRoomTypes();
    this.getOpenedRegister();
    this.getManagers();

    this.billingForm = this.formBuilder.group({
      paymentDetails: this.formBuilder.array([
        this.payments()
      ])
    });
    this.getAvailableRoomsSummary();

    this.payingGuestInfo.country = 'Nigeria';
  }

  payments(): FormGroup {
    return this.formBuilder.group({
      paymentType: ['card', Validators.required],
      amount: [null, Validators.required],
      bankName: ['Select a Bank', Validators.required],
      accountNumber: [{value: null, disabled: true}, Validators.required],
      posId: [{value: this.selectedPos.bankName, disabled: true}, Validators.required],
      transactionId: [null, Validators.required],
      managerName: [null, Validators.required],
      referenceNumber: [null, Validators.required]
    });
  }

  addPayment(): void {
    this.paymentDetailsArray = this.billingForm.get('paymentDetails') as FormArray;
    this.paymentDetailsArray.push(this.payments());
    this.inputsDisplay.push({
      showCardInput: 'block',
      showTransferInput: 'none',
      showCashInput: 'none',
      showManagerInput: 'none'
    });
  }

  removePayment(i: number) {
    this.paymentDetailsArray = this.billingForm.get('paymentDetails') as FormArray;
    this.paymentDetailsArray.removeAt(i);
    this.paymentChoices.splice(i, 1);
    this.inputsDisplay.splice(i, 1);
  }

  togglePaymentForm (value: number, formIndex: number) {
    console.log(value);
    if (value === 0) {
      this.inputsDisplay[formIndex].showCardInput = 'block';
      this.inputsDisplay[formIndex].showTransferInput = 'none';
      this.inputsDisplay[formIndex].showCashInput = 'none';
      this.inputsDisplay[formIndex].showManagerInput = 'none';
    }
    else if (value === 1) {
      this.inputsDisplay[formIndex].showCardInput = 'none';
      this.inputsDisplay[formIndex].showTransferInput = 'block';
      this.inputsDisplay[formIndex].showCashInput = 'none';
      this.inputsDisplay[formIndex].showManagerInput = 'none';
    }
    else if (value === 2) {
      this.inputsDisplay[formIndex].showCardInput = 'none';
      this.inputsDisplay[formIndex].showTransferInput = 'none';
      this.inputsDisplay[formIndex].showCashInput = 'block';
      this.inputsDisplay[formIndex].showManagerInput = 'none';
    }
    else if (value === 3) {
      this.inputsDisplay[formIndex].showCardInput = 'none';
      this.inputsDisplay[formIndex].showTransferInput = 'none';
      this.inputsDisplay[formIndex].showCashInput = 'none';
      this.inputsDisplay[formIndex].showManagerInput = 'block';
    }
  }

  makeReservation() {
    this.processing = true;
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);
     const startDateTime =
      `${this.startDate.year}-${this.startDate.month}-${this.startDate.day} ${this.startTime.hour}:${this.startTime.minute}:${this.startTime.second}`;
    const endDateTime =
      `${this.endDate.year}-${this.endDate.month}-${this.endDate.day} ${this.endTime.hour}:${this.endTime.minute}:${this.endTime.second}`;
    this.reservationInfo.reservationStartDateTime = startDateTime;
    this.reservationInfo.reservationEndDateTime = endDateTime;

    const reservationFullDetails = {
      ...this.reservationInfo,
      payingGuest: this.payingGuestInfo,
      currentDateTime,
      hotelId: this.hotelId,
      createdBy: this.employeeId,
      registerId: this.registerId,
      paymentDetails: this.billingForm.value.paymentDetails,
    };

    this.httpService.makeReservation('guests/makeReservation', reservationFullDetails).subscribe(
      res => {
        this.router.navigate(['/room/reservations'], {queryParams: {msg: 'success'}});
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  getRoomTypes() {
    this.httpService.getHotelRoomTypes(`hotels/${this.hotelId}/hotelRoomTypes`).subscribe(
      res => {
        this.hotelRoomTypes = res;
        this.reservationInfo.roomTypeId = this.hotelRoomTypes[0].roomTypeId;
      },
      err => {
        console.log(err);
      }
    );
  }

  autoCompleteListClicked(phoneNumber) {
    this.httpService.getGuests(`guests?phoneNumber=${phoneNumber}`).subscribe(
      res => {
        this.payingGuestInfo = res;
      },
      err => {
        console.log(err);
      }
    );
    this.hideAutocompleteDiv();
  }

  hideAutocompleteDiv() {
    this.autocompleteDivDisplay = 'none';
  }

  getPhoneNumberSuggestions($event) {
    const value = $event.target.value;
    if (value.length === 0 || value.length === '') {
      this.hideAutocompleteDiv();
    } else {
      this.httpService.getPhoneNumberList(`guests/guestPhoneNumbersList?phoneNumber=${value}`).subscribe(
        res => {
          this.phoneNumberList = res;
          this.autocompleteDivDisplay = '';
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  getHotelAccountDetails() {
    this.httpService.getHotelAccountDetails(`hotels/${this.hotelId}/getHotelAccountDetails`).subscribe(
      res => {
        this.hotelAccountDetails = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  bankAccountClicked(clickedItem, formIndex) {
    const bankAccountId = clickedItem.value;
    this.httpService.selectedBankAccount(`hotels/${this.hotelId}/getHotelAccountDetails?bankAccountId=${bankAccountId}`)
      .subscribe(
        res => {
          this.selectedBankAccount = res;

          const pChoice: PaymentChoiceModel = new PaymentChoiceModel();

          if (this.paymentChoices.filter(e => e.formNum === formIndex).length === 0) {
            pChoice.formNum = formIndex;
            pChoice.transferPayment.accountNumber = this.selectedBankAccount.accountNumber;
            pChoice.transferPayment.bankName = this.selectedBankAccount.bankName;
            pChoice.transferPayment.bankAccountId = this.selectedBankAccount.bankAccountId;
            pChoice.transferPayment.hotelId = this.selectedBankAccount.hotelId;
            this.paymentChoices.push(pChoice);
          } else {
            this.paymentChoices.splice(formIndex, 1);
            pChoice.transferPayment.accountNumber = this.selectedBankAccount.accountNumber;
            pChoice.transferPayment.bankName = this.selectedBankAccount.bankName;
            pChoice.transferPayment.bankAccountId = this.selectedBankAccount.bankAccountId;
            pChoice.transferPayment.hotelId = this.selectedBankAccount.hotelId;
            this.paymentChoices.push(pChoice);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getHotelPosDetails() {
    this.httpService.getHotelPosDetails(`hotels/${this.hotelId}/getHotelPosDetails`).subscribe(
      res => {
        this.hotelPosDetails = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  bankPosClicked(clickedItem, formIndex) {
    const posSn = clickedItem.value;
    this.httpService.selectedPos(`hotels/${this.hotelId}/getHotelPosDetails?posSn=${posSn}`)
      .subscribe(
        res => {
          this.selectedPos = res;

          const pChoice: PaymentChoiceModel = new PaymentChoiceModel();

          if (this.paymentChoices.filter(e => e.formNum === formIndex).length === 0) {
            pChoice.formNum = formIndex;
            pChoice.cardPayment.posId = this.selectedPos.posId;
            pChoice.cardPayment.bankName = this.selectedPos.bankName;
            pChoice.cardPayment.hotelId = this.selectedPos.hotelId;
            pChoice.cardPayment.posSn = this.selectedPos.posSn;
            this.paymentChoices.push(pChoice);
          } else {
            this.paymentChoices.splice(formIndex, 1);
            pChoice.cardPayment.posId = this.selectedPos.posId;
            pChoice.cardPayment.bankName = this.selectedPos.bankName;
            pChoice.cardPayment.hotelId = this.selectedPos.hotelId;
            pChoice.cardPayment.posSn = this.selectedPos.posSn;
            this.paymentChoices.push(pChoice);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getOpenedRegister() {
    if (this.registerId) {
      this.httpService.getOpenedCashRegister(`employees/${this.employeeId}/getOpenedRegister`).subscribe(
        res => {
          this.openedCashRegister = res;
          const hour = this.getHoursDifference(this.openedCashRegister.dateTimeOpened);
          this.registerHourExceeded = hour > 24;
          // console.log(hour, this.registerHourExceeded);
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  getManagers() {
    this.httpService.getHotelStaffs(`hotels/${this.hotelId}/staffs?role=manager`).subscribe(
      res => {
        this.managers = res;
      },
      err => {
        console.log(err);
      }
    );
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

  getCurrentDate() {
    const currentDateTimeArray = [];
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const tempDateTime = currentDateTime.split(/[-: ]/);
    // tslint:disable-next-line:forin
    for (const i of tempDateTime) {
      currentDateTimeArray.push(+i);
    }

    this.minDate1 = {
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

  getAvailableRoomsSummary() {
    const dateTime = moment().format().split(/[-T.:+]/);
    const currentTime = `${dateTime[0]}-${dateTime[1]}-${dateTime[2]} ${dateTime[3]}:${dateTime[4]}:00`;
    this.httpService.getAvailableRoomsSummary(`hotels/${this.hotelId}/roomAvailabilitySummary?dateTime=${currentTime}`).subscribe(
      res => {
        this.availableRoomsSummary = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  updateStartDate() {
    if (this.startDate !== undefined) {
      this.minDate2 = this.startDate;
    }
  }

  get paymentForm() {
    return <FormArray>this.billingForm.get('paymentDetails');
  }

}
