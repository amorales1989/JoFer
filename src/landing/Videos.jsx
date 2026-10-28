import { useEffect, useState } from 'react';
import YouTube from './YouTube.jsx';
import { ytThumb } from '../api.js';

export default function Videos({ videos, cargando }) {
  const [actualId, setActualId] = useState(null);
  const [reproducir, setReproducir] = useState(false);

  useEffect(() => {
    if (!actualId && videos.length) setActualId(videos[0].id);
  }, [videos, actualId]);

  const actual = videos.find((v) => v.id === actualId) || videos[0];

  const elegir = (id) => {
    setActualId(id);
    setReproducir(true);
    document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="videos" className="videos">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Videos</h2>
          <p className="section-sub">El EP Vínculos completo, sesiones en vivo y nuestra historia.</p>
        </div>

        {!actual ? (
          <p className="empty empty--dark">{cargando ? 'Cargando…' : 'Muy pronto, nuevos videos.'}</p>
        ) : (
          <div className="videos__layout">
            <div className="videos__main">
              <div className="videos__frame">
                <YouTube key={`${actual.id}-${reproducir}`} id={actual.youtube_id} titulo={actual.titulo} autoplay={reproducir} />
              </div>
              <h3 className="videos__title">{actual.titulo}</h3>
              {actual.descripcion && <p className="videos__desc">{actual.descripcion}</p>}
            </div>

            {videos.length > 1 && (
              <ol className="videos__list">
                {videos.map((v) => (
                  <li key={v.id}>
                    <button className={`vitem ${v.id === actual.id ? 'is-active' : ''}`} onClick={() => elegir(v.id)}>
                      <img src={ytThumb(v.youtube_id)} alt="" loading="lazy" />
                      <span>{v.titulo}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
