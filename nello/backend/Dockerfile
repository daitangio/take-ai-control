FROM node:26-trixie-slim AS build

WORKDIR /app/nello
COPY package.json package-lock.json ./
# GG ci=Clean install: you want to make sure you're doing a clean install of your dependencies.
RUN npm ci
COPY tsconfig.json ./
COPY src src
COPY tests tests
COPY vitest.config.ts .
COPY db-init db-init
RUN npm run build && npm run test
RUN rm -rf tests db-init vitest.config.ts

FROM node:26-trixie-slim

WORKDIR /app/nello
COPY --from=build /app/nello/dist dist
COPY --from=build /app/nello/node_modules node_modules
COPY package.json ./
# /app/nello/nello.db
RUN apt update && apt install -y sqlite3
COPY backendRunner.sh jjMigrator.sh .
COPY db-init db-init
CMD ./backendRunner.sh
