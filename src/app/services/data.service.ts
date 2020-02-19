import { Injectable } from "@angular/core";
import { Schedule } from "../models/schedule";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private schedule: Schedule;
  constructor() {}

  setSchedule(schedule: Schedule) {
    this.schedule = schedule;
    return true;
  }

  get mySchedule(): Schedule {
    return this.schedule;
  }
}
