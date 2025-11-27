#!/bin/bash

# Prepare Release Script
# This script helps prepare the plugin for release by running checks and building

set -e  # Exit on error

echo "🚀 Preparing Item Manager for release..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
MANIFEST_VERSION=$(node -p "require('./manifest.json').version")

echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Check version consistency
if [ "$CURRENT_VERSION" != "$MANIFEST_VERSION" ]; then
    echo -e "${YELLOW}⚠️  Warning: Version mismatch!${NC}"
    echo "   package.json: $CURRENT_VERSION"
    echo "   manifest.json: $MANIFEST_VERSION"
    echo ""
    echo "Run 'npm version <version>' to sync versions"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -f main.js main.js.map
echo -e "${GREEN}✓${NC} Clean complete"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --silent
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Type check
echo "🔍 Running type check..."
if npx tsc -noEmit; then
    echo -e "${GREEN}✓${NC} Type check passed"
else
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi
echo ""

# Lint
echo "🔍 Running linter..."
if npx eslint src/ --ext .ts,.tsx; then
    echo -e "${GREEN}✓${NC} Linting passed"
else
    echo -e "${RED}❌ Linting failed${NC}"
    exit 1
fi
echo ""

# Build
echo "🔨 Building plugin..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Verify artifacts
echo "✅ Verifying build artifacts..."

if [ ! -f "main.js" ]; then
    echo -e "${RED}❌ Error: main.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} main.js found ($(wc -c < main.js | numfmt --to=iec-i --suffix=B))"

if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} manifest.json found"

if [ -f "styles.css" ]; then
    echo -e "${GREEN}✓${NC} styles.css found ($(wc -c < styles.css | numfmt --to=iec-i --suffix=B))"
fi

if [ ! -f "versions.json" ]; then
    echo -e "${RED}❌ Error: versions.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} versions.json found"

echo ""

# Validate manifest
echo "🔍 Validating manifest.json..."
PLUGIN_ID=$(node -p "require('./manifest.json').id")
PLUGIN_NAME=$(node -p "require('./manifest.json').name")
MIN_APP_VERSION=$(node -p "require('./manifest.json').minAppVersion")

if [ -z "$PLUGIN_ID" ] || [ "$PLUGIN_ID" == "undefined" ]; then
    echo -e "${RED}❌ Error: manifest.json missing 'id' field${NC}"
    exit 1
fi

if [ -z "$PLUGIN_NAME" ] || [ "$PLUGIN_NAME" == "undefined" ]; then
    echo -e "${RED}❌ Error: manifest.json missing 'name' field${NC}"
    exit 1
fi

if [ -z "$MIN_APP_VERSION" ] || [ "$MIN_APP_VERSION" == "undefined" ]; then
    echo -e "${RED}❌ Error: manifest.json missing 'minAppVersion' field${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Manifest validation passed"
echo ""

# Generate checksums
echo "🔐 Generating checksums..."
mkdir -p release-temp
cp main.js manifest.json versions.json release-temp/
if [ -f "styles.css" ]; then
    cp styles.css release-temp/
fi

cd release-temp
sha256sum * > checksums.txt
cat checksums.txt
cd ..
rm -rf release-temp
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Release preparation complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Plugin: $PLUGIN_NAME"
echo "Version: $CURRENT_VERSION"
echo "ID: $PLUGIN_ID"
echo "Min Obsidian: $MIN_APP_VERSION"
echo ""
echo "Next steps:"
echo "  1. Test the plugin in Obsidian"
echo "  2. Update CHANGELOG.md"
echo "  3. Commit any changes"
echo "  4. Create a release:"
echo "     • Use GitHub Actions workflow, or"
echo "     • Run: git tag $CURRENT_VERSION && git push origin $CURRENT_VERSION"
echo ""
