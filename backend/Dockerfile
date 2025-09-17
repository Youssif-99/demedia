FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
ENV PORT=5000
CMD ["npm","run","start"]
# Production-ready Dockerfile for Express backend

FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# 1) Install dependencies using npm ci with only production deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# COPY .npmrc ./.npmrc  # Uncomment if using private registry
# Install only production dependencies
RUN npm ci --omit=dev

# 2) If the backend needs a build step (TypeScript), build with dev deps
#    Detect tsconfig.json presence by trying to copy then build in a separate stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN if [ -f tsconfig.json ]; then npm run build; else echo "No build step"; fi

# 3) Runtime: copy built artifacts and production node_modules
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
	&& adduser -S node -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules

# If built, copy dist, else copy source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

USER 1001

ENV PORT=5000
EXPOSE 5000

# Prefer running built server if dist exists, else fallback to src/index.js
CMD ["sh", "-c", "if [ -f dist/index.js ]; then node dist/index.js; else node src/index.js; fi"]


