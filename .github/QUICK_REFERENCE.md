# Quick Reference - Release Automation

Fast reference for common tasks with the automated release system.

## 🚀 Create a Release

### Option 1: GitHub Actions (Recommended)
1. Go to **Actions** → **Release Obsidian Plugin**
2. Click **Run workflow**
3. Enter version (e.g., `1.0.0`)
4. Done! ✅

### Option 2: Git Tags
```bash
npm version patch                                              # Bump version
git push                                                       # Push changes
git push origin $(node -p "require('./package.json').version") # Push tag
```

## 📦 Version Bumping

### Using GitHub Actions
1. Go to **Actions** → **Version Bump**
2. Click **Run workflow**
3. Select bump type or enter custom version

### Using npm
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
git push
```

### Beta Versions
```bash
npm version 1.0.0-beta.1 --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: bump to 1.0.0-beta.1"
git push
git tag 1.0.0-beta.1
git push origin 1.0.0-beta.1
```

## ✅ Pre-Release Checklist

```bash
npm run prepare-release  # Runs all checks
```

Or manually:
- [ ] All changes committed
- [ ] `npm run build` succeeds
- [ ] `npx tsc -noEmit` passes
- [ ] `npx eslint src/` passes
- [ ] Tested in Obsidian
- [ ] CHANGELOG.md updated
- [ ] Version bumped

## 📋 Workflow Status

Check workflow runs: **Actions** tab → Select workflow

## 🐛 Common Issues

### Build fails
```bash
npm ci                  # Reinstall dependencies
npm run build          # Test build locally
npx tsc -noEmit        # Check for type errors
```

### Version mismatch
```bash
npm version <version> --no-git-tag-version
git add package.json manifest.json versions.json
git commit -m "chore: sync versions"
```

### Tag already exists
```bash
git tag -d 1.0.0                    # Delete local tag
git push origin :refs/tags/1.0.0    # Delete remote tag
npm version <new-version>           # Bump to new version
```

## 📁 Release Artifacts

Every release includes:
- `main.js` - Plugin code (required)
- `manifest.json` - Metadata (required)
- `styles.css` - Styles (optional)
- `versions.json` - Compatibility map
- `checksums.txt` - SHA256 checksums

## 🔗 Important Links

- **Workflows**: `.github/workflows/`
- **Full Guide**: `RELEASE.md`
- **Contributing**: `CONTRIBUTING.md`
- **Changelog**: `CHANGELOG.md`

## 📞 Getting Help

1. Check workflow logs in Actions tab
2. Review `.github/workflows/README.md`
3. See `RELEASE.md` for detailed steps
4. Open an issue if stuck

## ⚡ Emergency Release

Need to release quickly?

```bash
npm run prepare-release              # Validate
npm version patch                    # Bump version
git push origin main                 # Push changes
git tag $(node -p "require('./package.json').version")
git push origin $(node -p "require('./package.json').version")
```

## 🎯 Version Rules

- **Stable**: `1.0.0`, `1.1.0`, `2.0.0`
- **Beta**: `1.0.0-beta.1`, `1.0.0-beta.2`
- **Alpha**: `1.0.0-alpha.1`
- **RC**: `1.0.0-rc.1`

Pre-releases are automatically marked on GitHub.

## 🔒 Obsidian Requirements

✅ No `v` prefix in tags (use `1.0.0`, not `v1.0.0`)  
✅ Tag must match manifest.json version exactly  
✅ All artifacts must be attached to release  
✅ Plugin ID must never change after first release

---

**Keep this reference handy for quick access to release commands!**
