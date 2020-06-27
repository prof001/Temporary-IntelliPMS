import {Injectable, OnInit} from '@angular/core';
import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class CustomValidationService{
  constructor(private httpService: HttpService) {}

  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      if (!control.value) {
        return null;
      }
      const regex = new RegExp('^[0-9]*$');
      const valid = regex.test(control.value);
      return valid ? null : {invalidPhoneNumber: true};
    };
  }

  // Todo Allow minimum value to be passed to it.
  minAmountValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      if (isNaN(control.value) || control.value < 5000) {
        return {minAmount: true};
      }
      return null;
    };
  }

  emailAddressValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      if (!control.value) {
        return null;
      }
      const regex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');
      const valid = regex.test(control.value);
      return valid ? null : {invalidEmail: true};
    };
  }

  takenEmailValidator(userControl: AbstractControl) {
    let emails;
    return new Promise (resolve => {
      this.httpService.getEmailsList('guests/guestEmailsList').subscribe(
        res => {
          // @ts-ignore
          emails = res.emailsList;
          if (emails.indexOf(userControl.value) > -1) {
            resolve({emailTaken: true});
          }
          else {
            resolve(null);
          }
        }
      );
    });
  }

  guestNameValidator(userControl: AbstractControl) {
    let guestNames;
    return new Promise (resolve => {
      this.httpService.getNamesList('guests/guestNamesList').subscribe(
        res => {
          guestNames = res.map(obj => obj.guestName);
          if (guestNames.indexOf(userControl.value) === -1) {
            resolve({invalidGuestName: true});
          }
          else {
            resolve(null);
          }
        }
      );
    });
  }

  matchPassword(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors.passwordMismatch) {
        return null;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({passwordMismatch: true});
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }
}
