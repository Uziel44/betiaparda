/* ==========================================================================
   MÉTRICAS · Diario fin del mundo
   Manda eventos anónimos a /api/metricas (ver server/server.js) para la pestaña
   Métricas del panel (admin.html). Un identificador aleatorio por navegador para
   contar personas distintas, sin IP ni datos personales.

   Eventos: visita, abrir_poema, click_blog, abrir_anio, click_instagram.

   El panel deja en este navegador una marca para NO contar las visitas de Waldo.
   Se carga antes de script.js, que llama a window.Metricas.track(tipo, datos).
   Si la web se abre sin servidor (doble clic), no se manda nada.
   ========================================================================== */

(() => {
  'use strict';

  const EXCLUIR = 'bestia_no_metricas';
  const VISITANTE = 'bestia_visitante';

  // Sin servidor (file://) no hay a dónde mandar los eventos
  if (location.protocol === 'file:') { window.Metricas = { track() {} }; return; }

  try {
    if (localStorage.getItem(EXCLUIR) === '1') { window.Metricas = { track() {} }; return; }
  } catch (_) { /* sin almacenamiento: se cuenta igual */ }

  const idVisitante = () => {
    try {
      let id = localStorage.getItem(VISITANTE);
      if (!id) {
        id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VISITANTE, id);
      }
      return id;
    } catch (_) {
      return undefined;
    }
  };

  const track = (tipo, datos) => {
    const cuerpo = JSON.stringify(Object.assign({ tipo, visitanteId: idVisitante() }, datos || {}));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/metricas', new Blob([cuerpo], { type: 'application/json' }))) return;
    } catch (_) { /* cae a fetch */ }
    fetch('/api/metricas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cuerpo, keepalive: true }).catch(() => {});
  };

  // De dónde llegó: ?utm_source=... (por ejemplo el enlace de Instagram) o el sitio que la enlazó
  const origen = () => {
    const utm = new URLSearchParams(location.search).get('utm_source');
    if (utm && /^[\w.\-]{1,40}$/.test(utm)) return utm.toLowerCase();
    try {
      const host = new URL(document.referrer).hostname;
      return host && host !== location.hostname ? host.replace(/^www\./, '') : 'directo';
    } catch (_) {
      return 'directo';
    }
  };

  window.Metricas = { track };

  track('visita', {
    origen: origen(),
    dispositivo: matchMedia('(max-width: 820px)').matches ? 'm' : 'd',
  });
})();
