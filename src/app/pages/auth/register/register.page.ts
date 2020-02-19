import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { NavController } from "@ionic/angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { EmailValidator, CheckboxValidator } from "src/app/helpers/validator";

import { Dialogs } from "@ionic-native/dialogs/ngx";

import { isDevice } from "src/app/helpers/check.cordova";
import { AuthService } from "src/app/services/auth.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"]
})
export class RegisterPage implements OnInit {
  signing_up: boolean = false;
  always_false: boolean = false;

  signUpForm: FormGroup;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private authSrvc: AuthService,
    private cd: ChangeDetectorRef,
    private dialogs: Dialogs,
    private route: ActivatedRoute
  ) {
    this.signUpForm = this.formBuilder.group(
      {
        fullname: ["", Validators.required],
        email: [
          "",
          Validators.compose([Validators.required, EmailValidator.isValid])
        ],
        password: [
          "",
          Validators.compose([Validators.minLength(6), Validators.required])
        ],
        accept: ["", Validators.required]
      },
      {
        validator: [CheckboxValidator()]
      }
    );

    this.route.queryParams.subscribe(params => {
      if (params.fullname) {
        this.signUpForm.controls.fullname.patchValue(params.fullname);
      }
    });
  }

  ngOnInit() {}

  signUp(cred: any) {
    console.log(cred);
    this.signing_up = true;
    this.authSrvc
      .createAccount(cred)
      .then(() => {
        return this.authSrvc.updateDisplayName(cred.fullname);
      })
      .then(() => {
        return this.authSrvc.verifyEmail();
      })
      .then(() => {
        this.signUpForm.reset();
        this.signing_up = false;
        this.navCtrl.navigateRoot("main");
      })
      .catch(e => {
        this.signing_up = false;
        let error_text = this.showError(e.code);
        console.log(error_text);

        if (isDevice()) {
          this.dialogs
            .alert(error_text, "Error creating your account")
            .then(() => console.log("Dialog dismissed"));
        } else {
          alert(`Error creating your account\n${error_text}`);
        }
      });
  }

  private showError(code): string {
    const error = {
      "auth/account-exists-with-different-credential":
        "Email already in use with a different login method",
      "auth/email-already-in-use":
        "Email address is already in use by another account",
      "auth/user-not-found": "No user found",
      "auth/wrong-password": "Credentials doesn't match",
      "auth/too-many-requests":
        "You tried too many times, please wait for 2 minutes",
      "auth/operation-not-allowed":
        "Sorry login is disabled, please contact support"
    };
    return error[code] || code;
  }
}
