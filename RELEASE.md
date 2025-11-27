# Release Guide

This document explains how to create releases for the Item Manager Obsidian plugin using the automated GitHub Actions workflows.

## Quick Start

### Automated Release (Recommended)

The easiest way to create a release:

1. **Navigate to GitHub Actions**
   - Go to your repository on GitHub
   - Click the **Actions** tab

2. **Run Version Bump Workflow** (Optional)
   - Select **Version Bump** workflow
   - Click **Run workflow**
   - Choose bump type or enter custom version
   - Wait for completion

3. **Run Release Workflow**
   - Select **Release Obsidian Plugin** workflow
   - Click **Run workflow**
   - Enter the version to release (e.g., `1.0.0` or `1.0.0-beta.3`)
   - Click **Run workflow** button

4. **Wait for Release**
   - The workflow will automatically:
     - Update version files
     - Build the plugin
     - Create a GitHub release
     - Upload all artifacts
   - Check the **Releases** section for your new release

### Tag-based Release

If you prefer using git tags:

```bash
# 1. Bump version locally
npm version patch  # or: minor, major, 1.0.0-beta.3

# 2. Push changes
git push

# 3. Push the tag
git push origin $(node -p "require('./package.json').version")
```

The Release workflow will automatically trigger when it detects the tag.

---

## Release Types

### Stable Release

For production-ready versions:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### Beta Release

For testing versions:

```bash
npm version 1.0.0-beta.1 --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: bump version to 1.0.0-beta.1"
git push
git tag 1.0.0-beta.1
git push origin 1.0.0-beta.1
```

Or use the **Version Bump** workflow with "custom" option.

---

## What Gets Released

Each release includes these files:

1. **main.js** - Bundled plugin code (minified)
2. **manifest.json** - Plugin metadata
3. **styles.css** - Plugin styles (if present)
4. **versions.json** - Version compatibility map
5. **checksums.txt** - SHA256 checksums for verification

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **1.0.0** - Initial stable release
- **1.0.1** - Patch (bug fixes)
- **1.1.0** - Minor (new features)
- **2.0.0** - Major (breaking changes)
- **1.0.0-beta.1** - Pre-release/beta version

---

## Workflows Overview

### Build and Validate
- **When:** Automatic on every push/PR
- **Purpose:** Ensures code builds successfully
- **Action Required:** None (automatic)

### Version Bump
- **When:** Manual trigger
- **Purpose:** Updates version in all files
- **Action Required:** Choose version bump type

### Release
- **When:** Manual trigger or tag push
- **Purpose:** Creates GitHub release with artifacts
- **Action Required:** Provide version number (manual) or push tag

---

## Detailed Release Process

### Step-by-Step for First-Time Release

1. **Prepare Your Code**
   ```bash
   # Ensure all changes are committed
   git status
   git add .
   git commit -m "feat: prepare for release"
   git push
   ```

2. **Choose Version Number**
   - First release: `1.0.0`
   - Beta: `1.0.0-beta.1`
   - Patch: `1.0.1`

3. **Bump Version**
   - **Option A - GitHub Actions:**
     1. Go to Actions → Version Bump
     2. Run workflow with your version
   
   - **Option B - Command Line:**
     ```bash
     npm version 1.0.0 --no-git-tag-version
     git add package.json manifest.json versions.json
     git commit -m "chore: bump version to 1.0.0"
     git push
     ```

4. **Create Release**
   - **Option A - GitHub Actions:**
     1. Go to Actions → Release Obsidian Plugin
     2. Run workflow with version `1.0.0`
   
   - **Option B - Git Tag:**
     ```bash
     git tag 1.0.0
     git push origin 1.0.0
     ```

5. **Verify Release**
   - Go to GitHub → Releases
   - Download and test `main.js`, `manifest.json`, `styles.css`
   - Verify files work in Obsidian

---

## Testing a Release Locally

Before creating a release, test the build:

```bash
# Build in production mode
npm run build

# Check that main.js is generated
ls -lh main.js

# Copy to your test vault
cp main.js manifest.json styles.css ~/Documents/ObsidianVault/.obsidian/plugins/item-manager/

# Reload Obsidian and test
```

---

## Common Scenarios

### Hotfix Release

For urgent bug fixes:

```bash
# Fix the bug and commit
git add .
git commit -m "fix: critical bug in feature X"
git push

# Bump patch version
npm version patch
git push
git push origin $(node -p "require('./package.json').version")
```

### Feature Release

For new features:

```bash
# Implement feature and commit
git add .
git commit -m "feat: add new feature Y"
git push

# Bump minor version
npm version minor
git push
git push origin $(node -p "require('./package.json').version")
```

### Beta Testing

For testing new versions:

```bash
# Create beta version
npm version 1.1.0-beta.1 --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: release beta version for testing"
git push

# Create release
git tag 1.1.0-beta.1
git push origin 1.1.0-beta.1
```

Beta releases are marked as "pre-release" on GitHub and won't appear as the latest stable version.

---

## Troubleshooting

### "Version already exists"

If you try to create a release with an existing version:

```bash
# Delete the tag locally and remotely
git tag -d 1.0.0
git push origin :refs/tags/1.0.0

# Bump to a new version
npm version patch
```

### "Build failed"

If the build workflow fails:

1. Check the error logs in GitHub Actions
2. Fix the issues locally
3. Run `npm run build` to verify
4. Commit and push fixes
5. Retry the release

### "Artifacts missing"

If release artifacts are missing:

1. Ensure `main.js` is generated after build
2. Check that `manifest.json` and `styles.css` exist
3. Verify esbuild.config.mjs is correct
4. Re-run the release workflow

---

## Manual Release (No Workflows)

If you need to create a release without workflows:

```bash
# 1. Bump version
npm version 1.0.0

# 2. Build
npm run build

# 3. Create GitHub release manually
# - Go to Releases → New release
# - Tag: 1.0.0
# - Title: 1.0.0
# - Upload: main.js, manifest.json, styles.css, versions.json
# - Publish
```

---

## Obsidian Community Plugin Submission

After your first stable release (1.0.0 or higher):

1. **Ensure Release is Live**
   - Verify artifacts are attached to GitHub release
   - Test the plugin manually

2. **Submit to Obsidian**
   - Follow: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
   - Add to: https://github.com/obsidianmd/obsidian-releases

3. **Requirements**
   - Tag must match manifest version exactly
   - No leading `v` in tag names
   - All required files must be present

---

## Best Practices

✅ **Do:**
- Test locally before releasing
- Write clear commit messages
- Follow semantic versioning
- Use beta versions for testing
- Review release notes before publishing

❌ **Don't:**
- Change plugin `id` after first release
- Use `v` prefix in tags (use `1.0.0`, not `v1.0.0`)
- Skip version bumping
- Release directly to production without testing
- Commit `main.js` to the repository

---

## Getting Help

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review the [workflows README](.github/workflows/README.md)
3. Ensure build passes locally: `npm run build`
4. Verify all required files exist

---

## Next Steps

After your first release:

1. ✅ Test the release in Obsidian
2. ✅ Announce to users
3. ✅ Consider submitting to Obsidian community plugins
4. ✅ Plan next features and releases

Happy releasing! 🚀
