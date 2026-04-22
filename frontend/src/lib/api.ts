const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('spendio_token');
}

function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('spendio_token');
    localStorage.removeItem('spendio_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? data?.message ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      headers: buildHeaders(),
    }).then(handleResponse<T>);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  del<T>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(handleResponse<T>);
  },
};
