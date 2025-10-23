# Client builder
FROM node:23-alpine AS client-builder

WORKDIR /app
COPY ./ .
WORKDIR /app/client

COPY client/package*.json ./

RUN npm ci

COPY client/ ./

RUN npm run build

# Application
FROM node:23-alpine 

# Install 
RUN apk add --no-cache ffmpeg

# Application
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY ./api ./api
COPY ./server ./server
COPY ./types ./types
COPY ./utils ./utils
COPY ./.env.defaults ./.env.defaults
COPY ./index.ts ./index.ts

COPY --from=client-builder /app/client_dist /app/client_dist

EXPOSE 3000

CMD ["node", "--experimental-transform-types", "./index.ts"]