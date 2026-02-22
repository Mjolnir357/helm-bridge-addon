ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /usr/share/helm-bridge

# Copy package files for dependency installation
COPY rootfs/usr/share/helm-bridge/package.json ./
COPY rootfs/usr/share/helm-bridge/package-lock.json* ./

# Install build tools for native modules, then install deps and clean up
# better-sqlite3 is in optionalDependencies — npm handles failure gracefully
RUN apk add --no-cache --virtual .build-deps python3 make g++ linux-headers \
  && ln -sf /usr/bin/python3 /usr/bin/python \
  && if [ -f package-lock.json ]; then \
       npm ci --omit=dev 2>&1; \
     else \
       npm install --omit=dev 2>&1; \
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
