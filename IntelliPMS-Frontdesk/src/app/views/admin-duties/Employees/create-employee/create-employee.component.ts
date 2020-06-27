import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../../shared/http.service';
import {HotelModel} from '../../../../models/hotel.model';
import {EmployeeModel} from '../../../../models/employee.model';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  imageUrl: string; employeePicture: File;
  employeeForm: FormGroup; phoneNumRegex = '^[0-9]*$';
  lettersRegex = '^[A-Za-z]+$';
  showSuccessAlert = false;
  hotels: HotelModel[] = [];
  loginAccess = true; showPassword = false;
  hotelListArray: FormArray;
  employeeId = localStorage.getItem('employeeId');
  processing = false;
  showOperateRegister = false;
  employee: EmployeeModel = new EmployeeModel();
  constructor(private httpService: HttpService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.employeeForm = this.formBuilder.group({
      firstName: new FormControl(null, [
        Validators.required,
        Validators.pattern(this.lettersRegex)
      ]),
      otherName: new FormControl(null, [Validators.pattern(this.lettersRegex)]),
      lastName: new FormControl(null, [
        Validators.required,
        Validators.pattern(this.lettersRegex)
      ]),
      employeeRole: new FormControl(null, [Validators.required]),
      emailAddress: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      employeeHotels: this.formBuilder.array([
        this.hotelList()
      ]),
      gender: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      loginAccess: new FormControl(null),
      operateRegister: new FormControl(null),
      password: new FormControl(null),
      phoneNumber: new FormControl(null, {
        validators: [Validators.required, Validators.pattern(this.phoneNumRegex)]
      }),
      picture: new FormControl(null)
    });

    this.getHotels();
    this.getEmployeeDetails();
  }

  hotelList(): FormGroup {
    return this.formBuilder.group({
      hotel: [null, Validators.required]
    });
  }

  addHotelList(): void {
    this.hotelListArray = this.employeeForm.get('employeeHotels') as FormArray;
    this.hotelListArray.push(this.hotelList());
  }

  removeHotelList(i: number) {
    this.hotelListArray = this.employeeForm.get('employeeHotels') as FormArray;
    this.hotelListArray.removeAt(i);
  }

  showPreview(event) {
    this.employeePicture = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(this.employeePicture);
  }

  onCreateEmployee() {
    // console.log(this.employeePicture);
    this.processing = true;
    const employeeData = new FormData();
    const employeeName = `${this.employeeForm.value.lastName}-${this.employeeForm.value.firstName}`;

    if (this.employeeForm.value.password && this.employeeForm.value.loginAccess === true) {
      employeeData.append('password', this.employeeForm.value.password);
    }
    if (this.employeePicture !== undefined) {
      employeeData.append('picture', this.employeePicture, employeeName);
    }

    employeeData.append('firstName', this.employeeForm.value.firstName);
    employeeData.append('otherName', this.employeeForm.value.otherName);
    employeeData.append('lastName', this.employeeForm.value.lastName);
    employeeData.append('employeeRole', this.employeeForm.value.employeeRole);
    employeeData.append('emailAddress', this.employeeForm.value.emailAddress);
    employeeData.append('phoneNumber', this.employeeForm.value.phoneNumber);
    employeeData.append('address', this.employeeForm.value.address);
    employeeData.append('gender', this.employeeForm.value.gender);
    employeeData.append('operateRegister', this.employeeForm.value.operateRegister);
    employeeData.append('employeeHotels', JSON.stringify(this.employeeForm.value.employeeHotels));
    employeeData.append('createdBy', this.employeeId);

    this.httpService.createEmployee('employees/addEmployee', employeeData).subscribe(
      res => {
        window.scrollTo(0, 0);
        this.processing = false;
        this.showSuccessAlert = true;
        this.employeeForm.reset();
        if (this.hotelListArray !== undefined) {
          this.hotelListArray.clear();
          this.addHotelList();
        }
        this.imageUrl = '';
      },
      err => {
        this.processing = false;
        console.log(err);
      }
    );
  }

  getHotels() {
    this.httpService.getHotels('hotels').subscribe(
      res => {
        this.hotels = res;
        // this.employeeForm.get('employeeHotel').setValue(this.hotels[0].hotelId);
      },
      err => {
        console.log(err);
      }
    );
  }

  getEmployeeDetails() {
    const employeeId = localStorage.getItem('employeeId');
    this.httpService.getEmployeeDetails(`employees/${employeeId}`).subscribe(
      res => {
        this.employee = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  toggleLoginAccess() {
    this.showPassword = this.employeeForm.value.loginAccess !== true;
    this.employeeForm.patchValue({
      loginAccess: !this.employeeForm.value.loginAccess
    });
  }

  onSelectEmployeeRole() {
    this.showOperateRegister = this.employeeForm.value.employeeRole === 'manager';
  }

  onAlertClosed() {
    this.showSuccessAlert = false;
  }

  get firstName() {
    return this.employeeForm.get('firstName');
  }

  get lastName() {
    return this.employeeForm.get('lastName');
  }

  get employeeRole() {
    return this.employeeForm.get('employeeRole');
  }

  get emailAddress() {
    return this.employeeForm.get('emailAddress');
  }

  get phoneNumber() {
    return this.employeeForm.get('phoneNumber');
  }

  get password() {
    return this.employeeForm.get('password');
  }

  get picture() {
    return this.employeeForm.get('picture');
  }

  get address() {
    return this.employeeForm.get('address');
  }

  get gender() {
    return this.employeeForm.get('gender');
  }

  get otherName() {
    return this.employeeForm.get('otherName');
  }

  get employeeHotels() {
    return <FormArray>this.employeeForm.get('employeeHotels');
  }
}
