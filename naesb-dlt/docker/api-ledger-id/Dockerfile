FROM registry.access.redhat.com/ubi9/nodejs-22 as prebuild
ENV TZ='UTC'
RUN npm install -g lerna@^8.0.0 @nestjs/cli
# USER root
# RUN dnf install -y ca-certificates && \
#     update-ca-trust enable

FROM prebuild
USER root
WORKDIR /opt/app-root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json .npmrc  ./
COPY packages/model/package.json ./packages/model/
COPY packages/server-utils/package.json ./packages/server-utils/
COPY packages/api-ledger-id/package.json ./packages/api-ledger-id/
RUN npm ci
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @api/ledger-id --include-dependencies
RUN chmod -R 0777 /opt/app-root/packages
EXPOSE 8080
# COPY ./docker/api-ledger-id/docker-entrypoint.sh /opt/app-root
# RUN chmod +x /opt/app-root/docker-entrypoint.sh
CMD [ "npm", "--prefix", "packages/api-ledger-id", "start" ]