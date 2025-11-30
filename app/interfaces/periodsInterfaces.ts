export interface getPeriodResponse {
  id: number;
  start_date?: string;
  end_date: string;
  is_closed: boolean;
  description: string;
}

export interface postPeriodRequest {
  start_date?: string;
  end_date?: string;
  description?: string;
  action: "create_new" | "close_current" | "close_and_create_new";
}

export interface MigratedEmployee {
  employee_id: number;
  employee_username: string;
  timestamp_in: string;
}

export interface MigrationInfo {
  migrated_count: number;
  migrated_employees: MigratedEmployee[];
  message: string;
}

export interface CloseAndCreateResponse {
  message: string;
  closed_period: getPeriodResponse;
  new_period: getPeriodResponse;
  migration: MigrationInfo;
}
