export class GuestStayModel {
  checkInId: number;
  guestId: number;
  roomId: number;
  guestName: string;
  roomNumber: number;
  roomTypeId: number;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  guestType: number | string;
  formattedCheckInDate: string;
  formattedCheckOutDate: string;
  daysLeft: number;
}
