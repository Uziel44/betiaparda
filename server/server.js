'use strict';
/* ============================================================
   Servidor de Diario fin del mundo (Waldo Orozco)
   ------------------------------------------------------------
   Mismo esquema que el de Ana Maria Floreria: un proceso Node/Express que sirve
   el sitio estatico (lista blanca) y la API del panel (admin.html).

   PUBLICO
     GET  /api/poemas                -> poemas visibles, del mas nuevo al mas viejo
     GET  /uploads/<archivo>         -> imagenes subidas desde el panel
     POST /api/metricas              -> registra un evento de la pagina (visita, poema abierto...)
   LOGIN
     POST /api/login                 -> { token }  (un unico usuario: waldo)
   PRIVADO (Authorization: Bearer <token>)
     GET    /api/admin/poemas        -> todos (incluye ocultos)
     POST   /api/admin/poemas        -> crea
     PUT    /api/admin/poemas/:id    -> edita
     DELETE /api/admin/poemas/:id    -> borra
     POST   /api/admin/imagen        -> cuerpo binario jpeg/png/webp -> { url }
     GET    /api/admin/metricas      -> resumen de los ultimos 30 dias

   Datos: data/poemas.json (escritura atomica + cola), imagenes en data/uploads/ y
   data/metricas.ndjson (un evento por linea, se conservan 90 dias).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Carga server/.env si existe (Node >= 20.12). Lo que ya este en el entorno tiene prioridad.
const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE) && typeof process.loadEnvFile === 'function') process.loadEnvFile(ENV_FILE);

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ARCHIVO, DATA_DIR, escribirAtomico, sembrar } = require('./seed');

const PORT = process.env.PORT || 3003;
const USUARIO = 'waldo';
const JWT_EXPIRA = '12h';
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const RAIZ_WEB = path.join(__dirname, '..');

/* ------------------------------------------------------------
   Credenciales (si falta la contrasena, no arranca)
   ------------------------------------------------------------ */
let PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').trim();
if (PASSWORD_HASH) {
  if (!/^\$2[abxy]\$\d{2}\$.{53}$/.test(PASSWORD_HASH)) {
    console.error('ERROR: ADMIN_PASSWORD_HASH no parece un hash bcrypt valido (debe empezar con $2a$/$2b$ y tener 60 caracteres).');
    process.exit(1);
  }
} else if (process.env.ADMIN_PASSWORD) {
  PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  console.warn('AVISO: usando ADMIN_PASSWORD en texto plano (se hashea al arrancar). Para produccion usa ADMIN_PASSWORD_HASH.');
} else {
  console.error('ERROR: falta la contrasena del panel. Define ADMIN_PASSWORD_HASH (bcrypt) o ADMIN_PASSWORD en el entorno o en server/.env.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('AVISO: falta JWT_SECRET. Se genero uno aleatorio: las sesiones del panel caducan en cada reinicio.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');

/* ------------------------------------------------------------
   Almacen de poemas (archivo JSON)
   ------------------------------------------------------------ */
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (sembrar()) console.log('data/poemas.json no existia: creado con los poemas iniciales.');

const leer = () => JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
// Del mas nuevo al mas viejo; a igual fecha, el ultimo creado primero.
const ordenados = (lista) => [...lista].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

// Cola: las operaciones de lectura-modificacion-escritura se ejecutan de una en una.
let cola = Promise.resolve();
function conCola(fn) {
  const p = cola.then(fn);
  cola = p.catch(() => {});
  return p;
}
const modificar = (fn) => conCola(() => {
  const lista = leer();
  const resultado = fn(lista);
  escribirAtomico(ARCHIVO, lista);
  return resultado;
});

// Borra una imagen de /uploads/ si ya ningun poema la usa.
function limpiarImagen(imagen, lista) {
  const m = /^\/uploads\/([a-f0-9]{32}\.(?:jpg|png|webp))$/.exec(imagen || '');
  if (!m || lista.some((p) => p.imagen === imagen)) return;
  fs.rm(path.join(UPLOADS_DIR, m[1]), { force: true }, () => {});
}

/* ------------------------------------------------------------
   Validacion
   ------------------------------------------------------------ */
class ErrorHttp extends Error {
  constructor(status, mensaje) { super(mensaje); this.status = status; }
}
const bad = (mensaje) => new ErrorHttp(400, mensaje);
const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const RE_UPLOAD = /^\/uploads\/[a-f0-9]{32}\.(?:jpg|png|webp)$/;
// Las fotos de los poemas copiados vienen del blog (Blogger). Solo se aceptan esos dos origenes.
const RE_IMG_BLOGGER = /^https:\/\/(?:blogger\.googleusercontent\.com|[\w-]+\.bp\.blogspot\.com)\/[\w\-\/.%=+~]+$/;

function validarImagen(imagen) {
  if (imagen === undefined || imagen === null || imagen === '') return '';
  if (typeof imagen !== 'string') throw bad('La imagen no es válida.');
  const img = imagen.trim();
  if (RE_UPLOAD.test(img)) {
    if (!fs.existsSync(path.join(UPLOADS_DIR, img.slice('/uploads/'.length)))) throw bad('La imagen indicada no existe en el servidor. Sube la foto de nuevo.');
    return img;
  }
  if (img.length <= 600 && RE_IMG_BLOGGER.test(img)) return img;
  throw bad('La ruta de la imagen no es válida.');
}

function validarEnlace(enlace) {
  if (enlace === undefined || enlace === null || enlace === '') return '';
  if (typeof enlace !== 'string' || enlace.length > 300) throw bad('El enlace al blog no es válido.');
  let u;
  try { u = new URL(enlace.trim()); } catch (_) { throw bad('El enlace al blog debe ser una dirección completa (https://...).'); }
  if (u.protocol !== 'https:') throw bad('El enlace al blog debe empezar con https://');
  return u.href;
}

function validarFecha(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw bad('La fecha debe tener el formato AAAA-MM-DD.');
  const d = new Date(fecha + 'T00:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== fecha) throw bad('La fecha no existe.');
  if (fecha < '2000-01-01' || fecha > '2100-12-31') throw bad('La fecha está fuera de rango.');
  return fecha;
}

function validarPoema(body) {
  if (!esObjeto(body)) throw bad('El cuerpo de la petición debe ser un objeto JSON.');
  if (typeof body.titulo !== 'string' || !body.titulo.trim()) throw bad('El título es obligatorio.');
  const titulo = body.titulo.trim();
  if (titulo.length > 120) throw bad('El título no puede superar 120 caracteres.');
  if (typeof body.texto !== 'string' || !body.texto.trim()) throw bad('El poema no puede estar vacío.');
  const texto = body.texto.replace(/\r\n/g, '\n').trim();
  if (texto.length > 20000) throw bad('El poema no puede superar 20.000 caracteres.');
  const visible = body.visible === undefined ? true : body.visible;
  if (typeof visible !== 'boolean') throw bad('"visible" debe ser verdadero o falso.');
  return {
    titulo, texto, visible,
    fecha: validarFecha(body.fecha),
    enlace: validarEnlace(body.enlace),
    imagen: validarImagen(body.imagen),
  };
}

/* ------------------------------------------------------------
   App y middlewares
   ------------------------------------------------------------ */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // un proxy delante (Caddy)

// CSP desactivada a proposito: el sitio carga fuentes de Google e imagenes de Blogger. El resto de helmet sigue activo.
app.use(helmet({ contentSecurityPolicy: false }));

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // por IP
  message: { error: 'Demasiados intentos. Prueba de nuevo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Estaticos por lista blanca: nunca server/, data/, .git, *.md, etc. Todo vive en la raiz de la web.
const PUBLICOS = new Set([
  'index.html', 'admin.html',
  'styles.css', 'script.js', 'metricas.js', 'admin.css', 'admin.js',
  'hero.jpg', '03.jpeg', 'banner.mp4', 'wolf-running.mp4',
]);
const enviarPublico = (nombre) => (req, res, next) =>
  res.sendFile(path.join(RAIZ_WEB, nombre), { dotfiles: 'ignore', maxAge: /\.(?:jpe?g|mp4)$/.test(nombre) ? '1d' : 0 }, (e) => e && next());

app.get('/', enviarPublico('index.html'));
for (const nombre of PUBLICOS) app.get('/' + nombre, enviarPublico(nombre));

// Imagenes subidas: nombres aleatorios e inmutables -> cache largo.
app.use('/uploads', express.static(UPLOADS_DIR, {
  dotfiles: 'ignore', index: false, maxAge: '365d', immutable: true,
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

/* ------------------------------------------------------------
   API
   ------------------------------------------------------------ */
const api = express.Router();
api.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
api.use(express.json({ limit: '64kb' })); // no afecta a la subida binaria (otro Content-Type)

api.get('/poemas', (req, res) => {
  res.json(ordenados(leer()).filter((p) => p.visible));
});

api.post('/login', limitadorLogin, ah(async (req, res) => {
  const { usuario, password } = esObjeto(req.body) ? req.body : {};
  const generico = () => res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  if (typeof usuario !== 'string' || typeof password !== 'string' || password.length > 200) return generico();
  // Siempre se compara con bcrypt, aunque el usuario no coincida (tiempo de respuesta constante).
  const passOk = await bcrypt.compare(password, PASSWORD_HASH);
  const userOk = usuario.trim().toLowerCase() === USUARIO;
  if (!(userOk && passOk)) return generico();
  const token = jwt.sign({ sub: USUARIO }, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_EXPIRA });
  res.json({ token });
}));

function requiereLogin(req, res, next) {
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m) return res.status(401).json({ error: 'Necesitas iniciar sesión.' });
  try {
    const dato = jwt.verify(m[1], JWT_SECRET, { algorithms: ['HS256'] });
    if (dato.sub !== USUARIO) throw new Error('sub');
    next();
  } catch (_) {
    res.status(401).json({ error: 'La sesión no es válida o caducó. Inicia sesión de nuevo.' });
  }
}

/* ------------------------------------------------------------
   Metricas: la pagina manda eventos sin login y el panel los resume.
   Un evento por linea en data/metricas.ndjson. No se guarda la IP ni ningun dato
   personal: solo un identificador aleatorio de navegador para contar personas distintas.
   ------------------------------------------------------------ */
const METRICAS_ARCHIVO = path.join(DATA_DIR, 'metricas.ndjson');
const METRICAS_RETENCION_MS = 90 * 24 * 60 * 60 * 1000;
const METRICAS_MAX_BYTES = 50 * 1024 * 1024;   // tope de seguridad del archivo
const ZONA = 'America/Argentina/Buenos_Aires';  // los dias se cuentan en hora de Argentina
const diaDe = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(ms);

const TIPOS_EVENTO = new Set(['visita', 'abrir_poema', 'click_blog', 'abrir_anio', 'click_instagram']);
const ID_VALIDO = /^[\w.\-]{1,64}$/;
const HOST_VALIDO = /^[a-z0-9][a-z0-9.\-]{0,119}$/i;

const limitadorMetricas = rateLimit({
  windowMs: 60 * 1000,
  limit: 120, // por IP: de sobra para una persona navegando; solo corta rafagas automaticas
  message: { error: 'Demasiados eventos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function normalizarEvento(b) {
  if (!esObjeto(b) || !TIPOS_EVENTO.has(b.tipo)) return null;
  const e = { t: Date.now(), tipo: b.tipo };
  if (typeof b.visitanteId === 'string' && ID_VALIDO.test(b.visitanteId)) e.v = b.visitanteId;
  if (b.tipo === 'abrir_poema' || b.tipo === 'click_blog') {
    if (typeof b.poemaId !== 'string' || !ID_VALIDO.test(b.poemaId)) return null;
    e.id = b.poemaId;
  }
  if (b.tipo === 'abrir_anio') {
    if (typeof b.anio !== 'string' && typeof b.anio !== 'number') return null;
    const a = String(b.anio);
    if (!/^20\d{2}$/.test(a)) return null;
    e.id = a;
  }
  if (typeof b.origen === 'string' && HOST_VALIDO.test(b.origen)) e.o = b.origen.toLowerCase();
  if (b.dispositivo === 'm' || b.dispositivo === 'd') e.d = b.dispositivo;
  return e;
}

// Las escrituras van por la misma cola que las de poemas: nunca se pisan con la limpieza.
function registrarEvento(e) {
  return conCola(() => {
    if (fs.existsSync(METRICAS_ARCHIVO) && fs.statSync(METRICAS_ARCHIVO).size > METRICAS_MAX_BYTES) return;
    fs.appendFileSync(METRICAS_ARCHIVO, JSON.stringify(e) + '\n');
  });
}

function leerEventos() {
  let texto = '';
  try { texto = fs.readFileSync(METRICAS_ARCHIVO, 'utf8'); } catch (_) { return []; }
  const limite = Date.now() - METRICAS_RETENCION_MS;
  const out = [];
  for (const linea of texto.split('\n')) {
    if (!linea) continue;
    try { const e = JSON.parse(linea); if (e && e.t >= limite) out.push(e); } catch (_) { /* linea cortada: se ignora */ }
  }
  return out;
}

// Una vez al dia se descartan los eventos de mas de 90 dias.
function limpiarMetricas() {
  return conCola(() => {
    if (!fs.existsSync(METRICAS_ARCHIVO)) return;
    const vigentes = leerEventos();
    const tmp = METRICAS_ARCHIVO + '.tmp';
    fs.writeFileSync(tmp, vigentes.map((e) => JSON.stringify(e) + '\n').join(''));
    fs.renameSync(tmp, METRICAS_ARCHIVO);
  });
}
limpiarMetricas().catch((e) => console.error('No se pudo limpiar metricas:', e.message));
setInterval(() => limpiarMetricas().catch(() => {}), 24 * 60 * 60 * 1000).unref();

api.post('/metricas', limitadorMetricas, express.json({ limit: '4kb' }), (req, res) => {
  if (JSON.stringify(req.body || {}).length > 2000) return res.status(413).json({ error: 'Evento demasiado grande.' });
  const e = normalizarEvento(req.body);
  if (!e) return res.status(400).json({ error: 'Evento inválido.' });
  registrarEvento(e).catch((err) => console.error('No se pudo registrar el evento:', err.message));
  res.status(201).json({ ok: true });
});

function resumirMetricas() {
  const ahora = Date.now();
  const desde = ahora - 30 * 24 * 60 * 60 * 1000;
  const todos = leerEventos();
  const ev = todos.filter((e) => e.t >= desde);

  // "Nueva" = su primera visita registrada cae dentro de los ultimos 30 dias
  const primera = new Map();
  for (const e of todos) if (e.tipo === 'visita' && e.v && (!primera.has(e.v) || e.t < primera.get(e.v))) primera.set(e.v, e.t);

  const de = (tipo) => ev.filter((e) => e.tipo === tipo);
  const unicos = (lista) => new Set(lista.map((e) => e.v).filter(Boolean));
  const contar = (lista, clave) => {
    const m = new Map();
    for (const e of lista) { const k = clave(e); if (k) m.set(k, (m.get(k) || 0) + 1); }
    return m;
  };
  const ordenar = (m, campo) => [...m].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, [campo]: n }));

  const visitas = de('visita');
  const visitantes = unicos(visitas);
  const nuevos = [...visitantes].filter((v) => primera.get(v) >= desde).length;

  // Ultimos 14 dias, uno por fila aunque no haya eventos
  const porDia = new Map();
  for (const e of visitas) {
    const d = diaDe(e.t);
    if (!porDia.has(d)) porDia.set(d, { visitas: 0, v: new Set() });
    const f = porDia.get(d); f.visitas++; if (e.v) f.v.add(e.v);
  }
  const diarias = [];
  for (let i = 13; i >= 0; i--) {
    const dia = diaDe(ahora - i * 24 * 60 * 60 * 1000);
    const f = porDia.get(dia);
    diarias.push({ dia, visitas: f ? f.visitas : 0, unicos: f ? f.v.size : 0 });
  }

  const titulos = new Map(leer().map((p) => [p.id, p.titulo]));
  const abiertos = contar(de('abrir_poema'), (e) => e.id);
  const alBlog = contar(de('click_blog'), (e) => e.id);
  const ids = new Set([...abiertos.keys(), ...alBlog.keys()]);
  const poemas = [...ids].map((id) => ({
    id, titulo: titulos.get(id) || null,
    abiertos: abiertos.get(id) || 0, alBlog: alBlog.get(id) || 0,
  })).sort((a, b) => (b.abiertos + b.alBlog) - (a.abiertos + a.alBlog) || a.id.localeCompare(b.id)).slice(0, 10);

  return {
    dias: 30,
    trafico: { visitas: visitas.length, unicos: visitantes.size, nuevos, recurrentes: visitantes.size - nuevos },
    diarias,
    etapas: {
      visitaron: visitantes.size,
      abrieronPoema: unicos(de('abrir_poema')).size,
      fueronAlBlog: unicos(de('click_blog')).size,
    },
    poemas,
    anios: ordenar(contar(de('abrir_anio'), (e) => e.id), 'aperturas'),
    instagram: de('click_instagram').length,
    origenes: ordenar(contar(visitas, (e) => e.o || 'directo'), 'visitas').slice(0, 8),
    dispositivos: ordenar(contar(visitas, (e) => e.d), 'visitas'),
  };
}

api.use('/admin', requiereLogin);

api.get('/admin/poemas', (req, res) => res.json(ordenados(leer())));

api.get('/admin/metricas', ah(async (req, res) => { res.json(resumirMetricas()); }));

api.post('/admin/poemas', ah(async (req, res) => {
  const datos = validarPoema(req.body);
  const nuevo = await modificar((lista) => {
    const p = { id: crypto.randomBytes(5).toString('hex'), ...datos };
    lista.push(p);
    return p;
  });
  res.status(201).json(nuevo);
}));

api.put('/admin/poemas/:id', ah(async (req, res) => {
  const datos = validarPoema(req.body);
  const p = await modificar((lista) => {
    const actual = lista.find((x) => x.id === req.params.id);
    if (!actual) throw new ErrorHttp(404, 'Poema no encontrado.');
    const anterior = actual.imagen;
    Object.assign(actual, datos);
    if (anterior !== actual.imagen) setImmediate(() => limpiarImagen(anterior, leer()));
    return actual;
  });
  res.json(p);
}));

api.delete('/admin/poemas/:id', ah(async (req, res) => {
  await modificar((lista) => {
    const i = lista.findIndex((x) => x.id === req.params.id);
    if (i < 0) throw new ErrorHttp(404, 'Poema no encontrado.');
    const [quitado] = lista.splice(i, 1);
    setImmediate(() => limpiarImagen(quitado.imagen, leer()));
  });
  res.json({ ok: true });
}));

// Tipo real segun los primeros bytes (el header Content-Type no es de fiar).
function tipoDeImagen(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return null;
}
api.post('/admin/imagen',
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '8mb' }),
  ah(async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw bad('Envía la imagen como cuerpo binario con Content-Type image/jpeg, image/png o image/webp.');
    const ext = tipoDeImagen(req.body);
    if (!ext) throw bad('El archivo no es una imagen JPG, PNG o WebP válida.');
    const nombre = crypto.randomBytes(16).toString('hex') + '.' + ext;
    await fs.promises.writeFile(path.join(UPLOADS_DIR, nombre), req.body, { flag: 'wx' });
    res.status(201).json({ url: '/uploads/' + nombre });
  }));

app.use('/api', api);

/* ------------------------------------------------------------
   404 y manejador global de errores
   ------------------------------------------------------------ */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Ruta no encontrada.' });
  res.status(404).type('text/plain').send('No encontrado');
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(err);
  let status = err.status || err.statusCode || 500;
  let mensaje = err.message;
  if (err.type === 'entity.too.large') { status = 413; mensaje = 'El archivo o los datos enviados son demasiado grandes.'; }
  else if (err.type === 'entity.parse.failed') { status = 400; mensaje = 'JSON inválido.'; }
  else if (!(err instanceof ErrorHttp) || status >= 500) {
    if (status < 500) mensaje = 'Petición no válida.';
    else { console.error(err); mensaje = 'Error interno del servidor.'; }
  }
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: mensaje });
  res.status(status).type('text/plain').send(status === 404 ? 'No encontrado' : mensaje);
});

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
