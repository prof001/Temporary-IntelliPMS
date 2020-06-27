import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {RoomModel} from '../models/room.model';
import {HotelModel} from '../models/hotel.model';
import {ServiceModel} from '../models/service.model';
import {ReservationModel} from '../models/reservation.model';
import {GuestStayModel} from '../models/guest-stay.model';
import {GuestModel} from '../models/guest.model';
import {LaundryServiceModel} from '../models/laundry-service.model';
import {RoomServiceModel} from '../models/room-service.model';
import {IssueCommentModel} from '../models/issue-comment.model';
import {AccountDetailModel} from '../models/account-detail.model';
import {PosDetailModel} from '../models/pos-detail.model';
import {BalanceBillModel} from '../models/balance-bill.model';
import {AvailableRoomSummaryModel} from '../models/available-room-summary.model';
import {RoomTypeModel} from '../models/room-type.model';
import {BuildingModel} from '../models/building.model';
import {HouseKeepingModel} from '../models/housekeeping.model';
import {EmployeeModel} from '../models/employee.model';
import {RegisterModel} from '../models/register.model';
import {CashRegisterDetailsModel} from '../models/cashRegisterDetails';
import {CheckinOutModel} from '../models/checkin-out.model';
import {CheckedInRoomReportModel} from '../models/checkedIn-room-report.model';
import {RevenueReportModel} from '../models/revenue-report.model';
import {HotelStatsModel} from '../models/hotel-stats.model';
import {CustomerServiceStatsModel} from '../models/customer-service-stats.model';
import {ActivityCountModel} from '../models/activity-count.model';
import {BillingsModel} from '../models/billings.model';
import {BaseHttpService} from './base-http.service';
import {GuestsStatsModel} from '../models/guests-stats.model';
import {CustomerReportModel} from '../models/customer-report.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = this.baseHttpService.baseUrl;
  constructor(private http: HttpClient, private baseHttpService: BaseHttpService) { }

  getRooms(path: string) {
    return this.http.get<RoomModel[]>(`${this.baseUrl}/${path}`);
  }

  getRoomInfo(path: string) {
    return this.http.get<RoomModel>(`${this.baseUrl}/${path}`);
  }

  getHotelInfo(path: string) {
    return this.http.get<HotelModel>(`${this.baseUrl}/${path}`);
  }

  getHotels(path: string) {
    return this.http.get<HotelModel[]>(`${this.baseUrl}/${path}`);
  }

  getEmployees(path: string) {
    return this.http.get<EmployeeModel[]>(`${this.baseUrl}/${path}`);
  }

  getCurrentCheckedInRooms(path: string){
    return this.http.get<any[]>(`${this.baseUrl}/${path}`);
  }

  getReservations(path: string) {
    return this.http.get<ReservationModel[]>(`${this.baseUrl}/${path}`);
  }

  getCurrentGuests(path: string) {
    return this.http.get<GuestStayModel[]>(`${this.baseUrl}/${path}`);
  }

  getLaundryList(path: string) {
    return this.http.get<LaundryServiceModel[]>(`${this.baseUrl}/${path}`);
  }

  getHousekeepingList(path: string) {
    return this.http.get<HouseKeepingModel[]>(`${this.baseUrl}/${path}`);
  }

  getRoomServiceList(path: string) {
    return this.http.get<RoomServiceModel[]>(`${this.baseUrl}/${path}`);
  }

  getIssuesCommentsList(path: string) {
    return this.http.get<IssueCommentModel[]>(`${this.baseUrl}/${path}`);
  }

  getPhoneNumberList(path: string) {
    return this.http.get<GuestModel[]>(`${this.baseUrl}/${path}`);
  }

  getGuests(path: string) {
    return this.http.get<GuestModel>(`${this.baseUrl}/${path}`);
  }

  getHotelAccountDetails(path: string) {
    return this.http.get<AccountDetailModel[]>(`${this.baseUrl}/${path}`);
  }

  getHotelPosDetails(path: string) {
    return this.http.get<PosDetailModel[]>(`${this.baseUrl}/${path}`);
  }

  getGuestBillBalance(path: string) {
    return this.http.get<BalanceBillModel>(`${this.baseUrl}/${path}`);
  }

  getAvailableRoomsSummary(path: string) {
    return this.http.get<AvailableRoomSummaryModel[]>(`${this.baseUrl}/${path}`);
  }

  getAllHotelRooms(path: string) {
    return this.http.get<RoomModel[]>(`${this.baseUrl}/${path}`);
  }

  getReservationInfo(path: string) {
    return this.http.get<ReservationModel>(`${this.baseUrl}/${path}`);
  }

  getHotelRoomTypes(path: string) {
    return this.http.get<RoomTypeModel[]>(`${this.baseUrl}/${path}`);
  }

  getHotelBuildings(path: string) {
    return this.http.get<BuildingModel[]>(`${this.baseUrl}/${path}`);
  }

  getHotelServices(path: string) {
    return this.http.get<ServiceModel[]>(`${this.baseUrl}/${path}`);
  }

  getHotelStaffs(path: string) {
    return this.http.get<EmployeeModel[]>(`${this.baseUrl}/${path}`);
  }

  getEmailsList(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  getRoomNumbersList(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  getRoomTypesList(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  getNamesList(path: string) {
    return this.http.get<GuestModel[]>(`${this.baseUrl}/${path}`);
  }

  getEmployeeDetails(path: string) {
    return this.http.get<EmployeeModel>(`${this.baseUrl}/${path}`);
  }

  getOpenedCashRegister(path: string) {
    return this.http.get<RegisterModel>(`${this.baseUrl}/${path}`);
  }

  getCashRegisterSummary(path: string) {
    return this.http.get<CashRegisterDetailsModel[]>(`${this.baseUrl}/${path}`);
  }

  getCashRegisters(path: string) {
    return this.http.get<RegisterModel[]>(`${this.baseUrl}/${path}`);
  }

  getCheckInDetails(path: string) {
    return this.http.get<CheckinOutModel>(`${this.baseUrl}/${path}`);
  }

  getRoomStatusReport(path: string) {
    return this.http.get<RoomModel[]>(`${this.baseUrl}/${path}`);
  }

  getCheckedInRoomsReport(path: string) {
    return this.http.get<CheckedInRoomReportModel[]>(`${this.baseUrl}/${path}`);
  }

  getCheckedInOutRoomsReport(path: string) {
    return this.http.get<CheckinOutModel[]>(`${this.baseUrl}/${path}`);
  }

  getActivityCount(path: string) {
    return this.http.get<ActivityCountModel>(`${this.baseUrl}/${path}`);
  }

  getRevenueReport(path: string) {
    return this.http.get<RevenueReportModel[]>(`${this.baseUrl}/${path}`);
  }

  getHotelStats(path: string) {
    return this.http.get<HotelStatsModel>(`${this.baseUrl}/${path}`);
  }

  getGuestsStats(path: string) {
    return this.http.get<GuestsStatsModel>(`${this.baseUrl}/${path}`);
  }

  getCustomerServiceStats(path: string) {
    return this.http.get<CustomerServiceStatsModel>(`${this.baseUrl}/${path}`);
  }

  getCashRegisterStats(path: string) {
    return this.http.get<RegisterModel>(`${this.baseUrl}/${path}`);
  }

  getRevenueStats(path: string) {
    return this.http.get<BillingsModel[]>(`${this.baseUrl}/${path}`);
  }

  getCustomersList(path: string) {
    return this.http.get<CustomerReportModel[]>(`${this.baseUrl}/${path}`);
  }

  selectedBankAccount(path: string) {
    return this.http.get<AccountDetailModel>(`${this.baseUrl}/${path}`);
  }

  selectedPos(path: string) {
    return this.http.get<PosDetailModel>(`${this.baseUrl}/${path}`);
  }

  createHotel(path: string, hotelData: FormData) {
    return this.http.post(`${this.baseUrl}/${path}`, hotelData);
  }

  createService(path: string, serviceDetails: ServiceModel) {
    return this.http.post(`${this.baseUrl}/${path}`, serviceDetails);
  }

  createRoom(path: string, roomDetails: FormData) {
    return this.http.post(`${this.baseUrl}/${path}`, roomDetails);
  }

  createEmployee(path: string, employeeDetails: FormData) {
    return this.http.post(`${this.baseUrl}/${path}`, employeeDetails);
  }

  createLaundryService(path: string, laundryDetails: LaundryServiceModel) {
    return this.http.post(`${this.baseUrl}/${path}`, laundryDetails);
  }

  createHouseKeepingRequest(path: string, houseKeepingDetails: HouseKeepingModel) {
    return this.http.post(`${this.baseUrl}/${path}`, houseKeepingDetails);
  }

  createRoomService(path: string, serviceRequestDetails: RoomServiceModel) {
    return this.http.post(`${this.baseUrl}/${path}`, serviceRequestDetails);
  }

  createIssueComment(path: string, issueCommentDetails: IssueCommentModel) {
    return this.http.post(`${this.baseUrl}/${path}`, issueCommentDetails);
  }

  createRoomType(path: string, roomTypeDetails: RoomTypeModel) {
    return this.http.post(`${this.baseUrl}/${path}`, roomTypeDetails);
  }

  createBuilding(path: string, buildingDetail: BuildingModel) {
    return this.http.post(`${this.baseUrl}/${path}`, buildingDetail);
  }

  openCashRegister(path: string, registerDetail) {
    return this.http.post(`${this.baseUrl}/${path}`, registerDetail);
  }

  dropOffKey(path: string, keyDropOffDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, keyDropOffDetails);
  }

  lostRoomKey(path: string, roomDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, roomDetails);
  }

  changeRoom(path: string, changeRoomDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, changeRoomDetails);
  }

  changeKey(path: string, roomDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, roomDetails);
  }

  editHotelInfo(path: string, hotelData: FormData) {
    return this.http.put(`${this.baseUrl}/${path}`, hotelData);
  }

  editRoomInfo(path: string, roomData: FormData) {
    return this.http.put(`${this.baseUrl}/${path}`, roomData);
  }

  editReservation(path: string, reservationDetail) {
    return this.http.put(`${this.baseUrl}/${path}`, reservationDetail);
  }

  pickUpKey(path: string, pickUpDetail) {
    return this.http.put(`${this.baseUrl}/${path}`, pickUpDetail);
  }

  checkInGuest(path: string, checkInDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, checkInDetails);
  }

  checkOutGuest(path: string, checkOutDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, checkOutDetails);
  }

  makeReservation(path: string, reservationDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, reservationDetails);
  }

  makeExtraPayment(path: string, paymentDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, paymentDetails);
  }

  cancelReservation(path: string, reservationDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, reservationDetails);
  }

  reservationCheckIn(path: string, reservationDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, reservationDetails);
  }

  extendStay(path: string, extendStayDetails) {
    return this.http.post(`${this.baseUrl}/${path}`, extendStayDetails);
  }

  countUnprocessedLaundryRequests(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  updateLaundryRequest(path: string, laundryDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, laundryDetails);
  }
  updateHousekeepingRequest(path: string, housekeepingDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, housekeepingDetails);
  }

  countUnprocessedRoomServiceRequests(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  countUnprocessedHousekeepingRequest(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  updateRoomServiceRequest(path: string, roomServiceDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, roomServiceDetails);
  }

  countUnprocessedIssuesComments(path: string) {
    return this.http.get(`${this.baseUrl}/${path}`);
  }

  updateIssuesComments(path: string, issuesCommentsDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, issuesCommentsDetails);
  }

  closeCashRegister(path: string, cashRegisterDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, cashRegisterDetails);
  }

  updateLoginAccess(path: string, statusDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, statusDetails);
  }

  resetPassword(path: string, passwordDetails) {
    return this.http.put(`${this.baseUrl}/${path}`, passwordDetails);
  }

  updateRoomSaleStatus(path: string, saleStatus) {
    return this.http.put(`${this.baseUrl}/${path}`, saleStatus);
  }
}
