# GitHub Actions Workflows

This directory contains automated workflows for building, versioning, and releasing the Obsidian plugin.

## Workflows

### 1. Build and Validate (`build.yml`)

**Trigger:** Push to main branches and pull requests

**Purpose:** Validates that the plugin builds successfully and all required artifacts are generated.

**What it does:**
- Installs dependencies
- Runs TypeScript type checking
- Builds the plugin with esbuild
- Validates manifest.json structure
- Checks version consistency between package.json and manifest.json
- Uploads build artifacts for review

**Use case:** Automatically runs on every push and PR to ensure code quality.

---

### 2. Version Bump (`version-bump.yml`)

**Trigger:** Manual workflow dispatch

**Purpose:** Bumps the plugin version in package.json, manifest.json, and versions.json.

**What it does:**
- Allows selection of version bump type (patch, minor, major, prerelease, or custom)
- Updates version in package.json
- Runs version-bump.mjs to sync manifest.json and versions.json
- Commits and pushes the version changes

**How to use:**
1. Go to **Actions** tab in GitHub
2. Select **Version Bump** workflow
3. Click **Run workflow**
4. Choose version bump type:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `prerelease` - Pre-release versions (1.0.0 → 1.0.1-0)
   - `custom` - Specify exact version (e.g., 1.0.0-beta.3)
5. If using custom, enter the version number

**Note:** This only bumps the version. To create a release, use the Release workflow.

---

### 3. Release Obsidian Plugin (`release.yml`)

**Trigger:** 
- Push of git tags (automatic)
- Manual workflow dispatch

**Purpose:** Builds the plugin and creates a GitHub release with all required artifacts.

**What it does:**
- Builds the plugin in production mode
- Generates checksums for all artifacts
- Creates comprehensive release notes
- Uploads artifacts to GitHub Releases:
  - `main.js` - Bundled plugin code
  - `manifest.json` - Plugin metadata
  - `styles.css` - Plugin styles (if present)
  - `versions.json` - Version compatibility mapping
  - `checksums.txt` - SHA256 checksums
- Marks pre-release versions (alpha, beta, rc) appropriately
- Updates 'latest' tag for stable releases

**How to use:**

#### Option A: Tag-based Release (Recommended)
```bash
# After bumping version with the Version Bump workflow or manually:
git tag 1.0.0
git push origin 1.0.0
```
The workflow will automatically trigger and create the release.

#### Option B: Manual Workflow Dispatch
1. Go to **Actions** tab in GitHub
2. Select **Release Obsidian Plugin** workflow
3. Click **Run workflow**
4. Enter the version to release (e.g., `1.0.0` or `1.0.0-beta.3`)
5. The workflow will:
   - Update the version in all files
   - Commit and push the changes
   - Create the tag
   - Build and release

---

## Complete Release Process

### For Regular Releases:

1. **Bump Version:**
   ```bash
   # Using GitHub Actions (recommended)
   # Go to Actions → Version Bump → Run workflow → Select bump type
   
   # Or manually via npm
   npm version patch  # or minor, major
   git push
   ```

2. **Create Release:**
   ```bash
   # Get the new version from package.json
   git tag $(node -p "require('./package.json').version")
   git push origin <tag-name>
   ```

3. **Automatic Release:**
   - The Release workflow triggers automatically
   - Wait for the workflow to complete
   - Release will be available under GitHub Releases

### For Beta Releases:

```bash
# Bump to beta version
npm version 1.0.0-beta.1 --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: bump version to 1.0.0-beta.1"
git push

# Create and push tag
git tag 1.0.0-beta.1
git push origin 1.0.0-beta.1
```

Or use the **Version Bump** workflow with "custom" option and enter `1.0.0-beta.1`.

---

## Release Artifacts

Each release includes:

1. **main.js** - The bundled plugin code (required)
2. **manifest.json** - Plugin metadata (required)
3. **styles.css** - Plugin styles (optional, if present)
4. **versions.json** - Maps plugin versions to minimum Obsidian versions
5. **checksums.txt** - SHA256 checksums for verification

---

## Version Numbering

This plugin follows [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (1.X.0): New features, backward compatible
- **Patch** (1.0.X): Bug fixes, backward compatible
- **Pre-release** (1.0.0-beta.1): Testing versions

---

## Obsidian Community Plugin Requirements

According to Obsidian's requirements:

1. ✅ Git tags must **NOT** include a leading `v` (use `1.0.0`, not `v1.0.0`)
2. ✅ Release tag must exactly match the version in `manifest.json`
3. ✅ Required files must be attached as individual assets to the release:
   - `main.js`
   - `manifest.json`
   - `styles.css` (if present)
4. ✅ The plugin `id` in manifest.json must never change after first release
5. ✅ `versions.json` should map each plugin version to minimum Obsidian version

All workflows in this repository comply with these requirements.

---

## Troubleshooting

### Build Failures

If the build workflow fails:
1. Check the workflow logs in the Actions tab
2. Fix any TypeScript errors or linting issues
3. Run `npm run build` locally to test
4. Commit and push fixes

### Version Mismatch

If you see version mismatch errors:
```bash
npm version <version> --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: sync versions"
git push
```

### Release Failed

If a release workflow fails:
1. Check the workflow logs
2. Delete the tag if it was created: `git tag -d <tag> && git push origin :refs/tags/<tag>`
3. Fix the issue
4. Re-run the release process

---

## Manual Release (Without Workflows)

If you need to create a release manually:

```bash
# 1. Build the plugin
npm run build

# 2. Verify artifacts
ls -lh main.js manifest.json styles.css

# 3. Create a GitHub release
# - Go to Releases → Draft a new release
# - Tag: version from manifest.json (e.g., 1.0.0)
# - Upload: main.js, manifest.json, styles.css, versions.json
# - Publish release
```

---

## Security

- The workflows use `GITHUB_TOKEN` which is automatically provided
- No additional secrets are required
- All workflows run in isolated GitHub-hosted runners
- Build artifacts are only uploaded to GitHub Releases

---

## Contributing

When modifying workflows:
1. Test changes in a fork first
2. Ensure all Obsidian plugin requirements are met
3. Update this README if workflow behavior changes
4. Follow GitHub Actions best practices
