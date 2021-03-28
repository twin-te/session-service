FROM node:14-slim AS build-env
WORKDIR /usr/src/app

RUN apt-get -qy update && apt-get install -qy openssl

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .

RUN yarn proto
RUN yarn schema

RUN yarn build


FROM node:14-slim
WORKDIR /usr/src/app

LABEL org.opencontainers.image.source https://github.com/twin-te/session-service

RUN apt-get -qy update && apt-get install -qy openssl

COPY --from=build-env /usr/src/app/dist ./dist
COPY --from=build-env /usr/src/app/prisma ./prisma
COPY --from=build-env /usr/src/app/protos ./protos
COPY --from=build-env /usr/src/app/generated ./generated
COPY --from=build-env /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build-env /usr/src/app/package.json .
COPY --from=build-env /usr/src/app/yarn.lock .

RUN yarn install --prod

EXPOSE 50051

CMD ["yarn", "run", "start"]