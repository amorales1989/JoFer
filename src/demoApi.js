// API simulada para la demo estática: lee public/demo/*.json y guarda los cambios
// del panel solo en este navegador (localStorage). No hay servidor ni base de datos.
const STORE_KEY = 'jofer_demo_store_v1';
const RECURSOS = ['productos', 'videos', 'noticias'];

let store = null;

const leerLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
};
const guardarLocal = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {
    throw new Error('No hay más espacio en el navegador para la demo. Usá "Restablecer demo".');
  }
};

async function cargar() {
  if (store) return store;
  store = leerLocal();
  if (store) return store;
  const datos = await Promise.all(
    RECURSOS.map((r) => fetch(`/demo/${r}.json`).then((res) => (res.ok ? res.json() : [])).catch(() => []))
  );
  store = Object.fromEntries(RECURSOS.map((r, i) => [r, datos[i]]));
  return store;
}

const ordenar = (recurso, filas) => {
  const clave = recurso === 'noticias' ? (f) => `${f.fecha}|${String(f.id).padStart(9, '0')}` : (f) => `${f.creado_en}|${String(f.id).padStart(9, '0')}`;
  return [...filas].sort((a, b) => clave(b).localeCompare(clave(a)));
};

function extraerYoutubeId(url = '') {
  const s = String(url).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const REQUERIDOS = { productos: ['nombre'], videos: ['titulo', 'youtube_id'], noticias: ['titulo'] };

function normalizar(recurso, datos, parcial) {
  const limpio = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, String(v ?? '').trim()]));
  for (const r of REQUERIDOS[recurso]) {
    if ((!parcial || r in limpio) && !limpio[r]) throw new Error(`Falta el campo "${r}"`);
  }
  if (recurso === 'videos' && 'youtube_id' in limpio) {
    const id = extraerYoutubeId(limpio.youtube_id);
    if (!id) throw new Error('El link de YouTube no es válido');
    limpio.youtube_id = id;
  }
  return limpio;
}

// Reduce la imagen para que entre en localStorage
const imagenADataUrl = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 900;
      const escala = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    img.src = URL.createObjectURL(file);
  });

const ahora = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export const demoApi = {
  async list(recurso) {
    const s = await cargar();
    return ordenar(recurso, s[recurso] || []);
  },
  async create(recurso, body) {
    const s = await cargar();
    const datos = normalizar(recurso, body, false);
    const id = Math.max(0, ...s[recurso].map((f) => f.id)) + 1;
    const fila = { id, creado_en: ahora(), ...datos };
    s[recurso] = [...s[recurso], fila];
    guardarLocal();
    return fila;
  },
  async update(recurso, id, body) {
    const s = await cargar();
    const datos = normalizar(recurso, body, true);
    s[recurso] = s[recurso].map((f) => (f.id === Number(id) ? { ...f, ...datos } : f));
    guardarLocal();
    return s[recurso].find((f) => f.id === Number(id));
  },
  async remove(recurso, id) {
    const s = await cargar();
    s[recurso] = s[recurso].filter((f) => f.id !== Number(id));
    guardarLocal();
    return null;
  },
  async login() {
    return { token: 'demo' };
  },
  async sesion() {
    return { ok: true };
  },
  async upload(file) {
    if (!/^image\//.test(file.type)) throw new Error('Subí una imagen JPG, PNG o WEBP');
    return { url: await imagenADataUrl(file) };
  },
  reset() {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    store = null;
  },
};
