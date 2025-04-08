FROM node:alpine3.19

ENV TZ=America/New_York

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD [ "node", "parseData.js" ]