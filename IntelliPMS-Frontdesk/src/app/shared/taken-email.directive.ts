import {Directive, forwardRef} from '@angular/core';
import {AbstractControl, NG_ASYNC_VALIDATORS, Validator} from '@angular/forms';
import {CustomValidationService} from './custom-validation.service';
import {Observable} from 'rxjs';

@Directive({
  selector: '[appValidateTakenEmail]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => ValidateTakenEmailDirective),
    multi: true
  }]
})
export class ValidateTakenEmailDirective implements Validator{
  constructor(private customValidator: CustomValidationService) {}

  validate(control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}>  {
    return this.customValidator.takenEmailValidator(control);
  }
}
