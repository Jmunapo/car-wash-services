import { FormControl, FormGroup } from "@angular/forms";

export class EmailValidator {
  /**
   * Email Validator
   * @param control Form Contro | 'email'
   * @usage email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
   */

  static isValid(control: FormControl) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      control.value
    );

    if (re) {
      return null;
    }

    return { invalidEmail: true };
  }
}

export function PasswordMatchValidator() {
  return (formGroup: FormGroup) => {
    const pass = formGroup.controls.password;
    const conf = formGroup.controls.confirm_password;
    if (conf.dirty && pass.value !== conf.value) {
      conf.setErrors({ mustmatch: true });
    } else if (conf.valid) {
      conf.setErrors(null);
    }
  };
}

export function CheckboxValidator() {
  return (formGroup: FormGroup) => {
    const checkbox = formGroup.controls.accept;
    if (!checkbox.value) {
      checkbox.setErrors({ accept: true });
    }
  };
}
