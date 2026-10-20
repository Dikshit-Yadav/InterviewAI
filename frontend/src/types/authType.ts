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

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  targetRole: string;
}

export interface AuthResponse {
  id?: string;
  name?: string;
  email?: string;
  targetRole?: string;
  token?: string;
}

export interface AuthMeResponse {
  user: UserProfile;
  isauthenticate: boolean;
}

export interface LogoutResponse {
  message: string;
}