FROM node:18-alpine3.17 AS build
WORKDIR /app
RUN npm install -g pnpm@8.6.2
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:18-alpine3.17
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node:node /app/.output .
ENV NODE_ENV=production
CMD [ "node", "server/index.mjs" ]
EXPOSE 3000
