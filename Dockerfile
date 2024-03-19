FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

COPY yarn* ./

RUN yarn install

COPY . /app

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
