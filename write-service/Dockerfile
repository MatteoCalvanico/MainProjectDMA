FROM node:23-alpine

# Crea la cartella, copia prima i file necessari a node per scaricare i pacchetti e poi tutto il resto
WORKDIR /usr/src/write
COPY package*.json ./
RUN npm i
COPY . .

# Fa partire il tutto
CMD npm run dev