import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sales-avenue-revenue',
  templateUrl: './sales-avenue-revenue.component.html',
  styleUrls: ['./sales-avenue-revenue.component.css']
})
export class SalesAvenueRevenueComponent implements OnInit {
  categoryList = [
    {
      roomCategory: 'Room 10',
      roomRevenue: 210000,
      fdRevenue: 120000,
      fbRevenue: 10000,
      otherRevenue: 140000,
    },
    {
      roomCategory: 'Room 12',
      roomRevenue: 210000,
      fdRevenue: 120000,
      fbRevenue: 10000,
      otherRevenue: 140000,
    },
    {
      roomCategory: 'Room 16',
      roomRevenue: 210000,
      fdRevenue: 120000,
      fbRevenue: 10000,
      otherRevenue: 140000
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
