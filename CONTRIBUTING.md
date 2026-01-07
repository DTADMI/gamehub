# Contributing to GameHub

Thank you for your interest in contributing to GameHub! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-org/gamehub/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/your-org/gamehub/issues) and [Discussions](https://github.com/your-org/gamehub/discussions)
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Any relevant examples or mockups

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests
5. Ensure all tests pass:
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```
6. Commit your changes following [Conventional Commits](#commit-messages)
7. Push to your fork
8. Open a Pull Request with:
   - Clear description of changes
   - Link to related issue(s)
   - Screenshots/videos if applicable

## Development Setup

See [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

Quick start:

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```
feat(games): add tetris game implementation

Implements classic tetris with:
- Standard tetromino shapes
- Line clearing mechanics
- Score tracking

Closes #123
```

```
fix(api): resolve user authentication timeout

- Increase JWT expiration time
- Add refresh token mechanism
- Update auth middleware

Fixes #456
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused on single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript props interfaces

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing and sizing
- Use design system tokens
- Ensure accessibility (contrast, focus states)

## Testing

### Unit Tests

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('GameEngine', () => {
  it('should initialize with default settings', () => {
    // Arrange
    const engine = new GameEngine();

    // Act
    const settings = engine.getSettings();

    // Assert
    expect(settings.difficulty).toBe('normal');
  });
});
```

### E2E Tests

- Test critical user flows
- Use page object pattern
- Keep tests independent
- Use realistic test data

## Documentation

- Update README for significant changes
- Add JSDoc comments for public APIs
- Update relevant documentation in `docs/`
- Include code examples where helpful

## Project Structure

When adding new code:

- Frontend components: `apps/app/components/`
- Backend modules: `apps/api/src/modules/`
- Shared code: `packages/shared/src/`
- New games: `packages/games/<game-name>/`
- Types: `packages/shared/src/types/`

## Review Process

1. Automated checks must pass (CI)
2. Code review by at least one maintainer
3. All feedback addressed
4. Tests added/updated as needed
5. Documentation updated

## Getting Help

- Check [Documentation](./docs/)
- Search [Issues](https://github.com/your-org/gamehub/issues)
- Ask in [Discussions](https://github.com/your-org/gamehub/discussions)
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation

Thank you for contributing to GameHub! 🎮
