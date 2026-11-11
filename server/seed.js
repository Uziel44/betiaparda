'use strict';
/* Genera data/poemas.json con los 19 poemas iniciales (2023-2026), copiados del blog.
 * Fuente: seed-data.json (id, fecha, titulo, texto, enlace, imagen, visible).
 *
 * Uso:  npm run seed            (no pisa datos existentes)
 *       node seed.js --force    (los reemplaza; borra los cambios hechos desde el panel)
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ARCHIVO = path.join(DATA_DIR, 'poemas.json');
const ORIGEN = path.join(__dirname, 'seed-data.json');

// Escritura atomica: se escribe a un temporal y se renombra, asi nunca queda un JSON a medias.
function escribirAtomico(destino, datos) {
  const tmp = destino + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(datos, null, 2));
  fs.renameSync(tmp, destino);
}

// Crea data/poemas.json si no existe (o siempre, con force). Devuelve true si escribio.
function sembrar(force = false) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(ARCHIVO) && !force) return false;
  escribirAtomico(ARCHIVO, JSON.parse(fs.readFileSync(ORIGEN, 'utf8')));
  return true;
}

module.exports = { ARCHIVO, DATA_DIR, escribirAtomico, sembrar };

if (require.main === module) {
  const force = process.argv.includes('--force');
  console.log(sembrar(force) ? 'data/poemas.json creado.' : 'data/poemas.json ya existe (usa --force para reemplazarlo).');
}
