import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainPage } from "./main.page";

const routes: Routes = [
  {
    path: "",
    component: MainPage,
    children: [
      {
        path: "home",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("./home/home.module").then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: "cars",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("./cars/cars.module").then(m => m.CarsPageModule)
          },
          {
            path: "add",
            loadChildren: () =>
              import("./cars/add/add.module").then(m => m.AddPageModule)
          },
          {
            path: "add/:car",
            loadChildren: () =>
              import("./cars/add/add.module").then(m => m.AddPageModule)
          }
        ]
      },
      {
        path: "bookings",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("./bookings/bookings.module").then(
                m => m.BookingsPageModule
              )
          },
          {
            path: "history",
            loadChildren: () =>
              import("./bookings/history/history.module").then(
                m => m.HistoryPageModule
              )
          }
        ]
      },
      {
        path: "profile",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("./profile/profile.module").then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainPageRoutingModule {}
