import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { Toast } from "@ionic-native/toast/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";
import { SpinnerDialog } from "@ionic-native/spinner-dialog/ngx";

import { GoogleMapsModule } from "@angular/google-maps";

import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { LocationAccuracy } from "@ionic-native/location-accuracy/ngx";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";

import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { config } from "./env/firebase";
import { iosTransitionAnimation } from "@ionic/core/dist/collection/utils/transition/ios.transition";
import { Animation } from "@ionic/core";

export function transitionAnimation(
  foo: Animation,
  el: HTMLElement,
  opts: any
): Promise<Animation> {
  return Promise.resolve(iosTransitionAnimation(el, opts));
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ navAnimation: transitionAnimation }),
    IonicStorageModule.forRoot({
      name: "__tnmDb",
      driverOrder: ["indexeddb", "sqlite", "websql"]
    }),
    AppRoutingModule,
    GoogleMapsModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  providers: [
    Toast,
    StatusBar,
    Dialogs,
    SpinnerDialog,
    SplashScreen,
    AndroidPermissions,
    Geolocation,
    LocationAccuracy,
    FirebaseX,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
