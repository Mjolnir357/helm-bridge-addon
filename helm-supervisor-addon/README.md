# Helm Supervisor - Home Assistant Add-on

> **DEPRECATED**: This directory is a legacy copy. The canonical supervisor add-on source is at `/helm-supervisor/` in the repo root.

A monitoring, logging, and diagnostics collector add-on for Home Assistant that syncs data to your [Helm Smart Home Dashboard](https://helm.replit.app).

## What It Does

The Helm Supervisor runs inside your Home Assistant instance and collects:

- **System Logs** - Core and Supervisor log entries
- **Performance Metrics** - CPU, memory, disk usage, network stats
- **Device State History** - Snapshots of all entity states
- **Add-on Status** - Installation state, errors, and versions for all add-ons
- **System Errors** - Resolution center issues and unhealthy system alerts

All data is securely synced to your Helm dashboard where you can view and analyze it.

## Installation

### Step 1: Register an Instance in Helm

1. Log in to your Helm dashboard
2. Go to **Helm Supervisor** (in the navigation menu)
3. Click **Register Instance**
4. Copy the API key that's generated

### Step 2: Add This Repository to Home Assistant

1. In Home Assistant, go to **Settings > Add-ons > Add-on Store**
2. Click the **three-dot menu** (top right) > **Repositories**
3. Add this repository URL:
   ```
   https://github.com/Mjolnir357/helm-bridge-addon
   ```
4. Click **Add** then **Close**

### Step 3: Install & Configure

1. Find **Helm Supervisor** in the add-on store and click **Install**
2. Go to the **Configuration** tab
3. Set:
   - `helm_url`: Your Helm dashboard URL (e.g., `https://helm.replit.app`)
   - `api_key`: The API key from Step 1
   - `sync_interval`: How often to sync (default: 60 seconds)
4. Click **Save**
5. Go to the **Info** tab and click **Start**

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `helm_url` | string | required | Your Helm dashboard URL |
| `api_key` | string | required | API key from Helm Supervisor registration |
| `sync_interval` | int | 60 | Seconds between sync cycles (10-600) |
| `collect_device_states` | bool | true | Collect entity state snapshots |
| `collect_performance_metrics` | bool | true | Collect CPU/memory/disk stats |
| `collect_addon_status` | bool | true | Collect add-on installation status |
| `log_level` | list | info | Logging verbosity (debug/info/warn/error) |

## Architecture

```
Home Assistant
  └── Helm Supervisor Add-on
        ├── HA Supervisor API → System info, logs, add-on status
        ├── HA REST API → Entity states, automations
        └── Sync Client → HTTPS POST to Helm Dashboard
                              └── /api/supervisor/* endpoints
```

## Security

- Communication uses HTTPS
- API key authentication on all sync requests
- No data is stored locally (stateless collector)
- The add-on only reads data from HA, never writes

## Troubleshooting

Check the add-on logs in Home Assistant:
1. Go to **Settings > Add-ons > Helm Supervisor**
2. Click the **Log** tab

Common issues:
- **"No Helm URL or API key configured"** - Set both in the Configuration tab
- **"Invalid API key"** - Re-register the instance in Helm and use the new key
- **Connection errors** - Verify your Helm dashboard URL is accessible from your HA network

## Support

For issues, visit the [Helm Smart Home Dashboard](https://helm.replit.app) or open an issue on this repository.
