FROM node:latest
WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install
COPY ./index.js ./
COPY ./deploy-commands.js ./
COPY ./commands/* ./commands/
CMD [ "node", "index.js" ]
