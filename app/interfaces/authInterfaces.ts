export interface AuthPostRequest {
  unique_pin: string;
}

export interface AuthPostResponse {
  refresh: string;
  access: string;
  username: string;
  is_admin: boolean;
}

export interface NFCTokenCreateRequest {
  employee_id: number;
  tag_id: string;
}

export interface NFCTokenResponse {
  id: number;
  employee: number;
  tag_id: string;
  token: string;
  revoked: boolean;
  created_at: string;
}

export interface NFCTokenValidateRequest {
  token: string;
}

export interface NFCTokenValidateResponse {
  employee_id: number;
  tag_id: string;
  exp: number;
  iat: number;
}
