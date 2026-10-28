# JoFer · Vínculos — landing

Landing de JoFer con sección de **Calentando Bancas**, tienda, videos de YouTube y noticias, más un panel `/admin` para cargar todo.

## Uso

```bash
npm install
cp .env.example .env   # definí ADMIN_PASSWORD y SESSION_SECRET
npm run dev            # front en http://localhost:5173 · API en :3001
```

Producción:

```bash
npm run build
npm start              # sirve landing + API en http://localhost:3001
```

## Panel de contenido

Entrá a `/admin` con la contraseña de `ADMIN_PASSWORD`.

- **Productos**: nombre, precio, descripción, imagen, link de compra (tienda, Mercado Pago, `https://wa.me/…`) y marca (JoFer o Calentando Bancas).
- **Videos**: pegá cualquier link de YouTube (watch, youtu.be, shorts, live). Elegí si va en *Videos JoFer* o en *Calentando Bancas*. Se reproducen dentro de la landing.
- **Noticias**: título, fecha, resumen, texto completo e imagen. Se abren en un modal.

## Datos

- Base SQLite en `data/jofer.db` e imágenes subidas en `data/uploads/` (configurable con `DATA_DIR` / `UPLOADS_DIR`). Hacé backup de la carpeta `data/`.
- Paleta JoFer: `#FBFAF1 #F1DEE6 #FCA65E #FF7983 #041282 #080808`. Calentando Bancas: `#D2A950 #F48328 #373F41`.
- Tipografía: Neue Haas Grotesk si está instalada; si no, *Inter Tight* (Google Fonts). Calentando Bancas usa *Montserrat*.

## Demo en Vercel (sin servidor)

La demo es una versión estática: lee el contenido de `public/demo/*.json` y el panel `/admin` guarda los cambios solo en el navegador de quien lo usa.

1. Cargá o editá el contenido en local (`npm run dev` + `/admin`, o `npm run seed`).
2. Exportalo para la demo: `npm run export-demo` (genera `public/demo/`).
3. Subí el repo a GitHub (incluida la carpeta `public/demo/`) e importalo en Vercel. `vercel.json` ya tiene la configuración: no hace falta tocar nada.

Para probar la demo en local: `npm run build:demo && npx vite preview`.
