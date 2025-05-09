import { getPeriodResponse } from "./periodsInterfaces";

export interface EmployeeStats {
  employee_id: number;
  employee_name: string;
  username: string;
  days_worked: number;
  total_hours: number;
  regular_hours: number;
  night_hours: number;
  target_biweekly_hours: number;
  hourly_rate: number;
}

export interface AllEmployeeStats {
  pay_period: getPeriodResponse;
  stats: EmployeeStats[];
}
