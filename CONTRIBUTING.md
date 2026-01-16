# Contributing to JustQuick MVP

Thank you for your interest in contributing to JustQuick MVP! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Suggesting Features](#suggesting-features)
9. [Testing](#testing)
10. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and constructive
- Welcome different perspectives
- Focus on what is best for the community
- Show empathy toward other contributors

### Unacceptable Behavior

- Harassment, intimidation, or discrimination
- Offensive comments or content
- Unwelcome advances or attention
- Trolling or insulting remarks

**Enforcement:** Report violations to maintainers privately.

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub
# https://github.com/yourusername/justquick-delivery/fork
```

### 2. Clone Your Fork

```bash
git clone https://github.com/yourusername/justquick-delivery.git
cd justquick-delivery
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/yourusername/justquick-delivery.git
git fetch upstream
```

### 4. Install Dependencies

```bash
# Using pnpm (recommended for this project)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 5. Set Up Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Required for development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 6. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Visit: http://localhost:3000

---

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
# Update main from upstream
git checkout main
git fetch upstream
git rebase upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/add-payment-gateway` - New feature
- `fix/login-email-validation` - Bug fix
- `docs/update-readme` - Documentation
- `test/add-component-tests` - Tests
- `refactor/cleanup-auth-logic` - Code refactoring
- `perf/optimize-image-loading` - Performance

### 2. Make Your Changes

```bash
# Edit files in your editor
# Keep commits small and focused
git add .
git commit -m "Clear, descriptive commit message"
```

### 3. Stay Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on main
git rebase upstream/main

# If conflicts, resolve them:
# - Fix conflicts in files
# - git add .
# - git rebase --continue
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Go to https://github.com/yourusername/justquick-delivery
- Click "Create Pull Request"
- Compare: `upstream/main` ← `yourusername/feature/your-feature-name`

---

## 💻 Coding Standards

### TypeScript

**All code must be TypeScript:**
```typescript
// ✅ Correct: Typed variables
const users: User[] = []
const count: number = 0

// ❌ Avoid: Untyped
const users = []
const count = 0
```

### File Structure

```
app/
├── api/              # API routes
├── auth/             # Auth pages
├── (dashboard)/      # Dashboard routes
└── page.tsx          # Home page

components/
├── ui/               # Reusable UI components
├── auth/             # Auth components
├── buyer/            # Buyer features
└── vendor/           # Vendor features

lib/
├── utils.ts          # Utility functions
└── supabase/         # Supabase client

hooks/
└── use-*.ts          # Custom hooks
```

### Component Standards

**Use Functional Components:**
```typescript
// ✅ Correct
export function MyComponent() {
  return <div>Hello</div>
}

// ❌ Avoid: Class components
export class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>
  }
}
```

**Props Typing:**
```typescript
// ✅ Correct: Props interface
interface UserCardProps {
  user: User
  onSelect?: (user: User) => void
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return <div>{user.name}</div>
}

// ❌ Avoid: No types
export function UserCard({ user, onSelect }) {
  return <div>{user.name}</div>
}
```

**Dark Mode Support:**
```typescript
// ✅ Correct: Responsive dark mode
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  Content
</div>

// ❌ Avoid: No dark mode
<div className="bg-white text-slate-900">
  Content
</div>
```

### Naming Conventions

```typescript
// Components: PascalCase
function UserProfile() {}

// Files: kebab-case
// user-profile.tsx

// Variables: camelCase
const userName = "John"
let isActive = true

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_TIMEOUT = 5000

// Booleans: is/has/should prefix
const isLoading = false
const hasError = false
const shouldUpdate = true
```

### Code Style

**Imports (organized):**
```typescript
// ✅ Correct: Organized imports
import React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

// ❌ Avoid: Unorganized imports
import { Button } from '@/components/ui/button'
import React from 'react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
```

**Formatting:**
- Line length: Maximum 100 characters
- Indentation: 2 spaces (configured in prettier)
- Trailing commas: Always
- Semicolons: Always

Run formatter:
```bash
pnpm format
# or
npm run format
```

### Comments

**Write clear, helpful comments:**
```typescript
// ✅ Helpful: Explains WHY
// User might not be authenticated if they cleared cookies
const user = await getUser() || null

// ❌ Unhelpful: States the obvious
// Get the user
const user = getUser()

// ✅ Document complex logic
/**
 * Validates email format using RFC 5322
 * @param email - Email address to validate
 * @returns true if valid email format
 */
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Type

Must be one of:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Dependency updates, tooling changes

### Examples

