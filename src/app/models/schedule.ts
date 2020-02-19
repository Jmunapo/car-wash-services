export interface VLoction {
  formatted_address: string;
  coords: { lat: number; lng: number };
}

export interface ScheduleDate {
  date: number;
  month: string;
  year: number;
  day: string;
  slot: string;
  timestamp: number;
}

export interface Schedule {
  id?: any;
  status?: string;
  location: VLoction;
  service_name: string;
  date: ScheduleDate;
  user_id?: string;
  fb_id?: string;
  updated_at: any;
  vehicles: Array<any>;
  frequency?: string;
  amount?: number;
  coupon?: string;
  weeks: number;
}
