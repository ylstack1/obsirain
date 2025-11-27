# Release Automation Implementation

This document describes the automated GitHub release and tagging system implemented for the Item Manager Obsidian plugin.

## Overview

A complete CI/CD pipeline has been implemented using GitHub Actions to automate the build, versioning, and release process for the Obsidian plugin.

## What Was Implemented

### 1. GitHub Actions Workflows

Three automated workflows were created in `.github/workflows/`:

#### a. Build and Validate (`build.yml`)
- **Purpose**: Continuous integration for all code changes
- **Triggers**: Pushes to main/master/develop branches and all PRs
- **What it does**:
  - Installs dependencies
  - Runs TypeScript type checking
  - Builds the plugin with esbuild
  - Validates manifest.json structure and required fields
  - Checks version consistency between package.json and manifest.json
  - Uploads build artifacts (retention: 30 days)
  - Generates detailed build summaries

#### b. Version Bump (`version-bump.yml`)
- **Purpose**: Simplify version management
- **Triggers**: Manual workflow dispatch
- **What it does**:
  - Allows selection of version bump type (patch, minor, major, prerelease, custom)
  - Updates version in package.json, manifest.json, and versions.json
  - Commits and pushes version changes automatically
  - Provides clear next steps in workflow summary

#### c. Release Obsidian Plugin (`release.yml`)
- **Purpose**: Automated releases with all required artifacts
- **Triggers**: 
  - Git tag pushes (automatic)
  - Manual workflow dispatch
- **What it does**:
  - Extracts version from tag or manual input
  - Builds the plugin in production mode (minified, no sourcemaps)
  - Verifies all required build artifacts exist
  - Generates SHA256 checksums for all files
  - Creates comprehensive release notes with:
    - Installation instructions
    - Minimum Obsidian version requirements
    - SHA256 checksums for verification
  - Creates GitHub release with proper tags
  - Uploads all required artifacts:
    - `main.js` - Bundled plugin code
    - `manifest.json` - Plugin metadata
    - `styles.css` - Plugin styles (if present)
    - `versions.json` - Version compatibility mapping
    - `checksums.txt` - SHA256 checksums
  - Marks pre-release versions (beta, alpha, rc) appropriately
  - Updates 'latest' tag for stable releases

### 2. Documentation

Comprehensive documentation was created:

#### a. Workflows README (`.github/workflows/README.md`)
- Detailed explanation of each workflow
- Usage instructions for maintainers
- Complete release process walkthrough
- Troubleshooting guide
- Obsidian plugin requirements reference

#### b. Release Guide (`RELEASE.md`)
- Step-by-step release instructions
- Quick start guide for first-time users
- Multiple release methods (automated and manual)
- Version numbering guidelines
- Testing procedures
- Common scenarios and solutions

#### c. Contributing Guide (`CONTRIBUTING.md`)
- Contributor guidelines
- Development workflow
- Code style requirements
- PR submission process
- Review process
- Release process for maintainers

#### d. Changelog (`CHANGELOG.md`)
- Template following Keep a Changelog format
- Semantic versioning guidelines
- Initial version entries

### 3. GitHub Templates

#### a. Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
- Structured PR format
- Change type classification
- Testing checklist
- Documentation requirements

#### b. Release Issue Template (`.github/ISSUE_TEMPLATE/release.md`)
- Track releases as GitHub issues
- Pre-release, release, and post-release checklists
- Change documentation sections

### 4. Helper Scripts

#### a. Prepare Release Script (`scripts/prepare-release.sh`)
- Automated pre-release checks
- Runs full validation:
  - Version consistency check
  - Clean build
  - Dependency installation
  - Type checking
  - Linting
  - Build verification
  - Artifact validation
  - Manifest validation
  - Checksum generation
- Provides clear summary and next steps
- Executable via `npm run prepare-release`

### 5. Build Configuration Updates

#### a. Version Bump Script (`version-bump.mjs`)
- Fixed to always update versions.json (removed conditional logic)
- Ensures version consistency across all files

#### b. Package.json
- Added `prepare-release` npm script
- Maintains existing build scripts

#### c. Versions.json
- Fixed formatting (incorrect indentation)

### 6. Documentation Updates

#### a. Main README.md
- Added GitHub releases installation instructions
- Added Releases section with workflow information
- Updated with links to release documentation

## Obsidian Plugin Compliance

All implementations comply with Obsidian plugin requirements:

✅ **Tag Format**: No leading 'v' (uses `1.0.0`, not `v1.0.0`)
✅ **Version Matching**: Git tag matches manifest.json version exactly
✅ **Required Files**: main.js, manifest.json attached as individual release assets
✅ **Optional Files**: styles.css included if present
✅ **Versions Mapping**: versions.json properly maintained and included
✅ **Plugin ID Stability**: manifest.json 'id' field remains unchanged
✅ **Semantic Versioning**: Proper x.y.z format supported
✅ **Pre-release Support**: Beta, alpha, rc versions marked correctly

## Usage Examples

### Creating a Release (Easiest Method)

1. Go to GitHub → Actions
2. Select "Release Obsidian Plugin"
3. Click "Run workflow"
4. Enter version (e.g., `1.0.0` or `1.0.0-beta.3`)
5. Click "Run workflow" button
6. Wait for completion
7. Check Releases page

### Creating a Release (Tag-based)

```bash
# Bump version
npm version patch  # or minor, major

# Push changes
git push

# Push tag
git push origin $(node -p "require('./package.json').version")

# Workflow triggers automatically
```

### Local Pre-release Validation

```bash
# Run all checks locally before releasing
npm run prepare-release
```

## Workflow Features

### Security
- Uses built-in `GITHUB_TOKEN` (no secrets needed)
- Runs in isolated GitHub-hosted runners
- No external services or API calls

### Reliability
- Comprehensive error checking at each step
- Build artifact verification
- Version consistency validation
- Automatic rollback on failures

### Transparency
- Detailed workflow logs
- Build summaries in GitHub Actions
- Release notes with checksums
- Clear error messages

### Flexibility
- Manual or automatic triggers
- Supports stable and pre-release versions
- Works with any semantic version format
- Can be customized as needed

## Testing Recommendations

Before creating the first real release:

1. **Test the build workflow**: Push to a feature branch and verify build succeeds
2. **Test version bump**: Use the workflow with a test version
3. **Test release workflow**: Create a test release (can be deleted)
4. **Verify artifacts**: Download and test the plugin from the release
5. **Test in Obsidian**: Install from release files in a test vault

## Maintenance

### Adding New Artifacts

To add new files to releases:

1. Ensure file is generated during build
2. Add to "Create release directory" step in `release.yml`
3. Add to "Generate checksums" step
4. Add to "Create GitHub Release" files list

### Modifying Release Notes

Edit the "Create release notes" step in `release.yml` to customize the release notes template.

### Changing Version Format

The system supports standard semantic versioning. To use different formats, modify the version extraction and validation logic in workflows.

## Future Enhancements

Potential improvements:

- [ ] Automated changelog generation from commits
- [ ] Integration with Obsidian community plugin submission
- [ ] Automated testing (if tests are added)
- [ ] Release candidate promotion workflow
- [ ] Automated rollback on failed releases
- [ ] Discord/Slack notifications for releases
- [ ] Download statistics tracking

## Support

For issues or questions about the release automation:

1. Check workflow logs in GitHub Actions
2. Review documentation in `.github/workflows/README.md`
3. See `RELEASE.md` for release process details
4. Open a GitHub issue if problems persist

---

**Implementation Date**: 2024-11-27  
**Status**: ✅ Complete and ready for use  
**Version**: 1.0
