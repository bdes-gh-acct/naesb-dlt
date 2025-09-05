FROM registry.access.redhat.com/ubi9/nodejs-20 as prebuild
RUN npm install -g lerna@^8.0.0 @nestjs/cli
# Set environment variables that the ORACLE client needs. These can also be OpenShift ConfigMAP entries.
ENV TZ='UTC'

FROM prebuild
WORKDIR /opt/app-root
USER root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json ./
COPY packages/business-agent/package.json ./packages/business-agent/
COPY packages/agent-utils/package.json ./packages/agent-utils/
COPY packages/model/package.json ./packages/model/
RUN npm ci --legacy-peer-deps
# WORKDIR /opt/app-root/packages/business-agent
# RUN npm install --legacy-peer-deps
# WORKDIR /opt/app-root/packages/agent-utils
# RUN npm install --legacy-peer-deps
# WORKDIR /opt/app-root
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope @local/business-agent
RUN chmod -R 0777 /opt/app-root/packages
EXPOSE 8080
CMD [ "npm", "--prefix", "packages/business-agent", "start" ]