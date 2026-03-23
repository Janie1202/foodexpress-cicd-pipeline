# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:18-alpine AS base
WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package*.json ./

# ── Stage 2: Dependencies ──────────────────────────────────────────────────────
FROM base AS deps
RUN npm install --omit=dev

# ── Stage 3: Final Image ───────────────────────────────────────────────────────
FROM node:18-alpine AS final
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY index.js .
COPY package*.json ./

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the application port
EXPOSE 3000

# Health check so Docker/orchestrators know when it's ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "index.js"]
