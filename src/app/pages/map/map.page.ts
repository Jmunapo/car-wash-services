import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MapInfoWindow, GoogleMap } from "@angular/google-maps";
import { UserLocation } from "src/app/models/user.location";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { isDevice } from "src/app/helpers/check.cordova";
import { UserPermissionsService } from "src/app/services/user-permissions.service";
import { AlertController, NavController } from "@ionic/angular";

@Component({
  selector: "app-map",
  templateUrl: "./map.page.html",
  styleUrls: ["./map.page.scss"]
})
export class MapPage implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  zoom = 17;
  center: google.maps.LatLngLiteral = {
    lat: 51.437472,
    lng: 0.310612
  };
  options: google.maps.MapOptions = {
    zoomControl: false,
    clickableIcons: false,
    fullscreenControl: false,
    mapTypeControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 8
  };
  markerOptions: google.maps.MarkerOptions = {
    animation: google.maps.Animation.DROP,
    crossOnDrag: true
  };

  infoContent = "";

  suggestions: Array<any> = [];

  marker: any = {};
  showMarker: boolean = false;
  geocoder: google.maps.Geocoder;

  formatted_address: string;
  check_tapped: string;

  service_name: string;

  allowedArea: any = new google.maps.Polygon({
    paths: [
      new google.maps.LatLng(51.439745, 0.291953),
      new google.maps.LatLng(51.43556, 0.290763),
      new google.maps.LatLng(51.437067, 0.289283),
      new google.maps.LatLng(51.43745, 0.287262),
      new google.maps.LatLng(51.435965, 0.284592),
      new google.maps.LatLng(51.430746, 0.298918),
      new google.maps.LatLng(51.430812, 0.322627),
      new google.maps.LatLng(51.440802, 0.315413),
      new google.maps.LatLng(51.44015, 0.293216)
    ]
  });

  userLocation: UserLocation;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private cd: ChangeDetectorRef,
    private userPerm: UserPermissionsService,
    public alertController: AlertController
  ) {
    this.geocoder = new google.maps.Geocoder();

    this.route.queryParams.subscribe(params => {
      if (params.service) {
        this.service_name = params.service;
      }
    });
  }

  ngOnInit() {
    if (isDevice()) {
      this.userPerm
        .checkPermission("ACCESS_COARSE_LOCATION")
        .then(allowed => {
          if (allowed.hasPermission) {
            return this.userPerm.askToTurnOnGPS();
          } else {
            return this.userPerm
              .getPermission("ACCESS_COARSE_LOCATION")
              .then(() => {
                return this.userPerm.askToTurnOnGPS();
              });
          }
        })
        .then(() => {
          return this.userPerm.getLocationCoordinates();
        })
        .then(location => {
          console.log(location);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  mapPin(event: google.maps.MouseEvent) {
    this.getLocationInfo(event);
  }

  addMarker() {
    this.formatted_address = this.userLocation.formatted_address;
    this.check_tapped = this.userLocation.formatted_address;
    this.marker = {
      position: this.userLocation.coords,
      options: {
        crossOnDrag: true,
        draggable: true,
        icon: "assets/img/tnm_pin.svg"
      }
    };
    this.zoom = 18;
    this.center = this.userLocation.coords;
    this.showMarker = true;
    this.cd.detectChanges();
  }

  getLocationInfo(event, drag: boolean = false) {
    if (!event) {
      console.error("No event");
      return;
    }
    let location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    this.geocoder.geocode({ location }, (res, status) => {
      if (status === "OK" && res.length) {
        let location = {
          formatted_address: res[0].formatted_address,
          coords: {
            lat: res[0].geometry.location.lat(),
            lng: res[0].geometry.location.lng()
          }
        };
        if (location.formatted_address.indexOf("Unnamed") !== -1) {
          for (let i = 0; i < res.length; i++) {
            const r = res[i];
            if (r.formatted_address.indexOf("Unnamed") === -1) {
              location.formatted_address = r.formatted_address;
              break;
            }
          }
        }
        if (drag) {
          this.userLocation = location;
          this.formatted_address = location.formatted_address;
          this.check_tapped = location.formatted_address;
          this.center = location.coords;
          this.cd.detectChanges();
          return true;
        }
        this.selectSuggestion(location);
      }
    });
  }

  searchLocation(ev) {
    let value: string = ev.detail.value;
    if (value === this.check_tapped) {
      return;
    }
    if (value.length >= 3) {
      this.geocoder.geocode({ address: value }, (res, status) => {
        if (status === "OK" && res.length) {
          this.suggestions = [];
          res.forEach(r => {
            let sugg = {
              formatted_address: r.formatted_address,
              coords: {
                lat: r.geometry.location.lat(),
                lng: r.geometry.location.lng()
              }
            };
            this.suggestions.push(sugg);
          });
        }
      });
    }
  }

  selectSuggestion(sugg: UserLocation) {
    this.userLocation = sugg;
    this.suggestions = [];
    this.addMarker();
  }

  async next() {
    let loc = new google.maps.LatLng(
      this.userLocation.coords.lat,
      this.userLocation.coords.lng
    );
    let contains = google.maps.geometry.poly.containsLocation(
      loc,
      this.allowedArea
    );

    console.log({ contains, loc });

    if (!contains) {
      const alert = await this.alertController.create({
        header: "Invalid Location!",
        message:
          "Sorry we are currently supporting areas within <strong>Ebbsfleet Valley, UK</strong>",
        buttons: [
          {
            text: "Okay",
            role: "cancel",
            handler: blah => {
              console.log("Nothing to do");
            }
          },
          {
            text: "Try again",
            handler: () => {
              this.userLocation = null;
              this.center = {
                lat: 51.437472,
                lng: 0.310612
              };
              this.zoom = 16;
              this.formatted_address = "";
              this.showMarker = false;
            }
          }
        ]
      });
      await alert.present();
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          service: JSON.stringify({
            location: this.userLocation,
            service_name: this.service_name.toLowerCase()
          })
        }
      };
      this.router.navigate(["schedule-service"], navigationExtras);
    }
  }

  back() {
    this.navCtrl.navigateBack("main/home");
  }
}
