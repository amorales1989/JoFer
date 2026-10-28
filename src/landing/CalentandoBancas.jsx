import YouTube from './YouTube.jsx';

// Episodios en orden cronológico: el más viejo primero, los nuevos se suman al final
const cronologico = (a, b) => `${a.creado_en}|${String(a.id).padStart(9, '0')}`.localeCompare(`${b.creado_en}|${String(b.id).padStart(9, '0')}`);

export default function CalentandoBancas({ videos, cargando }) {
  const episodios = [...videos].sort(cronologico);
  return (
    <section id="calentando-bancas" className="cb">
      <div className="wrap">
        <div className="cb__intro">
          <img className="cb__logo" src="/img/cb-logo.png" alt="Calentando Bancas" loading="lazy" />
          <div>
            <p className="cb__eyebrow">Asado y podcast</p>
            <h2 className="cb__title">Calentando <span>Bancas</span></h2>
            <p className="cb__text">
              Sentarse alrededor de una parrilla es una de las costumbres más nuestras. Acá dejamos de calentar bancas
              sin hacer nada y charlamos de los temas de todos los días desde nuestra mirada cristiana.
              ¡Prendé el fuego, armate un mate y sumate a la charla!
            </p>
          </div>
        </div>

        {episodios.length ? (
          <div className="cb__grid">
            {episodios.map((v) => (
              <article key={v.id} className="cb__card">
                <YouTube id={v.youtube_id} titulo={v.titulo} />
                <h3>{v.titulo}</h3>
                {v.descripcion && <p>{v.descripcion}</p>}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty empty--cb">{cargando ? 'Cargando…' : 'Los episodios se vienen pronto.'}</p>
        )}
      </div>
    </section>
  );
}
