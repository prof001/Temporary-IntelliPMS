import {ServiceModel} from './service.model';
import {AccountDetailModel} from './account-detail.model';

export class HotelModel {
  hotelId?: number;
  hotelName: string;
  numOfRooms: number;
  address: string;
  location: string;
  picture: string;
  totalRoomsCreated: number;
  managerName: string;
  totalEmployees: number;
  services?: ServiceModel[];
  bankAccountDetails: AccountDetailModel[];
}
