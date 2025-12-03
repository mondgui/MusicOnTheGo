#!/bin/bash
# Helper script to restore files progressively
# Usage: ./restore-file.sh <file-path>

if [ -z "$1" ]; then
    echo "Usage: ./restore-file.sh <file-path>"
    echo ""
    echo "Example: ./restore-file.sh MusicOnTheGo/frontend/app/(teacher)/_layout.tsx"
    echo ""
    echo "Available files to restore:"
    echo "  1. MusicOnTheGo/frontend/app/(teacher)/_layout.tsx"
    echo "  2. MusicOnTheGo/frontend/app/(teacher)/dashboard.tsx (deleted)"
    echo "  3. MusicOnTheGo/frontend/app/register-student.tsx"
    echo "  4. MusicOnTheGo/frontend/app/register-teacher.tsx"
    exit 1
fi

FILE_PATH="$1"

echo "Showing diff for: $FILE_PATH"
echo "----------------------------------------"
git diff HEAD -- "$FILE_PATH"
echo ""
echo "----------------------------------------"
read -p "Do you want to restore this file to last commit? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git restore "$FILE_PATH"
    echo "✓ Restored: $FILE_PATH"
else
    echo "✗ Cancelled"
fi




