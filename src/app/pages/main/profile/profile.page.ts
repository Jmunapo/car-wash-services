import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { isDevice } from "src/app/helpers/check.cordova";
import { timer } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { AlertController } from "@ionic/angular";
import { Toast } from "@ionic-native/toast/ngx";

import { parsePhoneNumberFromString } from "libphonenumber-js";

import * as firebase from "firebase";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"]
})
export class ProfilePage implements OnInit {
  user: firebase.User;

  action: string = "Signing Out...";

  phone: string;

  loading: boolean = false;
  constructor(
    private navCtrl: NavController,
    private authSrvc: AuthService,
    private firex: FirebaseX,
    private alertController: AlertController,
    private toast: Toast
  ) {}

  ngOnInit() {
    this.user = this.authSrvc.user;
    console.log(this.user);
  }

  signOut() {
    this.loading = true;
    this.authSrvc
      .signOut()
      .then(() => {
        timer(500).subscribe(() => {
          this.loading = false;
          this.navCtrl.navigateRoot("auth");
        });
      })
      .catch(e => {
        this.loading = false;
        console.log(e);
      });
  }

  async enterPhone() {
    const addPhone = await this.alertController.create({
      subHeader: `${
        this.user.phoneNumber ? "Change phone number" : "Enter phone number"
      }`,
      inputs: [
        {
          name: "phone",
          type: "tel",
          id: "phone",
          placeholder: `${this.user.phoneNumber || "+441234567890"}`
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          }
        },
        {
          text: "Get OTP",
          handler: data => {
            try {
              const phoneNumber = parsePhoneNumberFromString(data.phone);
              let country = phoneNumber.country;
              if (
                (phoneNumber.isValid() && country === "ZW") ||
                country === "GB"
              ) {
                this.phone = data.phone;
                this.sendOTP();
                return true;
              }
            } catch (error) {}

            let obj = addPhone.getElementsByClassName("alert-input")[0];
            var textnode = document.createTextNode(
              "Enter a valid UK number including +44"
            );
            obj.parentNode.insertBefore(textnode, obj.nextSibling);
            obj.classList.add("error");
            obj.addEventListener("focus", () => {
              obj.classList.remove("error");
              textnode.remove();
            });
            return false;
          }
        }
      ]
    });
    await addPhone.present();
  }

  private sendOTP() {
    console.log(this.phone);
    if (!isDevice()) return;
    this.action = "Sending OTP";
    this.loading = true;

    this.firex.verifyPhoneNumber(
      (credential: any) => {
        console.log(credential, isNaN(Number(credential.code)));

        if (!isNaN(Number(credential.code))) {
          this.updatePhone(credential);
        } else {
          this.enterCode(credential);
          this.endLoad();
        }
      },
      e => {
        this.endLoad();
        try {
          console.log(JSON.stringify(e));
        } catch (error) {
          console.log(JSON.stringify(error));
        }
      },
      this.phone,
      120
    );
  }

  private async enterCode(credential) {
    console.log(credential);
    const enterOTP = await this.alertController.create({
      subHeader: "Enter OTP we just send",
      inputs: [
        {
          name: "otp",
          type: "text",
          id: "otp",
          placeholder: "123456"
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          }
        },
        {
          text: "Resend",
          handler: () => {
            this.sendOTP();
          }
        },
        {
          text: "Verify",
          handler: async data => {
            credential.code = data.otp;
            console.log(credential);
            this.updatePhone(credential);
          }
        }
      ]
    });
    await enterOTP.present();
  }

  private updatePhone(credential) {
    this.action = "Verifying OTP";
    this.loading = true;
    const cred = firebase.auth.PhoneAuthProvider.credential(
      credential.verificationId,
      credential.code
    );
    this.user
      .updatePhoneNumber(cred)
      .then(() => {
        return this.authSrvc.reload();
      })
      .then(() => {
        return this.authSrvc.getUser();
      })
      .then(user => {
        this.endLoad();
        this.authSrvc.setUser(user);
      })
      .catch(e => {
        console.log(e);
        this.endLoad();
      });
  }

  private endLoad() {
    this.loading = false;
    this.action = "Signing Out...";
  }
}
