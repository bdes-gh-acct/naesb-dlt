FROM registry.access.redhat.com/ubi8/nodejs-16 as prebuild
RUN npm install -g lerna@^6.0.0 @nestjs/cli
# Set environment variables that the ORACLE client needs. These can also be OpenShift ConfigMAP entries.
ENV TZ='UTC'

FROM prebuild
WORKDIR /opt/app-root
USER root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json .npmrc ./
COPY packages/agent-client/package.json ./packages/agent-client/
COPY packages/model/package.json ./packages/model/
RUN npm ci --legacy-peer-deps
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @local/agent-client
RUN chmod -R 0777 /opt/app-root/packages
EXPOSE 8080
WORKDIR /opt/app-root/packages/agent-client
CMD ["npm","run","serve" ]