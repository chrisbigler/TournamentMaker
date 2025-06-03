# Color Migration Guide - Professional Design Update

This guide documents the migration from the original colorful theme to the new professional design scheme.

## Core Color Changes

### Primary Colors
| Old | New | Usage |
|-----|-----|-------|
| `sunbeamGold` (#F7C548) | `accentGreen` (#10A37F) | Primary actions, CTAs |
| `glassGreen` (#7FB069) | `deepNavy` (#0F172A) | Headers, primary brand |
| `skyBlue` (#87CEEB) | `slateGray` (#475569) | Secondary elements |

### Background Colors
| Old | New | Usage |
|-----|-----|-------|
| `warmWhite` (#FDFBF7) | `pureWhite` (#FFFFFF) | Main background |
| Card background | `coolGray` (#F8FAFC) | Card backgrounds |
| - | `lightGray` (#F1F5F9) | Section dividers |

### Text Colors
| Old | New | Usage |
|-----|-----|-------|
| `charcoal` (#3A3A37) | `richBlack` (#0F172A) | Primary text |
| `stoneGray` (#9B9B93) | `darkGray` (#334155) | Secondary text |
| - | `mediumGray` (#64748B) | Placeholder text |
| - | `lightGray` (#94A3B8) | Disabled text |

### Semantic Colors
| Old | New | Usage |
|-----|-----|-------|
| `semantic.success` (#52B788) | `accent.successGreen` (#10B981) | Success states |
| `semantic.warning` (#F4A261) | `accent.warningOrange` (#F59E0B) | Warnings |
| `semantic.error` (#E76F51) | `accent.errorRed` (#EF4444) | Errors |
| `semantic.info` (#6FAADB) | `accent.infoBlue` (#0EA5E9) | Information |

## Component Updates

### Button Variants
- `primary` → Electric Blue background, white text
- `secondary` → White background, blue text, border
- `tertiary` → Removed, use `ghost` instead
- `ghost` → Transparent background, gray text
- `outline` → Transparent with blue border

### MenuItem Variants
- `sunbeam` → `primary` (Electric Blue)
- `botanical` → `secondary` (Deep Navy)
- `sky` → `accent` (Info Blue)
- `sage` → `neutral` (Cool Gray)

### Shadow System
- `light` → `card` (subtle card shadow)
- `medium` → `hover` (hover state shadow)
- `heavy` → `elevated` (elevated elements)

## Migration Checklist

### ✅ Completed
- [x] `colors.ts` - Updated to professional scheme
- [x] `Button.tsx` - Updated variants and colors
- [x] `Card.tsx` - Updated background and shadows
- [x] `TextInput.tsx` - Updated colors and borders
- [x] `MenuItem.tsx` - Updated variants and text colors
- [x] `HomeScreen.tsx` - Updated header and variants
- [x] `AppNavigator.tsx` - Updated navigation theme
- [x] `theme/index.ts` - Updated component styles

### 🔄 Remaining (Manual Review Needed)
- [ ] `PlayersScreen.tsx`
- [ ] `CreatePlayerScreen.tsx`
- [ ] `CreateTournamentScreen.tsx`
- [ ] `TournamentScreen.tsx`
- [ ] `MatchScreen.tsx`
- [ ] `PlayerGroupsScreen.tsx`
- [ ] `CreatePlayerGroupScreen.tsx`
- [ ] `TournamentHistoryScreen.tsx`

## Quick Find & Replace Patterns

For remaining screens, use these patterns:

### Color References
```typescript
// Old → New
theme.colors.primary.sunbeamGold → theme.colors.primary.accentGreen
theme.colors.primary.glassGreen → theme.colors.primary.deepNavy
theme.colors.primary.skyBlue → theme.colors.primary.slateGray
theme.colors.light.background → theme.colors.background.pureWhite
theme.colors.light.card → theme.colors.background.coolGray
theme.colors.neutral.softGray → theme.colors.light.border
theme.colors.semantic.success → theme.colors.accent.successGreen
theme.colors.semantic.error → theme.colors.accent.errorRed
```

### Button Variants
```typescript
// Old → New
variant="tertiary" → variant="ghost"
```

### MenuItem Variants
```typescript
// Old → New
variant="sunbeam" → variant="primary"
variant="botanical" → variant="secondary"
variant="sky" → variant="accent"
variant="sage" → variant="neutral"
```

### Shadow References
```typescript
// Old → New
...theme.shadows.light → ...theme.shadows.card
...theme.shadows.medium → ...theme.shadows.hover
...theme.shadows.heavy → ...theme.shadows.elevated
```

## Design Principles

The new professional design follows these principles:
1. **Minimalist**: Clean white space, limited color palette
2. **Professional**: Navy and blue convey trust and competence
3. **Accessible**: High contrast ratios (WCAG AAA compliant)
4. **Modern**: Subtle shadows instead of borders
5. **Consistent**: Cohesive color system throughout

## Legacy Support

Legacy colors are maintained in the `legacy` object for backward compatibility during the transition period. These can be removed once all components are migrated. 