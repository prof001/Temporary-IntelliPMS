import {Component, OnInit} from '@angular/core';

import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {PaymentChoiceModel} from '../../../models/payment-choice.model';
import {ActivatedRoute, Params, Router} from '@angular/router';

import {RandomListsService} from '../../../shared/random-lists.service';
import {GuestModel} from '../../../models/guest.model';
import {PaymentDetailsModel} from '../../../models/payment-detail.model';
import {HttpService} from '../../../shared/http.service';
import {RoomModel} from '../../../models/room.model';
import {AccountDetailModel} from '../../../models/account-detail.model';
import {PosDetailModel} from '../../../models/pos-detail.model';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CacheService} from '../../../shared/cache.service';
import {EmployeeModel} from '../../../models/employee.model';
import {RegisterModel} from '../../../models/register.model';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit {
  constructor(
    private randomList: RandomListsService,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private cacheService: CacheService,
    private route: ActivatedRoute) { }

  countryList = this.randomList.countryList;
  inputsDisplay = [
    {
      showCardInput: 'block',
      showTransferInput: 'none',
      showCashInput: 'none',
      showManagerInput: 'none'
    }
  ];

  paymentDetails: PaymentDetailsModel = new PaymentDetailsModel();
  hotelAccountDetails: AccountDetailModel[] = [];
  selectedBankAccount: AccountDetailModel = new AccountDetailModel();
  hotelPosDetails: PosDetailModel[] = [];
  selectedPos: PosDetailModel = new PosDetailModel();
  phoneNumberList: GuestModel[] = [];
  billingForm: FormGroup;
  paymentDetailsArray: FormArray;
  guestsForm: FormGroup;
  guestsDetailArray: FormArray;
  roomId; selectedRoom: RoomModel = new RoomModel();
  totalPaymentDue; checkPayment = true;
  lettersRegex = '^[A-Za-z]+$';

  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');
  processing = false;
  daysNum = this.cacheService.checkInInfo.daysNum;
  managers: EmployeeModel[] = [];
  openedCashRegister: RegisterModel = new RegisterModel();
  registerHourExceeded = false;

  paymentChoices: PaymentChoiceModel[] = [];
  autocompletes = [
    {divDisplay: 'none'}
  ];

  ngOnInit(): void {
    this.getHotelAccountDetails();
    this.getHotelPosDetails();
    this.getManagers();
    this.getOpenedRegister();
    this.route.params.subscribe((params: Params) => {
      this.roomId = params.roomId;
      this.getRoomInfo();
    });

    this.billingForm = this.formBuilder.group({
      paymentDetails: this.formBuilder.array([
        this.payments()
      ])
    });

    this.guestsForm = this.formBuilder.group({
      guestDetails: this.formBuilder.array([
        this.guest()
      ])
    });

    if (this.cacheService.checkInInfo.checkInDateTime === undefined || this.cacheService.checkInInfo.checkOutDateTime === undefined) {
      this.router.navigate(['/room/checkin']);
    }

    /*const currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const parsedDateTime = this.randomList.parseDateTime(currentDateTime);
    console.log(parsedDateTime);*/
  }

  getRoomInfo() {
    this.httpService.getRoomInfo(`hotels/${this.hotelId}/rooms/${this.roomId}`).subscribe(
      res => {
        this.selectedRoom = res;
        const roomCost = this.selectedRoom.cost * this.daysNum;
        this.totalPaymentDue = roomCost + 2000;
      }, err => {
        console.log(err);
      }
    );
  }

  guest(): FormGroup {
    return this.formBuilder.group({
      phoneNumber: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: [null, [Validators.required, Validators.pattern(/^.+@.+\..+/)]],
      guestTitle: [null, Validators.required],
      firstName: [null, [
        Validators.required,
        Validators.pattern(this.lettersRegex)
      ]],
      otherName: [null, [Validators.pattern(this.lettersRegex)]],
      lastName: [null, [Validators.required, Validators.pattern(this.lettersRegex)]],
      gender: [null, Validators.required],
      country: ['Nigeria', Validators.required],
      address: [null, Validators.required],
      guestType: [3, Validators.required]
    });
  }

  addGuest(): void {
    this.guestsDetailArray = this.guestsForm.get('guestDetails') as FormArray;
    this.guestsDetailArray.push(this.guest());
    for (const div of this.autocompletes) {
      div.divDisplay = 'none';
    }
    this.autocompletes.push({divDisplay: 'none'});
  }

  removeGuest(i: number) {
    this.guestsDetailArray = this.guestsForm.get('guestDetails') as FormArray;
    this.guestsDetailArray.removeAt(i);
    this.autocompletes.splice(i, 1);
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
    this.getTotalAmountPaid();
  }

  togglePaymentForm (value: number, formIndex: number) {
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

  checkInGuest() {
    this.processing = true;
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const parsedDateTime = this.randomList.parseDateTime(currentDateTime);
    const fullCheckInDetails = {
      guestDetails: this.guestsForm.value.guestDetails,
      currentDateTime: parsedDateTime,
      createdBy: this.employeeId,
      registerId: this.registerId,
      hotelId: this.hotelId,
      checkInOutDateTime: this.cacheService.checkInInfo,
      selectedRoom: this.selectedRoom,
      paymentDetails: this.billingForm.value.paymentDetails
    };

    this.httpService.checkInGuest('guests/checkIn', fullCheckInDetails).subscribe(
      res => {
        this.router.navigate(['/room/checkout'], {queryParams: {msg: 'success'}});
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  getPhoneNumberSuggestions($event, formIndex: number) {
    const value = $event.target.value;
    for (let i = 0; i < this.autocompletes.length; i++) {
      if (i !== formIndex) {
        this.autocompletes[i].divDisplay = 'none';
      }
    }

    if (value.length === 0 || value.length === '') {
      this.hideAutocompleteDiv(formIndex);
    } else {
      this.httpService.getPhoneNumberList(`guests/guestPhoneNumbersList?phoneNumber=${value}`).subscribe(
        res => {
          this.phoneNumberList = res;
          this.autocompletes[formIndex].divDisplay = '';
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  autoCompleteListClicked(phoneNumber, formIndex) {
    this.httpService.getGuests(`guests?phoneNumber=${phoneNumber}`).subscribe(
      res => {
        // const temp =  as form
        this.guestsForm.patchValue({
          guestDetails: [{
            phoneNumber: res.phoneNumber,
            email: res.email,
            guestTitle: res.guestTitle,
            firstName: res.firstName,
            otherName: res.otherName,
            lastName: res.lastName,
            gender: res.gender,
            country: res.country,
            address: res.address
          }]
        });
        // console.log(this.guestsDetailArray);
        /*else {
        const tempDetail = {
          phoneNumber: res.phoneNumber,
          email: res.email,
          guestTitle: res.guestTitle,
          firstName: res.firstName,
          otherName: res.otherName,
          lastName: res.lastName,
          gender: res.gender,
          country: res.country,
          address: res.address
        };
        this.guestsForm.value.guestDetails = this.guestsForm.value.guestDetails.splice(formIndex, 1);
        this.guestsForm.value.guestDetails = this.guestsForm.value.guestDetails.splice(formIndex, 0, tempDetail);
        console.log(this.guestsForm.value.guestDetails);
      }*/
      },
      err => {
        console.log(err);
      }
    );
    this.hideAutocompleteDiv(formIndex);
  }

  hideAutocompleteDiv(formIndex) {
    this.autocompletes[formIndex].divDisplay = 'none';
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

  getTotalAmountPaid() {
    const amountPaid = this.billingForm.value.paymentDetails.reduce((a, b) => a + b.amount, 0);
    this.checkPayment = amountPaid < this.totalPaymentDue;
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
          // @ts-ignore
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

  get paymentForm() {
    return <FormArray>this.billingForm.get('paymentDetails');
  }

  get guestForm() {
    return <FormArray>this.guestsForm.get('guestDetails');
  }
}

// Alternative way to get current time
/*const now = new Date();
const current1 = formatDate(now, 'yyyy-MM-dd HH:mm:SS', 'en');*/

// Firing a sweet alert from the backend
// Swal.fire('Success!', 'Checkin was successful', 'success').then(r => {});
