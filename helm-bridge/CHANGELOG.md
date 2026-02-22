# Changelog

All notable changes to the Helm Bridge add-on will be documented in this file.

## [1.3.2] - 2026-02-22

### Fixed
- Fixed changelog formatting (literal \
 replaced with actual newlines)
- Fixed version pattern matching in run.sh files
- Fixed file sync to include rootfs build artifacts

## [1.3.1] - 2026-02-22

### Changed
- Unified all GitHub repo URLs to Mjolnir357/helm-bridge-addon
- Updated supervisor config and repository URLs
- Cleaned up legacy directory references
- Added automated sync script with version bumping and changelog

## [1.3.0] - 2026-02-14

### Added
- Remote diagnostic logging system for troubleshooting 502 Bad Gateway and other issues
- DiagnosticLogger captures console output, system metrics (memory, uptime, connections), and errors
- Logs are transmitted to Helm cloud every 30 seconds via WebSocket (immediate on errors)
- On-demand log request support from Helm dashboard
- Bridge Logs viewer on Integration Health page with level/category filtering and diagnostics dashboard

### Improved
- Enhanced cloud client with `sendDiagnosticLogs` method for structured log transmission
- Added `bridge_logs` and `request_logs` message types to WebSocket protocol
- Pre-built dist/index.js now included in repo for reliable addon Docker builds

## [1.2.0] - 2026-02-01

### Added
- Local device merge system for detecting and merging duplicate devices within Home Assistant
- SQLite database for entity groups, state history, and merge tracking
- Fuzzy name matching, room matching, and state correlation analysis for duplicate detection
- Pairwise bidirectional correlation with event normalization
- Express web server with ingress-protected API endpoints for device management
- Self-contained offline-capable web UI (no CDN dependencies)
- API endpoints: `/api/devices`, `/api/duplicates`, `/api/groups`, `/api/refresh`
- Group control endpoint to control all entities in a merge group simultaneously

### Security
- CORS restricted to HA-compatible origins (local network, homeassistant.local, ingress)
- API endpoints require ingress header or HA referer (except /api/health)

### Improved
- Secure WebSocket connections (wss://) when serving over HTTPS
- Reconnect scheduler for HA REST/WebSocket failures
- Updated project dependencies for improved security and stability

## [1.1.1] - 2026-01-19

### Fixed
- Fixed pairing code polling to stop after successful credential retrieval
- Fixed bridge continuing to poll even after pairing completed
- Handle "credential already claimed" response properly
- Fixed 404 response handling when pairing code no longer exists

### Improved
- Bridge now properly connects to cloud WebSocket immediately after pairing
- Added handling for edge cases when credentials are already claimed
- Better error messages for pairing status checks

## [1.1.0] - 2026-01-19

### Fixed
- Fixed WebSocket URL construction for Home Assistant Supervisor environment
- Resolved 404 errors when accessing Home Assistant registries
- Made type mappers more robust to handle missing fields gracefully
- Fixed `get_services` response format handling (dictionary to array transformation)

### Improved
- Added detailed step-by-step logging during connection sequence
- Entity registry and state loading are now non-fatal (bridge continues if they fail)
- Better error messages for troubleshooting connection issues

### Changed
- Switched from REST API to WebSocket for accessing areas, devices, entities, states, and services registries

## [1.0.0] - 2026-01-18

### Added
- Initial release of Helm Bridge add-on
- WebSocket connection to Home Assistant for real-time updates
- Pairing code generation displayed in add-on logs
- Cloud sync with Helm Smart Home Dashboard
- Support for all major architectures (amd64, aarch64, armhf, armv7, i386)
- Health check endpoint for monitoring
- Automatic reconnection on connection loss
