import { Component, OnInit } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  signing_in: boolean = false;
  signInForm: FormGroup;
  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private authSrvc: AuthService
  ) {
    this.signInForm = this.formBuilder.group({
      password: ["", Validators.required],
      email: ["", Validators.compose([Validators.email, Validators.required])]
    });
  }

  ngOnInit() {}

  async signIn(cred) {
    this.signing_in = true;
    this.authSrvc
      .signIn(cred)
      .then(() => {
        this.signing_in = false;
        this.signInForm.reset();
        this.navCtrl.navigateRoot("/main");
      })
      .catch(async e => {
        this.signing_in = false;
        let message = this.showError(e.code);
        const alert = await this.alertController.create({
          subHeader: "Login Error",
          backdropDismiss: false,
          message,
          buttons: [
            {
              text: "Register",
              cssClass: "secondary",
              handler: async () => {
                this.navCtrl.navigateForward("auth/register");
              }
            },
            {
              text: "Retry",
              role: "cancel",
              handler: async () => {
                this.signInForm.controls.password.reset();
              }
            }
          ]
        });
        await alert.present();
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
