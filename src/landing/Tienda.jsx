import { useState } from 'react';

const FILTROS = [
  ['todo', 'Todo'],
  ['jofer', 'JoFer'],
  ['cb', 'Calentando Bancas'],
];

export default function Tienda({ productos, cargando }) {
  const [filtro, setFiltro] = useState('todo');
  const hayCB = productos.some((p) => p.marca === 'cb');
  const visibles = filtro === 'todo' ? productos : productos.filter((p) => p.marca === filtro);

  return (
    <section id="tienda" className="tienda">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Tienda</h2>
          {hayCB && (
            <div className="chips" role="tablist">
              {FILTROS.map(([valor, label]) => (
                <button
                  key={valor}
                  role="tab"
                  aria-selected={filtro === valor}
                  className={`chip ${filtro === valor ? 'is-active' : ''}`}
                  onClick={() => setFiltro(valor)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {visibles.length ? (
          <div className="productos">
            {visibles.map((p) => (
              <article key={p.id} className={`producto ${p.marca === 'cb' ? 'producto--cb' : ''}`}>
                <div className="producto__img">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} loading="lazy" /> : <span>{p.marca === 'cb' ? 'CB' : 'JOFER'}</span>}
                  {p.marca === 'cb' && <em className="producto__tag">Calentando Bancas</em>}
                </div>
                <div className="producto__body">
                  <h3>{p.nombre}</h3>
                  {p.descripcion && <p>{p.descripcion}</p>}
                  <div className="producto__foot">
                    {p.precio && <strong>{p.precio}</strong>}
                    {p.link_compra && (
                      <a className="btn btn--dark btn--sm" href={p.link_compra} target="_blank" rel="noopener noreferrer">
                        Comprar
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty">{cargando ? 'Cargando…' : 'La tienda abre pronto.'}</p>
        )}
      </div>
    </section>
  );
}
