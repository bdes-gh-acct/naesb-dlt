FROM registry.access.redhat.com/ubi8/nodejs-16 as prebuild
RUN npm install -g lerna@^6.0.0 @nestjs/cli

FROM prebuild
WORKDIR /opt/app-root
ENV NODE_ENV development
USER root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json ./
COPY packages/model/package.json ./packages/model/
COPY packages/api/package.json ./packages/api/
COPY packages/orm/package.json ./packages/orm/
COPY packages/orm-model/package.json ./packages/orm-model/
RUN npm ci --legacy-peer-deps
ENV NX_SKIP_NX_CACHE true
ENV NX_DAEMON false
RUN lerna bootstrap
COPY packages ./packages/
#ENV NODE_ENV production
#RUN npm install @nestjs/swagger@^6.1.0 --legacy-peer-deps
#RUN npm install @nestjs/platform-express@^9.0.0
RUN lerna run build --scope api
#RUN rm -rf node_modules
#RUN npm install --legacy-peer-deps
RUN npm install @nestjs/platform-express@^9.0.0
RUN chmod -R 0777 /opt/app-root/packages
EXPOSE 8080
CMD [ "npm", "--prefix", "packages/api", "start" ]