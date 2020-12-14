FROM node:13.7.0-alpine

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ROOT_API=https://37.230.195.218
RUN ROOT_API=$ROOT_API npm run build

EXPOSE 8080

CMD [ "http-server", "dist" ]
