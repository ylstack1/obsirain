# Item Manager - Obsidian Plugin

A comprehensive, production-ready Obsidian plugin for managing items with full CRUD operations, React-based dashboard, and MDX support.

## Features

### 🎯 Core Functionality

- **Full CRUD Operations**: Create, Read, Update, and Delete items stored as Markdown files
- **Vault Integration**: Items are stored as regular Markdown files with YAML frontmatter
- **Folder Management**: Organize items in folders and subfolders with hierarchical tree view
- **Tag System**: Support for predefined and custom tags with filtering
- **Search**: Real-time search across titles, descriptions, and tags

### 🎨 User Interface

- **React Dashboard**: Modern, responsive dashboard with card-based layout
- **Modal Forms**: Intuitive modal dialogs for adding and editing items
- **Floating Add Button**: Quick access to create new items
- **Tag Filter**: Visual tag filtering with active state indicators
- **Folder Tree**: Hierarchical folder navigation with expand/collapse
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### ⚙️ Technical Features

- **TypeScript**: Fully typed with strict mode enabled
- **React + JSX**: Modern React components with automatic JSX transform
- **ESBuild**: Fast bundling and compilation
- **ESLint**: Code quality and consistency checks
- **Mobile Compatible**: Works on both desktop and mobile Obsidian apps

## Installation

### From GitHub Releases (Recommended)

