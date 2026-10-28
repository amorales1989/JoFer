const ICONOS = {
  YouTube: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" />
    </svg>
  ),
};

export default function Footer({ links, tracks, redes }) {
  return (
    <footer className="footer">
      <div className="footer__bg" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--4" />
        <span className="hero__grain" />
      </div>

      <div className="wrap">
        <div className="footer__cols">
          <div className="footer__brand">
            <p className="footer__logo">JOFER</p>
            <p>Dúo musical. Una amistad desde los 6 años y un mismo propósito: llevar un mensaje de fe, esperanza y amor.</p>
          </div>

          <nav className="footer__col" aria-label="Secciones">
            <h3>Secciones</h3>
            {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>

          <div className="footer__col">
            <h3>Vínculos</h3>
            <ol className="footer__tracks">
              {tracks.map((t, i) => (
                <li key={t}><span>{String(i + 1).padStart(2, '0')}</span><a href="#videos">{t}</a></li>
              ))}
            </ol>
          </div>

          <div className="footer__col">
            <h3>Seguinos</h3>
            <div className="footer__redes">
              {redes.map(([href, label]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                  {ICONOS[label]}
                </a>
              ))}
            </div>
            <p className="footer__handle">@jofer.jf</p>
          </div>
        </div>
      </div>

      <div className="wrap footer__bottom">
        <p>© {new Date().getFullYear()} JoFer · Dúo musical</p>
        <a href="#top" className="footer__up">Volver arriba ↑</a>
      </div>
    </footer>
  );
}
