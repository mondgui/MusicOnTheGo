# Development Guide

This guide covers development guidelines, feature integration, color schemes, and project cleanup.

---

# ============================================
# FEATURE INTEGRATION SUMMARY
# ============================================

# Feature Integration Summary

This document tracks the integration of features from Figma AI designs into the React Native app.

## Completed Features

### ✅ StudentDashboard
- **Status**: Completed
- **Location**: `app/(student)/dashboard.tsx`
- **Features**:
  - Search functionality
  - Filter by instrument
  - Filter by price range
  - Quick access cards (Progress, Resources, Tools)
  - Real teacher data integration
- **Backend**: Uses `/api/teachers` endpoint

### ✅ UI Components Created
- Card, Input, Button, Avatar, Badge, Select
- **Location**: `components/ui/`

## Pending Features

### 🚧 Student Screens
- `progress-log.tsx` - Practice tracking
- `resources.tsx` - Learning resources
- `practice-tools.tsx` - Metronome, tuner, theory quizzes
- `settings.tsx` - App settings

### 🚧 Teacher Screens
- `student-portfolio.tsx` - View student progress
- `resources.tsx` - Learning resources
- `practice-tools.tsx` - Teaching tools
- `availability.tsx` - Availability management (partially in dashboard)
- `settings.tsx` - App settings

### 🚧 Shared Screens
- `messages.tsx` - Messaging system
- `booking/booking-confirmation.tsx` - Booking confirmation flow

## Notes

