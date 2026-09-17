const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getTokens() {
  return JSON.parse(localStorage.getItem('dh_tokens') || 'null');
}

function setTokens(tokens) {
  localStorage.setItem('dh_tokens', JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem('dh_tokens');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const tokens = getTokens();
    if (tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && auth) {
    // one silent refresh attempt
    const tokens = getTokens();
    if (tokens?.refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      if (refreshRes.ok) {
        const { access } = await refreshRes.json();
        setTokens({ ...tokens, access });
        return request(path, { method, body, auth });
      }
    }
    clearTokens();
    window.location.href = '/login';
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: async (payload) => {
    const data = await request('/auth/login', { method: 'POST', body: payload, auth: false });
    setTokens(data);
    return data;
  },
  me: () => request('/auth/me'),

  myScores: () => request('/scores/'),
  addScore: (payload) => request('/scores/', { method: 'POST', body: payload }),
  updateScore: (id, payload) => request(`/scores/${id}/`, { method: 'PATCH', body: payload }),
  deleteScore: (id) => request(`/scores/${id}/`, { method: 'DELETE' }),

  charities: () => request('/charities/', { auth: false }),

  mySubscription: () => request('/subscriptions/me'),
  startSubscription: (plan) => request('/subscriptions/start', { method: 'POST', body: { plan } }),
  cancelSubscription: () => request('/subscriptions/cancel', { method: 'POST' }),
  updateSubscription: (payload) => request('/subscriptions/me', { method: 'PATCH', body: payload }),

  myDrawEntries: () => request('/draws/my-entries/'),
  myWinnings: () => request('/draws/winners/'),
  submitProof: (payload) => request('/draws/winners/', { method: 'POST', body: payload }),

  // admin
  adminUsers: () => request('/admin/users/'),
  adminDraws: () => request('/draws/admin/'),
  createDraw: (payload) => request('/draws/admin/', { method: 'POST', body: payload }),
  simulateDraw: (id) => request(`/draws/admin/${id}/simulate/`, { method: 'POST' }),
  publishDraw: (id) => request(`/draws/admin/${id}/publish/`, { method: 'POST' }),
  adminCharities: () => request('/charities/'),
  createCharity: (payload) => request('/charities/', { method: 'POST', body: payload }),
  adminWinners: () => request('/draws/winners/'),
  reviewWinner: (id, payload) => request(`/draws/winners/${id}/`, { method: 'PATCH', body: payload }),
  reports: () => request('/reports/'),
};
