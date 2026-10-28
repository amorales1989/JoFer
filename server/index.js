import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db } from './db.js';
import { login, requiereAdmin } from './auth.js';

const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'data/uploads');
const DIST_DIR = path.resolve('dist');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)),
});

// Acepta links de watch, youtu.be, shorts, embed, live o directamente el ID
export function extraerYoutubeId(url = '') {
  const limpio = String(url).trim();
  if (/^[\w-]{11}$/.test(limpio)) return limpio;
  const m = limpio.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const borrarImagen = (ruta) => {
  if (!ruta?.startsWith('/uploads/')) return;
  fs.rm(path.join(UPLOADS_DIR, path.basename(ruta)), { force: true }, () => {});
};

/* ---------- Auth ---------- */
app.post('/api/login', (req, res) => {
  const token = login(req.body?.password);
  if (!token) return res.status(401).json({ error: 'Contraseña incorrecta' });
  res.json({ token });
});

app.get('/api/sesion', requiereAdmin, (_req, res) => res.json({ ok: true }));

app.post('/api/upload', requiereAdmin, upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Subí una imagen JPG, PNG, WEBP, GIF o AVIF (máx. 8 MB)' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

/* ---------- CRUD genérico ---------- */
const recursos = {
  productos: {
    campos: ['nombre', 'descripcion', 'precio', 'imagen', 'link_compra', 'marca'],
    requeridos: ['nombre'],
    orden: 'creado_en DESC, id DESC',
  },
  videos: {
    campos: ['titulo', 'youtube_id', 'descripcion', 'seccion'],
    requeridos: ['titulo', 'youtube_id'],
    orden: 'creado_en DESC, id DESC',
    normalizar: (datos) => {
      if ('youtube_id' in datos) {
        const id = extraerYoutubeId(datos.youtube_id);
        if (!id) throw new Error('El link de YouTube no es válido');
        datos.youtube_id = id;
      }
      return datos;
    },
  },
  noticias: {
    campos: ['titulo', 'resumen', 'cuerpo', 'imagen', 'fecha'],
    requeridos: ['titulo'],
    orden: 'fecha DESC, id DESC',
  },
};

for (const [nombre, cfg] of Object.entries(recursos)) {
  const base = `/api/${nombre}`;

  const tomarDatos = (body, parcial) => {
    const datos = {};
    for (const c of cfg.campos) if (body?.[c] !== undefined) datos[c] = String(body[c]).trim();
    if (!parcial) for (const r of cfg.requeridos) if (!datos[r]) throw new Error(`Falta el campo "${r}"`);
    for (const r of cfg.requeridos) if (r in datos && !datos[r]) throw new Error(`El campo "${r}" no puede quedar vacío`);
    return cfg.normalizar ? cfg.normalizar(datos) : datos;
  };

  const buscar = db.prepare(`SELECT * FROM ${nombre} WHERE id = ?`);

  app.get(base, (req, res) => {
    const filtro = nombre === 'videos' && req.query.seccion ? 'WHERE seccion = ?' : '';
    const params = filtro ? [req.query.seccion] : [];
    res.json(db.prepare(`SELECT * FROM ${nombre} ${filtro} ORDER BY ${cfg.orden}`).all(...params));
  });

  app.get(`${base}/:id`, (req, res) => {
    const fila = buscar.get(req.params.id);
    fila ? res.json(fila) : res.status(404).json({ error: 'No encontrado' });
  });

  app.post(base, requiereAdmin, (req, res) => {
    try {
      const datos = tomarDatos(req.body, false);
      const cols = Object.keys(datos);
      const info = db
        .prepare(`INSERT INTO ${nombre} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
        .run(...Object.values(datos));
      res.status(201).json(buscar.get(info.lastInsertRowid));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put(`${base}/:id`, requiereAdmin, (req, res) => {
    try {
      const anterior = buscar.get(req.params.id);
      if (!anterior) return res.status(404).json({ error: 'No encontrado' });
      const datos = tomarDatos(req.body, true);
      const cols = Object.keys(datos);
      if (cols.length) {
        db.prepare(`UPDATE ${nombre} SET ${cols.map((c) => `${c} = ?`).join(',')} WHERE id = ?`)
          .run(...Object.values(datos), req.params.id);
      }
      if ('imagen' in datos && anterior.imagen !== datos.imagen) borrarImagen(anterior.imagen);
      res.json(buscar.get(req.params.id));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete(`${base}/:id`, requiereAdmin, (req, res) => {
    const fila = buscar.get(req.params.id);
    if (!fila) return res.status(404).json({ error: 'No encontrado' });
    db.prepare(`DELETE FROM ${nombre} WHERE id = ?`).run(req.params.id);
    borrarImagen(fila.imagen);
    res.status(204).end();
  });
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

/* ---------- Front en producción ---------- */
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({
    error: err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera los 8 MB' : 'Error interno',
  });
});

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
