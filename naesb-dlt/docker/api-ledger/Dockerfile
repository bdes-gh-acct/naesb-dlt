FROM registry.access.redhat.com/ubi9/nodejs-22 as prebuild
ENV TZ='UTC'
RUN npm install -g lerna@^8.0.0 @nestjs/cli

FROM prebuild
USER root
WORKDIR /opt/app-root
RUN mkdir -p $HOME/go/src/github.com/jameshiester
RUN cd $HOME/go/src/github.com/jameshiester
RUN curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
RUN ./install-fabric.sh -f 2.5.3 binary
RUN cd /opt/app-root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json .npmrc ./
COPY packages/model/package.json ./packages/model/
COPY packages/server-utils/package.json ./packages/server-utils/
COPY packages/api-ledger/package.json ./packages/api-ledger/
RUN npm ci
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @react/toolkit
RUN lerna run build --scope @naesb/dlt-model
RUN lerna run build --scope @api/ledger
RUN mkdir -p /var/log/app
COPY docker/api-ledger/scripts /opt/app-root/packages/api-ledger/scripts
COPY docker/api-ledger/core.yaml /opt/app-root/packages/api-ledger/scripts/
RUN chmod -R 0777 /opt/app-root/packages
ENV FABRIC_CFG_PATH /opt/app-root/packages/api-ledger/scripts/
RUN peer version
EXPOSE 8080
CMD [ "npm", "--prefix", "packages/api-ledger", "start" ]

