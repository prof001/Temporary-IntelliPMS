import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {

  constructor() { }
  // public baseUrl = 'http://197.210.166.58:3000/api/v1';
  public baseUrl = 'http://localhost:3000/api/v1';
}
