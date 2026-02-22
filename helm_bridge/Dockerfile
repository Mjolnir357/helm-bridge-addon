ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /usr/share/helm-bridge

# Copy package.json first for layer caching
COPY rootfs/usr/share/helm-bridge/package.json ./

# Install build tools, attempt native module build, then clean up build tools
# better-sqlite3 is optional - bridge works without it (device merge disabled)
RUN apk add --no-cache --virtual .build-deps python3 make g++ linux-headers \
  && ln -sf /usr/bin/python3 /usr/bin/python \
  && npm install --only=production --build-from-source 2>&1 || true \
  && if [ ! -d "node_modules/better-sqlite3/build" ]; then \
       echo "WARNING: better-sqlite3 failed to build, installing without it..." ; \
       npm install --only=production --ignore-scripts 2>&1 ; \
     fi \
  && npm cache clean --force \
  && apk del .build-deps

# Copy bundled bridge code (single file created by build.sh)
COPY rootfs/usr/share/helm-bridge/dist/index.js ./dist/

# Copy public directory for web UI
COPY rootfs/usr/share/helm-bridge/public ./public/

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

# Set environment
ENV NODE_ENV=production
ENV DATA_DIR=/data

CMD [ "/run.sh" ]
