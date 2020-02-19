import { Component, OnInit, ViewChild } from "@angular/core";
import { CarModel } from "src/app/models/car.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoreLocalService } from "src/app/services/store-local.service";

import * as Models from "../../../../../assets/json/cars.json";
import { isDevice } from "src/app/helpers/check.cordova.js";
import { Toast } from "@ionic-native/toast/ngx";
import { UserCar } from "src/app/models/user.car.js";
import { NavController, IonSlides } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-add",
  templateUrl: "./add.page.html",
  styleUrls: ["./add.page.scss"]
})
export class AddPage implements OnInit {
  models: Array<CarModel> = Models.arr;
  slideOpts = {
    speed: 400,
    slidesPerView: 2.3,
    spaceBetween: 1
  };
  @ViewChild(IonSlides, null) slides: IonSlides;

  selected: string = null;
  edit_car: UserCar = null;

  saveCarForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private storeLoc: StoreLocalService,
    private toast: Toast,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.saveCarForm = this.formBuilder.group({
      model_make: ["", Validators.required],
      type: ["", Validators.required],
      plate_number: ["", Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      if (params && params.car) {
        this.edit_car = JSON.parse(params.car);
        let model = this.models.filter(m => m.id === this.edit_car.type);
        this.selectModel(model[0], true);
        this.saveCarForm.controls.model_make.patchValue(
          this.edit_car.model_make
        );
        this.saveCarForm.controls.plate_number.patchValue(
          this.edit_car.plate_number
        );
        let i = this.models.findIndex(m => m.id === this.edit_car.type);
        this.slides.slideTo(i);
      }
    });
  }

  selectModel(model: CarModel, prog: boolean = false) {
    if (this.edit_car && !prog) {
      if (isDevice()) {
        this.toast
          .show("Sorry, you can not edit the vehicle type", "2500", "bottom")
          .subscribe(() => {});
      }
      return;
    }
    this.selected = model.id;
    this.saveCarForm.controls.type.patchValue(model.id);
  }

  ngOnInit() {}

  save(car: UserCar) {
    if (this.edit_car) {
      car.id = this.edit_car.id;
    } else {
      car.id = new Date().getTime().toString();
    }
    this.storeLoc
      .saveCar(car)
      .then(saved => {
        console.log(saved);
        if (saved.length) {
          this.saveCarForm.reset();
          this.selected = null;
          if (isDevice()) {
            let text = `${car.model_make} was ${
              this.edit_car ? "updated" : "added"
            }`;
            this.toast.show(text, "2100", "bottom").subscribe(toast => {
              console.log(toast);
            });
          }
          // this.navCtrl.navigateBack("main/cars");
          this.location.back();
        } else {
          console.error("Could not save car");
        }
      })
      .catch(e => {
        console.log(e);
      });
  }
}
