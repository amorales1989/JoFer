import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Videos from './Videos.jsx';
import CalentandoBancas from './CalentandoBancas.jsx';
import Tienda from './Tienda.jsx';
import Noticias from './Noticias.jsx';
import Footer from './Footer.jsx';
import MiniPlayer from './MiniPlayer.jsx';

const LINKS = [
  ['#videos', 'Videos'],
  ['#calentando-bancas', 'Calentando Bancas'],
  ['#tienda', 'Tienda'],
  ['#noticias', 'Noticias'],
];

const EP = [
  ['Hijo Pródigo', 'p8O-6OxmE3w'],
  ['Esas Canciones', 'vDdQh7wpBfQ'],
  ['Sediento de Ti', 'ivHxVwIGa0w'],
  ['Esperanza Infinita', 'yVM2s-71WZU'],
  ['Alma Perdida', 'U9dfUYujiws'],
  ['Gracia Sublime Es (Bonus Track)', '8lfaEywK-K4'],
];
const TRACKS = EP.map(([t]) => t);

const REDES = [
  ['https://www.youtube.com/@JoFer.', 'YouTube'],
  ['https://www.instagram.com/jofer.jf/', 'Instagram'],
];

function useDatos() {
  const [datos, setDatos] = useState({ videos: [], productos: [], noticias: [], cargando: true });
  useEffect(() => {
    Promise.all([api.list('videos'), api.list('productos'), api.list('noticias')])
      .then(([videos, productos, noticias]) => setDatos({ videos, productos, noticias, cargando: false }))
      .catch(() => setDatos((d) => ({ ...d, cargando: false })));
  }, []);
  return datos;
}

export default function Landing() {
  const { videos, productos, noticias, cargando } = useDatos();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [enCurso, setEnCurso] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Con el menú abierto no se scrollea la página de fondo
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
  }, [menu]);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--solid' : ''} ${menu ? 'nav--open' : ''}`}>
        <a href="#top" className="nav__logo" onClick={() => setMenu(false)}>JOFER</a>
        <button className="nav__toggle" onClick={() => setMenu(!menu)} aria-label="Menú" aria-expanded={menu}>
          <span /><span />
        </button>
        <nav className="nav__links">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__bg" aria-hidden="true">
            <span className="blob blob--1" />
            <span className="blob blob--2" />
            <span className="blob blob--3" />
            <span className="blob blob--4" />
            <span className="hero__sky" />
            <span className="hero__grain" />
          </div>

          <div className="wrap hero__grid">
            <div className="hero__text">
              <p className="eyebrow">Nuevo EP · Ya disponible</p>
              <h1 className="hero__title">Vínculos</h1>
              <p className="hero__lead">
                El primer EP de <strong>JoFer</strong>. Seis canciones sobre los vínculos que nos sostienen.
              </p>
              <div className="hero__ctas">
                <a href="#videos" className="btn btn--light">▶ Escuchar el EP</a>
                <a href="#calentando-bancas" className="btn btn--ghost">Calentando Bancas</a>
              </div>
            </div>

            <figure className="hero__cover">
              <img src="/img/jofer-hero.jpg" alt="Portada JoFer · Vínculos" />
              <figcaption>
                <span>JOFER</span>
                <span>Vínculos · EP · 2026</span>
              </figcaption>
            </figure>
          </div>

          <div className="hero__marquee" aria-hidden="true">
            <div className="hero__track">
              {[...TRACKS, ...TRACKS].map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>
        </section>

        <section className="vinculos">
          <div className="wrap vinculos__grid">
            <div>
              <p className="eyebrow eyebrow--coral">Nuestro primer EP</p>
              <h2 className="vinculos__statement">
                Seis canciones sobre los vínculos que nos sostienen: con Dios, con la familia y con los amigos.
              </h2>
              <p className="vinculos__text">
                JoFer es un dúo musical nacido de una amistad: compañeros de banco desde los 6 años en la escuelita
                bíblica, hoy llevamos un mensaje de fe, esperanza y amor fuera de las estructuras tradicionales.
              </p>
            </div>
            <div>
              <figure className="vinculos__fig">
                <img src="/img/vinculos-banner.jpg" alt="Arte del EP Vínculos" loading="lazy" />
              </figure>
              <ol className="tracklist">
                {EP.map(([t, id], i) => {
                  const sonando = enCurso?.id === id;
                  return (
                    <li key={id}>
                      <button
                        className={`tracklist__btn${sonando ? ' is-playing' : ''}`}
                        onClick={() => setEnCurso(sonando ? null : { id, titulo: t })}
                        aria-label={sonando ? `Detener ${t}` : `Escuchar ${t}`}
                      >
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        <strong>{t}</strong>
                        <i className="tracklist__play" aria-hidden="true">
                          {sonando ? (
                            <svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
                          )}
                        </i>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <ul className="paleta" aria-hidden="true">
            {['#FBFAF1', '#F1DEE6', '#FCA65E', '#FF7983', '#041282', '#080808'].map((c) => (
              <li key={c} style={{ background: c }} />
            ))}
          </ul>
        </section>

        <Videos videos={videos.filter((v) => v.seccion === 'jofer')} cargando={cargando} />
        <CalentandoBancas videos={videos.filter((v) => v.seccion === 'cb')} cargando={cargando} />
        <Tienda productos={productos} cargando={cargando} />
        <Noticias noticias={noticias} cargando={cargando} />
      </main>

      <Footer links={LINKS} tracks={TRACKS} redes={REDES} />
      {enCurso && <MiniPlayer {...enCurso} onClose={() => setEnCurso(null)} />}
    </>
  );
}
