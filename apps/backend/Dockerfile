# ===================================
# Backend Dockerfile (Express + Prisma)
# Multi-stage build for optimized image
# ===================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend .

# Generate Prisma Client
RUN pnpm prisma generate

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install only production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy source code and generated files
COPY apps/backend .
COPY --from=builder /app/generated ./generated

# Create necessary directories
RUN mkdir -p tmp data prisma

# Generate Prisma Client again in runtime (to ensure compatibility)
RUN pnpm prisma generate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressuser
RUN chown -R expressuser:nodejs /app

USER expressuser

EXPOSE 3000

CMD ["pnpm", "start"]
