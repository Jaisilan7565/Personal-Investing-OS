# Git Workflow & Commit Guide — Investor-OS

This document outlines the standard workflow for all future code modifications, linting checks, branch operations, and pull requests in this monorepo.

---

## 1. Daily Development Workflow

Always write code on the `dev` branch. Never commit directly to `main`.

### Step 1: Switch to `dev` and pull updates
Before starting any new work, sync your local environment:
```powershell
git checkout dev
git pull origin dev
```

### Step 2: Write your code
Make changes in `frontend/` or `backend/` as needed. 

### Step 3: Run local lint checks (Optional but recommended)
You can run these manually before committing to catch formatting issues early:
* **Frontend:** `cd frontend && npm run lint`
* **Backend:** `cd backend && npm run lint`

### Step 4: Commit your changes
Stage and commit your changes using **Conventional Commits**:
```powershell
git add .
git commit -m "feat: implement delete confirmation modal on decision log"
```

### Step 5: Push your changes
```powershell
git push origin dev
```
> **What happens behind the scenes?**
> 1. The **local pre-push hook** triggers, running ESLint on both folders. If there are any hard errors, the push is safely blocked.
> 2. Once pushed, **GitHub Actions CI** automatically kicks off in the cloud to build the frontend and verify everything compiles.

---

## 2. Conventional Commit Standards

Always prefix your commit messages with one of these types for a clean, readable project history:

| Prefix | Meaning / Use Case | Example |
| :--- | :--- | :--- |
| `feat:` | A brand new feature | `feat: add mobile support to journal header` |
| `fix:` | A bug fix | `fix: resolve crash on null decision outcome` |
| `chore:` | Tooling, configuration, or dependency updates | `chore: upgrade react-router package` |
| `refactor:` | Code restructuring without behavior changes | `refactor: extract outcome toggles to separate service` |
| `style:` | CSS, layout, spacing, or visual adjustments | `style: update button hover micro-animations` |
| `docs:` | Documentation updates | `docs: add API integration manual` |

---

## 3. How to Release to Production (`main`)

When your features on `dev` are tested, stable, and ready to go live:

1. Go to [github.com/Jaisilan7565/Personal-Investing-OS](https://github.com/Jaisilan7565/Personal-Investing-OS).
2. Click **New Pull Request**.
3. Select `base: main` ← `compare: dev`.
4. Click **Create Pull Request**.
5. The CI Checks will run. Once the checks turn green (meaning lint & build pass successfully), click **Merge Pull Request**!
