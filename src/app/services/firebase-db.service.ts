import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";
import { Platform } from "@ionic/angular";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { isDevice } from "../helpers/check.cordova";
import { Schedule } from "../models/schedule";
import { Dialogs } from "@ionic-native/dialogs/ngx";
@Injectable({
  providedIn: "root"
})
export class FirebaseDbService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AuthService,
    private plt: Platform,
    private firex: FirebaseX,
    private dialogs: Dialogs,
    private router: Router
  ) {}

  get timestamp() {
    return new Date().getTime();
  }

  async getToken() {
    let token;
    if (this.plt.is("android")) {
      token = await this.firex.getToken();
    }
    if (this.plt.is("ios")) {
      token = await this.firex.getToken();
      await this.firex.hasPermission();
    }

    if (!token) return;
    this.subscribe();
    const docData = {
      token,
      email: this.auth.user.email
    };
    return this.firestore
      .collection("Tokens")
      .doc(this.auth.user.uid)
      .set(docData);
  }

  saveSchedule(schedule: Schedule) {
    schedule.user_id = this.auth.user.uid;
    return this.firestore.collection("Bookings").add(schedule);
  }

  toHistory(schedule: Schedule) {
    return this.firestore.collection("BookingHistory").add(schedule);
  }

  updateSchedule(schedule: Schedule) {
    return this.firestore
      .collection("Bookings")
      .doc(schedule.fb_id)
      .update(schedule);
  }

  deleteSchedule(schedule: Schedule) {
    return this.firestore
      .collection("Bookings")
      .doc(schedule.fb_id)
      .delete();
  }

  removeToken() {
    return this.firestore
      .collection("U")
      .doc(this.auth.user.email)
      .delete();
  }

  getAll() {
    return this.firestore.collection("Bookings", ref =>
      ref.where("user_id", "==", this.auth.user.uid)
    );
  }

  addParcel(parcel: any) {
    return this.firestore
      .collection(`P/${this.auth.user.uid}/pending`)
      .add(parcel);
  }

  confirmParcel(id, parcel) {
    return this.firestore.collection(`O/${id}`).add(parcel);
  }

  subscribe() {
    if (!isDevice()) return;
    this.plt.ready().then(() => {
      this.firex.onMessageReceived().subscribe(data => {
        console.log(data);
        if (!data.title) {
          this.router.navigate(["main/bookings"]);
          return;
        }
        this.dialogs.alert(data.body, data.title, "Okay").then(() => {});
      });
    });
  }
}
