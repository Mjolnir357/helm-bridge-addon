#!/bin/sh

# Helm Bridge Add-on Startup Script
# Uses plain shell (no bashio) for init: false compatibility

CONFIG_PATH=/data/options.json
BRIDGE_DIR=/usr/share/helm-bridge

# Read configuration from Home Assistant add-on options using jq
CLOUD_URL=$(jq -r '.cloud_url' "$CONFIG_PATH")
LOG_LEVEL=$(jq -r '.log_level' "$CONFIG_PATH")

# Get Supervisor token for Home Assistant API access
export HA_TOKEN="${SUPERVISOR_TOKEN}"
export HA_URL="http://supervisor/core"
export CLOUD_URL="${CLOUD_URL}"
export CREDENTIAL_PATH="/data/credentials.json"
export BRIDGE_ID="${HOSTNAME}"
export LOG_LEVEL="${LOG_LEVEL}"

echo "[INFO] Starting Helm Bridge v1.3.1..."
echo "[INFO]   Cloud URL: ${CLOUD_URL}"
echo "[INFO]   Bridge ID: ${BRIDGE_ID}"
echo "[INFO]   Log Level: ${LOG_LEVEL}"
echo "[INFO]   Node.js: $(node --version 2>/dev/null || echo 'not found')"

# Verify Node.js is available
if ! command -v node > /dev/null 2>&1; then
  echo "[FATAL] Node.js is not installed! Cannot start bridge."
  exit 1
fi

# Verify the bridge bundle exists
if [ ! -f "${BRIDGE_DIR}/dist/index.js" ]; then
  echo "[FATAL] Bridge bundle not found at ${BRIDGE_DIR}/dist/index.js"
  exit 1
fi

# Log better-sqlite3 status (optional dependency - not a blocker)
if [ -d "${BRIDGE_DIR}/node_modules/better-sqlite3" ]; then
  echo "[INFO]   better-sqlite3: installed (device merge enabled)"
else
  echo "[INFO]   better-sqlite3: not available (device merge disabled, core features work normally)"
fi

# Create data directory if needed
mkdir -p /data

# Change to bridge directory and start
cd "${BRIDGE_DIR}"

echo "[INFO] Launching bridge process..."
exec node dist/index.js 2>&1
