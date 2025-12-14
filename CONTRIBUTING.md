# Contributing to Pebbledash

Thank you for your interest in contributing to Pebbledash! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18.18 or higher
- pnpm 8.15.0 or higher

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/pebbledash.git
   cd pebbledash
   ```

2. Install dependencies:
   ```bash
   pnpm -w install
   ```

3. Build all packages:
   ```bash
   pnpm build
   ```

4. Run tests to verify setup:
   ```bash
   pnpm test
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run unit and integration tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm e2e` | Run end-to-end tests |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix auto-fixable lint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm demo:fast` | Start the demo app |
| `pnpm typecheck` | Run TypeScript type checking |

## Code Style

This project uses ESLint and Prettier for code formatting. Configuration is defined in:
- `eslint.config.js` - ESLint rules
- `.prettierrc` or Prettier defaults

### Key Style Guidelines

- Use TypeScript with strict mode enabled
- Prefer `async/await` over promise chains
- Use meaningful variable and function names
- Add JSDoc comments to public APIs
- Keep functions focused and reasonably sized

### Running Linters

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

## Project Structure

```
pebbledash/
├── packages/
│   ├── core/           # Headless layout engine (no DOM)
│   ├── renderer-dom/   # Vanilla DOM renderer
│   ├── react/          # React bindings
│   ├── web-component/  # Web Component wrapper
│   └── devtools/       # Development tools
├── apps/
│   └── demo/           # Demo application
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── performance/    # Performance benchmarks
├── e2e/
│   └── playwright/     # End-to-end tests
└── docs/               # Documentation
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-widget-system` - New features
- `fix/resize-edge-calculation` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/split-large-file` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

Examples:
```
feat(core): add tile grouping support
fix(renderer-dom): correct resize handle positioning
docs(readme): add installation instructions
```

## Testing Requirements

### Before Submitting a PR

1. **All tests must pass:**
   ```bash
   pnpm test
   ```

2. **Type checking must pass:**
   ```bash
   pnpm typecheck
   ```

3. **Linting must pass:**
   ```bash
   pnpm lint
   ```

### Writing Tests

- Place unit tests alongside source files or in `tests/unit/`
- Integration tests go in `tests/integration/`
- E2E tests go in `e2e/playwright/`
- Use descriptive test names that explain the expected behavior
- Test edge cases and error conditions

Example test structure:
```typescript
describe('DashboardModel', () => {
  describe('splitTile', () => {
    it('splits tile vertically at specified ratio', async () => {
      // Test implementation
    });

    it('rejects split when tile is locked', async () => {
      // Test implementation
    });
  });
});
```

## Pull Request Process

1. **Create a feature branch** from `main`

2. **Make your changes** following the code style guidelines

3. **Write or update tests** as needed

4. **Update documentation** if your changes affect the public API

5. **Run the full test suite** to ensure nothing is broken

6. **Submit a pull request** with:
   - Clear title describing the change
   - Description of what was changed and why
   - Reference to any related issues

7. **Address review feedback** promptly

### PR Checklist

- [ ] Tests added/updated and passing
- [ ] TypeScript types are correct
- [ ] Linting passes
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated (for significant changes)

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/Node.js version
- Package versions

### Feature Requests

Include:
- Description of the feature
- Use case / motivation
- Proposed implementation (if any)

## Questions?

If you have questions about contributing, feel free to:
- Open a discussion on GitHub
- Check existing issues and discussions

Thank you for contributing!

