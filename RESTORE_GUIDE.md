# Git Restore Guide - Progressive File Restoration

## Your Current Changes
- **Modified**: `app/(teacher)/_layout.tsx`
- **Deleted**: `app/(teacher)/dashboard.tsx` 
- **Modified**: `app/register-student.tsx`
- **Modified**: `app/register-teacher.tsx`
- **New**: `app/(teacher)/dashboard/` directory (untracked)

## How to Restore Progressively

### 1. See what changed in a specific file:
```bash
git diff HEAD -- MusicOnTheGo/frontend/app/(teacher)/_layout.tsx
```

### 2. Restore ONE file at a time (to last commit state):
```bash
# Restore _layout.tsx to last commit
git restore MusicOnTheGo/frontend/app/(teacher)/_layout.tsx

# Restore register-student.tsx
git restore MusicOnTheGo/frontend/app/register-student.tsx

# Restore register-teacher.tsx
git restore MusicOnTheGo/frontend/app/register-teacher.tsx
```

### 3. Restore the deleted dashboard.tsx file:
```bash
git restore MusicOnTheGo/frontend/app/(teacher)/dashboard.tsx
```

### 4. See the last commit version of a file:
```bash
git show HEAD:MusicOnTheGo/frontend/app/(teacher)/_layout.tsx
```

### 5. Compare current vs last commit for all files:
```bash
git diff HEAD
```

## Step-by-Step Process

1. **First, see what you changed:**
   ```bash
   git diff HEAD
   ```

2. **Restore files one by one, testing after each:**
   ```bash
   git restore <file-path>
   ```

3. **If you want to keep the new dashboard/ directory**, just don't delete it manually.

4. **If you restore dashboard.tsx, you may want to delete the dashboard/ directory:**
   ```bash
   rm -rf MusicOnTheGo/frontend/app/(teacher)/dashboard/
   ```

## Safety: Create a backup branch first
```bash
git branch backup-current-work
```
This creates a branch with your current state, so you can always come back to it!





