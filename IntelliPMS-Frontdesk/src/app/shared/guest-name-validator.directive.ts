import {Directive, forwardRef} from '@angular/core';
import {AbstractControl, NG_ASYNC_VALIDATORS} from '@angular/forms';
import {CustomValidationService} from './custom-validation.service';
import {Observable} from 'rxjs';

@Directive({
  selector: '[appGuestNameValidator]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => GuestNameValidatorDirective),
    multi: true
  }]
})
export class GuestNameValidatorDirective {

  constructor(private customValidator: CustomValidationService) { }

  validate(control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}>  {
    return this.customValidator.guestNameValidator(control);
  }
}
