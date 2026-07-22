export interface User {
  id: string;
  email?: string;
  name?: string;
  photo?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
