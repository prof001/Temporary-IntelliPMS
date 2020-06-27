import {ServiceModel} from './service.model';

export class HouseKeepingModel {
  houseKeepingId: number;
  guestId: string;
  checkInId: number;
  roomId: number;
  employeeId: number;
  roomNumber: number;
  createdDateTime: string;
  endDateTime: string;
  amount: number;
  guestName: string;
  statuss: string;
  paymentStatus: string;
  items: ServiceModel[];
}
