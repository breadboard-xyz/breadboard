from node:10 as builder

WORKDIR /src

COPY package*.json ./

RUN npm install

from node:10-alpine

WORKDIR /src

COPY . .

RUN rm -rf ./node_modules

COPY --from=builder /src/node_modules ./node_modules

EXPOSE 8070
CMD [ "node", "index.js" ]
