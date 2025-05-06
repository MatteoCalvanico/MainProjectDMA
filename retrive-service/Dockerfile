FROM node:23-alpine

# Crea la cartella, copia prima i file necessari a node per scaricare i pacchetti e poi tutto il resto
WORKDIR /usr/src/retrive
COPY package*.json ./
RUN npm i
COPY . .

# Porta per il reader e fa partire il tutto
EXPOSE 8090
CMD npm run dev