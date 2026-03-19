FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
