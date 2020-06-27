import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {CustomValidationService} from './custom-validation.service';

@Directive({
  selector: '[appMinAmount]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MinAmountDirective,
    multi: true
  }]
})

export class MinAmountDirective implements Validator {
  // tslint:disable-next-line:no-input-rename

  constructor(private customValidator: CustomValidationService) {
  }

  validate(control: AbstractControl): {[key: string]: boolean} | null {
    return this.customValidator.minAmountValidator()(control);
  }
}
