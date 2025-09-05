FROM registry.access.redhat.com/ubi9/nodejs-22 as prebuild
ENV TZ='UTC'
RUN npm install -g lerna@^8.0.0 @nestjs/cli@8.1.1

FROM prebuild as builder
USER root
WORKDIR /opt/app-root
RUN curl -sSL https://bit.ly/2ysbOFE | bash -s -- -d -s -- 2.5.3
ENV PATH $PWD/bin:$PATH
RUN chmod -R 0777 /opt/app-root/bin
COPY package.json package-lock.json lerna.json tsconfig.json nx.json .npmrc  ./
COPY packages/model/package.json ./packages/model/
COPY packages/server-utils/package.json ./packages/server-utils/
COPY packages/api-ledger-admin/package.json ./packages/api-ledger-admin/
RUN npm ci
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @react/toolkit
RUN lerna run build --scope @naesb/dlt-model
RUN lerna run build --scope @api/ledger-admin
COPY docker/api-ledger-admin/scripts /opt/app-root/packages/api-ledger-admin/scripts
RUN mkdir -p /var/log/app
COPY docker/api-ledger-admin/core.yaml /opt/app-root/packages/api-ledger-admin/scripts/
RUN chmod -R 0777 /opt/app-root/packages

ENV FABRIC_CFG_PATH /opt/app-root/packages/api-ledger-admin/scripts/
CMD [ "npm", "--prefix", "packages/api-ledger-admin", "start" ]