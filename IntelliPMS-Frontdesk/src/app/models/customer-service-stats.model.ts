import {ServiceModel} from './service.model';

export class CustomerServiceStatsModel {
  roomService: ServiceModel = new ServiceModel();
  laundryService: ServiceModel = new ServiceModel();
  housekeeping: ServiceModel = new ServiceModel();
  issuesComments: ServiceModel = new ServiceModel();
}
