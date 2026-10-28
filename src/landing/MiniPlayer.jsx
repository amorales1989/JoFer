// Reproductor flotante para escuchar los temas del EP sin salir de la lista
export default function MiniPlayer({ id, titulo, onClose }) {
  return (
    <div className="miniplayer" role="region" aria-label="Reproduciendo">
      <div className="miniplayer__video">
        <iframe
          key={id}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={titulo}
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
      <div className="miniplayer__info">
        <small>Sonando · Vínculos</small>
        <strong>{titulo}</strong>
      </div>
      <button className="miniplayer__close" onClick={onClose} aria-label="Cerrar reproductor">×</button>
    </div>
  );
}
