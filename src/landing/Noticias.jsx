import { useEffect, useState } from 'react';
import { formatearFecha } from '../api.js';

export default function Noticias({ noticias, cargando }) {
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    if (!abierta) return;
    const onKey = (e) => e.key === 'Escape' && setAbierta(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [abierta]);

  const [destacada, ...resto] = noticias;

  return (
    <section id="noticias" className="noticias">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Noticias</h2>
        </div>

        {!destacada ? (
          <p className="empty">{cargando ? 'Cargando…' : 'Todavía no hay noticias.'}</p>
        ) : (
          <div className="news">
            <NoticiaCard n={destacada} grande onOpen={setAbierta} />
            {resto.map((n) => <NoticiaCard key={n.id} n={n} onOpen={setAbierta} />)}
          </div>
        )}
      </div>

      {abierta && (
        <div className="modal" onClick={() => setAbierta(null)} role="dialog" aria-modal="true" aria-label={abierta.titulo}>
          <article className="modal__box" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setAbierta(null)} aria-label="Cerrar">×</button>
            {abierta.imagen && <img className="modal__img" src={abierta.imagen} alt="" />}
            <div className="modal__body">
              <time>{formatearFecha(abierta.fecha)}</time>
              <h3>{abierta.titulo}</h3>
              {(abierta.cuerpo || abierta.resumen).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function NoticiaCard({ n, grande, onOpen }) {
  return (
    <button className={`ncard ${grande ? 'ncard--big' : ''}`} onClick={() => onOpen(n)}>
      <div className="ncard__img">
        {n.imagen ? <img src={n.imagen} alt="" loading="lazy" /> : <span className="ncard__sky" />}
      </div>
      <div className="ncard__body">
        <time>{formatearFecha(n.fecha)}</time>
        <h3>{n.titulo}</h3>
        {n.resumen && <p>{n.resumen}</p>}
        <span className="ncard__more">Leer más →</span>
      </div>
    </button>
  );
}
