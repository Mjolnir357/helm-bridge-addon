# Helm Bridge - Home Assistant Add-on

Connect your Home Assistant to the Helm Smart Home Dashboard with local device management.

## Features

- Cloud pairing with Helm Dashboard via secure pairing codes
- Real-time device sync via WebSocket
- Local device merge detection (fuzzy name matching, state correlation)
- Web UI for device management (accessible via Home Assistant ingress)
- Health API endpoint for monitoring
- Diagnostic logging with remote sync

## Installation

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**
2. Click the three dots menu (top right) → **Repositories**
3. Add this URL: `https://github.com/Mjolnir357/helm-bridge-addon`
4. Find "Helm Bridge" in the store and click **Install**

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `cloud_url` | `https://helm-by-nautilink.replit.app` | URL of your Helm Dashboard |
| `log_level` | `info` | Log verbosity (debug, info, warn, error) |

## Architecture Support

- aarch64 (Raspberry Pi 4, Pi 5)
- amd64 (Intel/AMD x86_64)
- armv7 (Raspberry Pi 3, Pi 2)
- armhf (older ARM boards)
- i386 (32-bit x86)

## How It Works

After installation, the add-on will display a **pairing code** in the logs. Enter this code in your Helm Dashboard under Integrations → Home Assistant → Add Bridge to link your instance.

Once paired, the bridge maintains a persistent WebSocket connection to sync device states in real-time.
