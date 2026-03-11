# syntax=docker/dockerfile:1.7
# =============================================================================
# Stage 1: deps — install all dependencies
# =============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy manifests only for optimal layer caching
COPY package.json package-lock.json ./

# BuildKit cache mount avoids re-downloading packages on subsequent builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# =============================================================================
# Stage 2: build — compile the Nuxt 4 app
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files (.dockerignore excludes noise)
COPY . .

# Build outputs to .output/ — fully self-contained Nitro server bundle
RUN npm run build

# =============================================================================
# Stage 3: runtime — lean production image (~150-200 MB)
# Nitro's .output/ is self-contained: no node_modules required at runtime.
# =============================================================================
FROM node:22-alpine AS runtime

LABEL org.opencontainers.image.title="prebooking-backoffice" \
      org.opencontainers.image.description="Prebooking Back Office — Nuxt 4 SSR"

WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S nodegroup && \
    adduser -u 1001 -S nodeuser -G nodegroup

# Copy only the self-contained build output
COPY --from=build --chown=nodeuser:nodegroup /app/.output ./.output

USER nodeuser

EXPOSE 3000

# Runtime defaults — secrets injected at deploy time via env vars
# LOG_TO_FILE=false: always log to stdout in containers (CloudWatch / Fluentd)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_TO_FILE=false \
    LOG_LEVEL=info \
    NUXT_APP_BASE_URL=/

# Health check — wget is available in Alpine busybox, curl is not
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
