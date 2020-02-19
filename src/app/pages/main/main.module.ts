import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { MainPage } from "./main.page";
import { MainPageRoutingModule } from "./main-routing.module";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MainPageRoutingModule],
  declarations: [MainPage]
})
export class MainPageModule {}