1. Download the latest release from [GitHub Releases](https://github.com/yaeyintlin199/obsidian-sample-plugin/releases)
2. Extract the following files from the release:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Create a folder called `item-manager` in your vault's `.obsidian/plugins/` directory
4. Copy the downloaded files into the `item-manager` folder
5. Reload Obsidian and enable the plugin in **Settings → Community plugins**

### From Source

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd <vault>/.obsidian/plugins/
   git clone https://github.com/yaeyintlin199/obsidian-sample-plugin.git item-manager
   cd item-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Reload Obsidian and enable the plugin in **Settings → Community plugins**

### Development Mode

For development with hot reload:

```bash
npm run dev
```

This will watch for changes and automatically rebuild the plugin.

## Usage

### Opening the Dashboard

There are multiple ways to open the Item Manager dashboard:

1. **Ribbon Icon**: Click the dashboard icon (📊) in the left ribbon
2. **Command Palette**: 
   - Press `Ctrl/Cmd + P`
   - Search for "Open Item Manager Dashboard"
3. **Sidebar**: The dashboard opens in the right sidebar by default

### Creating Items

1. Click the floating **+** button in the bottom-right corner of the dashboard
2. Or use the command "Add new item" from the command palette
3. Fill in the form:
   - **Title** (required): Name of the item
   - **Description**: Brief description of the item
   - **Folder**: Storage location (defaults to "Items")
   - **Tags**: Comma-separated tags for organization
4. Click **Create** to save the item

### Editing Items

1. Locate the item card in the dashboard
2. Click the **✏️** (edit) button on the card
3. Modify the fields in the modal form
4. Click **Update** to save changes

**Note**: If you change the title or folder, the file will be renamed/moved automatically.

### Deleting Items

1. Click the **🗑️** (delete) button on the item card
2. Confirm the deletion in the dialog
3. The item file will be permanently removed from your vault

### Filtering and Search

**Search Bar**: Type to filter items by title, description, or tags in real-time

**Tag Filter**: 
- Click tags to filter items that have those tags
- Click again to deselect
- Use "Clear all" to remove all tag filters

**Folder Tree**:
- Click folders to show only items in that folder and subfolders
- Click again or use "Show all" to clear the filter

### Settings

Access plugin settings via **Settings → Community plugins → Item Manager**:

- **Default folder**: Set the default folder for new items (default: "Items")
- **Predefined tags**: Comma-separated list of tags for quick selection
- **Enable auto-save**: Automatically save changes when editing items

## File Format

Items are stored as standard Markdown files with YAML frontmatter:

\`\`\`markdown
---
id: item-1700000000000
title: My Project
description: A sample project item
tags: ["project", "important"]
folder: Items/Projects
createdAt: 2024-01-01T00:00:00.000Z
updatedAt: 2024-01-01T12:00:00.000Z
---

# My Project

A sample project item
\`\`\`

### Frontmatter Fields

- `id`: Unique identifier (auto-generated)
- `title`: Item title
- `description`: Item description
- `tags`: Array of tags
- `folder`: Storage folder path
- `createdAt`: Creation timestamp (ISO 8601)
- `updatedAt`: Last update timestamp (ISO 8601)

## Commands

The plugin registers the following commands:

| Command | Description |
|---------|-------------|
| Open Item Manager Dashboard | Opens the dashboard in the sidebar |
| Add new item | Opens the add item modal |
| Refresh items | Reloads all items from the vault |

## Architecture

### Project Structure

\`\`\`
src/
├── main.tsx              # Plugin entry point and lifecycle
├── types.ts              # TypeScript interfaces and types
├── settings.ts           # Settings tab implementation
├── components/           # React components
│   ├── Card.tsx         # Item card component
│   ├── Search.tsx       # Search input component
│   ├── TagFilter.tsx    # Tag filter component
│   ├── FolderTree.tsx   # Folder tree component
│   ├── AddButton.tsx    # Floating add button
│   └── Dashboard.tsx    # Main dashboard component
├── modals/              # Modal dialogs
│   └── ItemModal.tsx    # Add/Edit item modal
├── views/               # Obsidian views
│   └── ItemView.tsx     # Dashboard view wrapper
├── utils/               # Utility functions
│   └── fileManager.ts   # Vault file operations
└── commands/            # Command implementations
    └── index.ts         # Command registration

styles.css               # Plugin styles
manifest.json            # Plugin manifest
\`\`\`

### Key Components

**FileManager** (`utils/fileManager.ts`):
- Handles all vault file operations
- Creates, reads, updates, and deletes item files
- Parses frontmatter and generates Markdown content
- Manages folder creation and file renaming

**Dashboard** (`components/Dashboard.tsx`):
- Main UI component with search, filters, and item grid
- Manages local state for search and filter selections
- Renders item cards with edit/delete actions

**ItemModal** (`modals/ItemModal.tsx`):
- Modal form for creating and editing items
- Validates input and handles submission
- Supports predefined tag selection

**ItemView** (`views/ItemView.tsx`):
- Obsidian view wrapper for the React dashboard
- Manages React root and rendering lifecycle
- Connects dashboard to plugin methods

## Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- Obsidian app for testing

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder

### Build Scripts

\`\`\`bash
# Development mode with watch
npm run dev

# Production build
npm run build

# Lint code
npx eslint src/ --ext .ts,.tsx

# Type check
npx tsc -noEmit
\`\`\`

### Code Quality

The project uses:
- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** configuration via `.editorconfig`

### Testing

Manual testing workflow:

1. Build the plugin with `npm run build`
2. Reload Obsidian
3. Test CRUD operations:
   - Create items with various titles, descriptions, tags, and folders
   - Edit items and verify file updates
   - Delete items and confirm file removal
4. Test filtering:
   - Search by title, description, and tags
   - Filter by tags (single and multiple)
   - Filter by folders
5. Test edge cases:
   - Empty tags and descriptions
   - Special characters in titles
   - Long titles and descriptions
   - Nested folders

## Releases

This project uses automated GitHub Actions workflows for versioning and releasing.

### Creating a Release

**For maintainers:**

1. **Navigate to GitHub Actions** in the repository
2. **Select "Release Obsidian Plugin"** workflow
3. **Click "Run workflow"** and enter the version (e.g., `1.0.0` or `1.0.0-beta.3`)
4. The workflow will automatically:
   - Build the plugin
   - Create a GitHub release
   - Upload all required artifacts

For detailed instructions, see [RELEASE.md](RELEASE.md).

### Release Artifacts

Each release includes:
- `main.js` - Bundled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles
- `versions.json` - Version compatibility mapping
- `checksums.txt` - SHA256 checksums for verification

### Version History

See [GitHub Releases](https://github.com/yaeyintlin199/obsidian-sample-plugin/releases) for the full version history and changelogs.

## Mobile Compatibility

The plugin is fully compatible with Obsidian mobile apps:

- Responsive layout adapts to smaller screens
- Touch-friendly buttons and controls
- No desktop-only APIs used (`isDesktopOnly: false`)
- Tested on iOS and Android

## Troubleshooting

### Items not appearing in dashboard

1. Click the **Refresh** button in the dashboard header
2. Check that item files have valid YAML frontmatter
3. Verify the `id` and `title` fields are present

### Build errors

1. Delete `node_modules` and run `npm install` again
2. Ensure you're using Node.js 18 or higher
3. Check for TypeScript errors with `npx tsc -noEmit`

### Plugin not loading

1. Check that `main.js`, `manifest.json`, and `styles.css` are in the plugin folder
2. Reload Obsidian
3. Enable the plugin in **Settings → Community plugins**
4. Check the developer console (Ctrl/Cmd + Shift + I) for errors

### File operations failing

1. Check vault permissions
2. Ensure target folders exist or can be created
3. Verify file names don't contain invalid characters

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with clear commit messages
4. Ensure code passes linting: `npx eslint src/`
5. Build and test the plugin
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) template
- Uses [React](https://react.dev/) for UI components
- Bundled with [ESBuild](https://esbuild.github.io/)

## Support

For issues, feature requests, or questions:

- **GitHub Issues**: [Report an issue](https://github.com/yaeyintlin199/obsidian-sample-plugin/issues)
- **Discussions**: [Join the discussion](https://github.com/yaeyintlin199/obsidian-sample-plugin/discussions)

---

**Version**: 1.0.0  
**Author**: Your Name  
**Repository**: https://github.com/yaeyintlin199/obsidian-sample-plugin
