import {PaymentDetailsModel} from './payment-detail.model';

export class BillingsModel {
  roomId: number;
  billingId: number;
  billedFor: string;
  guestId: number;
  paymentDate: string;
  paymentType: string;
  paymentDetails: PaymentDetailsModel[];
  amount: number;
  totalRevenue: number;
}
