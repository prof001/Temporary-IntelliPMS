import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() { }
  checkInInfo = {
    checkInDateTime: undefined,
    checkOutDateTime: undefined,
    daysNum: undefined
  };
}
