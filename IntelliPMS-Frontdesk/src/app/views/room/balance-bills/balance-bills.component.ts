import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/http.service';
import {BalanceBillModel} from '../../../models/balance-bill.model';
import * as moment from 'moment';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PosDetailModel} from '../../../models/pos-detail.model';
import {PaymentChoiceModel} from '../../../models/payment-choice.model';
import {AccountDetailModel} from '../../../models/account-detail.model';
import {RandomListsService} from '../../../shared/random-lists.service';
import {EmployeeModel} from '../../../models/employee.model';
import {RegisterModel} from '../../../models/register.model';

@Component({
  selector: 'app-balance-bills',
  templateUrl: './balance-bills.component.html',
  styleUrls: ['./balance-bills.component.css']
})
export class BalanceBillsComponent implements OnInit {
  guestBillsBalance: BalanceBillModel = new BalanceBillModel();
  roomId; checkInId; totalBalance;
  billingForm: FormGroup;
  selectedPos: PosDetailModel = new PosDetailModel();
  paymentDetailsArray: FormArray;
  paymentChoices: PaymentChoiceModel[] = [];
  selectedBankAccount: AccountDetailModel = new AccountDetailModel();
  hotelPosDetails: PosDetailModel[] = [];
  hotelAccountDetails: AccountDetailModel[] = [];
  deactivateCheckOutButton: boolean;
  banksList = this.randomList.nigerianBanks;
  hideRefund = true; refundMethod = 'keep';
  guestBankName; guestAccountNumber;

  hotelId = localStorage.getItem('hotelId');
  employeeId = localStorage.getItem('employeeId');
  registerId = localStorage.getItem('registerId');
  processing = false;
  managers: EmployeeModel[] = [];
  openedCashRegister: RegisterModel = new RegisterModel();
  registerHourExceeded = false;

  inputsDisplay = [
    {
      showCardInput: 'block',
      showTransferInput: 'none',
      showCashInput: 'none',
      showManagerInput: 'none'
    }
  ];
  constructor(private httpService: HttpService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private randomList: RandomListsService,
              private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.roomId = params.roomId;
      this.checkInId = params.checkInId;
      this.getGuestBillBalance();
      this.getHotelAccountDetails();
      this.getHotelPosDetails();
      this.getOpenedRegister();
      this.getManagers();
    });

    this.billingForm = this.formBuilder.group({
      paymentDetails: this.formBuilder.array([
        this.payments()
      ])
    });
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

  getGuestBillBalance() {
    this.httpService.getGuestBillBalance(`guests/checkOutBalanceBills/${this.checkInId}/${this.roomId}`).subscribe(
      res => {
        this.guestBillsBalance = res;
        if (this.guestBillsBalance.otherRoomsStay.length === 0) {
          this.guestBillsBalance.daysSpent = +this.getDaysNumber(this.guestBillsBalance.checkInDate);
          this.guestBillsBalance.totalDebits = this.guestBillsBalance.debits.reduce((a, b) => a + b.amount, 0);
          this.guestBillsBalance.totalDeposits = this.guestBillsBalance.deposits.reduce((a, b) => a + b.amount, 0);
          this.guestBillsBalance.totalDebits += this.guestBillsBalance.daysSpent * this.guestBillsBalance.cost;
          this.totalBalance = this.guestBillsBalance.totalDeposits - this.guestBillsBalance.totalDebits;
        } else {
          const currentRoomDays = +this.getDaysNumber(this.guestBillsBalance.checkInDate);
          const oldRoomsDays = this.guestBillsBalance.otherRoomsStay.reduce((a, b) => a + b.oldRoomStayDays, 0);
          this.guestBillsBalance.daysSpent = currentRoomDays - oldRoomsDays;
          const debit1 = this.guestBillsBalance.debits.reduce((a, b) => a + b.amount, 0);
          const debit2 = this.guestBillsBalance.otherRoomsStay.reduce((a, b) => a + b.calculatedAmount, 0);
          const debit3 = this.guestBillsBalance.extendStay.reduce((a, b) => a + b.cost, 0);
          this.guestBillsBalance.totalDebits = debit1 + debit2 + debit3;
          this.guestBillsBalance.totalDebits += this.guestBillsBalance.daysSpent * this.guestBillsBalance.cost;
          this.guestBillsBalance.totalDeposits = this.guestBillsBalance.deposits.reduce((a, b) => a + b.amount, 0);
          this.totalBalance = this.guestBillsBalance.totalDeposits - this.guestBillsBalance.totalDebits;
        }
        this.checkOutButtonActivator();
      },
      err => {
        console.log(err);
      }
    );
  }

  getDaysNumber(checkIn) {
    const time1 = moment().format().split(/[-T.:+ ]/);
    const date1 = new Date(`${time1[1]}/${time1[2]}/${time1[0]} ${time1[3]}:${time1[4]}:${time1[5]}`);
    let daysSpent;

    const time2 = checkIn.split(/[-T.:+ ]/);
    const date2 = new Date(`${time2[1]}/${time2[2]}/${time2[0]} ${time2[3]}:${time2[4]}:${time2[5]}`);

    if (date2 <= date1) {
      // @ts-ignore
      const diffTime = Math.abs(date2 - date1);
      daysSpent = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      daysSpent = -1;
    }
    return daysSpent;
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

  checkOut() {
    this.processing = true;
    const momentDateTime = moment().format('YYYY-MM-DD HH:mm:SS');
    const dateTime = this.randomList.parseDateTime(momentDateTime);
    let balanceInfo;
    if (this.totalBalance > 0) {
      balanceInfo = this.refundMethod;
    } else if (this.totalBalance < 0) {
      balanceInfo = 'make payment';
    } else {
      balanceInfo = 'balanced';
    }
    let checkOutDetails;

    const mainDetails = {
      checkInId: this.checkInId,
      roomId: this.roomId,
      balanceInfo,
      dateTime,
      registerId: this.registerId,
      createdBy: this.employeeId,
      hotelId: this.hotelId,
      amountDuringCheckout: this.totalBalance,
      guestId: this.guestBillsBalance.payingGuestId,
      deposits: this.guestBillsBalance.deposits,
      debits: this.guestBillsBalance.debits,
    };

    if (balanceInfo === 'refund') {
      const refundDetails = {
        refundMethod: this.refundMethod,
        bankName: this.guestBankName,
        accountNumber: this.guestAccountNumber
      };
      checkOutDetails = { ...mainDetails, ...refundDetails};
    } else if (balanceInfo === 'make payment') {
      const payments = {
        paymentDetails: this.billingForm.value.paymentDetails,
      };
      checkOutDetails = { ...mainDetails, ...payments};
    } else {
      checkOutDetails = {...mainDetails};
    }

    this.httpService.checkOutGuest('guests/checkOut', checkOutDetails).subscribe(
      res => {
        this.router.navigate(['/room/checkout'], {queryParams: {chk: 'yes'}});
      },
      err => {
        this.processing = false;
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

  refundChecker() {
    this.hideRefund = this.refundMethod !== 'refund';
  }

  checkOutButtonActivator() {
    if (this.totalBalance < -1) {
      this.deactivateCheckOutButton = true;
      const amountPaid = this.billingForm.value.paymentDetails.reduce((a, b) => a + b.amount, 0);
      this.deactivateCheckOutButton = amountPaid < -this.totalBalance;
    } else {
      this.deactivateCheckOutButton = false;
    }
  }

  get paymentForm() {
    return <FormArray>this.billingForm.get('paymentDetails');
  }
}
