FROM node:18-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY public ./public
COPY server.js .

CMD [ "node", "server.js" ]

# 이미지 빌드시 ./public/upload 정리