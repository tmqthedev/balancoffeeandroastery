FROM node:22-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev --include=optional \
  && npm install --omit=dev --include=optional --os=linux --cpu=x64 sharp

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
