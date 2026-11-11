# Diario fin del mundo (Waldo Orozco): la web y su panel en un solo contenedor.
#
# Se construye desde el docker-compose de plexipedidos (servicio "bestiaparda",
# build: /home/deploy/bestiaparda). A diferencia de la florería, acá el mismo servidor Node
# sirve la web (lista blanca de archivos), la API y /uploads; Caddy solo le hace reverse_proxy.
FROM node:20-alpine

WORKDIR /app/server

# Primero solo el manifest, para que Docker cachee `npm ci` mientras no cambien las dependencias.
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./

# La web: server.js la busca en la carpeta de arriba (/app). Solo estos archivos: nada de videos
# originales ni capturas sueltas.
WORKDIR /app
COPY index.html admin.html styles.css script.js metricas.js admin.css admin.js hero.jpg 03.jpeg banner.mp4 wolf-running.mp4 ./

# data/ (poemas.json + uploads/ + metricas.ndjson) se monta como volumen: sin él, cada deploy
# borraría los poemas, las imágenes y las métricas. Se crea con dueño "node" para que el volumen
# nuevo herede ese permiso y el proceso pueda escribir.
WORKDIR /app/server
RUN mkdir -p data && chown node:node data
USER node

ENV NODE_ENV=production PORT=3003
EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/poemas').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
