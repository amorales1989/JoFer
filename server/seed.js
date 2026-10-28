// Carga datos de ejemplo. Uso: npm run seed  (agrega --reset para vaciar antes)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'data/uploads');
const IMG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed/img');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const reset = process.argv.includes('--reset');
const hayDatos = ['productos', 'videos', 'noticias'].some((t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n > 0);

if (hayDatos && !reset) {
  console.log('La base ya tiene contenido. Usá "npm run seed -- --reset" para reemplazarlo por los datos de ejemplo.');
  process.exit(0);
}

const imagen = (archivo) => {
  const destino = `seed-${archivo}`;
  fs.copyFileSync(path.join(IMG_DIR, archivo), path.join(UPLOADS_DIR, destino));
  return `/uploads/${destino}`;
};

// Fechas de creación escalonadas para que el orden en la landing sea el de las listas
const hace = (dias) => new Date(Date.now() - dias * 864e5).toISOString().replace('T', ' ').slice(0, 19);

// Productos: de ejemplo (el canal no tiene tienda). Videos y noticias: contenido real del canal youtube.com/@JoFer.
const productos = [
  ['Remera Vínculos', 'Algodón peinado con el arte del EP Vínculos en el frente. Talles S a XXL.', '$22.000', 'remera.jpg', 'jofer'],
  ['Buzo JoFer', 'Buzo oversize con capucha y JOFER bordado en el pecho.', '$48.000', 'buzo.jpg', 'jofer'],
  ['Póster Vínculos', 'Impresión 50×70 cm en papel mate con el tracklist del EP.', '$12.000', 'poster.jpg', 'jofer'],
  ['Pack de stickers', 'Seis stickers, uno por cada canción de Vínculos.', '$4.500', 'stickers.jpg', 'jofer'],
  ['Remera Calentando Bancas', 'La oficial del asado y podcast. Logo a color en el frente.', '$20.000', 'cb-remera.jpg', 'cb'],
  ['Gorra Calentando Bancas', 'Gorra trucker con logo bordado. Talle único ajustable.', '$16.000', 'cb-gorra.jpg', 'cb'],
  ['Mate Calentando Bancas', 'Para la previa de cada episodio. Calabaza forrada con logo grabado.', '$14.000', 'cb-mate.jpg', 'cb'],
];

// En orden de aparición: el primero es el video destacado
const videos = [
  ['Hijo Pródigo · EP Vínculos', 'p8O-6OxmE3w', 'La historia del hijo que se va en busca de su propia "felicidad" y descubre que el vínculo perfecto es estar al lado del Padre (Lucas 15:20).', 'jofer'],
  ['Esas Canciones · EP Vínculos', 'vDdQh7wpBfQ', 'Nuestra propia historia de amistad: compañeros de banco desde los 6 años, unidos por un mismo sueño, la música.', 'jofer'],
  ['Sediento de Ti · EP Vínculos', 'ivHxVwIGa0w', 'Cuando una relación se rompe y el corazón queda quebrantado, Dios es nuestro mejor refugio. Una oración cantada.', 'jofer'],
  ['Esperanza Infinita · EP Vínculos', 'yVM2s-71WZU', 'Una charla sincera entre dos amigos, sin caretas, que termina desbordando en la certeza de las promesas de Dios.', 'jofer'],
  ['Alma Perdida · EP Vínculos', 'U9dfUYujiws', 'Una historia real: Dios aparece para transformar el interior y abrir un futuro esperanzador.', 'jofer'],
  ['Gracia Sublime Es (Bonus Track) · EP Vínculos', '8lfaEywK-K4', 'El cierre del EP, como agradecimiento a Dios por hacer posible este sueño.', 'jofer'],
  ['JoFer desde adentro: Nuestra historia', 's8Ui32g_7KE', 'Cómo nació el dúo: de la escuelita dominical a reencontrarnos en la pandemia, el proceso creativo y lo que se viene.', 'jofer'],
  ['Contigo Dios', 'ULBFpZberOM', '', 'jofer'],
  ['Misericordia Eterna', 'gHDsx9NlcNs', '', 'jofer'],
  ['Todos Tienen Que Saber', '7xGq17EbFy0', '', 'jofer'],
  ['Session Adoración #1', 'dT-CZ095H7c', '', 'jofer'],
  ['Ep. 3 · Compromiso y Responsabilidad', 'PbBvpYxZ-XU', 'Empanadas al disco y una charla sobre el compromiso, el miedo al fracaso y la historia del profeta Elías.', 'cb'],
  ['Ep. 2 · Procesos', 'xybrrXUWdE8', 'Con Matías Di Filippo e Ignacio Irusta: la música que nos marcó y cómo Dios trabaja en cada etapa.', 'cb'],
  ['Ep. 1 · Identidad', 'jRT0-iWp_kw', 'El estreno: mates, anécdotas bien argentinas y una mirada sobre la identidad desde nuestro caminar cristiano.', 'cb'],
];

const noticias = [
  [
    'Así se vivió nuestra presentación en el Stream QHJ',
    'Presentamos Vínculos en vivo en San Fernando y compartimos nuestra historia en una entrevista.',
    'Tuvimos el privilegio de presentar las canciones de Vínculos en vivo en el Stream QHJ, en San Fernando.\n\nAdemás de tocar, contamos cómo pasamos de ser compañeros de banco a los 6 años a cumplir este gran sueño, los referentes que nos marcaron y la historia detrás de la banda. Los mejores momentos están en nuestro canal de YouTube.',
    'news-stream.jpg', '2026-10-23',
  ],
  [
    'Una semana de Vínculos',
    'Ya pasó una semana desde el estreno y el corazón explota de agradecimiento.',
    '¡Ya pasó una semana desde que estrenamos Vínculos y el corazón explota de agradecimiento!\n\nGracias a cada uno de ustedes por escuchar, compartir y hacer suyas estas canciones. Ya forman parte de esta gran familia que es JOFER.',
    'news-semana.jpg', '2026-10-08',
  ],
  [
    'Vínculos, nuestro primer EP, ya está disponible',
    'Seis canciones sobre la amistad, el perdón y la fe. Disponible en todas las plataformas digitales.',
    'Vínculos es nuestro primer EP oficial y ya está disponible en todas las plataformas digitales.\n\nSon seis canciones: Hijo Pródigo, Esas Canciones, Sediento de Ti, Esperanza Infinita, Alma Perdida y, como bonus track, Gracia Sublime Es. Cada una cuenta una historia de los vínculos que nos sostienen: con Dios, con la familia y con los amigos.\n\nProducción, mezcla y masterización: Ignacio Irusta (@atalalla) y Matías Di Filippo. Visualizers: Isaac Rosales. Composiciones de Fernando Cordone, Jorge Silveyra y Leonardo Benitez.\n\nPodés escuchar el EP completo acá mismo, en la sección de videos.',
    'yt-p8O-6OxmE3w.jpg', '2026-10-01',
  ],
  [
    'Calentando Bancas Ep. 3: Compromiso y Responsabilidad',
    'Empanadas al disco, datos de nuestra realidad y la historia del profeta Elías.',
    'En el tercer episodio de Calentando Bancas nos metimos en la cocina para armar unas empanadas al disco mientras charlábamos sobre un tema que nos atraviesa como sociedad: el compromiso y la responsabilidad.\n\nHablamos del miedo al fracaso, la cultura de lo descartable y los desafíos en las parejas, y cerramos con la historia de Elías: su victoria, la cueva y el silbo apacible de Dios llamándolo a volver al propósito.',
    'yt-PbBvpYxZ-XU.jpg', '2026-09-16',
  ],
  [
    'JoFer desde adentro: nuestra historia',
    'Un especial para contarles cómo nació el dúo y todo lo que se viene.',
    'En este especial abrimos el corazón para contarles la historia de JoFer: desde nuestros inicios en la escuelita dominical a los 6 años, pasando por los desafíos de la pandemia, hasta el proceso creativo que nos define hoy.\n\nJoFer no es solo música: es una amistad forjada a prueba de todo, con temperamentos opuestos pero un mismo propósito, llevar un mensaje de fe, esperanza y amor fuera de las estructuras tradicionales.',
    'yt-s8Ui32g_7KE.jpg', '2026-07-10',
  ],
  [
    'Nace Calentando Bancas: asado y podcast',
    'Estrenamos una nueva sección en el canal: charlas alrededor de la parrilla.',
    'Sentarse alrededor de una parrilla es una de las costumbres más nuestras. En Calentando Bancas dejamos de "calentar bancas sin hacer nada" y profundizamos en temas que nos rodean cotidianamente.\n\nEn el primer episodio debatimos sobre la identidad: unos mates en la previa, anécdotas bien argentinas y una mirada desde nuestro caminar cristiano. ¡Prendé el fuego, armate un mate y sumate a la charla!',
    'yt-jRT0-iWp_kw.jpg', '2026-06-03',
  ],
];

const cargar = db.transaction(() => {
  if (reset) {
    for (const t of ['productos', 'videos', 'noticias']) db.exec(`DELETE FROM ${t}; DELETE FROM sqlite_sequence WHERE name = '${t}';`);
  }

  const insProducto = db.prepare(
    'INSERT INTO productos (nombre, descripcion, precio, imagen, link_compra, marca, creado_en) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  productos.forEach(([nombre, desc, precio, img, marca], i) =>
    insProducto.run(nombre, desc, precio, imagen(img), 'https://www.instagram.com/jofer.jf/', marca, hace(i))
  );

  const insVideo = db.prepare('INSERT INTO videos (titulo, youtube_id, descripcion, seccion, creado_en) VALUES (?, ?, ?, ?, ?)');
  videos.forEach(([titulo, id, desc, seccion], i) => insVideo.run(titulo, id, desc, seccion, hace(i)));

  const insNoticia = db.prepare('INSERT INTO noticias (titulo, resumen, cuerpo, imagen, fecha) VALUES (?, ?, ?, ?, ?)');
  noticias.forEach(([titulo, resumen, cuerpo, img, fecha]) => insNoticia.run(titulo, resumen, cuerpo, imagen(img), fecha));
});

cargar();
console.log(`Listo: ${productos.length} productos, ${videos.length} videos y ${noticias.length} noticias de ejemplo.`);
