import { Injectable } from "@angular/core";

import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { LocationAccuracy } from "@ionic-native/location-accuracy/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";

@Injectable({
  providedIn: "root"
})
export class UserPermissionsService {
  constructor(
    private permission: AndroidPermissions,
    private accuracy: LocationAccuracy,
    private geolocation: Geolocation
  ) {}

  checkPermission(permission: string) {
    return this.permission.checkPermission(
      this.permission.PERMISSION[permission]
    );
  }

  locAccuracy() {
    return this.accuracy.canRequest();
  }
  getPermission(permission: string) {
    return this.permission.requestPermission(
      this.permission.PERMISSION[permission]
    );
  }

  askToTurnOnGPS() {
    return this.accuracy.request(this.accuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
  }

  getLocationCoordinates() {
    return this.geolocation.getCurrentPosition();
  }
}
