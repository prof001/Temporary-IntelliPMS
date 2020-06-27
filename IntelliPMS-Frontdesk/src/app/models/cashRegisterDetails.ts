export class CashRegisterDetailsModel {
  activityId: number;
  billingId: number;
  billedFor: string;
  paymentDate: string;
  formattedDate: [string] | string;
  paymentType: string;
  amount: number;
  totalAmount: number;
  num: number;
}
