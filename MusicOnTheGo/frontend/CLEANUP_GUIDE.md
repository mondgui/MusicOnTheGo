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

