FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  CMD wget --spider http://localhost:5000/health || exit 1

CMD ["npm","start"]