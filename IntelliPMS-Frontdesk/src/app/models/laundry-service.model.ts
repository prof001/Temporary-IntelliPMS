import {ServiceModel} from './service.model';

export class LaundryServiceModel {
  laundryId: number;
  guestId: number;
  guestName: string;
  employeeId: number;
  roomId: number;
  roomNumber: number;
  createdDateTime: string;
  dueDateTime: string;
  completedDateTime: string;
  date: any;
  time: any;
  statuss: string;
  amount: number;
  paymentStatus: string;
  checkInId: number;
  items: ServiceModel[];
}
