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

