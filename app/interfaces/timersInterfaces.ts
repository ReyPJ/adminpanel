export interface TimerInterface {
  id: number;
  employee: number;
  employee_username: string;
  day: number;
  timeIn: string;
  timeOut: string;
  day_display: string;
  is_active?: boolean;
  is_night_shift?: boolean;
}

// day: 0 is sunday, 1 is monday, 2 is tuesday, 3 is wednesday, 4 is thursday, 5 is friday, 6 is saturday
export interface PostTimerInterface {
  employee: number;
  day: number;
  timeIn: string;
  timeOut: string;
  is_night_shift?: boolean;
  is_active?: boolean;
}
