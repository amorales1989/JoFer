// Exporta el contenido actual de la base a public/demo/ para la versión estática (Vercel).
// Uso: npm run export-demo
import fs from 'node:fs';
import path from 'node:path';
import { db } from './db.js';

const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'data/uploads');
const DEMO_DIR = path.resolve('public/demo');
const DEMO_UPLOADS = path.join(DEMO_DIR, 'uploads');

fs.rmSync(DEMO_DIR, { recursive: true, force: true });
fs.mkdirSync(DEMO_UPLOADS, { recursive: true });

const copiarImagen = (ruta) => {
  if (!ruta?.startsWith('/uploads/')) return ruta;
  const archivo = path.basename(ruta);
  const origen = path.join(UPLOADS_DIR, archivo);
  if (!fs.existsSync(origen)) return '';
  fs.copyFileSync(origen, path.join(DEMO_UPLOADS, archivo));
  return `/demo/uploads/${archivo}`;
};

const orden = { productos: 'creado_en DESC, id DESC', videos: 'creado_en DESC, id DESC', noticias: 'fecha DESC, id DESC' };

for (const [tabla, ord] of Object.entries(orden)) {
  const filas = db.prepare(`SELECT * FROM ${tabla} ORDER BY ${ord}`).all();
  for (const f of filas) if ('imagen' in f) f.imagen = copiarImagen(f.imagen);
  fs.writeFileSync(path.join(DEMO_DIR, `${tabla}.json`), JSON.stringify(filas, null, 2));
  console.log(`${tabla}: ${filas.length}`);
}

console.log(`Demo exportada en ${path.relative(process.cwd(), DEMO_DIR)}/`);
