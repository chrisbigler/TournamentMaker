# Design System

This document reflects the current, code-backed design system. When in doubt, follow `src/theme/*.ts` and the component implementations in `src/components`.

## Design Philosophy
- Calm confidence with clear hierarchy and restrained color.
- Strategic color: green is the primary accent, with purposeful secondary accents.
- Tactile feedback: subtle scale animations on press.
- Hairline precision: 1px borders and low-elevation shadows.
- Outdoor-ready: high contrast and large touch targets for visibility.

## Color System

### Primary Accent
- `primary`: `#059669`
- `primaryLight`: `#10B981`
- `primaryDark`: `#047857`

### Secondary Accents
- `accents.blue`: `#3B82F6`
- `accents.purple`: `#8B5CF6`
- `accents.amber`: `#F59E0B`
- `accents.rose`: `#F43F5E`
- `accents.cyan`: `#06B6D4`

### Semantic Colors
- `semantic.success`: `#059669`
- `semantic.warning`: `#F59E0B`
- `semantic.error`: `#EF4444`
- `semantic.info`: `#3B82F6`

### Light Mode Palette
- `background.primary`: `#FFFFFF`
- `background.secondary`: `#FAFAFA`
- `background.tertiary`: `#F5F5F5`
- `border.subtle`: `#E5E5E5`
- `border.default`: `#D4D4D4`
- `border.strong`: `#A3A3A3`
- `text.primary`: `#171717`
- `text.secondary`: `#525252`
- `text.tertiary`: `#737373`
- `text.disabled`: `#A3A3A3`
- `text.inverse`: `#FFFFFF`

### Dark Mode Palette
- `background.primary`: `#0A0A0A`
- `background.secondary`: `#171717`
- `background.tertiary`: `#262626`
- `border.subtle`: `#262626`
- `border.default`: `#404040`
- `border.strong`: `#525252`
- `text.primary`: `#FAFAFA`
- `text.secondary`: `#D4D4D4`
- `text.tertiary`: `#A3A3A3`
- `text.disabled`: `#525252`
- `text.inverse`: `#171717`

## Typography
- Sizes and weights are defined in `src/theme/typography.ts`.
- Current scale:
- `display` 32
- `h1` 28
- `h2` 26
- `h3` 22
- `h4` 19
- `body` 15
- `bodyLarge` 17
- `bodySmall` 13
- `caption` 11
- `label` 13
- `button` 15
- `buttonSmall` 13
- `buttonLarge` 17

## Spacing and Radii
- Spacing scale in `src/theme/spacing.ts`: 4 to 96.
- Border radii in `src/theme/spacing.ts`:
- `sm` 4
- `md` 6
- `lg` 8
- `xl` 12
- `2xl` 16
- `full` 9999

## Dimensions
- Button heights: 32, 40, 48
- Input heights: 32, 40, 48
- Icon sizes: 14, 18, 22, 28, 36
- Minimum touch target: 44

## Shadows
- `low`, `medium`, `high` are defined in `src/theme/colors.ts`.
- Use low for cards, medium for elevated elements, high for overlays.

## Components

### Button
- Variants: `primary`, `secondary`, `destructive`, `ghost`, `outline`.
- Press feedback: scale to 0.98.

### Card
- Variants: `default`, `elevated`, `outlined`.
- Uses theme border and shadow tokens.

### TextInput
- Variants: `default`, `outlined`.
- Focused state uses `theme.colors.primary`.

### MenuItem
- Uses a left accent bar and icon container with tinted background.
- Press feedback: scale animation.

### ScreenHeader
- Variants: `create`, `list`, `detail`.
- Standardizes headers across screens.

## Interaction Patterns
- Use `ScreenHeader` for list, create, and detail views.
- Favor tokens over hardcoded values.
- Keep touch targets >= 44px.
- Use `theme` via `useTheme()` and `createStyles(theme)`.

## Navigation and Layout
- Tab bar: hairline top border, primary for active, tertiary for inactive, centered FAB for Create Tournament.
- Headers: background matches `background.primary`, hairline bottom border, no shadow.

## Gradients
- Primary CTA gradient:
- `colors={[theme.colors.primary, theme.colors.primaryDark]}`
- Hero or header gradient tints:
- `colors={[`${theme.colors.primary}15`, `${theme.colors.primary}05`, 'transparent']}`

## Iconography
- Use `MaterialIcons` with sizes from `theme.dimensions.iconSize`.
- Pair icons with tinted containers for emphasis.

## Do and Don't
- Do keep palettes minimal and rely on accents sparingly.
- Do use hairline borders with subtle shadows.
- Don't exceed 2 or 3 accent colors on a single screen.
- Don't use heavy shadows without borders.

## Historical Notes
- Earlier docs referenced ChatGPT colors and legacy palettes. Those are superseded by the current theme tokens in code.
- Legacy aliases still exist in `createTheme.ts` for compatibility.
