FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .yarnrc.yml ./
RUN corepack enable && yarn install

COPY . .
RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html
