FROM registry.access.redhat.com/ubi9/nodejs-22 as prebuild
ENV TZ='UTC'
RUN npm install -g lerna@^8.0.0

FROM prebuild
USER root
WORKDIR /opt/app-root
COPY .eslintrc.react.js package.json package-lock.json lerna.json tsconfig.json nx.json .npmrc  ./
COPY packages/model/package.json ./packages/model/
COPY packages/react-toolkit/package.json ./packages/react-toolkit/
COPY packages/client/package.json ./packages/client/
RUN npm ci
RUN lerna bootstrap
COPY packages ./packages/
ENV NODE_ENV production
RUN lerna run build --scope client --include-dependencies --skip-nx-cache
EXPOSE 8080
CMD ["npm","run","react-static" ]