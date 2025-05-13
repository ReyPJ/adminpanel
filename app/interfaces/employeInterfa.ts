export interface EmployeeInterface {
  id?: number;
  salary_hour: string;
  biweekly_hours?: string;
  night_shift_factor?: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  phone?: string;
  unique_pin?: string;
}

export interface ActiveEmployeeInterface {
  id: number;
  full_name: string;
  username: string;
  timestamp_in: string;
  method: string;
}
