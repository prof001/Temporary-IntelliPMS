import {DepositModel} from './deposit.model';
import {DebitModel} from './debits.model';
import {ServiceModel} from './service.model';

export class BalanceBillModel {
  checkInId: number;
  guestId: string;
  payingGuestId: string;
  checkInDate: string;
  billingId: string;
  phoneNumber: string;
  guestName: string;
  cost: number;
  email: string;
  daysSpent: number;
  deposits: DepositModel[];
  debits: DebitModel[];
  otherRoomsStay: DebitModel[];
  extendStay: ServiceModel[];
  totalDeposits: number;
  totalDebits: number;
  guestBalance: number;
}
