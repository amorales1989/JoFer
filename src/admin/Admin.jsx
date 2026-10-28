import { useEffect, useState } from 'react';
import { api, DEMO, getToken, setToken, ytThumb, formatearFecha } from '../api.js';

const RECURSOS = {
  productos: {
    label: 'Productos',
    singular: 'producto',
    vacio: { nombre: '', descripcion: '', precio: '', imagen: '', link_compra: '', marca: 'jofer' },
    campos: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'precio', label: 'Precio', placeholder: '$25.000' },
      { name: 'marca', label: 'Marca', type: 'select', options: [['jofer', 'JoFer'], ['cb', 'Calentando Bancas']] },
      { name: 'link_compra', label: 'Link de compra', placeholder: 'https://… o https://wa.me/…' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'imagen', label: 'Imagen', type: 'image' },
    ],
    resumen: (p) => [p.nombre, [p.precio, p.marca === 'cb' ? 'Calentando Bancas' : 'JoFer'].filter(Boolean).join(' · ')],
    thumb: (p) => p.imagen,
  },
  videos: {
    label: 'Videos',
    singular: 'video',
    vacio: { titulo: '', youtube_id: '', descripcion: '', seccion: 'jofer' },
    campos: [
      { name: 'titulo', label: 'Título', required: true },
      { name: 'youtube_id', label: 'Link de YouTube', required: true, placeholder: 'https://www.youtube.com/watch?v=…' },
      { name: 'seccion', label: 'Sección', type: 'select', options: [['jofer', 'Videos JoFer'], ['cb', 'Calentando Bancas']] },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    ],
    resumen: (v) => [v.titulo, v.seccion === 'cb' ? 'Calentando Bancas' : 'Videos JoFer'],
    thumb: (v) => ytThumb(v.youtube_id),
    aFormulario: (v) => ({ ...v, youtube_id: `https://www.youtube.com/watch?v=${v.youtube_id}` }),
  },
  noticias: {
    label: 'Noticias',
    singular: 'noticia',
    vacio: () => ({ titulo: '', resumen: '', cuerpo: '', imagen: '', fecha: new Date().toISOString().slice(0, 10) }),
    campos: [
      { name: 'titulo', label: 'Título', required: true },
      { name: 'fecha', label: 'Fecha', type: 'date' },
      { name: 'resumen', label: 'Resumen (se ve en la tarjeta)', type: 'textarea', rows: 2 },
      { name: 'cuerpo', label: 'Texto completo (separá párrafos con una línea en blanco)', type: 'textarea', rows: 8 },
      { name: 'imagen', label: 'Imagen', type: 'image' },
    ],
    resumen: (n) => [n.titulo, formatearFecha(n.fecha)],
    thumb: (n) => n.imagen,
  },
};

export default function Admin() {
  const [estado, setEstado] = useState(getToken() ? 'verificando' : 'login');

  useEffect(() => {
    if (estado !== 'verificando') return;
    api.sesion()
      .then(() => setEstado('ok'))
      .catch(() => { setToken(null); setEstado('login'); });
  }, [estado]);

  if (estado === 'verificando') return <div className="admin admin--center"><p>Verificando sesión…</p></div>;
  if (estado === 'login') return <Login onOk={() => setEstado('ok')} />;
  return <Panel onLogout={() => { setToken(null); setEstado('login'); }} />;
}

function Login({ onOk }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const { token } = await api.login(password);
      setToken(token);
      onOk();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="admin admin--center admin--sky">
      <form className="login" onSubmit={submit}>
        <p className="login__logo">JOFER</p>
        <h1>Panel de contenido</h1>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
        </label>
        {DEMO && <p className="demo-hint">Demo: entrá con cualquier contraseña.</p>}
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--dark" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <a href="/" className="login__back">← Volver a la landing</a>
      </form>
    </div>
  );
}

function Panel({ onLogout }) {
  const [tab, setTab] = useState('productos');
  const [version, setVersion] = useState(0);

  return (
    <div className="admin">
      <header className="admin__bar">
        <a href="/" className="admin__logo">JOFER <small>panel</small></a>
        <nav className="admin__tabs">
          {Object.entries(RECURSOS).map(([key, r]) => (
            <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{r.label}</button>
          ))}
        </nav>
        <div className="admin__actions">
          <a href="/" target="_blank" rel="noreferrer">Ver landing ↗</a>
          <button onClick={onLogout}>Salir</button>
        </div>
      </header>
      {DEMO && (
        <div className="demo-banner">
          <span>
            <strong>Modo demo.</strong> Los cambios se guardan solo en este navegador y se ven en la landing desde acá.
          </span>
          <button
            onClick={() => {
              if (!confirm('¿Volver a los datos originales de la demo?')) return;
              api.reset();
              setVersion((v) => v + 1);
            }}
          >
            Restablecer demo
          </button>
        </div>
      )}
      <Recurso key={`${tab}-${version}`} recurso={tab} cfg={RECURSOS[tab]} onAuthError={onLogout} />
    </div>
  );
}

