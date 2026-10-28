import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'jofer.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    precio TEXT DEFAULT '',
    imagen TEXT DEFAULT '',
    link_compra TEXT DEFAULT '',
    marca TEXT NOT NULL DEFAULT 'jofer' CHECK (marca IN ('jofer', 'cb')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    seccion TEXT NOT NULL DEFAULT 'jofer' CHECK (seccion IN ('jofer', 'cb')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    resumen TEXT DEFAULT '',
    cuerpo TEXT DEFAULT '',
    imagen TEXT DEFAULT '',
    fecha TEXT NOT NULL DEFAULT (date('now')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
