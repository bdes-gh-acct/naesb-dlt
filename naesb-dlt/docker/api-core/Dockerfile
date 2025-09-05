FROM registry.access.redhat.com/ubi9/nodejs-22 as prebuild
RUN npm install -g lerna@^8.0.0 @nestjs/cli
# Set environment variables that the ORACLE client needs. These can also be OpenShift ConfigMAP entries.
ENV TZ='UTC'

FROM prebuild
WORKDIR /opt/app-root
USER root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json ./
COPY packages/model/package.json ./packages/model/
COPY packages/server-utils/package.json ./packages/server-utils/
COPY packages/api-core/package.json ./packages/api-core/
RUN npm ci --legacy-peer-deps
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @api/core
RUN chmod -R 0777 /opt/app-root/packages
EXPOSE 8080
CMD [ "npm", "--prefix", "packages/api-core", "start" ]