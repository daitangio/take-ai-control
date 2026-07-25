# Build step #1: build the React front end
FROM node:26.5-alpine3.24 as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY *.json *.html *.ts ./
COPY ./src ./src
COPY ./public ./public
RUN npm install
RUN npm run build

# Build step #2: build an nginx container
FROM nginx:stable-alpine
COPY --from=build-step /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf