import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RandomListsService} from '../../../shared/random-lists.service';
import {GuestModel} from '../../../models/guest.model';
import {HttpService} from '../../../shared/http.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ReservationModel} from '../../../models/reservation.model';
import * as moment from 'moment';
import {RoomModel} from '../../../models/room.model';
import {PaymentChoiceModel} from '../../../models/payment-choice.model';
import {AccountDetailModel} from '../../../models/account-detail.model';
import {PosDetailModel} from '../../../models/pos-detail.model';
import {EmployeeModel} from '../../../models/employee.model';
import {RegisterModel} from '../../../models/register.model';

@Component({
  selector: 'app-reservation-checkin',
  templateUrl: './reservation-checkin.component.html',
  styleUrls: ['./reservation-checkin.component.css']
})
export class ReservationCheckinComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private randomList: RandomListsService,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private router: Router) { }

  guestsInfoForm: FormGroup;
  guestInfoFormArray: FormArray;
  billingForm: FormGroup;
  paymentDetailsArray: FormArray;
  countryList = this.randomList.countryList;
  phoneNumberList: GuestModel[] = [];
  autocompletes = [
    {divDisplay: 'none'}
  ];
  inputsDisplay = [
    {
      showCardInput: 'block',
      showTransferInput: 'none',
      showCashInput: 'none',
      showManagerInput: 'none'
    }
  ];
  paymentChoices: PaymentChoiceModel[] = [];
  selectedBankAccount: AccountDetailModel = new AccountDetailModel();
  hotelPosDetails: PosDetailModel[] = [];
  selectedPos: PosDetailModel = new PosDetailModel();
  hotelAccountDetails: AccountDetailModel[] = [];

  reservationId;
  reservationInfo: ReservationModel = new ReservationModel();
  availableRooms: RoomModel[] = [];
  hideGuestInfoForm = true; hidePickRoomForm = false;
  chosenRoom: RoomModel = new RoomModel();
  balance; count = 1; totalDebit;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');

  lettersRegex = '^[A-Za-z]+$';
  processing = false;
  deactivateNextFinishButton = true;
  newBalance; amountPaid;
  managers: EmployeeModel[] = [];
  openedCashRegister: RegisterModel = new RegisterModel();
  registerHourExceeded = false;

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.reservationId = params.reservationId;
      this.getReservationInfo(this.reservationId);
    });
    this.guestsInfoForm = this.formBuilder.group({
      guestInfo: this.formBuilder.array([
        this.guest()
      ])
    });
    this.billingForm = this.formBuilder.group({
      paymentDetails: this.formBuilder.array([
        this.payments()
      ])
    });
    this.getHotelAccountDetails();
    this.getHotelPosDetails();
    this.nextFinishButtonActivator();
    this.getManagers();
    this.getOpenedRegister();
  }

  guest(): FormGroup {
    return this.formBuilder.group({
      phoneNumber: [null, [
        Validators.required,
        Validators.pattern(/^[0-9]+$/)]
      ],
      email: [null, [
        Validators.required,
        Validators.pattern(/^.+@.+\..+/)]
      ],
      guestTitle: [null, Validators.required],
      firstName: [null, [
        Validators.required,
        Validators.pattern(this.lettersRegex)
      ]],
      otherName: [null, Validators.pattern(this.lettersRegex)],
      lastName: [null, [
        Validators.required,
        Validators.pattern(this.lettersRegex)
      ]],
      gender: [null, Validators.required],
      country: ['Nigeria', Validators.required],
      address: [null, Validators.required]
    });
  }

  showGuestInfoForm(roomId) {
    this.chosenRoom = this.availableRooms.filter(e => e.roomId === roomId)[0];
    this.totalDebit = (this.chosenRoom.cost + 2000);
    this.balance = this.reservationInfo.totalPayment - this.totalDebit;
    this.hideGuestInfoForm = false;
    this.hidePickRoomForm = true;
    this.nextFinishButtonActivator();
  }

  addGuest(): void {
    this.guestInfoFormArray = this.guestsInfoForm.get('guestInfo') as FormArray;
    this.guestInfoFormArray.push(this.guest());
    this.autocompletes.push({divDisplay: 'none'});
  }

  removeGuest(i: number) {
    this.guestInfoFormArray = this.guestsInfoForm.get('guestInfo') as FormArray;
    this.guestInfoFormArray.removeAt(i);
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

  checkIn() {
    this.processing = true;
    let newGuestBalance;
    if (this.balance >= 0) {
      newGuestBalance = this.balance;
    } else {
      newGuestBalance = this.amountPaid + this.balance;
    }

    const guestInfo = this.guestsInfoForm.value.guestInfo;
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);
    this.reservationInfo.reservationEndDateTime = this.randomList.parseDateTime(this.reservationInfo.reservationEndDateTime);

    const mainDetails = {
      balanceInfo: undefined,
      ...this.reservationInfo,
      guestInfo,
      currentDateTime,
      newGuestBalance,
      hotelId: this.hotelId,
      createdBy: this.employeeId,
      registerId: this.registerId,
      chosenRoom: this.chosenRoom,
      totalDebit: this.totalDebit
    };
    let reservationDetails;

    if (this.balance < 0) {
      mainDetails.balanceInfo = 'payment';
      const payments = {paymentDetails: this.billingForm.value.paymentDetails};
      reservationDetails = {...mainDetails, ...payments};
    } else {
      mainDetails.balanceInfo = 'balanced';
      reservationDetails = mainDetails;
    }

    this.httpService.reservationCheckIn('guests/reservationCheckIn', reservationDetails).subscribe(
      res => {
        this.processing = false;
        if (this.count === this.reservationInfo.numOfRooms) {
          this.router.navigate(['/room/reservations'], {queryParams: {chk: 'success'}});
        }
        ++this.count;
        this.getAvailableRooms(this.reservationInfo.roomTypeId);
        this.refreshPage();
        this.getReservationInfo(this.reservationId);
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  refreshPage() {
    this.billingForm.reset();
    this.guestsInfoForm.reset();
    if (this.paymentDetailsArray !== undefined) {
      this.paymentDetailsArray.clear();
    }
    if (this.guestInfoFormArray !== undefined) {
      this.guestInfoFormArray.clear();
      this.addGuest();
    }
    this.paymentChoices = [];
    this.hideGuestInfoForm = true;
    this.hidePickRoomForm = false;
  }

  getPhoneNumberSuggestions($event, formIndex) {
    const value = $event.target.value;
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
        this.guestsInfoForm.patchValue({
          guestInfo: [{
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
        // this.guestInfo = res;
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

  getReservationInfo(reservationId) {
    this.httpService.getReservationInfo(`hotels/${this.hotelId}/reservation/${reservationId}`).subscribe(
      res => {
        this.reservationInfo = res;
        // this.reservationInfo.totalPayment = this.reservationInfo.billings.reduce((a, b) => a + b.amount, 0);
        this.getAvailableRooms(this.reservationInfo.roomTypeId);
      },
      err => {
        console.log(err);
      }
    );
  }

  getAvailableRooms(roomType) {
    this.httpService.getRooms(`hotels/${this.hotelId}/rooms?roomType=${roomType}`).subscribe(
      res => {
        this.availableRooms = res;
        const daysLeft = this.availableRooms.map(e => this.getDaysLeft(e.freeDate));
        // tslint:disable-next-line:forin
        for (const i in this.availableRooms) {
          this.availableRooms[i].daysLeft = daysLeft[i];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  nextFinishButtonActivator() {
    if (this.balance < 0) {
      this.deactivateNextFinishButton = true;
      this.amountPaid = this.billingForm.value.paymentDetails.reduce((a, b) => a + b.amount, 0);
      this.deactivateNextFinishButton = this.amountPaid < -this.balance;
      // this.newAmountPaid = this.amountPaid - this.balance;
    } else {
      this.deactivateNextFinishButton = false;
    }
  }

  getDaysLeft(checkOut) {
    const time1 = moment().format().split(/[-T.:+]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]}`);
    let daysLeft = 0;

    if (checkOut !== null) {
      const time2 = checkOut.split(/[-T.:+]/);
      const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]}`);

      if (date2 > date1) {
        // @ts-ignore
        const diffTime = Math.abs(date2 - date1);
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysLeft = -1;
      }
    } else {
      daysLeft = -2;
    }
    return daysLeft;
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

  get guestForm() {
    return <FormArray>this.guestsInfoForm.get('guestInfo');
  }

  get paymentForm() {
    return <FormArray>this.billingForm.get('paymentDetails');
  }

}
