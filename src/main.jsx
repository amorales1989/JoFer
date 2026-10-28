import React from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './landing/Landing.jsx';
import Admin from './admin/Admin.jsx';
import './styles.css';

const esAdmin = window.location.pathname.replace(/\/$/, '') === '/admin';
if (esAdmin) document.title = 'Panel · JOFER';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>{esAdmin ? <Admin /> : <Landing />}</React.StrictMode>
);
