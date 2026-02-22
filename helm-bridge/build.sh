#!/bin/bash
# Build script for Helm Bridge Home Assistant Add-on
# Uses esbuild to bundle all code into a single file

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRIDGE_SRC="$PROJECT_ROOT/bridge/src"
BRIDGE_PUBLIC="$PROJECT_ROOT/bridge/public"
OUTPUT_DIR="$SCRIPT_DIR/rootfs/usr/share/helm-bridge"

echo "================================================"
echo "Building Helm Bridge Home Assistant Add-on"
echo "================================================"

# Clean previous build
echo "Cleaning previous build..."
rm -rf "$OUTPUT_DIR/dist"
rm -rf "$OUTPUT_DIR/public"

# Create output directories
mkdir -p "$OUTPUT_DIR/dist"
mkdir -p "$OUTPUT_DIR/public"

# Create temporary build directory
BUILD_DIR=$(mktemp -d)
trap "rm -rf $BUILD_DIR" EXIT

echo "Build directory: $BUILD_DIR"

# Create package.json for build
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "helm-bridge-build",
  "type": "module",
  "dependencies": {
    "ws": "^8.16.0",
    "better-sqlite3": "^9.4.3",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "esbuild": "^0.19.0"
  }
}
EOF

# Install dependencies
echo "Installing dependencies..."
cd "$BUILD_DIR"
npm install

# Bundle with esbuild
echo "Bundling with esbuild..."
npx esbuild "$BRIDGE_SRC/index.ts" \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=esm \
  --outfile="$OUTPUT_DIR/dist/index.js" \
  --external:better-sqlite3 \
  --external:express \
  --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

# Verify bundle was created
if [ ! -f "$OUTPUT_DIR/dist/index.js" ]; then
  echo "ERROR: Bundle failed - dist/index.js not found"
  exit 1
fi

echo "Bundle created: $(wc -l < "$OUTPUT_DIR/dist/index.js") lines"

# Copy public directory for web UI
echo "Copying public web UI files..."
if [ -d "$BRIDGE_PUBLIC" ]; then
  cp -r "$BRIDGE_PUBLIC"/* "$OUTPUT_DIR/public/"
  echo "Copied $(ls -1 "$OUTPUT_DIR/public" | wc -l) public files"
else
  echo "WARNING: No public directory found at $BRIDGE_PUBLIC"
fi

echo ""
echo "================================================"
echo "Build complete!"
echo "Output: $OUTPUT_DIR/dist/index.js"
echo "Public: $OUTPUT_DIR/public/"
echo ""
echo "To build Docker image:"
echo "  cd $SCRIPT_DIR"
echo "  docker build --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest -t helm-bridge-addon ."
echo "================================================"
