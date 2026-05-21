FROM node:18.12.0-alpine as develop-stage

# RUN mkdir $APP_ROOT
WORKDIR /app
# ADD . $APP_ROOT

COPY package.json ./
#just comment
RUN yarn

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# just comment
FROM develop-stage as build-stage
RUN yarn build

RUN : \
  && rm -rf node_modules/.yarn-integrity \
  && rm package.json \
  && yarn cache clean \
  && :

# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
