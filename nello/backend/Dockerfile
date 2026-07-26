FROM node:22-bookworm-slim AS build

WORKDIR /app/nello
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app/nello
COPY --from=build /app/nello/dist dist
COPY --from=build /app/nello/node_modules node_modules
COPY package.json ./
# /app/nello/nello.db
CMD node dist/index.js
