# Servidor de Diario fin del mundo

Un solo proceso Node/Express que sirve la web y la API del panel (`/admin.html`).
Mismo esquema que Ana María Florería. Sin base de datos: los poemas viven en `data/poemas.json`,
las imágenes subidas en `data/uploads/` y las métricas en `data/metricas.ndjson`.

## Usuario

Un único usuario: **waldo**. La contraseña no está en el código: está como hash bcrypt en `server/.env`
(`ADMIN_PASSWORD_HASH`), que no se sube a git.

Para cambiarla:

```bash
node -e "console.log(require('bcryptjs').hashSync('LA_NUEVA_CONTRASEÑA', 12))"
```

y pegar el resultado en `ADMIN_PASSWORD_HASH` de `server/.env`. Si falta la contraseña, el servidor no arranca.
`JWT_SECRET` firma las sesiones (12 h); si falta, se genera uno y las sesiones caducan al reiniciar.

## Correr

```bash
cd server
npm install
npm start          # http://localhost:3003  (Node >= 20.12)
```

- Web: `http://localhost:3003/`
- Panel: `http://localhost:3003/admin.html`

Al primer arranque, si no existe `data/poemas.json`, se crea con los 19 poemas de 2023-2026 (`seed-data.json`).
`node seed.js --force` los reemplaza (borra los cambios hechos desde el panel).

## Panel

- **Tarjetas:** crear, editar y eliminar poemas; subir una imagen por poema (se redimensiona en el navegador,
  JPG/PNG/WebP, máx. 8 MB); ocultar un poema sin borrarlo. La web los muestra al instante.
- **Métricas:** visitas, personas distintas, nuevas/recurrentes, visitas por día, poemas más abiertos,
  clics al blog original, años abiertos, de dónde llegan y dispositivos (últimos 30 días).
  No se guarda IP ni datos personales, solo un identificador aleatorio por navegador. Las visitas de Waldo
  desde el navegador donde entró al panel no se cuentan.

## Si se abre la web sin servidor

`index.html` abierta con doble clic sigue funcionando: usa los poemas de respaldo que lleva `script.js`
y no manda métricas. Para ver los cambios hechos en el panel hay que entrar por el servidor.

## API (resumen)

Público: `GET /api/poemas` · `POST /api/metricas` · `POST /api/login`.
Con `Authorization: Bearer <token>`: `GET|POST /api/admin/poemas`, `PUT|DELETE /api/admin/poemas/:id`,
`POST /api/admin/imagen` (cuerpo binario `image/jpeg|png|webp`), `GET /api/admin/metricas`.
Errores: `{ "error": "mensaje" }`. Límites: 10 intentos de login / 15 min por IP.

## Qué se sirve

Solo una lista blanca de archivos de la raíz (`index.html`, `admin.html`, CSS/JS, imágenes y videos de la web)
y `/uploads`. `server/`, `data/`, `.git`, `.env` y `*.md` devuelven 404.
