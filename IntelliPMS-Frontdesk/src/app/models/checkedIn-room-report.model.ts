export class CheckedInRoomReportModel {
  checkInId: number;
  roomId: number;
  roomNumber: number;
  checkInDate: string;
  checkOutDate: string;
  formattedCheckInDate: string;
  formattedCheckOutDate: string;
  extended: string;
  numOfGuests: number;
  dropOffKey: string;
  changedRoom: string;
  totalDeposit: number;
  totalBill: number;
}
