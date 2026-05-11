FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

RUN apk add --no-cache python3 make g++

COPY . .

RUN yarn install

ARG REACT_APP_BASE_URL
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY ["./default.conf", "/etc/nginx/conf.d/"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
