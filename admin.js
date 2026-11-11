(() => {
  'use strict';

  // ---- Configuración ----
  const TOKEN_KEY = 'bestia_admin_token';
  const MAX_SIDE = 1600;          // lado largo máximo de la imagen, en píxeles
  const JPEG_QUALITY = 0.85;
  const SAFE_IMG = /^(\/uploads\/|https:\/\/(?:blogger\.googleusercontent\.com|[\w-]+\.bp\.blogspot\.com)\/)/;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  // El token vive en sessionStorage (se borra al cerrar la pestaña); si el navegador lo bloquea, queda en memoria
  let token = '';
  try { token = sessionStorage.getItem(TOKEN_KEY) || ''; } catch (_) { /* sin almacenamiento */ }
  const saveToken = (value) => {
    token = value;
    try { value ? sessionStorage.setItem(TOKEN_KEY, value) : sessionStorage.removeItem(TOKEN_KEY); } catch (_) { /* sin almacenamiento */ }
  };

  const loginBox = $('#login');
  const loginMsg = $('#login-msg');
  const logoutBtn = $('#logout');
  const panel = $('#panel');
  const tabs = $('#tabs');
  const panelMetricas = $('#panel-metricas');
  const list = $('#list');
  const empty = $('#empty');
  const loading = $('#loading');
  const aviso = $('#aviso');
  const editor = $('#editor');
  const editorForm = $('#editor-form');
  const editorMsg = $('#editor-msg');
  const confirmDlg = $('#confirm');

  let poemas = [];
  let editing = null;        // poema que se edita (null = nuevo)
  let photoUrl = '';         // imagen ya guardada en el servidor
  let pendingBlob = null;    // imagen nueva redimensionada, aún sin subir
  let previewUrl = '';       // URL temporal de la vista previa
  let deleting = null;
  let busy = false;

  const say = (text) => { aviso.textContent = text; };
  const safeImg = (src) => typeof src === 'string' && SAFE_IMG.test(src);
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fmtFecha = (f) => `${Number(f.slice(8, 10))} de ${MESES[Number(f.slice(5, 7)) - 1]} de ${f.slice(0, 4)}`;

  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }
  const errorText = (status) => ({
    400: 'Revisa los datos e inténtalo de nuevo.',
    404: 'Ese poema ya no existe. Actualizamos la lista.',
    413: 'La imagen es demasiado grande. Prueba con otra.',
    415: 'Ese tipo de archivo no sirve. Usa una imagen JPG, PNG o WebP.',
    429: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  }[status] || `Algo salió mal (código ${status}). Inténtalo de nuevo en un momento.`);

  // Llamada a la API. Si el servidor dice 401 (fuera del login) la sesión venció: vuelve al login.
  const api = async (path, { method = 'GET', json, body, type } = {}) => {
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload = body;
    if (json !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(json); }
    else if (type) headers['Content-Type'] = type;

    let res;
    try { res = await fetch(path, { method, headers, body: payload }); }
    catch (_) { throw new ApiError(0, 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'); }

    if (res.status === 401 && path !== '/api/login') {
      showLogin('Tu sesión venció. Entra de nuevo.');
      throw new ApiError(401, '');
    }
    let data = null;
    try { data = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }
    if (!res.ok) {
      const detail = (res.status === 400 || res.status === 401) && data && typeof data.error === 'string' ? data.error : '';
      throw new ApiError(res.status, detail || errorText(res.status));
    }
    return data;
  };
  const expired = (err) => err instanceof ApiError && err.status === 401;
  const messageOf = (err) => (err instanceof ApiError ? err.message : 'Algo salió mal. Inténtalo de nuevo.');

  // ---- Entrar / salir ----
  function showLogin(message = '') {
    saveToken('');
    poemas = [];
    [editor, confirmDlg].forEach((d) => { if (d.open) d.close(); });
    panel.hidden = true;
    panelMetricas.hidden = true;
    tabs.hidden = true;
    logoutBtn.hidden = true;
    loginBox.hidden = false;
    loginMsg.textContent = message;
    $('#login-pass').value = '';
    $('#login-send').disabled = false;
    $('#login-send').textContent = 'Entrar';
    (message ? $('#login-pass') : $('#login-user')).focus();
  }

  function showPanel() {
    loginBox.hidden = true;
    tabs.hidden = false;
    logoutBtn.hidden = false;
    // Las visitas de Waldo desde este navegador no se cuentan en las métricas (ver metricas.js)
    try { localStorage.setItem('bestia_no_metricas', '1'); } catch (_) { /* sin almacenamiento */ }
    selectTab('poemas');
    loadPoemas();
  }

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const send = $('#login-send');
    send.disabled = true;
    send.textContent = 'Entrando…';
    loginMsg.textContent = '';
    try {
      const { token: t } = await api('/api/login', {
        method: 'POST',
        json: { usuario: $('#login-user').value, password: $('#login-pass').value },
      });
      saveToken(t);
      $('#login-pass').value = '';
      showPanel();
    } catch (err) {
      loginMsg.textContent = messageOf(err);
      send.disabled = false;
      send.textContent = 'Entrar';
    }
  });

  logoutBtn.addEventListener('click', () => showLogin());

  // ---- Lista de tarjetas ----
  async function loadPoemas() {
    loading.hidden = false;
    empty.hidden = true;
    try {
      poemas = await api('/api/admin/poemas');
      renderList();
    } catch (err) {
      if (!expired(err)) { say(messageOf(err)); list.replaceChildren(el('li', 'msg', messageOf(err))); }
    } finally {
      loading.hidden = true;
    }
    panel.hidden = false;
  }

  function renderList() {
    list.replaceChildren();
    empty.hidden = poemas.length > 0;
    poemas.forEach((p) => {
      const li = el('li', 'card' + (p.visible ? '' : ' hidden-card'));
      const thumb = el('div', 'thumb');
      if (safeImg(p.imagen)) thumb.style.backgroundImage = `url("${p.imagen}")`;
      const info = el('div');
      const h = el('h3', undefined, p.titulo);
      if (!p.visible) h.append(el('span', 'tag', 'oculto'));
      info.append(h, el('div', 'meta', fmtFecha(p.fecha)), el('p', 'frag', p.texto.replace(/\s+/g, ' ')));
      const actions = el('div', 'card-actions');
      const edit = el('button', 'btn ghost', 'Editar');
      edit.type = 'button';
      edit.addEventListener('click', () => openEditor(p));
      const del = el('button', 'btn ghost', 'Eliminar');
      del.type = 'button';
      del.addEventListener('click', () => askDelete(p));
      actions.append(edit, del);
      li.append(thumb, info, actions);
      list.append(li);
    });
  }

  // ---- Editor ----
  const setPreview = (src) => {
    $('#photo-preview').style.backgroundImage = src ? `url("${src}")` : '';
    $('#foto-quitar').hidden = !src;
  };
  const clearPending = () => {
    pendingBlob = null;
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; }
  };

  function openEditor(p) {
    editing = p || null;
    clearPending();
    $('#editor-titulo').textContent = p ? 'Editar poema' : 'Nuevo poema';
    $('#f-titulo').value = p ? p.titulo : '';
    $('#f-fecha').value = p ? p.fecha : new Date().toISOString().slice(0, 10);
    $('#f-texto').value = p ? p.texto : '';
    $('#f-enlace').value = p ? p.enlace : '';
    $('#f-visible').checked = p ? p.visible : true;
    $('#f-foto').value = '';
    $('#foto-msg').textContent = '';
    photoUrl = p && safeImg(p.imagen) ? p.imagen : '';
    setPreview(photoUrl);
    editorMsg.textContent = '';
    editor.showModal();
    $('#f-titulo').focus();
  }

  $('#nuevo').addEventListener('click', () => openEditor(null));
  $('#editor-cancelar').addEventListener('click', () => editor.close());
  editor.addEventListener('close', clearPending);

  // Redimensiona en el navegador antes de subir (las fotos del celular pesan mucho)
  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', JPEG_QUALITY);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }

  $('#f-foto').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const msg = $('#foto-msg');
    msg.textContent = 'Preparando la imagen…';
    try {
      const blob = await resizeImage(file);
      clearPending();
      pendingBlob = blob;
      previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);
      msg.textContent = `Lista (${Math.round(blob.size / 1024)} KB). Se sube al guardar.`;
    } catch (_) {
      msg.textContent = 'No se pudo leer esa imagen. Prueba con otra.';
    }
  });

  $('#foto-quitar').addEventListener('click', () => {
    clearPending();
    photoUrl = '';
    $('#f-foto').value = '';
    $('#foto-msg').textContent = '';
    setPreview('');
  });

  editorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const titulo = $('#f-titulo').value.trim();
    const texto = $('#f-texto').value.trim();
    if (!titulo) { editorMsg.textContent = 'Escribe un título.'; $('#f-titulo').focus(); return; }
    if (!texto) { editorMsg.textContent = 'El poema no puede estar vacío.'; $('#f-texto').focus(); return; }
    if (!$('#f-fecha').value) { editorMsg.textContent = 'Elige una fecha.'; return; }

    busy = true;
    const save = $('#editor-guardar');
    save.disabled = true;
    save.textContent = 'Guardando…';
    editorMsg.textContent = '';
    try {
      let imagen = photoUrl;
      if (pendingBlob) {
        const r = await api('/api/admin/imagen', { method: 'POST', body: pendingBlob, type: 'image/jpeg' });
        imagen = r.url;
      }
      const datos = {
        titulo, texto, imagen,
        fecha: $('#f-fecha').value,
        enlace: $('#f-enlace').value.trim(),
        visible: $('#f-visible').checked,
      };
      if (editing) await api(`/api/admin/poemas/${encodeURIComponent(editing.id)}`, { method: 'PUT', json: datos });
      else await api('/api/admin/poemas', { method: 'POST', json: datos });
      editor.close();
      say(editing ? 'Poema guardado.' : 'Poema creado.');
      await loadPoemas();
    } catch (err) {
      if (!expired(err)) editorMsg.textContent = messageOf(err);
    } finally {
      busy = false;
      save.disabled = false;
      save.textContent = 'Guardar';
    }
  });

  // ---- Eliminar ----
  function askDelete(p) {
    deleting = p;
    $('#confirm-msg').textContent = `¿Eliminar “${p.titulo}”? No se puede deshacer. Si solo quieres sacarlo de la web, desmarca “Visible” al editarlo.`;
    confirmDlg.showModal();
  }
  $('#confirm-no').addEventListener('click', () => confirmDlg.close());
  $('#confirm-si').addEventListener('click', async () => {
    if (!deleting || busy) return;
    busy = true;
    try {
      await api(`/api/admin/poemas/${encodeURIComponent(deleting.id)}`, { method: 'DELETE' });
      confirmDlg.close();
      say('Poema eliminado.');
      await loadPoemas();
    } catch (err) {
      confirmDlg.close();
      if (!expired(err)) say(messageOf(err));
      if (err instanceof ApiError && err.status === 404) await loadPoemas();
    } finally {
      busy = false;
      deleting = null;
    }
  });

  // ---- Pestañas ----
  function selectTab(name) {
    const m = name === 'metricas';
    panel.hidden = m;
    panelMetricas.hidden = !m;
    $('#tab-poemas').setAttribute('aria-pressed', String(!m));
    $('#tab-metricas').setAttribute('aria-pressed', String(m));
    if (m) loadMetricas();
  }
  $('#tab-poemas').addEventListener('click', () => selectTab('poemas'));
  $('#tab-metricas').addEventListener('click', () => selectTab('metricas'));
  $('#metricas-refresh').addEventListener('click', () => loadMetricas());

  // ---- Métricas (GET /api/admin/metricas; los eventos los manda metricas.js) ----
  const body = $('#metricas-cuerpo');
  const mMsg = $('#metricas-msg');
  const mLoading = $('#metricas-loading');
  let mBusy = false;

  const stat = (n, label) => { const d = el('div', 'stat'); d.append(el('b', undefined, String(n)), el('span', undefined, label)); return d; };
  function table(headers, rows, vacio) {
    if (!rows.length) return el('p', 'muted', vacio);
    const t = el('table', 'rows');
    const thead = el('thead'); const trh = el('tr');
    headers.forEach((h) => trh.append(el('th', undefined, h)));
    thead.append(trh);
    const tb = el('tbody');
    rows.forEach((r) => { const tr = el('tr'); r.forEach((c) => tr.append(el('td', undefined, String(c)))); tb.append(tr); });
    t.append(thead, tb);
    return t;
  }
  const block = (titulo, ...nodes) => { const b = el('section', 'block'); b.append(el('h3', undefined, titulo), ...nodes); return b; };
  const DISP = { m: 'Celular', d: 'Computadora' };

  function renderMetricas(d) {
    body.replaceChildren();

    const t = d.trafico;
    const stats = el('div', 'stats');
    stats.append(stat(t.visitas, 'visitas'), stat(t.unicos, 'personas distintas'), stat(t.nuevos, 'nuevas'), stat(t.recurrentes, 'que volvieron'));
    body.append(stats);

    const max = Math.max(1, ...d.diarias.map((x) => x.visitas));
    const days = el('div', 'days');
    d.diarias.forEach((x) => {
      const c = el('div', 'day');
      c.title = `${x.dia}: ${x.visitas} visitas, ${x.unicos} personas`;
      const bar = el('i'); bar.style.height = `${Math.round((x.visitas / max) * 100)}%`;
      c.append(bar, el('small', undefined, x.dia.slice(8)));
      days.append(c);
    });
    body.append(block('Visitas por día (últimos 14 días)', days));

    const e = d.etapas;
    body.append(block('Qué hace la gente',
      table(['Paso', 'Personas'], [['Entraron a la web', e.visitaron], ['Abrieron un poema', e.abrieronPoema], ['Fueron al blog original', e.fueronAlBlog]], 'Sin datos todavía.')));

    body.append(block('Poemas más leídos',
      table(['Poema', 'Abiertos', 'Fueron al blog'], d.poemas.map((p) => [p.titulo || `(${p.id})`, p.abiertos, p.alBlog]), 'Todavía nadie abrió un poema.')));

    const two = el('div', 'two');
    two.append(
      block('De dónde llegan', table(['Origen', 'Visitas'], d.origenes.map((o) => [o.id, o.visitas]), 'Sin datos.')),
      block('Dispositivos', table(['Tipo', 'Visitas'], d.dispositivos.map((o) => [DISP[o.id] || o.id, o.visitas]), 'Sin datos.')),
    );
    body.append(two);

    const two2 = el('div', 'two');
    two2.append(
      block('Años abiertos en el archivo', table(['Año', 'Aperturas'], d.anios.map((o) => [o.id, o.aperturas]), 'Sin datos.')),
      block('Instagram', el('p', undefined, `${d.instagram} clics al Instagram`)),
    );
    body.append(two2);

    body.append(el('p', 'foot', 'Tus propias visitas desde este navegador no se cuentan. No se guarda ningún dato personal de quienes visitan la web.'));
  }

  async function loadMetricas() {
    if (mBusy) return;
    mBusy = true;
    mLoading.hidden = false;
    mMsg.textContent = '';
    try {
      renderMetricas(await api('/api/admin/metricas'));
    } catch (err) {
      if (!expired(err)) mMsg.textContent = messageOf(err);
    } finally {
      mBusy = false;
      mLoading.hidden = true;
    }
  }

  // ---- Arranque: si ya hay sesión en esta pestaña, se entra directo ----
  if (token) showPanel(); else showLogin();
})();
