export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  targetRole:string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  targetRole:string;
  token: string;
}