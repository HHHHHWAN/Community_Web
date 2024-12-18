FROM node:18-alpine3.19 

WORKDIR /test/app

COPY package*.json ./

RUN npm ci

COPY src .
COPY public .
COPY manage.js .

CMD [ "node", "manage.js" ]