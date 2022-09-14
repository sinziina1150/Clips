import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(controlName: string, matchingContrtolName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingContrtolName);

      if (!control || !matchingControl) {
        console.error('form controls can not be found in the form groud');
        return { controlNotFound: false };
      }

      const error =
        control.value === matchingControl.value ? null : { noMatch: true };

      matchingControl.setErrors(error);
      return error;
    };
  }
}
