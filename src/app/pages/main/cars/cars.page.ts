import { Component, OnInit } from "@angular/core";
import { StoreLocalService } from "src/app/services/store-local.service";
import { UserCar } from "src/app/models/user.car";
import { AlertController } from "@ionic/angular";

import * as Models from "../../../../assets/json/cars.json";
import { CarModel } from "src/app/models/car.model.js";
import { Router, NavigationExtras } from "@angular/router";
import { isDevice } from "src/app/helpers/check.cordova.js";
import { Toast } from "@ionic-native/toast/ngx";
import { timer } from "rxjs";
import { Schedule } from "src/app/models/schedule";
import { FirebaseDbService } from "src/app/services/firebase-db.service";

@Component({
  selector: "app-cars",
  templateUrl: "./cars.page.html",
  styleUrls: ["./cars.page.scss"]
})
export class CarsPage implements OnInit {
  user_cars: Array<UserCar> = [];
  models: Array<CarModel> = Models.arr;

  bookings: Array<Schedule> = [];

  action: string = "Getting your cars...";

  slideOpts = {
    speed: 400,
    slidesPerView: 1.3,
    spaceBetween: 3
  };

  loading: boolean = true;
  constructor(
    private storeLoc: StoreLocalService,
    private router: Router,
    private toast: Toast,
    private firedb: FirebaseDbService,
    private alertCtrl: AlertController
  ) {}

  ionViewWillEnter() {
    this.loading = true;
    this.storeLoc
      .userCars()
      .then((cars: Array<UserCar>) => {
        if (!cars) {
          timer(500).subscribe(() => (this.loading = false));
          return;
        }
        let ucars = cars.length ? cars : [];
        ucars.forEach(car => {
          car.services = [];
        });
        this.user_cars = ucars;
        this.firedb
          .getAll()
          .get()
          .subscribe(
            snap => {
              if (snap.empty) {
                timer(500).subscribe(() => (this.loading = false));
                return;
              }
              snap.forEach(doc => {
                let schedule = doc.data() as Schedule;
                this.addSchedule(schedule);
              });
            },
            error => {
              console.log(error);
              if (this.loading)
                timer(500).subscribe(() => (this.loading = false));
            }
          );
      })
      .catch(e => {
        this.loading = false;
        console.error("Failed to access storage", e);
      });
  }

  private addSchedule(schedule: Schedule) {
    this.user_cars.forEach(car => {
      let carIndex = schedule.vehicles.findIndex(v => v.id === car.id);
      if (carIndex !== -1) {
        if (car.services.indexOf(schedule.service_name) === -1) {
          car.services.push(schedule.service_name);
        }
      }
    });
    timer(500).subscribe(() => (this.loading = false));
  }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  getImage(id) {
    let img = "assets/cars/default.png";
    this.models.forEach(m => {
      if (m.id === id) {
        img = m.img;
      }
    });
    return img;
  }

  editCar(car: UserCar) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        car: JSON.stringify(car)
      }
    };
    this.router.navigate(["main/cars/add"], navigationExtras);
  }

  async deleteCar(car: UserCar, index) {
    if (car.services.length) {
      let booked = await this.alertCtrl.create({
        subHeader: `Booking in progress`,
        message: "To delete, cancel and delete the booking for this car!",
        buttons: ["Ok"]
      });
      await booked.present();
      return;
    }
    this.storeLoc.removeCar(car.id).then(() => {
      if (isDevice()) {
        this.toast
          .show("Car was deleted", "2100", "bottom")
          .subscribe(toast => {
            console.log(toast);
          });
      }
      this.user_cars.splice(index, 1);
    });
  }
}
