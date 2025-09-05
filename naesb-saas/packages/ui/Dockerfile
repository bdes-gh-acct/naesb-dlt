FROM node:18-alpine as prebuild 

FROM prebuild AS builder
WORKDIR /app
#ENV PYTHONUNBUFFERED=1
#RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add --no-cache python3 py3-pip make g++
RUN npm install -g lerna@^6.0.0
ENV NODE_ENV development
ENV NX_SKIP_NX_CACHE true
ENV NX_DAEMON false

COPY package.json package-lock.json lerna.json tsconfig.json nx.json ./
COPY packages/model/package.json ./packages/model/
COPY packages/ui/package.json ./packages/ui/
COPY packages/orm-model/package.json ./packages/orm-model/
RUN npm ci --legacy-peer-deps
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope ui

FROM prebuild AS final
ENV PORT 3000
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY packages/ui/public ./public/
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/.next/static ./packages/ui/.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/public ./packages/ui/public/
USER nextjs

EXPOSE 3000



CMD ["node", "/app/packages/ui/server.js"]

