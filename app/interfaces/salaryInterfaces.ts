interface periodForNightHoursCountInterface {
  id: number;
  description: string;
}

export interface nightHoursCountInterface {
  id: number;
  username: string;
  full_name: string;
  night_hours: number;
  night_shift_factor: number;
  period: periodForNightHoursCountInterface[];
}

export interface requestCalculateSalaryInterface {
  employee_id: number;
  apply_night_factor: boolean;
  period_id: number;
  lunch_deduction_hours: number;
  other_deductions: number;
  other_deductions_description: string;
}

export interface responseCalculateSalaryInterface {
  id: number;
  employee: number;
  employee_name: string;
  total_hours: number;
  regular_hours: number;
  night_hours: number;
  extra_hours: number;
  night_shift_factor_applied: number;
  gross_salary: number;
  lunch_deduction_hours: number;
  other_deductions: number;
  other_deductions_description: string;
  salary_to_pay: number;
  paid_at: string;
  sync: boolean;
  pay_period: number;
  period_name: string;
  has_night_hours: boolean;
}
