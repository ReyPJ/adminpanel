export interface salaryRecordInterface {
  id: number;
  employee: number;
  employee_name: string;
  total_hours: number;
  regular_hours?: number;
  night_hours?: number;
  extra_hours: number;
  night_shift_factor_applied?: string; // Decimal
  gross_salary?: string; // Decimal
  lunch_deduction_hours?: number;
  other_deductions?: string; // Decimal
  other_deductions_description?: string;
  salary_to_pay: string; // Decimal
  paid_at: string; // Date
  sync?: boolean;
  pay_period?: number;
  period_name: string;
  has_night_hours: boolean;
}
