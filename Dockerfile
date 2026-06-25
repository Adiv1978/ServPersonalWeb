# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias (capa cacheada independiente del código fuente)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar en modo producción
COPY . .
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Solo copiamos el output compilado; el servidor SSR está bundleado por esbuild
COPY --from=builder /app/dist ./dist

EXPOSE 4000
ENV PORT=4000

CMD ["node", "dist/ServPersonalWeb/server/server.mjs"]
