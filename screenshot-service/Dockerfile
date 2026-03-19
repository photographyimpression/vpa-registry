FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN chown -R pptruser:pptruser /app
USER pptruser

EXPOSE 8080
CMD ["node", "server.js"]
