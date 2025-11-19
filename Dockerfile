FROM node:lts-alpine AS base
RUN npm install -g pnpm@10.22.0

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS production
WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Copiar configuración de Drizzle para ejecutar migraciones en runtime
COPY drizzle.config.ts ./

# Instalar dependencias de producción y drizzle-kit para migraciones
RUN pnpm install --prod --frozen-lockfile && pnpm add -D drizzle-kit

# Copiar migraciones desde el código fuente
COPY migrations ./migrations

# Copiar aplicación compilada
COPY --from=build /app/dist ./dist

RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]