FROM node:22-alpine as build
WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install
COPY ./src ./src
COPY ./tsconfig.json ./
RUN npm run build

FROM node:22-alpine as install
WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs22-debian12:latest as runtime
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist/ ./
COPY --from=install /usr/src/app/node_modules ./node_modules
CMD [ "index.js" ]
