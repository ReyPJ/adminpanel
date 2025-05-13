export interface getPeriodResponse {
  id: number;
  start_date?: string;
  end_date: string;
  is_closed: boolean;
  description: string;
}

export interface postPeriodRequest {
  start_date: string;
  end_date: string;
  description?: string;
  action: "create_new" | "close_current";
}
