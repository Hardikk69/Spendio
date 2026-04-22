export interface User {
  user_id?: number;
  id?: string;
  name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
}

const TOKEN_KEY = 'spendio_token';
const USER_KEY = 'spendio_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function clearAuth(): void {
  clearToken();
  clearUser();
}
