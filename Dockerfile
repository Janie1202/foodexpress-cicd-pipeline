FROM node:20-alpine
WORKDIR /app
RUN apk upgrade --no-cache && npm install -g npm@latest
COPY package*.json ./
RUN npm install
COPY . .

RUN chown -R node:node /app 
USER node
EXPOSE 3000
CMD ["node", "index.js"]
```[cite: 1]