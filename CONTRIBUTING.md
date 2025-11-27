# Contributing to Item Manager

Thank you for your interest in contributing to Item Manager! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, constructive, and collaborative. We aim to maintain a welcoming and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Provide detailed information**:
   - Obsidian version
   - Plugin version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or error logs (if applicable)

### Suggesting Features

1. **Search existing issues** to see if the feature has been suggested
2. **Use the feature request template**
3. **Describe the use case** and why the feature would be valuable
4. **Consider implementation** - how might it work?

### Submitting Pull Requests

#### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- Obsidian for testing
- Git for version control

#### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/obsidian-sample-plugin.git
   cd obsidian-sample-plugin
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/yaeyintlin199/obsidian-sample-plugin.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

2. **Make your changes**:
   - Follow existing code style and conventions
   - Write clear, descriptive commit messages
   - Keep commits focused and atomic

3. **Test your changes**:
   ```bash
   # Build the plugin
   npm run build
   
   # Type check
   npx tsc -noEmit
   
   # Lint
   npx eslint src/ --ext .ts,.tsx
   
   # Test in Obsidian vault
   cp main.js manifest.json styles.css <vault>/.obsidian/plugins/item-manager/
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

6. **Create a pull request**:
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit the PR

## Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript with strict mode enabled
- **Naming Conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and React components
  - `UPPER_CASE` for constants
- **Formatting**: Follow the `.editorconfig` settings
- **Imports**: Group and order imports logically

### Project Structure

```
src/
├── main.tsx              # Plugin entry point (keep minimal)
├── types.ts              # Type definitions
├── settings.ts           # Settings implementation
├── components/           # React components
├── modals/              # Modal dialogs
├── views/               # Obsidian views
├── utils/               # Utility functions
└── commands/            # Command implementations
```

### React Components

- Use functional components with hooks
- Keep components focused and reusable
- Extract complex logic to custom hooks or utilities
- Use TypeScript interfaces for props

### File Operations

- Use the `FileManager` utility for vault operations
- Handle errors gracefully
- Provide user feedback for operations
- Validate input before file operations

### Testing

Manual testing checklist:

- [ ] Plugin loads without errors
- [ ] All commands work
- [ ] CRUD operations work correctly
- [ ] Search and filtering work
- [ ] Settings persist correctly
- [ ] Mobile compatibility (if applicable)
- [ ] No console errors or warnings

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

Examples:
```
feat: add tag autocomplete to item modal
fix: resolve issue with folder tree not expanding
docs: update installation instructions
refactor: simplify file manager error handling
```

## Pull Request Process

1. **Fill out the PR template** completely
2. **Ensure all checks pass**:
   - Build succeeds
   - No linting errors
   - No TypeScript errors
3. **Request review** from maintainers
4. **Address feedback** promptly and professionally
5. **Keep PR focused** - one feature/fix per PR
6. **Update documentation** if needed

## Code Review

### What We Look For

- ✅ Code quality and readability
- ✅ Proper error handling
- ✅ TypeScript type safety
- ✅ Performance considerations
- ✅ Mobile compatibility (if applicable)
- ✅ Documentation and comments (where needed)
- ✅ Tests and validation

### Review Process

1. Maintainer reviews code
2. Feedback provided via PR comments
3. Author addresses feedback
4. Additional review if needed
5. PR approved and merged

## Release Process

For maintainers creating releases:

1. **Update version**:
   - Use GitHub Actions "Version Bump" workflow
   - Or manually: `npm version <major|minor|patch>`

2. **Update CHANGELOG.md**:
   - Document all changes since last release
   - Follow Keep a Changelog format

3. **Create release**:
   - Use GitHub Actions "Release Obsidian Plugin" workflow
   - Or manually push a tag

4. **Verify release**:
   - Check GitHub Releases page
   - Download and test artifacts
   - Verify checksums

See [RELEASE.md](RELEASE.md) for detailed release instructions.

## Getting Help

- **Questions?** Open a discussion on GitHub Discussions
- **Bugs?** Open an issue with the bug report template
- **Feature ideas?** Open an issue with the feature request template
- **Development help?** Reach out in discussions

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for their contributions
- GitHub's contributors page

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Item Manager! 🎉
