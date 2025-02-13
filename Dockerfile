FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

COPY yarn* ./

RUN corepack enable
RUN yarn install

COPY . /app

ARG REACT_APP_BASE_URL

ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL

RUN yarn build
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY ["./default.conf", "/etc/nginx/conf.d/"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
