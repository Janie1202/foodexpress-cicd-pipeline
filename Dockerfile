
FROM node:18-alpine AS base
WORKDIR /app

COPY package*.json ./


FROM base AS deps
RUN npm install --omit=dev

FROM node:18-alpine AS final
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup


COPY --from=deps /app/node_modules ./node_modules


COPY index.js .
COPY package*.json ./


RUN chown -R appuser:appgroup /app
USER appuser

# Expose the application port
EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "index.js"]
