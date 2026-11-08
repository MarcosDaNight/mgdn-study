# syntax=docker/dockerfile:1
FROM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run check:content && npm test && npm run build && npm prune --omit=dev

FROM node:25-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 \
    DB_PATH=/data/study.sqlite CONTENT_DIR=/app/content TZ=America/Sao_Paulo
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/content ./content
# O runtime só executa `node build`: tirar npm/corepack remove o `tar` embutido (CVE-2026-59873) e superfície de ataque.
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn*
# Usuário sem privilégios; /data é o volume (SQLite) que entra no backup da plataforma.
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "build"]
