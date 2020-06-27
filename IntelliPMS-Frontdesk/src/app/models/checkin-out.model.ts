export class CheckinOutModel {
  guestId: number;
  checkInId: number;
  checkInDate: string;
  icon: string;
  checkOutDate: string;
  actualCheckOutDate: string;
  freeDate: string;
  roomTypeName: string;
  currentOccupant: string;
  occupantName: string;
  guestName: string | string[];
  daysLeft: number;
  roomNumber: number;
  roomStatus: string;
  roomId: number;
  payingGuestId: number;
  payingGuestName: string;
  billingsId: number;
  lostKey: string;
  cost: number;
  numOfRooms: number;
  numOfGuests: number;
}
