import { demoApi } from './demoApi.js';

const TOKEN_KEY = 'jofer_admin_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
};

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Con VITE_DEMO=true (build para Vercel) no hay servidor: se usa la API simulada
export const DEMO = import.meta.env.VITE_DEMO === 'true';

const apiServidor = {
  list: (recurso, query = '') => request(`/${recurso}${query}`),
  create: (recurso, body) => request(`/${recurso}`, { method: 'POST', body }),
  update: (recurso, id, body) => request(`/${recurso}/${id}`, { method: 'PUT', body }),
  remove: (recurso, id) => request(`/${recurso}/${id}`, { method: 'DELETE' }),
  login: (password) => request('/login', { method: 'POST', body: { password } }),
  sesion: () => request('/sesion'),
  upload: (file) => {
    const form = new FormData();
    form.append('imagen', file);
    return request('/upload', { method: 'POST', form });
  },
};

export const api = DEMO ? demoApi : apiServidor;

export const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const formatearFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};
