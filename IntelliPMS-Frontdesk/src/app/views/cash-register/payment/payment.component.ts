import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PaymentChoiceModel} from '../../../models/payment-choice.model';
import {AccountDetailModel} from '../../../models/account-detail.model';
import {PosDetailModel} from '../../../models/pos-detail.model';
import {HttpService} from '../../../shared/http.service';
import {ActivatedRoute, Params} from '@angular/router';
import {CheckinOutModel} from '../../../models/checkin-out.model';
import * as moment from 'moment';
import {RandomListsService} from '../../../shared/random-lists.service';
import {EmployeeModel} from '../../../models/employee.model';
import {RegisterModel} from '../../../models/register.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private randomList: RandomListsService) { }

  billingForm: FormGroup;
  paymentDetailsArray: FormArray;
  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');
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
  processing = false;
  checkInId;
  checkInDetails: CheckinOutModel = new CheckinOutModel();
  showSuccessAlert = false;
  managers: EmployeeModel[] = [];
  openedCashRegister: RegisterModel = new RegisterModel();
  registerHourExceeded = false;

  ngOnInit(): void {
    this.getHotelAccountDetails();
    this.getHotelPosDetails();
    this.getManagers();
    this.getOpenedRegister();
    this.billingForm = this.formBuilder.group({
      paymentDetails: this.formBuilder.array([
        this.payments()
      ])
    });

    this.route.params.subscribe((params: Params) => {
      this.checkInId = params.checkInId;
      this.getCheckInDetails();
    });
  }

  getCheckInDetails() {
    this.httpService.getCheckInDetails(`guests/${this.checkInId}/checkInDetails`).subscribe(
      res => {
        this.checkInDetails = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  makeExtraPayment() {
    // this.processing = true;
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const currentDateTime = this.randomList.parseDateTime(momentDateTime);

    const extraPaymentDetails = {
      checkInId: this.checkInId,
      guestId: this.checkInDetails.guestId,
      registerId: this.registerId,
      hotelId: this.hotelId,
      currentDateTime,
      paymentDetails: this.billingForm.value.paymentDetails
    };
    this.httpService.makeExtraPayment('guests/payExtra', extraPaymentDetails).subscribe(
      res => {
        console.log(res);
        window.scrollTo(0, 0);
        this.processing = false;
        this.showSuccessAlert = true;
        this.billingForm.reset();
        if (this.paymentDetailsArray !== undefined) {
          this.paymentDetailsArray.clear();
          this.addPayment();
        }
      },
      err => {
        console.log(err);
      }
    );
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

  onAlertClosed() {
    this.showSuccessAlert = false;
  }

  get paymentForm() {
    return <FormArray>this.billingForm.get('paymentDetails');
  }

}
