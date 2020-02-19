import { Component, OnInit } from "@angular/core";
import { timer } from "rxjs";
import { NavController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.page.html",
  styleUrls: ["./reset-password.page.scss"]
})
export class ResetPasswordPage implements OnInit {
  resetting: boolean = false;
  res: boolean = false;
  status: string = "success";

  notification: string =
    "Enter the email address associated with your account.";
  resetForm: FormGroup;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private authSrvc: AuthService
  ) {
    this.resetForm = this.formBuilder.group({
      email: ["", Validators.compose([Validators.email, Validators.required])]
    });
  }

  ngOnInit() {}

  resetPass(cred) {
    this.resetting = true;
    this.authSrvc
      .resetPass(cred)
      .then(() => {
        this.resetForm.reset();
        this.showStatus("success", "Email was send! Check your inbox");
      })
      .catch(e => {
        console.log(e);
        this.showStatus(
          "failure",
          "We don't have that email address in our records",
          5000
        );
      });
  }

  private showStatus(status, msg, time = 2000) {
    this.res = true;
    this.resetting = false;
    this.status = status;
    this.notification = msg;
    timer(time).subscribe(() => {
      this.res = false;
    });
  }
}
