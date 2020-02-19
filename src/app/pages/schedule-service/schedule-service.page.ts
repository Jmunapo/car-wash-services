import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IonSlides, NavController, AlertController } from "@ionic/angular";
import { StoreLocalService } from "src/app/services/store-local.service";
import { UserCar } from "src/app/models/user.car";
import { CarModel } from "src/app/models/car.model";

import { timer } from "rxjs";

import * as moment from "moment";
import { Schedule } from "src/app/models/schedule";
import * as Models from "../../../assets/json/cars.json";
import { FirebaseDbService } from "src/app/services/firebase-db.service";

@Component({
  selector: "app-schedule-service",
  templateUrl: "./schedule-service.page.html",
  styleUrls: ["./schedule-service.page.scss"]
})
export class ScheduleServicePage implements OnInit {
  service: any = {
    service_name: "Service"
  };
  weeks: any = 1;
  dom: any = {}; //for date

  loading: boolean = false;

  action: string = "Booking...";

  models: Array<CarModel> = Models.arr;
  @ViewChild(IonSlides, null) slides: IonSlides;

  slideOpts = {
    speed: 400,
    slidesPerView: 2.3,
    spaceBetween: 3
  };

  dateSlideOpts = {
    speed: 400,
    initialSlide: 0,
    slidesPerView: 1,
    loop: true
  };

  daysSlidesOpts = {
    speed: 400,
    initialSlide: 0,
    slidesPerView: 3.6,
    spaceBetween: 1
  };
  user_cars: Array<UserCar> = [];

  stopCounter: boolean = false;

  time_slot: string;

  months: Array<any> = [];
  days: Array<any> = [];

  timeSlot = [
    {
      from: "06:00",
      to: "07:00"
    },
    {
      from: "07:00",
      to: "08:30"
    },
    {
      from: "08:30",
      to: "10:00"
    },
    {
      from: "10:00",
      to: "11:30"
    },
    {
      from: "11:30",
      to: "13:00"
    },
    {
      from: "13:00",
      to: "14:30"
    },
    {
      from: "14:30",
      to: "16:00"
    },
    {
      from: "16:00",
      to: "17:30"
    }
  ];

  selectedDate: string;

  scheduledDate: any;
  editingDates: any;

  selectedVehicles: Array<UserCar> = [];

  price: number = 0;

