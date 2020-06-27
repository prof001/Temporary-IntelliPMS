import {BillingsModel} from './billings.model';

export class ReservationModel {
  reservationId: number;
  payingGuestId: number;
  payingGuestName: string;
  reservationStartDateTime: string;
  reservationEndDateTime: string;
  billingId: number;
  roomTypeId: number;
  roomTypeName: string;
  phoneNumber: string;
  icon: string;
  numOfRooms: number;
  adultsPerRoom: number;
  childrenPerRoom: number;
  formattedStartDate: string;
  formattedEndDate: string;
  exceedStartDate: boolean;
  totalPayment: number;
  error: string;
  billings: BillingsModel[];
}
