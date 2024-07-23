FROM node:22-alpine3.19

WORKDIR /app


RUN apk update && \
    apk add --no-cache \
    g++ \
    openjdk11-jdk \
    python3 \
    && apk add --no-cache --virtual .build-deps gcc musl-dev 


COPY package.json .
RUN npm install
COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