  editing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeLoc: StoreLocalService,
    private navCtr: NavController,
    private firedb: FirebaseDbService,
    private alertCtrl: AlertController
  ) {
    this.route.queryParams.subscribe(params => {
      if (params.service) {
        this.service = JSON.parse(params.service);
      }

      if (params.schedule) {
        this.service = JSON.parse(params.schedule);
        this.editing = true;
        console.log(this.service);
      }
    });
    this.loadCars();
    let months = moment.months();
    let newDates = [];
    let curr = new Date().getMonth();
    months.forEach((m, i) => {
      let obj;
      if (i < curr) {
        obj = {
          month: m,
          i,
          year: new Date().getFullYear() + 1
        };
      } else {
        obj = {
          month: m,
          i,
          year: new Date().getFullYear()
        };
      }
      newDates.push(obj);
    });
    this.months = newDates.sort((a, b) => a.year - b.year);
  }

  ionViewWillLoad() {
    this.loadCars();
  }

  private getDays(month) {
    const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    let date = new Date(month.year, month.i, 1);
    let dates = [];
    while (date.getMonth() == month.i) {
      let day = {
        date: date.getDate(),
        day: names[date.getDay()],
        month: month.month
      };
      if (moment().isBefore(`${month.year}-${month.i + 1}-${day.date + 1}`)) {
        dates.push(day);
      }
      date.setDate(date.getDate() + 1);
    }

    //Can't find a way to include the current date and the last day of the month
    date.setDate(date.getDate() - 1);
    let day = {
      date: date.getDate(),
      day: names[date.getDay()],
      month: month.month
    };
    dates.push(day);
    return dates;
  }

  loadCars() {
    this.storeLoc
      .userCars()
      .then((cars: Array<UserCar>) => {
        if (!cars) return;
        if (this.user_cars.length === cars.length) return;
        if (this.user_cars.length) {
          cars.forEach(car => {
            let i = this.user_cars.findIndex(c => c.id === car.id);
            if (i === -1) {
              this.stopCounter = true;
              this.user_cars.push(car);
              return;
            }
          });
        } else {
          this.user_cars = cars.length ? cars : [];
        }
        if (this.editing) {
          this.setOldValues();
        }
      })
      .catch(e => {
        console.error("Failed to access storage", e);
      });
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

  selectCar(car: UserCar) {
    let cIndex = this.selectedVehicles.findIndex(c => c.id === car.id);
    if (cIndex !== -1) {
      this.selectedVehicles.splice(cIndex, 1);
    } else {
      this.selectedVehicles.push(car);
    }
    this.showPrice();
  }

  showPrice() {
    switch (this.selectedVehicles.length) {
      case 0:
        this.price = 0;
        break;
      case 1:
        this.price = this.weeks * 10;
        break;
      case 2:
        this.price = this.weeks * 14.99;
        break;
      case 3:
        this.price = this.weeks * 19.98;
        break;
      default:
        this.price = this.weeks * this.selectedVehicles.length * 5.99;
        break;
    }
  }

  carSelected(car: UserCar) {
    return this.selectedVehicles.findIndex(c => c.id === car.id) !== -1;
  }

  reloadVehicles() {
    timer(1000).subscribe(() => {
      this.loadCars();
      if (!this.stopCounter) {
        this.reloadVehicles();
      } else {
        this.stopCounter = false;
      }
    });
  }

  addCar() {
    timer(1000).subscribe(() => this.reloadVehicles());
    this.router.navigate(["add"]);
  }

  ngOnInit() {}

  async getSlider(slider: IonSlides, dir: number) {
    if (dir === 1) {
      slider.slidePrev();
    } else {
      slider.slideNext();
    }
  }

  changeWeek(week) {
    console.log(week);
  }

  async changeDates(daysSlider: IonSlides, slider: IonSlides) {
    this.scheduledDate = null;
    this.selectedDate = null;
    let i = await slider.getActiveIndex();
    if (i === 0) {
      i = this.months.length;
    } else if (i === this.months.length + 1) {
      i = 1;
    }
    this.days = this.getDays(this.months[i - 1]);
    daysSlider.slideTo(0);
  }

  async selectDate(day, monthSlider: IonSlides) {
    this.selectedDate = `${day.day}-${day.date}`;
    let mon = await monthSlider.getActiveIndex();
    this.scheduledDate = this.months[mon - 1];
    this.dom.day = day;
  }

  private setOldValues() {
    this.service.vehicles.forEach(c => {
      let i = this.user_cars.findIndex(car => car.id === c.id);
      if (i !== -1) {
        this.selectedVehicles.push(this.user_cars[i]);
      }
    });
    this.time_slot = this.service.date.slot;
    this.weeks = this.service.weeks || 1;
    this.editingDates = this.service.date;
    this.dom.day = this.service.date;
    this.price = this.service.amount;
    this.editing = true;
  }

  async finish() {
    if (!this.scheduledDate) {
      this.scheduledDate = this.editingDates;
    }

    let schedule: Schedule = {
      id: this.service.id ? this.service.id + 1 : new Date().getTime(),
      status: "UPCOMMING",
      location: this.service.location,
      service_name: this.service.service_name,
      date: {
        year: this.scheduledDate.year,
        month: this.scheduledDate.month,
        day: this.dom.day.day,
        date: this.dom.day.date,
        slot: this.time_slot,
        timestamp: this.getTimestamp()
      },
      weeks: this.weeks,
      fb_id: this.service.fb_id || null,
      vehicles: this.selectedVehicles,
      amount: this.price,
      updated_at: this.firedb.timestamp
    };

    let valid_date = moment()
      .add(2, "hours")
      .isBefore(schedule.date.timestamp);

    if (!valid_date) {
      let booked = await this.alertCtrl.create({
        subHeader: "Invalid Time Slot",
        message: "Make sure your date is 2 hours+ in the future",
        buttons: ["Ok"]
      });
      await booked.present();
      return;
    }
    console.log(schedule);
    let sch = JSON.parse(JSON.stringify(schedule));
    sch.vehicles = this.selectedVehicles;
    let fun = this.service.fb_id ? "updateSchedule" : "saveSchedule";
    this.loading = true;
    this.action = `Booking for ${this.service.service_name} service`;
    this.firedb[fun](sch)
      .then(async () => {
        this.loading = false;
        let booked = await this.alertCtrl.create({
          subHeader: "Booked Successfully",
          message: `We have received your booking, we will get in touch shortly`,
          buttons: ["Ok"]
        });
        booked.onDidDismiss().then(() => {
          this.navCtr.navigateRoot("/main/bookings");
        });
        await booked.present();
      })
      .catch(async e => {
        console.log(e);
        this.loading = false;
        let booked = await this.alertCtrl.create({
          subHeader: "Oops!",
          message: "Booking Failed, please check your connection and try again",
          buttons: ["Ok"]
        });
        await booked.present();
      });
  }

  private getTimestamp(): number {
    let month = Number(
      moment()
        .month(this.scheduledDate.month)
        .format("M")
    );
    return new Date(
      `${this.scheduledDate.year}-${month}-${this.dom.day.date} ${this.time_slot}:00`
    ).getTime();
  }
}
