# Multi-stage Dockerfile untuk NetBilling Pro di Ubuntu Server
FROM node:20-alpine AS builder

WORKDIR /app

# Salin dependencies manifest
COPY package*.json ./

# Install dependensi
RUN npm ci --silent

# Salin seluruh kode program
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Stage runtime produksi ringan
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install tsx secara global untuk menjalankan server.ts
RUN npm install -g tsx

COPY package*.json ./
RUN npm ci --only=production --silent

# Salin file build dari stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["tsx", "server.ts"]
