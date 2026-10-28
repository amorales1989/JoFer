import crypto from 'node:crypto';

const PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

if (!PASSWORD) {
  console.warn('⚠  ADMIN_PASSWORD no está definido en .env: el panel /admin queda bloqueado.');
}

const firmar = (valor) => crypto.createHmac('sha256', SECRET).update(valor).digest('hex');

const igualSeguro = (a, b) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

export function login(password) {
  if (!PASSWORD || typeof password !== 'string' || !igualSeguro(password, PASSWORD)) return null;
  const vence = String(Date.now() + DURACION_MS);
  return `${vence}.${firmar(vence)}`;
}

export function requiereAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer /, '');
  const [vence, firma] = token.split('.');
  if (vence && firma && igualSeguro(firma, firmar(vence)) && Number(vence) > Date.now()) return next();
  res.status(401).json({ error: 'No autorizado' });
}
