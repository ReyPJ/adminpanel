export interface AuthPostRequest {
  fingerprint?: string;
  unique_pin: string;
}

export interface AuthPostResponse {
  refresh: string;
  access: string;
  username: string;
  is_admin: boolean;
}
