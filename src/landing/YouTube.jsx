import { useState } from 'react';
import { ytThumb } from '../api.js';

// Muestra la miniatura y recién carga el iframe al hacer clic (más liviano que varios iframes)
export default function YouTube({ id, titulo, autoplay = false }) {
  const [activo, setActivo] = useState(autoplay);

  if (activo) {
    return (
      <div className="yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button className="yt yt--poster" onClick={() => setActivo(true)} aria-label={`Reproducir ${titulo}`}>
      <img src={ytThumb(id)} alt="" loading="lazy" />
      <span className="yt__play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
      </span>
    </button>
  );
}
