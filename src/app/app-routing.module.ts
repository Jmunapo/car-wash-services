import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/auth/auth-routing.module").then(m => m.AuthRoutingModule)
  },
  {
    path: "main",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/main/main.module").then(m => m.MainPageModule)
  },

  {
    path: "map",
    loadChildren: () =>
      import("./pages/map/map.module").then(m => m.MapPageModule)
  },
  {
    path: "schedule-service",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/schedule-service/schedule-service.module").then(
        m => m.ScheduleServicePageModule
      )
  },
  {
    path: "schedule-service/:id",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/schedule-service/schedule-service.module").then(
        m => m.ScheduleServicePageModule
      )
  },
  {
    //to be able to add from schedule service
    path: "add",
    loadChildren: () =>
      import("./pages/main/cars/add/add.module").then(m => m.AddPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
