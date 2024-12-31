ARG NODE_VERSION=20.14

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile \
  && yarn cache clean

COPY . .

RUN chmod +x ./infra/entrypoints/entrypoint.sh

RUN apk add --no-cache git curl python3 alpine-sdk

RUN npx @mapbox/node-pre-gyp rebuild -C /usr/src/node_modules/bcrypt

EXPOSE 5000

EXPOSE 5001

ENTRYPOINT [ "/bin/sh", "./infra/entrypoints/entrypoint.sh" ]