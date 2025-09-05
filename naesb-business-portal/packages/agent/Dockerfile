FROM registry.access.redhat.com/ubi8/nodejs-16 as prebuild
RUN npm install -g lerna@^6.0.0 @nestjs/cli
# Set environment variables that the ORACLE client needs. These can also be OpenShift ConfigMAP entries.
ENV TZ='UTC'

FROM prebuild
WORKDIR /opt/app-root
USER root
COPY package.json package-lock.json lerna.json tsconfig.json nx.json ./
COPY packages/agent/package.json ./packages/agent/
COPY packages/agent-utils/package.json ./packages/agent-utils/
COPY packages/model/package.json ./packages/model/
RUN npm ci --legacy-peer-deps
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN npm install @nestjs/typeorm@^9.0.0 --legacy-peer-deps
RUN npm install typescript -g --legacy-peer-deps
RUN npm install @types/node --save-dev --legacy-peer-deps
RUN npm i --save-dev @types/jest --legacy-peer-deps
RUN lerna run build --scope @local/admin
RUN chmod -R 0777 /opt/app-root/packages
RUN chmod +x ./start.sh
EXPOSE 8080
CMD [ "npm", "--prefix", "packages/agent", "start" ]