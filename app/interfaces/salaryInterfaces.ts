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

// Interfaz para warnings del backend
export interface SalaryWarning {
  type: "early_calculation" | "missing_checkout" | "general";
  message: string;
  days_remaining?: number;
  employee_id?: number;
  details?: string;
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
  warnings?: SalaryWarning[]; // Nuevo campo para warnings
}

// Interfaz para respuesta con warnings
export interface CalculateSalaryResponse {
  salary_record: responseCalculateSalaryInterface;
  warnings?: SalaryWarning[];
}

// Interfaz para Live Summary (horas en tiempo real)
export interface LiveSummaryEmployee {
  employee_id: number;
  employee_username: string;
  total_hours: string;
  regular_hours: string;
  night_hours: string;
  extra_hours: string;
  estimated_salary: string;
  days_worked: number;
  pending_checkout: number;
}

export interface LiveSummaryPeriod {
  id: number;
  description: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

export interface LiveSummaryResponse {
  period: LiveSummaryPeriod;
  employees: LiveSummaryEmployee[];
  total_employees: number;
  warnings?: SalaryWarning[];
}
