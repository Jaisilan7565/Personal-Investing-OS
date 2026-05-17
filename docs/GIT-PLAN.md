# Git Branch Setup & Dev Push Plan — Investor-OS

> **Status:** Plan only — nothing executed yet.  
> **Git root:** `c:\Users\jaysh\Desktop\MERN Projects\Investor-OS\Web-App\`  
> **Remote:** `https://github.com/Jaisilan7565/Personal-Investing-OS.git`  
> **Current branch:** `main` (only branch that exists)

---

## Current Repo State (already discovered)

```
Branch:   main only (no dev, no fix branches yet)
Remote:   origin → github.com/Jaisilan7565/Personal-Investing-OS
Staged:   nothing
Changes:
  - All OLD root-level files deleted (index.html, src/, etc.) — D status
  - NEW folders untracked: frontend/  backend/
  - .gitignore modified
```

This means the repo still reflects the **old structure** on GitHub. The plan below fixes the gitignore, stages the new monorepo layout, creates branches, and pushes cleanly.

---

## Target Branch Structure

```
origin
  └── main        ← production-ready, branch-protected
       └── dev    ← integration branch, all work lands here
            └── fix/<name>   ← short-lived hotfix branches (created on demand)
```

---

## Step 1 — Fix .gitignore First

The `.gitignore` is modified but not committed. Update it to cover the new structure before staging anything else.

Replace contents of `Web-App/.gitignore` with:

```gitignore
# ── Dependencies ──────────────────────────────────────────────────────────
node_modules/

# ── Build outputs ─────────────────────────────────────────────────────────
frontend/dist/
frontend/.vite/

# ── Environment secrets — NEVER commit ────────────────────────────────────
frontend/.env
frontend/.env.local
backend/.env
backend/.env.local
.env*
!*.env.example

# ── OS / Editor ───────────────────────────────────────────────────────────
.DS_Store
Thumbs.db
*.log
npm-debug.log*
```

> CAUTION: Verify `git status` shows NO `.env` files as untracked before proceeding to step 3.

---

## Step 2 — Create the .githooks/pre-push Quality Gate

Git hooks inside `.git/hooks/` are not committed. Use a `.githooks/` folder that IS committed so every machine gets the same gate.

Create file: `Web-App/.githooks/pre-push` (no file extension)

```bash
#!/bin/sh
set -e

echo ""
echo "========================================"
echo "  PRE-PUSH QUALITY GATE"
echo "========================================"

echo ""
echo "[1/3] Linting frontend..."
cd frontend && npm run lint
cd ..

echo ""
echo "[2/3] Linting backend..."
cd backend && npm run lint
cd ..

echo ""
echo "[3/3] Building frontend (verifying no broken imports)..."
cd frontend && npm run build
cd ..

echo ""
echo "All checks passed. Pushing to GitHub..."
echo ""
```

Then register it — run **once per machine**, not committed:

```powershell
# From Web-App/
git config core.hooksPath .githooks
```

### Verify ESLint lint scripts exist

**frontend** — check `frontend/package.json` already has:

```json
"lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
```

**backend** — if `npm run lint` does not exist, add to `backend/package.json`:

```json
"scripts": {
  "lint": "eslint src/**/*.js"
}
```

And install ESLint for backend if not present:

```powershell
cd backend && npm install --save-dev eslint && npx eslint --init
```

---

## Step 3 — Verify the Build Passes Locally First

Before any commit, run manually:

```powershell
# From Web-App/
cd frontend && npm run build
```

Fix any build errors before continuing. A broken build must not land on `dev`.

---

## Step 4 — Create the GitHub Actions CI Workflow

Create directory + file: `Web-App/.github/workflows/ci.yml`

```yaml
name: CI — Lint & Build

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  frontend:
    name: Frontend — Lint & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

  backend:
    name: Backend — Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint
```

> NOTE: This runs on every push/PR to `main` and `dev`. GitHub shows a green check or red X on each commit. Merges to `main` can be blocked until CI passes (configured in Step 7).

---

## Step 5 — Create `dev` and Stage Everything into an Initial Commit

```powershell
# From Web-App/
git checkout -b dev

# Stage the .gitignore fix, .githooks/, .github/ workflow, and all new folders
git add .gitignore
git add .githooks/
git add .github/
git add frontend/
git add backend/

# Also stage the deletion of old root-level files (they show as D in status)
git add -u

# Safety check — no .env files should appear
git status

# Commit
git commit -m "chore: restructure into frontend/backend monorepo layout, add CI and pre-push hooks"
```

---

## Step 6 — Push `dev` to GitHub

```powershell
git push -u origin dev
```

After this push, GitHub Actions will run the CI workflow automatically on the `dev` branch.
Check progress at: `https://github.com/Jaisilan7565/Personal-Investing-OS/actions`

---

## Step 7 — Push a Clean `main` Too

`main` still has the old file structure on GitHub. Sync it:

```powershell
git checkout main

# Merge dev into main to bring main up to the new structure
git merge dev --no-ff -m "chore: merge initial monorepo restructure from dev into main"

git push origin main
```

---

## Step 8 — Protect `main` on GitHub (UI steps)

1. `github.com/Jaisilan7565/Personal-Investing-OS` → **Settings** → **Branches**
2. **Add branch protection rule**, pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass (select `Frontend — Lint & Build` and `Backend — Lint`)
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

---

## Step 9 — Push Current Feature Changes to `dev`

After the infrastructure commits above, push the actual feature work:

```powershell
git checkout dev

# All feature changes are already in the working tree — just commit
git add frontend/src/
git add backend/src/

git status   # final review

git commit -m "feat: delete confirmation dialog, PATCH outcome endpoint, responsive Decision Log & Journal headers"

git push origin dev
```

GitHub Actions CI runs → watch at `/actions`. Once green, open a PR `dev → main` when ready to release.

---

## Daily Workflow After Setup

```
1. git checkout dev
2. git pull origin dev                  # stay in sync
3. (make changes)
4. npm run lint  &&  npm run build      # local check (pre-push hook does this too)
5. git add . && git commit -m "feat: ..."
6. git push origin dev                  # triggers GitHub Actions CI
7. PR: dev → main when feature is stable
```

### Fix Branch Pattern

```powershell
git checkout dev
git checkout -b fix/describe-the-bug
# ... make fix ...
git commit -m "fix: describe what was broken"
git push origin fix/describe-the-bug
# Open PR: fix/describe-the-bug → dev
```

---

## Conventional Commit Reference

| Prefix      | Use case                             |
| ----------- | ------------------------------------ |
| `feat:`     | New feature                          |
| `fix:`      | Bug fix                              |
| `chore:`    | Config, deps, tooling                |
| `refactor:` | Restructure with no behaviour change |
| `style:`    | CSS / formatting only                |
| `docs:`     | Documentation only                   |
| `ci:`       | GitHub Actions changes               |

---

> APPROVAL REQUIRED before executing any step.
> Steps must be run in order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9.
