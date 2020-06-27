import {PosDetailModel} from './pos-detail.model';
import {AccountDetailModel} from './account-detail.model';

export class PaymentChoiceModel {
  formNum: number;
  cardPayment: PosDetailModel = new PosDetailModel();
  transferPayment: AccountDetailModel = new AccountDetailModel();
}
