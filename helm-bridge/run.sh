#!/usr/bin/with-contenv bashio

# Helm Bridge Add-on Startup Script

CONFIG_PATH=/data/options.json
BRIDGE_DIR=/usr/share/helm-bridge

# Read configuration from Home Assistant add-on options
CLOUD_URL=$(bashio::config 'cloud_url')
LOG_LEVEL=$(bashio::config 'log_level')

# Get Supervisor token for Home Assistant API access
export HA_TOKEN="${SUPERVISOR_TOKEN}"
export HA_URL="http://supervisor/core"
export CLOUD_URL="${CLOUD_URL}"
export CREDENTIAL_PATH="/data/credentials.json"
export BRIDGE_ID=$(bashio::addon.hostname)
export LOG_LEVEL="${LOG_LEVEL}"

bashio::log.info "Helm Bridge v1.3.1..."
bashio::log.info "  Cloud URL: ${CLOUD_URL}"
bashio::log.info "  Bridge ID: ${BRIDGE_ID}"
bashio::log.info "  Log Level: ${LOG_LEVEL}"
bashio::log.info "  HA_TOKEN: [SET]"
bashio::log.info "  Node.js: $(node --version 2>/dev/null || echo 'not found')"

# Verify Node.js is available
if ! command -v node &> /dev/null; then
  bashio::log.fatal "Node.js is not installed! Cannot start bridge."
  exit 1
fi

# Verify the bridge bundle exists
if [ ! -f "${BRIDGE_DIR}/dist/index.js" ]; then
  bashio::log.fatal "Bridge bundle not found at ${BRIDGE_DIR}/dist/index.js"
  exit 1
fi

# Log better-sqlite3 status (optional dependency - not a blocker)
if [ -d "${BRIDGE_DIR}/node_modules/better-sqlite3" ]; then
  bashio::log.info "  better-sqlite3: installed (device merge enabled)"
else
  bashio::log.info "  better-sqlite3: not available (device merge disabled, core features work normally)"
fi

# Create data directory with secure permissions
mkdir -p /data
chmod 700 /data

# Lock down existing credentials file if present
if [ -f "${CREDENTIAL_PATH}" ]; then
  chmod 600 "${CREDENTIAL_PATH}"
fi

# Change to bridge directory and start
cd ${BRIDGE_DIR}

bashio::log.info "Launching bridge process..."
exec node dist/index.js 2>&1
