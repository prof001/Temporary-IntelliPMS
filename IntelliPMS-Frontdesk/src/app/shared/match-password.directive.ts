import {Directive, Input} from '@angular/core';
import {AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import {CustomValidationService} from './custom-validation.service';

@Directive({
  selector: '[appMatchPassword]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MatchPasswordDirective,
    multi: true
  }]
})
export class MatchPasswordDirective implements Validator{
  @Input('appMatchPassword') MatchPassword: string[] = [];

  constructor(private customValidator: CustomValidationService) {}

  validate(formGroup: FormGroup): ValidationErrors {
    return this.customValidator.matchPassword(this.MatchPassword[0], this.MatchPassword[1])(formGroup);
  }
}
