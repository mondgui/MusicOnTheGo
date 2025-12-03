# React Native Screen Organization Guide

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
│   │   ├── availability.tsx        # Separate route
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

## 🔄 **Migration Plan for Your App**

### **Phase 1: Standardize Dashboard Structure**

**Option A: Keep TeacherDashboard with `_tabs/`** (Recommended)
- ✅ Already well-organized
- ✅ Tabs are internal views
- ✅ Keep as-is

**Option B: Refactor StudentDashboard**
- Currently: All tabs in one file
- Recommended: Keep internal tabs OR extract to `_tabs/` if they get complex

---

### **Phase 2: Add New Screens as Separate Files**

For the 18 screens from Figma:

**Student Screens:**
```
app/(student)/
├── dashboard.tsx          ✅ Already exists
├── progress-log.tsx       🆕 New file
├── resources.tsx          🆕 New file
├── practice-tools.tsx     🆕 New file
├── my-bookings.tsx        ✅ Already exists (rename from my-lessons.tsx?)
└── settings.tsx           🆕 New file
```

**Teacher Screens:**
```
app/(teacher)/
├── dashboard/             ✅ Already exists
│   └── _tabs/             ✅ Keep as-is
├── student-portfolio.tsx  🆕 New file
├── resources.tsx         🆕 New file
├── practice-tools.tsx     🆕 New file
├── availability.tsx      🆕 New file (or keep in dashboard?)
└── settings.tsx           🆕 New file
```

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

## 🎨 **Component Organization**

### **UI Components (48 components)**
```
components/ui/
├── button.tsx          ✅ Created
├── input.tsx            ✅ Created
├── card.tsx             ✅ Created
├── avatar.tsx           ✅ Created
├── badge.tsx            ✅ Created
├── select.tsx           ✅ Created
├── calendar.tsx         🆕 To create
├── tabs.tsx             🆕 To create
├── alert.tsx            🆕 To create
├── progress.tsx         🆕 To create
└── ... (38 more)
```

**Naming Convention:**
- Use lowercase with hyphens: `button.tsx`, `alert-dialog.tsx`
- Match shadcn/ui naming if applicable

---

## 🚀 **Action Plan**

### **Immediate (Do Now)**
1. ✅ Keep TeacherDashboard structure (it's good!)
2. ✅ Keep StudentDashboard as-is (or extract tabs if needed)
3. ✅ Continue adding UI components to `components/ui/`

### **Next Steps (As You Add Screens)**
1. Create new screens as **separate files** in `(student)/` or `(teacher)/`
2. Use `_tabs/` only for **internal dashboard tabs**
3. Keep UI components in `components/ui/`
4. Use route groups `(student)/` and `(teacher)/` for organization

---

## 💡 **Best Practices Summary**

1. **Route Groups**: Use `(student)/` and `(teacher)/` for logical separation
2. **Tab Components**: Use `_tabs/` for internal dashboard tabs only
3. **Separate Files**: Each standalone screen gets its own file
4. **UI Components**: All reusable components in `components/ui/`
5. **Consistency**: Keep the same pattern for student and teacher

---

## ❓ **FAQ**

**Q: Should I refactor StudentDashboard to use `_tabs/`?**
A: Only if the tabs become complex. Current structure is fine for 3 simple tabs.

**Q: Can I have both `_tabs/` and separate route files?**
A: Yes! Use `_tabs/` for internal dashboard tabs, separate files for standalone screens.

**Q: Where do shared screens go?**
A: Outside route groups: `app/messages.tsx`, `app/booking/`

**Q: How do I organize 48 UI components?**
A: All in `components/ui/` - flat structure is fine, or group by category if needed.

---

## ✅ **Final Recommendation**

**Keep your current TeacherDashboard structure** - it's well-organized!

**For new screens:**
- Create separate files: `progress-log.tsx`, `resources.tsx`, etc.
- Use `_tabs/` only for internal dashboard tabs
- Keep UI components in `components/ui/`

**This gives you:**
- ✅ Consistent structure
- ✅ Easy navigation
- ✅ Maintainable code
- ✅ Scalable architecture

