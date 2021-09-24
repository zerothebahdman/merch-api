FROM node:alpine

RUN mkdir -p /usr/src/cognohub-api && chown -R node:node /usr/src/cognohub-api

WORKDIR /usr/src/cognohub-api

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 4004
