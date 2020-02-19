import { Component, ViewChild } from "@angular/core";

import { Platform, IonRouterOutlet } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { Toast } from "@ionic-native/toast/ngx";
import { timer } from "rxjs";
import { isDevice } from "./helpers/check.cordova";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, null) routerOutlet: IonRouterOutlet;
  clicked: boolean = false;
  splash: boolean = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private toast: Toast
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
      //TODO hide splash when the user is logged
      timer(2500).subscribe(() => (this.splash = false));
      if (isDevice()) {
        this.registerBackButton();
      }
    });
  }

  registerBackButton() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
      } else {
        this.doubleClicked();
      }
    });
  }

  doubleClicked() {
    if (this.clicked) {
      navigator["app"].exitApp();
      return;
    }
    this.clicked = true;
    this.toast
      .show("Press again to close app", "2100", "bottom")
      .subscribe(toast => {
        console.log(toast);
      });
    timer(2100).subscribe(() => {
      this.clicked = false;
    });
  }
}

//https://api.fuelapi.com/v1/json/vehicles/?api_key=daefd14b-9f2b-4968-9e4d-9d4bb4af01d1&year=2014
