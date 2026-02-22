# Helm Bridge - Home Assistant Add-on

Connect your Home Assistant instance to the Helm Smart Home Dashboard for unified smart home control.

## About

The Helm Bridge add-on creates a secure connection between your Home Assistant instance and the Helm cloud service. This allows you to:

- View and control all your Home Assistant devices from the Helm dashboard
- Create automations that span multiple smart home platforms
- Monitor device status and get real-time updates
- Access your smart home from anywhere

## Installation

### From the Helm Add-on Repository

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**
2. Click the three dots menu (⋮) in the upper right corner
3. Select **Repositories**
4. Add the Helm repository URL: `https://github.com/Mjolnir357/Helm-by-nautilink.replit.app`
5. Click **Add** → **Close**
6. Find "Helm Bridge" in the add-on store and click **Install**

### Manual Installation

1. Download the latest release from GitHub
2. Copy the `helm-bridge` folder to your Home Assistant `addons` directory
3. Go to **Settings** → **Add-ons** and click **Reload**
4. Install "Helm Bridge" from the Local Add-ons section

## Configuration

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `cloud_url` | URL of the Helm cloud server | `https://helm-by-nautilink.replit.app` |
| `log_level` | Logging verbosity (debug/info/warn/error) | `info` |

### Example Configuration

```yaml
cloud_url: "https://helm-by-nautilink.replit.app"
log_level: info
```

## Pairing with Helm

After installing and starting the add-on:

1. Open the Helm web dashboard at [helm-by-nautilink.replit.app](https://helm-by-nautilink.replit.app)
2. Log in or create an account
3. Navigate to **Integrations** → **Home Assistant**
4. Click **Add Bridge**
5. Enter the pairing code shown in the add-on logs
6. Click **Pair** to complete the connection

The bridge will automatically connect and begin syncing your devices.

## Troubleshooting

### Bridge Not Connecting

1. Check the add-on logs for error messages
2. Verify your internet connection
3. Ensure the cloud URL is correct
4. Try restarting the add-on

### Devices Not Appearing

1. Wait a few minutes for the initial sync to complete
2. Check that the bridge is connected (green status in Helm dashboard)
3. Try triggering a manual sync from the Helm dashboard

### Pairing Code Expired

Pairing codes expire after 10 minutes. Restart the add-on to generate a new code.

## Data Privacy

- All communication between the bridge and Helm cloud is encrypted (TLS/WSS)
- Device data is stored securely in your Helm account
- You control which devices are visible in Helm through the import settings
- The bridge only sends data when connected to your verified account

## Security Hardening

For enhanced security, consider implementing the following network-level protections:

### Network Requirements

The Helm Bridge add-on requires the following network access:

| Direction | Destination | Port | Purpose |
|-----------|-------------|------|---------|
| Outbound | helm-by-nautilink.replit.app | 443 | Cloud connection (WSS/HTTPS) |
| Internal | Home Assistant Core | 8123 | Local API access |
| Inbound (Optional) | LAN | 8099 | Local API (if enabled) |

### Firewall Configuration

If you have strict firewall rules, ensure the following outbound connections are allowed:

**Required:**
- `helm-by-nautilink.replit.app:443` (TLS/WSS)
- DNS resolution (port 53)

**Example Router Rules (pfSense/OPNsense/UniFi):**
```
Allow | TCP | Home_Assistant_IP | * | helm-by-nautilink.replit.app | 443
Allow | UDP | Home_Assistant_IP | * | DNS_Server | 53
```

### VLAN Segmentation (Recommended)

For best security, place Home Assistant on a dedicated IoT VLAN:

1. Create a separate VLAN for IoT/smart home devices (e.g., VLAN 20)
2. Place your Home Assistant on this VLAN
3. Configure inter-VLAN routing to:
   - Allow your trusted devices to access HA UI (port 8123)
   - Allow HA outbound to internet (ports 443, 53 only)
   - Block IoT VLAN from initiating connections to trusted networks

### Entity Access Control

Use Helm's import settings to follow the principle of least privilege:

1. **Import only necessary entities** - Don't expose everything
2. **Use visibility controls**:
   - Visible: Can see state (read-only)
   - Controllable: Can send commands
   - Automatable: Can use in automations
3. **Regularly review imported entities** and remove unused ones

### Security Best Practices

- **Strong passwords**: Use 8+ characters with uppercase, lowercase, and numbers
- **Separate accounts**: Create individual accounts for family members
- **Review audit logs**: Regularly check the Helm audit log for unusual activity
- **Keep updated**: Update the add-on when new versions are released
- **Monitor connections**: Check bridge status regularly for unexpected disconnections

For detailed network security configuration, see the main [SECURITY.md](../../SECURITY.md) documentation.

## Support

- [GitHub Issues](https://github.com/Mjolnir357/Helm-by-nautilink.replit.app/issues)

## License

MIT License - See LICENSE file for details.
