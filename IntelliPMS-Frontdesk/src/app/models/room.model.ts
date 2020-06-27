import {CheckinOutModel} from './checkin-out.model';

export class RoomModel {
  roomId: number;
  hotelId: number;
  roomNumber: number;
  roomType: string;
  roomTypeId: number;
  checkInId: number;
  roomTypeName: string;
  icon: string;
  cost: number;
  notForSale: string;
  roomStatus: string;
  currentOccupant: string;
  guestId: string;
  checkInDate: string;
  freeDate: string;
  cleanRoom: string;
  buildingName: string;
  daysLeft: number;
  daysSpent: number;
  picture: string;
  lostKey: string;
  dropOffKey: string;
  attributes: any[];
  occupants: CheckinOutModel[];
}
