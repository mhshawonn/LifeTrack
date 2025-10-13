FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
