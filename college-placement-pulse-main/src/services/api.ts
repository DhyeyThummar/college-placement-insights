export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; token?: string; isForm?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, token, isForm } = options;
  const headers: Record<string, string> = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : (await res.text());
  if (!res.ok) {
    const message = (payload as any)?.error || (typeof payload === 'string' ? payload : 'Request failed');
    throw new Error(message);
  }
  return payload as T;
}

export type LoginResponse = { token: string; user?: any; admin?: any };

export const authApi = {
  adminSignup: (name: string, email: string, password: string, collegeName: string, specialKey: string) =>
    apiFetch<LoginResponse>('/admin/signup', { method: 'POST', body: { name, email, password, collegeName, specialKey } }),
  adminLogin: (email: string, password: string) =>
    apiFetch<LoginResponse>('/admin/login', { method: 'POST', body: { email, password } }),
};

export const placementApi = {
  uploadCsv: (file: File, token: string) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<{ success: boolean; inserted: number }>('/admin/upload', { method: 'POST', token, body: form, isForm: true });
  },
  downloadCsvTemplate: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/csv-template`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to download template');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement_data_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  getAll: (collegeId: string) => apiFetch<{ data: any[] }>(`/placements/${collegeId}`),
  getStats: (collegeId: string) => apiFetch<{ companyWise: any[]; branchWise: any[]; yearWise: any[]; packageStats: { max: number; min: number; avg: number } }>(`/placements/${collegeId}/stats`),
};


