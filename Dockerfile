# Multi-stage Dockerfile to build Next.js frontend and run both frontend and backend in one container via PM2

FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# --- Frontend deps (full) for building ---
FROM node:18-alpine AS fe_deps
WORKDIR /app/demedia
RUN apk add --no-cache libc6-compat
COPY demedia/package*.json ./
# If using npm workspaces or lockfiles, add them here as needed
RUN npm ci

# --- Frontend build ---
FROM node:18-alpine AS fe_builder
WORKDIR /app/demedia
COPY --from=fe_deps /app/demedia/node_modules ./node_modules
COPY demedia/ .
# Build-time env for Next.js public vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# --- Backend production deps only ---
FROM node:18-alpine AS be_deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# --- Final runtime image ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S appuser -u 1001 -G nodejs

# Install PM2 globally to run multiple processes
RUN npm i -g pm2@5

# Copy backend production deps and app code
COPY --from=be_deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy Next.js standalone output (small runtime) and static assets
# Place standalone output under /app/demedia
COPY --from=fe_builder /app/demedia/.next/standalone ./demedia/
COPY --from=fe_builder /app/demedia/.next/static ./demedia/.next/static
COPY --from=fe_builder /app/demedia/public ./demedia/public

# PM2 process configuration
COPY ecosystem.config.cjs ./ecosystem.config.cjs

# Set ports and required env
ENV PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BACKEND_PORT=5000

EXPOSE 3000

USER 1001

# Use pm2-runtime for proper signal handling in containers
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]


