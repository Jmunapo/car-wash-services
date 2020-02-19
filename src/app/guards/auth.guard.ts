import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivate
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { NavController, AlertController } from "@ionic/angular";
import { Router } from "@angular/router";

import { StoreLocalService } from "src/app/services/store-local.service";
import { FirebaseDbService } from "src/app/services/firebase-db.service";
import { isDevice } from "src/app/helpers/check.cordova.js";

import { FirebaseX } from "@ionic-native/firebase-x/ngx";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  subSNot: any;
  constructor(
    private auth: AuthService,
    private navCtr: NavController,
    public alertController: AlertController,
    private router: Router,
    private storeLoc: StoreLocalService,
    private firedb: FirebaseDbService,
    private firex: FirebaseX
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.auth
      .getUser()
      .then((user: firebase.User) => {
        let isOnAuth =
          state.url === "/auth/login" ||
          state.url === "/auth/register" ||
          state.url === "/auth/reset" ||
          state.url.indexOf("fullname") !== -1;

        let logged = user ? true : false;

        if (logged) {
          if (!user.emailVerified) {
            return this.shouldVerifyEmail(user.email);
          }
          this.auth.setUser(user);
          this.subscribeToNotifications();
        }

        if ((!logged && isOnAuth) || (logged && !isOnAuth)) {
          return true;
        } else if (!logged && !isOnAuth) {
          this.navCtr.navigateRoot("/auth/login");
          return false;
        } else if (logged && isOnAuth) {
          this.navCtr.navigateRoot("/main");
          return false;
        }
      })
      .catch(async e => {
        await this.auth.signOut();
        this.navCtr.navigateRoot("/auth");
        return false;
      });
  }

  private async shouldVerifyEmail(email, resend: boolean = false) {
    const alert = await this.alertController.create({
      header: "Verify your email!",
      subHeader: resend ? "Email was send" : null,
      backdropDismiss: false,
      cssClass: "email-unverified",
      message: `Click the link we send to <b>${email}</b>, to verify your email`,
      buttons: [
        {
          text: "Email didn't arrive",
          cssClass: "secondary",
          handler: async () => {
            this.shouldVerifyEmail(email, true);
            await this.auth.verifyEmail();
            console.log("Resend Email");
          }
        },
        {
          text: "Change Email",
          handler: async () => {
            let user = JSON.parse(JSON.stringify(await this.auth.getUser()));
            await this.auth.signOut();
            let navigationExtras = {
              queryParams: {
                fullname: user.displayName
              }
            };
            this.router.navigate(["auth/register"], navigationExtras);
          }
        },
        {
          text: "Email verified",
          handler: async () => {
            await this.auth.reload();
            let u = await this.auth.getUser();
            if (!u.emailVerified) {
              this.shouldVerifyEmail(email);
            } else {
              console.log("Confirm Okay");
              this.navCtr.navigateRoot("/main");
            }
          }
        }
      ]
    });
    await alert.present();
    return false;
  }

  private async subscribeToNotifications() {
    if (!isDevice()) return;
    if (!this.subSNot) {
      this.firex.onTokenRefresh().subscribe(
        token => {
          console.log(`Token changed to ${token}`);
          this.subscribeToNotifications();
        },
        e => {
          console.log("Something went wrong on changing token");
        }
      );
    }

    this.subSNot = this.firedb
      .getToken()
      .then(() => {
        return this.firex.subscribe(this.auth.user.uid);
      })
      .then(() => {
        return this.storeLoc.setSubscribed(this.auth.user.uid);
      })
      .catch(e => {
        console.log(e);
      });
  }
}
