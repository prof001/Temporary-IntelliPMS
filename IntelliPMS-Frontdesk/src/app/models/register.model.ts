import {CashRegisterDetailsModel} from './cashRegisterDetails';

export class RegisterModel {
  registerId: number;
  employeeId: string;
  cashOnHand: number;
  dateTimeOpened: string;
  dateTimeClosed: string;
  balanceOnClose: number;
  statuss: string;
  totalAmountOnClose: number;
  totalTransactions: number;
  employeeName: string;
  department: string;
  totalCash: number;
  active: number;
  closed: number;
  registerDetails: CashRegisterDetailsModel[];
}
