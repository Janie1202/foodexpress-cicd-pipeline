# 1. Start with the Base Image (MUST BE FIRST)
FROM node:20-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Upgrade npm
RUN apk upgrade --no-cache && npm install -g npm@latest

# 4. Copy dependency files and install
COPY package*.json ./
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Set permissions and switch to a non-root user (Security Best Practice)
RUN chown -R node:node /app
USER node

# 7. Open the application port
EXPOSE 3000

# 8. Start the app
CMD ["node", "index.js"]
```[cite: 1]