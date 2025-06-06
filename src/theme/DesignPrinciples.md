# ChatGPT Theme System

This theme system implements a ChatGPT‑inspired aesthetic with deep grays and a vibrant green accent, supporting both light and dark modes.

## Design Principles

1. **Dark Mode First**: Rich gray backgrounds for a modern look
2. **Vibrant Accent**: ChatGPT green (`#10A37F`) for primary actions
3. **Minimalist**: Clean surfaces with subtle shadows
4. **Accessibility**: High contrast ratios for readability
5. **Consistency**: Unified palette across components
6. **Theme Switching**: Dynamic light/dark mode support

## Color Palette

### Primary Colors
- **ChatGPT Green** (`#10A37F`) - Primary actions
- **Deep Navy** (`#202123`) - Headers and dark surfaces
- **Slate Gray** (`#40414F`) - Secondary elements

### Background Colors (Dark Mode)
- **Main Background** (`#343541`) - Primary backgrounds
- **Card Background** (`#444654`) - Card surfaces
- **Surface** (`#202123`) - Section dividers

### Background Colors (Light Mode)
- **Main Background** (`#FFFFFF`) - Primary backgrounds
- **Card Background** (`#F7F7F8`) - Card surfaces
- **Surface** (`#FFFFFF`) - Section surfaces

### Text Colors (Dark Mode)
- **Primary Text** (`#ECECF1`) - Main text
- **Secondary Text** (`#C5C5D2`) - Secondary text
- **Tertiary Text** (`#8E8EA0`) - Placeholder text
- **Disabled Text** (`#6B6B7B`) - Disabled states

### Text Colors (Light Mode)
- **Primary Text** (`#202123`) - Main text
- **Secondary Text** (`#40414F`) - Secondary text
- **Tertiary Text** (`#6B6B7B`) - Placeholder text
- **Disabled Text** (`#8E8EA0`) - Disabled states

### Accent Colors
- **Success Green** (`#10B981`) - Success states
- **Warning Orange** (`#F59E0B`) - Warnings
- **Error Red** (`#EF4444`) - Errors
- **Info Blue** (`#0EA5E9`) - Information

### Legacy Colors (Backward Compatibility)
- **Sunbeam Gold** (`#F7C548`)
- **Glass Green** (`#7FB069`)
- **Sky Blue** (`#87CEEB`)

## Theme Management

### ThemeProvider Setup
```tsx
import { ThemeProvider } from '../theme/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Using Theme Hooks
```tsx
import { useTheme, useThemeMode } from '../theme';

const Component = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  
  // Access theme properties
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.pureWhite,
      padding: theme.spacing.lg,
    },
  });
};
```

### Creating Dynamic Themes
```tsx
import { createTheme } from '../theme';

const lightTheme = createTheme('light');
const darkTheme = createTheme('dark');
```

## Components

### Button
```tsx
import { Button } from '../components';

<Button 
  title="Primary Action" 
  onPress={handlePress} 
  variant="primary" // primary | secondary | ghost | outline
  size="md" // sm | md | lg
  loading={false}
  disabled={false}
/>
```

### Card
```tsx
import { Card } from '../components';

<Card 
  variant="default" // default | elevated | outlined
  padding="lg" // xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl | 6xl | 7xl | 8xl
>
  <Text>Card content</Text>
</Card>
```

### MenuItem
```tsx
import { MenuItem } from '../components';

<MenuItem
  title="Menu Item"
  subtitle="Description"
  icon="emoji-events"
  variant="primary" // primary | secondary | accent | neutral
  onPress={handlePress}
/>
```

### TextInput
```tsx
import { TextInput } from '../components';

<TextInput
  label="Label"
  placeholder="Placeholder"
  variant="default" // default | outlined
  error="Error message"
/>
```

## Usage

### Importing Theme
```tsx
import { 
  theme, 
  colors, 
  spacing, 
  textStyles, 
  useTheme,
  useThemeMode,
  ThemeProvider 
} from '../theme';
```

### Using Colors
```tsx
const Component = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.pureWhite,
    },
    text: {
      color: theme.colors.text.richBlack,
    },
  });
};
```

### Using Typography
```tsx
const Component = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    title: {
      ...theme.textStyles.h1,
      color: theme.colors.text.richBlack,
    },
    body: {
      ...theme.textStyles.body,
      color: theme.colors.text.darkGray,
    },
  });
};
```

### Using Spacing
```tsx
const Component = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
  });
};
```

### Using Shadows
```tsx
const Component = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    card: {
      ...theme.shadows.card,
      borderRadius: theme.borderRadius.lg,
    },
  });
};
```

## Typography Scale

- **h1**: 32px, bold - Major headings
- **h2**: 28px, bold - Section headings  
- **h3**: 24px, semibold - Subsection headings
- **h4**: 20px, semibold - Component titles
- **body**: 16px, normal - Body text
- **bodyLarge**: 18px, normal - Emphasized body text
- **bodySmall**: 14px, normal - Secondary text
- **caption**: 12px, normal - Fine print
- **label**: 14px, medium - Form labels
- **button**: 16px, semibold - Button text
- **buttonLarge**: 18px, semibold - Large button text

## Spacing Scale

- **xs**: 4px
- **sm**: 8px  
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **4xl**: 40px
- **5xl**: 48px
- **6xl**: 64px
- **7xl**: 80px
- **8xl**: 96px

## Border Radius Scale

- **none**: 0px
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **2xl**: 20px
- **3xl**: 24px
- **full**: 9999px

## Dimensions

### Button Heights
- **sm**: 32px
- **md**: 44px
- **lg**: 56px

### Input Heights
- **sm**: 32px
- **md**: 44px
- **lg**: 56px

### Icon Sizes
- **xs**: 16px
- **sm**: 20px
- **md**: 24px
- **lg**: 32px
- **xl**: 40px

### Touch Targets
- **Minimum**: 44px (Accessibility requirement)

## Shadows

### Card Shadow
```tsx
shadowColor: '#000000',
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.1,
shadowRadius: 3,
elevation: 3,
```

### Elevated Shadow
```tsx
shadowColor: '#000000',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.15,
shadowRadius: 12,
elevation: 12,
```

## Accessibility

- All touch targets meet the minimum 44px requirement
- Color contrast ratios exceed WCAG AA standards
- Components include proper accessibility labels and roles
- Focus states are clearly visible
- Text is scalable and readable
- Support for system theme preferences

## Best Practices

1. **Always use theme values** instead of hardcoded colors or spacing
2. **Use theme hooks** (`useTheme`, `useThemeMode`) for dynamic theming
3. **Prefer semantic color names** over specific hex values
4. **Use appropriate text styles** for hierarchy
5. **Include proper accessibility attributes**
6. **Test with different font sizes** and accessibility settings
7. **Maintain consistency** across screens and components
8. **Wrap your app** with `ThemeProvider` for theme context
9. **Use `createStyles` pattern** for theme-aware styling
10. **Test both light and dark modes** during development

## Migration Guide

### From Legacy Colors
If migrating from legacy color names, use this mapping:
- `sunbeam` → `primary` (for MenuItem variant)
- `botanical` → `accent` 
- `sky` → `secondary`
- Legacy gradients are still available for backward compatibility

### Theme Structure Changes
- Theme is now generated dynamically based on mode
- Use `useTheme()` hook instead of importing static theme
- Component styles are now theme-aware and update automatically 