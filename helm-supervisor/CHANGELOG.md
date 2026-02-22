# Changelog

## [1.0.3] - 2026-02-22

### Fixed
- Added icon.png and logo.png to bridge addon
- Cleaned up duplicate addon directories from repo
- Home Assistant now correctly discovers helm-bridge and helm-supervisor

## [1.0.2] - 2026-02-22

### Fixed
- Fixed changelog formatting (literal \
 replaced with actual newlines)
- Fixed version pattern matching in run.sh files
- Fixed file sync to include rootfs build artifacts

## [1.0.1] - 2026-02-22

### Changed
- Unified all GitHub repo URLs to Mjolnir357/helm-bridge-addon
- Updated supervisor config and repository URLs
- Cleaned up legacy directory references
- Added automated sync script with version bumping and changelog

## 1.0.0
- Initial release
- System log collection from Home Assistant
- Performance metrics (CPU, memory, disk, network)
- Device state history tracking
- Add-on status monitoring with install error capture
- Error aggregation and deduplication
- Secure sync to Helm dashboard via API key
