# Git & GitHub Setup Guide

This guide walks you through setting up Git, GitHub, and pushing your JustQuick MVP project to production.

---

## 📋 Prerequisites

- [Git installed](https://git-scm.com/downloads)
- [GitHub account](https://github.com/signup)
- Project ready locally
- Terminal/Command Prompt access

**Verify Git installed:**
```bash
git --version
# Should show: git version 2.40.0 or higher
```

---

## 🔑 Step 1: Configure Git

### 1.1 Set Global User Info

This identifies your commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**Verify configuration:**
```bash
git config --list
# Should show:
# user.name=Your Name
# user.email=your@email.com
```

### 1.2 Setup SSH Key (Recommended)

Allows pushing without entering password each time:

**Check for existing key:**
```bash
ls -la ~/.ssh/id_rsa.pub  # Mac/Linux
# or
dir %userprofile%\.ssh    # Windows
```

**Generate new key (if needed):**
```bash
ssh-keygen -t ed25519 -C "your@email.com"
# Press Enter for default location
# Set passphrase (or leave empty)
```

**Add to SSH agent:**

Mac/Linux:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

Windows (Git Bash):
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

**Add key to GitHub:**

1. Copy SSH key:
```bash
# Mac/Linux
cat ~/.ssh/id_rsa.pub | pbcopy

# Windows
type %userprofile%\.ssh\id_rsa.pub | clip
```

2. Go to GitHub Settings → SSH and GPG keys
3. Click "New SSH key"
4. Paste key, save

**Test connection:**
```bash
ssh -T git@github.com
# Should show: "Hi username! You've successfully authenticated..."
```

---

## 📂 Step 2: Initialize Local Repository

### 2.1 Navigate to Project

```bash
cd path/to/justquick-delivery
# Example: cd f:/hyperlocaldeliverymvp2
```

### 2.2 Initialize Git

```bash
git init
```

**Check status:**
```bash
git status
# On branch master
# No commits yet
# Changes to be committed:
#   new file: package.json
#   new file: README.md
#   ...
```

### 2.3 Create Initial Commit

```bash
# Stage all files
git add .

# Create commit
git commit -m "Initial commit: JustQuick MVP - Production ready

- Next.js 15.5.7 with React 19.1.0
- Supabase authentication (magic links)
- Tailwind CSS with dark/light mode
- Responsive design
- Ready for deployment"
```

**View commits:**
```bash
git log --oneline
# 1a2b3c4 Initial commit: JustQuick MVP - Production ready
```

---

## 🌐 Step 3: Create GitHub Repository

### 3.1 Create New Repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `justquick-delivery`
3. **Description**: `Hyperlocal delivery platform - 9 minute delivery`
4. **Visibility**: Public (for free Vercel hosting)
5. **Initialize with**: Nothing (we already have code)
6. Click **"Create repository"**

### 3.2 Copy Repository URL

Choose one (SSH recommended):

```
SSH: git@github.com:yourusername/justquick-delivery.git
HTTPS: https://github.com/yourusername/justquick-delivery.git
```

---

## 🔗 Step 4: Connect Local to GitHub

### 4.1 Add Remote

Using SSH:
```bash
git remote add origin git@github.com:yourusername/justquick-delivery.git
```

Or using HTTPS:
```bash
git remote add origin https://github.com/yourusername/justquick-delivery.git
```

**Verify remote:**
```bash
git remote -v
# origin  git@github.com:yourusername/justquick-delivery.git (fetch)
# origin  git@github.com:yourusername/justquick-delivery.git (push)
```

### 4.2 Rename Branch (if needed)

GitHub uses `main` by default:

```bash
# Check current branch
git branch
# * master

# Rename to main
git branch -M main
```

---

## 🚀 Step 5: Push to GitHub

### 5.1 Initial Push

```bash
git push -u origin main
# -u sets upstream, so future pushes just need "git push"
```

**You might see:**
- GitHub verification prompt → Approve
- New window opens → Authorize
- Password/token needed → Provide

### 5.2 Verify on GitHub

Visit: `https://github.com/yourusername/justquick-delivery`

Check:
- [ ] All files visible
- [ ] Code shows in browser
- [ ] README.md displays
- [ ] .gitignore working (no .env files shown)

---

## 📝 Step 6: Daily Workflow

### Making Changes

```bash
# 1. Make changes in editor
# 2. Check what changed
git status

# 3. Stage specific files
git add src/components/MyComponent.tsx
# Or stage all
git add .

# 4. Create commit
git commit -m "feat: add new feature description"

# 5. Push to GitHub
git push
```

### Feature Branches

```bash
# Create new branch
git checkout -b feature/add-payment-system

# Make changes...
git add .
git commit -m "feat: add Stripe payment integration"

# Push branch
git push origin feature/add-payment-system

# Create Pull Request on GitHub
# When merged, delete branch

# Back to main
git checkout main
git pull origin main
```

---

## 🔄 Step 7: Collaboration Workflow

### If Working with Team

```bash
# Get latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit
git commit -m "feat: your changes"

# Push to GitHub
git push origin feature/your-feature

# On GitHub:
# - Create Pull Request
# - Request review
# - Address feedback
# - Merge when approved
```

### Handling Conflicts

If someone else pushed changes:

```bash
# Pull latest
git pull origin main
# CONFLICT (content merge) in file.tsx

# Open file and resolve conflict markers
# Then:
git add file.tsx
git commit -m "Resolve merge conflict"
git push origin feature/your-feature
```

---

## 🔍 Useful Git Commands

### View History

```bash
# See all commits
git log

# See concise history
git log --oneline

# See changes in last commit
git show

# See who changed each line
git blame src/file.tsx
```

### Undo Changes

```bash
# Undo uncommitted changes
git checkout -- src/file.tsx

# Unstage a file
git reset src/file.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a commit (create new commit undoing changes)
git revert abc1234
```

### Stash Changes

```bash
# Save changes temporarily
git stash

# List stashed changes
git stash list

# Restore stashed changes
git stash pop

# Delete stashed changes
git stash drop
```

### Branching

```bash
# List branches
git branch

# List remote branches
git branch -r

# Create branch
git branch feature/new-feature

# Switch branch
git checkout feature/new-feature

# Create and switch (shorthand)
git checkout -b feature/new-feature

# Delete branch
git branch -D feature/completed-feature

# Delete remote branch
git push origin --delete feature/completed-feature
```

---

## 🛡️ Security Best Practices

### Never Commit Secrets

**Check what's being committed:**
```bash
git diff --cached
# Review changes before commit
```

**If accidentally committed:**
```bash
# Remove from history
git rm --cached .env.local
git commit -m "Remove sensitive file"

# If already pushed, rotate all secrets!
```

### Verify .gitignore

```bash
# Check if file is ignored
git status --ignored

# Verify .env files not tracked
git ls-files | grep .env
# Should show: nothing
```

### Sign Commits (Optional)

```bash
# Generate GPG key first
gpg --full-generate-key

# Then sign commits
git commit -S -m "Your message"

# Sign all commits by default
git config --global commit.gpgsign true
```

---

## 🚀 Publishing to GitHub Pages (Optional)

For documentation site:

```bash
# Create gh-pages branch
git checkout --orphan gh-pages

# Add documentation
echo "# JustQuick Documentation" > index.html

# Commit and push
git add .
git commit -m "Add GitHub Pages"
git push origin gh-pages

# Enable in Settings → Pages → Source: gh-pages
```

---

## 🔗 GitHub Profile Setup (Optional)

### Add Repository Badge to README

```markdown
# JustQuick MVP

[![GitHub](https://img.shields.io/badge/GitHub-justquick--delivery-blue)](https://github.com/yourusername/justquick-delivery)
[![Deploy](https://img.shields.io/badge/Deployed-Vercel-success)](https://justquick-delivery.vercel.app)
```

### Setup GitHub Discussions (Optional)

1. Settings → Discussions
2. Enable discussions
3. Post updates, get community feedback

### Setup Issues (Optional)

1. Settings → Issues
2. Enable issue templates
3. Create template for bug reports, features

---

## ✅ Quick Reference Checklist

- [ ] Git installed (`git --version`)
- [ ] Git configured (`git config --list`)
- [ ] SSH key setup and added to GitHub
- [ ] Local repo initialized (`git init`)
- [ ] Initial commit created
- [ ] GitHub repo created (public)
- [ ] Remote added (`git remote -v`)
- [ ] Code pushed to GitHub (`git push`)
- [ ] README visible on GitHub
- [ ] .env files NOT visible (ignored)
- [ ] Ready to deploy to Vercel

---

## 📞 Troubleshooting

### "Permission denied (publickey)"

**Solution:**
```bash
# Verify SSH key added to GitHub
ssh -T git@github.com

# If not working, add key to agent
ssh-add ~/.ssh/id_rsa
```

### "fatal: 'origin' does not appear to be a git repository"

**Solution:**
```bash
# Verify you're in project folder
cd path/to/justquick-delivery

# Add remote
git remote add origin git@github.com:yourusername/justquick-delivery.git
```

### "Everything up-to-date"

**This means:**
- No new commits since last push
- Create commits to push: `git commit -m "Your message"`

### "Detached HEAD state"

**Solution:**
```bash
# Go back to main
git checkout main

# Or create new branch from current state
git checkout -b recovery-branch
```

### Large files rejected

**Solution:**
```bash
# Check for large files
git log --all --pretty=format: --diff-filter=D --name-only | sort -u

# Remove large files or use Git LFS
git lfs install
git lfs track "*.psd"  # For large files
```

---

## 📚 Learn More

- [GitHub Learning Lab](https://lab.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub Skills](https://skills.github.com/)

---

## 🎉 Next Steps

After pushing to GitHub:
1. ✅ Code on GitHub
2. → Deploy to Vercel (see DEPLOYMENT_GUIDE.md)
3. → Setup GitHub Actions CI/CD (.github/workflows/ci-cd.yml)
4. → Invite collaborators (Settings → Collaborators)
5. → Enable branch protection (Settings → Branches)

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Status**: Ready to Push ✅

Happy coding! 🚀