function Recurso({ recurso, cfg, onAuthError }) {
  const nuevo = () => (typeof cfg.vacio === 'function' ? cfg.vacio() : { ...cfg.vacio });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(nuevo);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);

  const manejarError = (err) => {
    if (err.status === 401) return onAuthError();
    setError(err.message);
  };

  const cargar = () => api.list(recurso).then(setItems).catch(manejarError);
  useEffect(() => { cargar(); }, []);

  const reset = () => { setForm(nuevo()); setEditandoId(null); setError(''); };

  const editar = (item) => {
    setForm(cfg.aFormulario ? cfg.aFormulario(item) : { ...item });
    setEditandoId(item.id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const datos = Object.fromEntries(cfg.campos.map((c) => [c.name, form[c.name] ?? '']));
      if (editandoId) await api.update(recurso, editandoId, datos);
      else await api.create(recurso, datos);
      setAviso(editandoId ? 'Cambios guardados' : `${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} publicado`);
      setTimeout(() => setAviso(''), 2500);
      reset();
      cargar();
    } catch (err) {
      manejarError(err);
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (item) => {
    if (!confirm(`¿Borrar "${cfg.resumen(item)[0]}"? No se puede deshacer.`)) return;
    try {
      await api.remove(recurso, item.id);
      if (editandoId === item.id) reset();
      cargar();
    } catch (err) {
      manejarError(err);
    }
  };

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const previewYt = recurso === 'videos' && extraerId(form.youtube_id);

  return (
    <div className="admin__body">
      <form className="admin__form" onSubmit={guardar}>
        <h2>{editandoId ? `Editar ${cfg.singular}` : `Nuevo ${cfg.singular}`}</h2>
        {cfg.campos.map((c) => (
          <Campo key={c.name} c={c} value={form[c.name] ?? ''} onChange={(v) => set(c.name, v)} onError={manejarError} />
        ))}
        {previewYt && (
          <div className="admin__ytpreview">
            <img src={ytThumb(previewYt)} alt="Vista previa del video" />
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="admin__formbtns">
          <button className="btn btn--dark" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Publicar'}
          </button>
          {editandoId && <button type="button" className="btn btn--outline" onClick={reset}>Cancelar</button>}
        </div>
        {aviso && <p className="form-ok">{aviso}</p>}
      </form>

      <section className="admin__list">
        <h2>{cfg.label} publicados <small>{items.length}</small></h2>
        {!items.length && <p className="empty">Todavía no hay {cfg.label.toLowerCase()}.</p>}
        <ul>
          {items.map((item) => {
            const [titulo, sub] = cfg.resumen(item);
            const thumb = cfg.thumb(item);
            return (
              <li key={item.id} className={editandoId === item.id ? 'is-editing' : ''}>
                <div className="admin__thumb">{thumb ? <img src={thumb} alt="" /> : null}</div>
                <div className="admin__info"><strong>{titulo}</strong><span>{sub}</span></div>
                <button onClick={() => editar(item)}>Editar</button>
                <button className="danger" onClick={() => borrar(item)}>Borrar</button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Campo({ c, value, onChange, onError }) {
  const [subiendo, setSubiendo] = useState(false);

  if (c.type === 'image') {
    const subir = async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setSubiendo(true);
      try {
        const { url } = await api.upload(file);
        onChange(url);
      } catch (err) {
        onError(err);
      } finally {
        setSubiendo(false);
      }
    };
    return (
      <div className="field">
        <span>{c.label}</span>
        <div className="uploader">
          {value ? <img src={value} alt="" /> : <div className="uploader__empty">Sin imagen</div>}
          <div className="uploader__btns">
            <label className="btn btn--outline btn--sm">
              {subiendo ? 'Subiendo…' : value ? 'Cambiar' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={subir} hidden disabled={subiendo} />
            </label>
            {value && <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange('')}>Quitar</button>}
          </div>
        </div>
      </div>
    );
  }

  const props = {
    value,
    onChange: (e) => onChange(e.target.value),
    required: c.required,
    placeholder: c.placeholder,
  };

  return (
    <label className="field">
      <span>{c.label}{c.required && ' *'}</span>
      {c.type === 'textarea' ? (
        <textarea rows={c.rows || 3} {...props} />
      ) : c.type === 'select' ? (
        <select {...props}>{c.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      ) : (
        <input type={c.type || 'text'} {...props} />
      )}
    </label>
  );
}

function extraerId(url = '') {
  const s = String(url).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
