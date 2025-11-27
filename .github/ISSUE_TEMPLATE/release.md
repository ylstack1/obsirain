---
name: Release Request
about: Track a new release of the plugin
title: 'Release v[VERSION]'
labels: release
assignees: ''
---

## Release Information

**Version:** [e.g., 1.0.0, 1.0.0-beta.1]
**Type:** [stable/beta/hotfix]

## Release Checklist

### Pre-Release
- [ ] All features/fixes are merged
- [ ] Code review completed
- [ ] Build passes locally (`npm run build`)
- [ ] Plugin tested in Obsidian vault
- [ ] Version bumped (via workflow or `npm version`)
- [ ] Changelog/release notes prepared

### Release Process
- [ ] Version Bump workflow executed (if using workflows)
- [ ] Release workflow executed or tag pushed
- [ ] GitHub release created successfully
- [ ] All artifacts uploaded (main.js, manifest.json, styles.css, versions.json)
- [ ] Release notes added

### Post-Release
- [ ] Release tested by downloading from GitHub
- [ ] Plugin works in fresh Obsidian vault
- [ ] Announcement prepared (if needed)
- [ ] Community plugin listing updated (if applicable)

## Changes in This Release

### Features
- 

### Bug Fixes
- 

### Breaking Changes
- 

## Testing Notes

<!-- Describe how this release was tested -->

## Additional Notes

<!-- Any additional information about this release -->
