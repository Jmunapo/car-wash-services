import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";

import { Toast } from "@ionic-native/toast/ngx";
import { isDevice } from "src/app/helpers/check.cordova";
import { AuthService } from "src/app/services/auth.service";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit {
  maps_available: boolean = false;

  user: firebase.User;

  services: Array<any> = [
    {
      name: "Car de-icing",
      text: "With best and safe equipment",
      icon: "md-car-deice",
      available: true
    },
    {
      name: "Car wash",
      text: "At the comfort of your home",
      icon: "md-car-wash",
      available: false
    },
    {
      name: "Car polish",
      text: "Sparkle like stars",
      icon: "md-car-polish",
      available: false
    },
    {
      name: "Interior wash",
      text: "Fresh breath",
      icon: "md-car-interior",
      available: false
    },
    {
      name: "Car service",
      text: "Feel safe always",
      icon: "md-car-service",
      available: false
    }
  ];

  constructor(
    private router: Router,
    private toast: Toast,
    private authSrvc: AuthService,
    private navCtrl: NavController
  ) {
    try {
      let test = google.maps;
      this.maps_available = true;

      if (test) return;
    } catch (error) {
      this.maps_available = false;
    }
  }

  ngOnInit() {
    this.user = this.authSrvc.user;
  }

  requestService(service: any) {
    if (!this.maps_available) {
      if (!isDevice()) {
        console.log("You're offline!");
        return;
      }
      this.toast
        .show(
          "You seem offline, please check your connection",
          "2500",
          "bottom"
        )
        .subscribe(() => 0);
      return;
    }

    if (!service.available) {
      if (!isDevice()) {
        return console.log(
          `${service.name} service is not yet available.\nWe are working to bring it to you.`
        );
      }
      this.toast
        .show(
          `${service.name} service is not yet available.\nWe are working to bring it to you.`,
          "2500",
          "top"
        )
        .subscribe(() => 0);
      return;
    }
    console.log(service);

    let navigationExtras: NavigationExtras = {
      queryParams: {
        service: service.name
      }
    };

    const animationsOptions = {
      animation: "ios-transition",
      duration: 1000
    };

    this.navCtrl.navigateForward("map", navigationExtras);
  }
}
