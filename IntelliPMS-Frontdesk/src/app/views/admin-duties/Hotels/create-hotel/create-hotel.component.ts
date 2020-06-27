import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, FormArray, FormBuilder, Validators, Form} from '@angular/forms';

import {HttpService} from '../../../../shared/http.service';
import {RandomListsService} from '../../../../shared/random-lists.service';

@Component({
  selector: 'app-create-hotel',
  templateUrl: './create-hotel.component.html',
  styleUrls: ['./create-hotel.component.css']
})
export class CreateHotelComponent implements OnInit {
  constructor(
    private httpService: HttpService,
    private router: Router,
    private formBuilder: FormBuilder,
    private randomList: RandomListsService) { }
  imageUrl: string | ArrayBuffer;
  display = false;
  form: FormGroup;
  bankAccountArray: FormArray;
  PosArray: FormArray;
  hotelPicture: File = null;
  bankList = this.randomList.nigerianBanks;
  employeeId = localStorage.getItem('employeeId');
  processing = false;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      hotelName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      numOfRooms: new FormControl(null, {
        validators: [Validators.required]
      }),
      address: new FormControl(null, {
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      picture: new FormControl(null, [Validators.required]),
      bankAccountDetails: this.formBuilder.array([
        this.bankAccounts()
      ]),
      posDetails: this.formBuilder.array([
        this.posDetail()
      ])
    });
  }

  bankAccounts(): FormGroup {
    return this.formBuilder.group({
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required]
    });
  }

  addBankAccount(): void {
    this.bankAccountArray = this.form.get('bankAccountDetails') as FormArray;
    this.bankAccountArray.push(this.bankAccounts());
  }

  removeBankAccount(i: number) {
    this.bankAccountArray = this.form.get('bankAccountDetails') as FormArray;
    this.bankAccountArray.removeAt(i);
  }

  posDetail(): FormGroup {
    return this.formBuilder.group({
      posBankName: ['', Validators.required],
      posId: ['', Validators.required]
    });
  }

  addPos(): void {
    this.PosArray = this.form.get('posDetails') as FormArray;
    this.PosArray.push(this.posDetail());
  }

  removePos(i: number) {
    this.PosArray = this.form.get('posDetails') as FormArray;
    this.PosArray.removeAt(i);
  }

  showPreview(event) {
    this.hotelPicture = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(this.hotelPicture);
  }

  createHotel() {
    this.processing = true;
    const hotelData = new FormData();
    hotelData.append('hotelName', this.form.value.hotelName);
    hotelData.append('numOfRooms', this.form.value.numOfRooms);
    hotelData.append('address', this.form.value.address);
    hotelData.append('location', this.form.value.location);
    hotelData.append('bankAccountDetails', JSON.stringify(this.form.value.bankAccountDetails));
    hotelData.append('posDetails', JSON.stringify(this.form.value.posDetails));
    hotelData.append('createdBy', this.employeeId);

    if (this.hotelPicture !== null) {
      hotelData.append('picture', this.hotelPicture, this.form.value.hotelName);
    }

    this.httpService.createHotel('hotels/createHotel', hotelData).subscribe(
      res => {
        this.processing = false;
        // @ts-ignore
        this.router.navigate(['/admin-duties/hotel-info', res.hotelId], {queryParams: {msg: 'created'}});
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  get hotelName() {
    return this.form.get('hotelName');
  }

  get numOfRooms() {
    return this.form.get('numOfRooms');
  }

  get address() {
    return this.form.get('address');
  }

  get location() {
    return this.form.get('location');
  }

  get picture() {
    return this.form.get('picture');
  }

  get bankAccountDetails() {
    return <FormArray>this.form.get('bankAccountDetails');
  }

  get posDetails() {
    return <FormArray>this.form.get('posDetails');
  }
}
