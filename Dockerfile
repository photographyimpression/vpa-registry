FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# vips-dev: sharp image processing; python3/make/g++: node-gyp for native builds
RUN apk add --no-cache libc6-compat vips-dev python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
# vips needed at build time for sharp
RUN apk add --no-cache vips-dev python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN apk add --no-cache vips
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
# Allow Node to use up to 1.5 GB heap for Sharp image processing under load.
# Pair with Cloud Run --memory=2Gi (or higher) for production.
ENV NODE_OPTIONS="--max-old-space-size=1536"

CMD ["node", "server.js"]
