export interface attendanceInterface {
  id: number;
  employee: number;
  employee_name: string;
  pay_period: number;
  work_date: string;
  formatted_date: string;
  time_in: string;
  time_out: string;
  regular_hours: string;
  night_hours: string;
  extra_hours: string;
  lunch_deduction: string;
}
