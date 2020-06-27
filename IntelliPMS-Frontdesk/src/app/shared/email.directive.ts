import { Directive } from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {CustomValidationService} from './custom-validation.service';

@Directive({
  selector: '[appEmail]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: EmailDirective,
    multi: true
  }]
})
export class EmailDirective implements Validator{
  constructor(private customValidator: CustomValidationService) {}

  validate(control: AbstractControl): {[key: string]: any} | null {
    return this.customValidator.emailAddressValidator()(control);
  }
}
