import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { UserCar } from "../models/user.car";
import { Schedule } from "../models/schedule";

@Injectable({
  providedIn: "root"
})
export class StoreLocalService {
  constructor(private storage: Storage) {}

  async saveCar(newCar: UserCar) {
    let cars: Array<UserCar> = await this.storage.get("user_cars");
    cars = cars ? cars : [];

    let i = cars.findIndex(c => c.id === newCar.id);
    console.log(i);
    if (i === -1) {
      cars.push(newCar);
    } else {
      cars[i] = newCar;
    }
    console.log(cars);

    return this.storage.set("user_cars", cars);
  }

  userCars() {
    return this.storage.get("user_cars");
  }

  async removeCar(id) {
    let cars: Array<UserCar> = await this.storage.get("user_cars");
    let newCars = cars.filter(c => c.id !== id);
    return this.storage.set("user_cars", newCars);
  }

  setSubscribed(uid) {
    return this.storage.set(uid, true);
  }

  isSubscribed(uid) {
    return this.storage.get(uid);
  }
}
