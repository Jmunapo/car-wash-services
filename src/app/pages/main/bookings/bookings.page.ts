import { Component, OnInit } from "@angular/core";
import { isDevice } from "src/app/helpers/check.cordova";
import { Schedule } from "src/app/models/schedule";
import { ActionSheetController } from "@ionic/angular";
import { Router, NavigationExtras } from "@angular/router";
import { timer } from "rxjs";
import { FirebaseDbService } from "src/app/services/firebase-db.service";
import { AlertController } from "@ionic/angular";

import * as moment from "moment";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"]
})
export class BookingsPage implements OnInit {
  bookings: Array<Schedule> = [];
  loading: boolean = true;

  action: string = "Getting your bookings...";

  fireDocs: any;

  user_cars: Array<any> = [];
  constructor(
    public actSheetController: ActionSheetController,
    public alertController: AlertController,
    private router: Router,
    private firedb: FirebaseDbService
  ) {}

  ngOnInit() {}

  ionViewDidLeave() {
    if (this.fireDocs) {
      this.fireDocs.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.loading = true;
    this.bookings = [];
    this.fireDocs = this.firedb
      .getAll()
      .snapshotChanges()
      .subscribe(
        snap => {
          this.bookings = [];
          if (this.loading) timer(500).subscribe(() => (this.loading = false));
          snap.forEach(data => {
            if (data && data.payload.doc) {
              let schedule = data.payload.doc.data() as Schedule;
              schedule.fb_id = data.payload.doc.id;
              this.bookings.push(schedule);
            }
          });

          this.moveToHistory();
        },
        error => {
          console.log(error);
          if (this.loading) timer(500).subscribe(() => (this.loading = false));
        }
      );
  }

  private async moveToHistory() {
    this.bookings.forEach(schedule => {
      if (schedule.status !== "CANCELLED") return;
      let next_day = moment(schedule.updated_at).add(1, "days");
      if (moment().isAfter(next_day)) {
        this.firedb
          .toHistory(schedule)
          .then(() => {
            return this.firedb.deleteSchedule(schedule);
          })
          .then(() => {
            console.log("Deleted");
          })
          .catch(e => {
            console.log(e);
          });
      }
    });
  }

  async openActionSheet(schedule: Schedule) {
    console.log(schedule);
    let buttons = [
      {
        text: "Edit Schedule",
        icon: "create",
        handler: () => {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              schedule: JSON.stringify(schedule)
            }
          };
          this.router.navigate(["schedule-service"], navigationExtras);
        }
      },
      {
        text: "Close",
        icon: "close",
        role: "cancel",
        handler: () => {
          console.log("Cancel clicked");
        }
      }
    ];

    if (schedule.status !== "CANCELLED") {
      buttons.push({
        text: "Cancel Schedule",
        role: "destructive",
        icon: "md-cancel-booking",
        handler: () => {
          schedule.status = "CANCELLED";
          schedule.updated_at = this.firedb.timestamp;
          this.action = "Cancelling...";
          this.loading = true;
          this.firedb
            .updateSchedule(schedule)
            .then(() => {
              this.action = "Getting your bookings...";
            })
            .catch(e => {
              this.action = "Getting your bookings...";
              console.log("Failed to :) Done!", e);
              timer(500).subscribe(() => (this.loading = false));
            });
        }
      });
    } else {
      buttons.push({
        text: "Delete Schedule",
        role: "destructive",
        icon: "trash",
        handler: () => {
          this.action = "Deleting...";
          this.loading = true;
          this.firedb
            .deleteSchedule(schedule)
            .then(() => {
              this.action = "Getting your bookings...";
            })
            .catch(e => {
              this.action = "Getting your bookings...";
              console.log("Failed to :) Done!", e);
              timer(500).subscribe(() => (this.loading = false));
            });
        }
      });
    }

    const actionSheet = await this.actSheetController.create({
      header: `${schedule.service_name} @ ${schedule.date.slot}`,
      mode: "md",
      cssClass: "schedule-actions",
      buttons
    });
    await actionSheet.present();
  }
}
