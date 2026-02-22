ARG BUILD_FROM
FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm curl

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/

COPY rootfs /

CMD ["node", "src/index.js"]
