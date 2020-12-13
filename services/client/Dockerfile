FROM node:13.7.0-alpine

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# RUN ROOT_API=http://localhost:5000 npm run build
RUN ROOT_API=http://37.230.195.218 npm run build

EXPOSE 8080

CMD [ "http-server", "dist" ]
