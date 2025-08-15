FROM node:24-slim
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
CMD [ "node", "server.js" ]