```bash
# Feature
git commit -m "feat: add email verification for new users"

# Bug fix
git commit -m "fix: correct infinite loop in product list"

# Documentation
git commit -m "docs: update deployment guide with Vercel steps"

# Multiple changes (detailed)
git commit -m "feat: implement magic link authentication

- Add magic link sending to email
- Create OTP verification page
- Update auth provider with token handling

Fixes #123"
```

### Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive messages
- Use imperative mood ("add feature" not "added feature")
- Reference issues: "Fixes #123"
- Don't include code review notes in commit

---

## 🔀 Pull Request Process

### Before Creating PR

```bash
# 1. Update your branch
git fetch upstream
git rebase upstream/main

# 2. Run tests
pnpm test

# 3. Run linter
pnpm lint

# 4. Build locally
pnpm build

# 5. Type check
pnpm type-check
```

All must pass ✓

### PR Title Format

```
[type] Brief description

# Examples
[Feature] Add email verification
[Fix] Correct infinite loop in product list
[Docs] Update deployment guide
```

### PR Description Template

```markdown
## 📝 Description
Brief explanation of changes

## 🎯 Related Issue
Fixes #123

## 🔄 Changes
- Change 1
- Change 2
- Change 3

## 🧪 Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## 📋 Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Build succeeds
```

### Review Process

1. **Automated Checks**
   - Tests must pass
   - Build must succeed
   - Linting must pass

2. **Code Review**
   - At least 1 maintainer review
   - Comments addressed
   - Changes approved

3. **Merge**
   - Squash commits (if needed)
   - Delete branch
   - Reference related issues

---

## 🐛 Reporting Bugs

### Before Reporting

- Search existing issues
- Check latest main branch
- Try to reproduce locally

### Bug Report Template

```markdown
## 📝 Description
Clear description of the bug

## 🔄 Steps to Reproduce
1. First step
2. Second step
3. Bug occurs

## 💡 Expected Behavior
What should happen

## 🐛 Actual Behavior
What actually happens

## 🖥️ Environment
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node version: 18.17
- pnpm version: 8.0

## 📎 Screenshots
If applicable, add screenshots

## 💻 Code Sample
```typescript
// Minimal code to reproduce
const result = buggyFunction()
```

## 🔍 Possible Solution
If you have ideas...
```

### Creating Issue

1. Go to https://github.com/yourusername/justquick-delivery/issues
2. Click "New Issue"
3. Select "Bug Report"
4. Fill in template
5. Click "Submit"

---

## ✨ Suggesting Features

### Before Suggesting

- Search for existing feature requests
- Check project roadmap
- Consider if fits project scope

### Feature Request Template

```markdown
## 🎯 Feature Description
Clear description of desired feature

## 💡 Use Case
Why this feature is needed

## 📝 Example Usage
How users would use this feature

## 🔄 Alternatives Considered
Other ways to solve this

## 📎 Additional Context
Any additional information
```

### Creating Feature Request

1. Go to https://github.com/yourusername/justquick-delivery/issues
2. Click "New Issue"
3. Select "Feature Request"
4. Fill in template
5. Click "Submit"

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Writing Tests

```typescript
// tests/lib/utils.test.ts
import { formatDate } from '@/lib/utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('Jan 15, 2024')
  })

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('')
  })
})
```

### Test Coverage Goals

- Components: 80%+ coverage
- Utilities: 90%+ coverage
- API routes: 85%+ coverage

---

## 📚 Documentation

### When to Document

- New features
- API changes
- Architecture decisions
- Setup/installation changes
- Breaking changes

### Documentation Files

Update when necessary:
- README.md - Project overview
- DEPLOYMENT_GUIDE.md - Deployment instructions
- SECURITY.md - Security guidelines
- Component files - JSDoc comments
- API routes - Inline documentation

### JSDoc Example

```typescript
/**
 * Calculates the total price including tax
 * @param subtotal - Price before tax
 * @param taxRate - Tax rate as decimal (0.1 = 10%)
 * @returns Total price including tax
 * @example
 * const total = calculateTotal(100, 0.1) // Returns 110
 */
function calculateTotal(subtotal: number, taxRate: number): number {
  return subtotal * (1 + taxRate)
}
```

---

## 📞 Need Help?

- **Issues**: GitHub Issues section
- **Discussions**: GitHub Discussions
- **Email**: contributors@yourdomain.com
- **Documentation**: README.md and guides

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 🎉 Recognition

All contributors are recognized in:
- [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- GitHub contributors page
- Monthly team shoutout

---

**Thank you for contributing to JustQuick MVP! 🚀**

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Status**: Active Development ✅
