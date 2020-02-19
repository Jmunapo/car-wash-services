import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "auth",
    children: [
      {
        path: "login",
        loadChildren: () =>
          import("./login/login.module").then(m => m.LoginPageModule)
      },
      {
        path: "register",
        loadChildren: () =>
          import("./register/register.module").then(m => m.RegisterPageModule)
      },
      {
        path: "reset",
        loadChildren: () =>
          import("./reset-password/reset-password.module").then(
            m => m.ResetPasswordPageModule
          )
      },

      {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
      }
    ]
  },
  {
    path: "",
    redirectTo: "auth",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