- All new screens should follow the established color scheme (#FF9076, #FF6A5C)
- Use existing UI components from `components/ui/`
- Integrate with backend APIs where available
- Replace demo data with real API calls

---

# ============================================
# COLOR SCHEME UPDATE GUIDE
# ============================================

# Color Scheme Update Guide

## Current Color Palette

The app uses a coral/peach color scheme:

- **Primary Coral**: `#FF9076`
- **Primary Red**: `#FF6A5C`
- **Background**: `#FFF5F3` (light peach)
- **White**: `#FFFFFF`
- **Text Dark**: `#333333`
- **Text Medium**: `#666666`
- **Text Light**: `#999999`

## Usage

Colors are defined in `styles/colors.ts`. Import and use them consistently:

```typescript
import { colors } from '../styles/colors';

// Usage
<View style={{ backgroundColor: colors.primaryCoral }} />
```

## Gradient Usage

For gradients, use the primary colors:

```typescript
<LinearGradient colors={["#FF9076", "#FF6A5C"]} />
```

## Status Colors

- **Success**: `#D6FFE1` (light green)
- **Warning**: `#FFF3C4` (light yellow)
- **Error**: Use primary red `#FF6A5C`

---

# ============================================
# PROJECT CLEANUP GUIDE
# ============================================

# Project Cleanup Guide

## Files Safe to Delete (Default Expo Template Files)

These files came with the Expo template and are not being used in your app:

### Components (Default Template)
- ✅ `components/external-link.tsx` - Not used anywhere
- ✅ `components/hello-wave.tsx` - Not used anywhere  
- ✅ `components/haptic-tab.tsx` - Not used anywhere
- ✅ `components/parallax-scroll-view.tsx` - Not used anywhere
- ✅ `components/themed-text.tsx` - Only used in `modal.tsx` (which is also unused)
- ✅ `components/themed-view.tsx` - Only used in `modal.tsx` (which is also unused)
- ✅ `components/feedback/` - Empty directory
- ✅ `components/layout/` - Empty directory

### App Files (Default Template)
- ✅ `app/modal.tsx` - Default modal screen, not used in your app

### Assets (Default Template Images)
- ✅ `assets/images/partial-react-logo.png` - Default Expo logo
- ✅ `assets/images/react-logo.png` - Default Expo logo
- ✅ `assets/images/react-logo@2x.png` - Default Expo logo
- ✅ `assets/images/react-logo@3x.png` - Default Expo logo

### Directories (Empty)
- ✅ `constants/` - Empty directory

## Files to KEEP (Your App Files)

### Components You Created
- ✅ `components/ui/` - All your custom UI components (avatar, badge, button, card, etc.)

### App Files You Created
- ✅ All files in `app/(auth)/` - Your authentication screens
- ✅ All files in `app/(student)/` - Your student screens
- ✅ All files in `app/(teacher)/` - Your teacher screens
- ✅ All files in `app/booking/` - Your booking flow
- ✅ All files in `app/chat/` - Your chat functionality
- ✅ `app/index.tsx` - Your welcome screen
- ✅ `app/messages.tsx` - Your messages screen
- ✅ `app/role-selection.tsx` - Your role selection screen

### Other Important Files
- ✅ `lib/` - Your API, auth, and storage utilities
- ✅ `styles/` - Your color, spacing, and typography constants
- ✅ `hooks/` - Your custom hooks (keep these, they're used)
- ✅ `guidelines/` - Your documentation
- ✅ `scripts/reset-project.js` - Keep this for reference

## How to Clean Up

### Option 1: Manual Deletion (Recommended)
Delete the files listed above manually through your IDE.

### Option 2: Command Line
```bash
cd MusicOnTheGo/frontend

# Delete unused components
rm components/external-link.tsx
rm components/hello-wave.tsx
rm components/haptic-tab.tsx
rm components/parallax-scroll-view.tsx
rm components/themed-text.tsx
rm components/themed-view.tsx
rm -rf components/feedback
rm -rf components/layout

# Delete unused app file
rm app/modal.tsx

# Delete default React logos
rm assets/images/partial-react-logo.png
rm assets/images/react-logo.png
rm assets/images/react-logo@2x.png
rm assets/images/react-logo@3x.png

# Delete empty directories
rmdir constants
```

## Note About themed-text and themed-view

These components are only used in `modal.tsx`. If you delete `modal.tsx`, you can also delete:
- `components/themed-text.tsx`
- `components/themed-view.tsx`

However, if you might use them in the future for theming, you can keep them.

## After Cleanup

After deleting these files, your project should be cleaner and easier to navigate. The remaining files are all part of your actual application.

---

# ============================================
# REACT NATIVE SCREEN ORGANIZATION GUIDE
# ============================================

## 📁 Recommended Structure for MusicOnTheGo

### **Current vs Recommended**

#### ✅ **RECOMMENDED Structure** (Based on Expo Router Best Practices)

```
frontend/
├── app/
│   ├── (auth)/                    # Authentication group
│   │   ├── login.tsx
│   │   ├── register-student.tsx
│   │   ├── register-teacher.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (student)/                 # Student group
│   │   ├── _layout.tsx            # Student navigation layout
│   │   ├── dashboard.tsx          # Main dashboard (with internal tabs)
│   │   ├── progress-log.tsx       # Separate route
│   │   ├── resources.tsx          # Separate route
│   │   ├── practice-tools.tsx     # Separate route
│   │   ├── my-bookings.tsx        # Separate route
│   │   ├── settings.tsx           # Separate route
│   │   └── teacher/
│   │       └── [id].tsx           # Teacher detail
│   │
│   ├── (teacher)/                 # Teacher group
│   │   ├── _layout.tsx            # Teacher navigation layout
│   │   ├── dashboard/
│   │   │   ├── index.tsx          # Main dashboard
│   │   │   └── _tabs/             # Tab components (internal to dashboard)
│   │   │       ├── ScheduleTab.tsx
│   │   │       ├── BookingsTab.tsx
│   │   │       ├── MessagesTab.tsx
│   │   │       ├── TimesTab.tsx
│   │   │       └── ProfileTab.tsx
│   │   ├── student-portfolio.tsx  # Separate route
│   │   ├── resources.tsx          # Separate route
│   │   ├── practice-tools.tsx     # Separate route
│   │   ├── availability.tsx       # Separate route
│   │   └── settings.tsx           # Separate route
│   │
│   ├── booking/                   # Shared booking flow
│   │   ├── booking-confirmation.tsx
│   │   ├── booking-success.tsx
│   │   └── contact-detail.tsx
│   │
│   ├── messages.tsx               # Shared messaging
│   ├── splash.tsx                 # Initial screen
│   └── role-selection.tsx         # Role chooser
│
├── components/
│   ├── ui/                        # 48 UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── tabs.tsx
│   │   ├── alert.tsx
│   │   ├── progress.tsx
│   │   └── ... (40+ more)
│   │
│   ├── layout/                    # Layout components
│   │   ├── bottom-navigation.tsx
│   │   ├── sidebar.tsx
│   │   └── top-header.tsx
│   │
│   └── feedback/                  # Feedback components
│       ├── alert-dialog.tsx
│       ├── toast.tsx
│       └── tooltip.tsx
│
└── lib/
    ├── api.ts
    ├── auth.ts
    └── utils.ts
```

---

## 🎯 **Key Principles**

### **1. When to Use `_tabs/` Directory**

✅ **USE `_tabs/` when:**
- Tabs are **views within a single screen** (not separate routes)
- Tabs share the same header/navigation
- Example: TeacherDashboard with Schedule, Bookings, Messages tabs

❌ **DON'T USE `_tabs/` when:**
- Each tab should be a **separate route** (different URLs)
- Tabs have different navigation contexts
- Example: Student's Progress, Resources, Tools (should be separate files)

---

### **2. When to Use Separate Files**

✅ **USE separate files when:**
- Screen is a **standalone route** (can be navigated to directly)
- Screen has its own navigation context
- Screen can be deep-linked
- Example: `progress-log.tsx`, `resources.tsx`, `settings.tsx`

---

### **3. Expo Router File Naming Conventions**

| Pattern | Purpose | Example |
|---------|---------|---------|
| `(group)/` | Route groups (not in URL) | `(student)/`, `(teacher)/` |
| `_layout.tsx` | Layout wrapper | `(student)/_layout.tsx` |
| `_tabs/` | Tab components (private) | `dashboard/_tabs/ScheduleTab.tsx` |
| `[id].tsx` | Dynamic route | `teacher/[id].tsx` |
| `index.tsx` | Default route | `dashboard/index.tsx` |

---

## 📋 **Recommended Organization Rules**

### **Rule 1: Group by Feature, Not by Type**
```
✅ Good:
app/(student)/progress-log.tsx
app/(student)/resources.tsx

❌ Bad:
app/screens/student/progress-log.tsx
app/components/student/progress-log.tsx
```

### **Rule 2: Use Route Groups for Logical Separation**
```
✅ Good:
app/(student)/dashboard.tsx
app/(teacher)/dashboard/index.tsx

❌ Bad:
app/student-dashboard.tsx
app/teacher-dashboard.tsx
```

### **Rule 3: Keep Tab Components Close to Parent**
```
✅ Good:
app/(teacher)/dashboard/
  ├── index.tsx
  └── _tabs/
      ├── ScheduleTab.tsx
      └── BookingsTab.tsx

❌ Bad:
app/(teacher)/dashboard/index.tsx
components/tabs/ScheduleTab.tsx
```

### **Rule 4: UI Components Go in `components/ui/`**
```
✅ Good:
components/ui/button.tsx
components/ui/card.tsx

❌ Bad:
app/components/button.tsx
components/Button.tsx
```

---

## 💡 **Best Practices Summary**

1. **Route Groups**: Use `(student)/` and `(teacher)/` for logical separation
2. **Tab Components**: Use `_tabs/` for internal dashboard tabs only
3. **Separate Files**: Each standalone screen gets its own file
4. **UI Components**: All reusable components in `components/ui/`
5. **Consistency**: Keep the same pattern for student and teacher

---

# ============================================
# FRONTEND REORGANIZATION SUMMARY
# ============================================

## ✅ Completed Reorganization

### **1. Route Groups Created**
- ✅ `app/(auth)/` - Authentication screens
  - `login.tsx`
  - `register-student.tsx`
  - `register-teacher.tsx`
  - `forgot-password.tsx`
  - `_layout.tsx` (created)

### **2. Student Screens Organized**
- ✅ `app/(student)/dashboard.tsx` - Main dashboard
- ✅ `app/(student)/my-bookings.tsx` - Renamed from `my-lessons.tsx`
- ✅ `app/(student)/book-lesson.tsx` - Book lesson flow
- ✅ `app/(student)/student-profile-setup.tsx` - Profile completion
- ✅ `app/(student)/teacher/[id].tsx` - Teacher detail view

### **3. Teacher Screens Organized**
- ✅ `app/(teacher)/dashboard/index.tsx` - Main dashboard
- ✅ `app/(teacher)/dashboard/_tabs/` - Tab components (kept structure)
- ✅ `app/(teacher)/profile-setup.tsx` - Profile completion

### **4. Booking Flow**
- ✅ `app/booking/` - Booking flow directory
  - `contact-detail.tsx` - Renamed from `inquiry-form.tsx`
  - `booking-success.tsx` - Renamed from `inquiry-success.tsx`
  - `_layout.tsx` (created)

### **5. Root-Level Screens**
- ✅ `app/splash.tsx` - Renamed from `index.tsx`
- ✅ `app/role-selection.tsx` - Renamed from `choose-role.tsx`
- ✅ `app/modal.tsx` - Modal component (to be reviewed)

### **6. Components Structure**
- ✅ `components/ui/` - UI components (6 created so far)
- ✅ `components/layout/` - Directory created (empty, for future use)
- ✅ `components/feedback/` - Directory created (empty, for future use)

### **7. Styles Structure**
- ✅ `styles/colors.ts` - Color definitions (already existed)
- ✅ `styles/spacing.ts` - Spacing constants (created)
- ✅ `styles/typography.ts` - Typography constants (created)

---

## 📁 Final Structure

```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register-student.tsx
│   ├── register-teacher.tsx
│   └── forgot-password.tsx
├── (student)/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── my-bookings.tsx
│   ├── book-lesson.tsx
│   ├── student-profile-setup.tsx
│   └── teacher/[id].tsx
├── (teacher)/
│   ├── _layout.tsx
│   ├── dashboard/
│   │   ├── index.tsx
│   │   └── _tabs/
│   └── profile-setup.tsx
├── booking/
│   ├── _layout.tsx
│   ├── contact-detail.tsx
│   └── booking-success.tsx
├── splash.tsx
├── role-selection.tsx
└── modal.tsx

components/
├── ui/ (6 components created)
├── layout/ (empty, ready for use)
└── feedback/ (empty, ready for use)

styles/
├── colors.ts
├── spacing.ts
└── typography.ts
```

---

## ⚠️ Important Notes

1. **Route Paths Changed**: Some route paths have changed:
   - `/login` → `/(auth)/login`
   - `/choose-role` → `/role-selection`
   - `/my-lessons` → `/my-bookings`
   - `/inquiry-form` → `/booking/contact-detail`

2. **Import Paths**: All relative imports need to be checked and updated

3. **Navigation**: Update all `router.push()` calls to use new paths

4. **Backend**: No backend changes needed - API endpoints remain the same

---

# ============================================
# GIT RESTORE GUIDE
# ============================================

## Progressive File Restoration

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

---

**Last Updated**: Based on current codebase analysis

