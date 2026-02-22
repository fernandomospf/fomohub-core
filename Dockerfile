FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-alpine

LABEL app="fomohub-backend"

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -S fomohub && adduser -S fomohub -G fomohub

USER fomohub

EXPOSE 3000

CMD ["node", "dist/main.js"]