# ChatGPT Theme System

This theme system implements a ChatGPT‑inspired aesthetic with deep grays and a vibrant green accent.

## Design Principles

1. **Dark Mode First**: Rich gray backgrounds for a modern look
2. **Vibrant Accent**: ChatGPT green for primary actions
3. **Minimalist**: Clean surfaces with subtle shadows
4. **Accessibility**: High contrast ratios for readability
5. **Consistency**: Unified palette across components

## Color Palette

### Primary Colors
- **ChatGPT Green** (`#10A37F`) - Primary actions
- **Deep Gray** (`#343541`) - Main background
- **Card Gray** (`#444654`) - Card surfaces

### Neutral Colors
- **Off White** (`#ECECF1`) - Text and icons
- **Border Gray** (`#E5E5E5`) - Dividers
- **Dark Slate** (`#202123`) - Headers

### Accent Colors
- **Success Green** (`#10A37F`) - Success states
- **Warning Orange** (`#F59E0B`) - Warnings
- **Error Red** (`#EF4444`) - Errors
- **Info Blue** (`#0EA5E9`) - Information

## Components

### Button
```tsx
import { Button } from '../components';

<Button 
  title="Primary Action" 
  onPress={handlePress} 
  variant="primary" // primary | secondary | tertiary | outline
  size="md" // sm | md | lg
/>
```

### Card
```tsx
import { Card } from '../components';

<Card variant="default" padding="lg">
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
  variant="sunbeam" // sunbeam | botanical | sky | sage
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
import { theme, colors, spacing, textStyles } from '../theme';
```

### Using Colors
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.light.background,
  },
  text: {
    color: theme.colors.light.text.primary,
  },
});
```

### Using Typography
```tsx
const styles = StyleSheet.create({
  title: {
    ...theme.textStyles.h1,
    color: theme.colors.light.text.primary,
  },
  body: {
    ...theme.textStyles.body,
    color: theme.colors.light.text.secondary,
  },
});
```

### Using Spacing
```tsx
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
```

### Using Shadows
```tsx
const styles = StyleSheet.create({
  card: {
    ...theme.shadows.medium,
    borderRadius: theme.borderRadius.lg,
  },
});
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

## Accessibility

- All touch targets meet the minimum 44px requirement
- Color contrast ratios exceed WCAG AA standards
- Components include proper accessibility labels and roles
- Focus states are clearly visible
- Text is scalable and readable

## Best Practices

1. Always use theme values instead of hardcoded colors or spacing
2. Prefer semantic color names over specific hex values
3. Use appropriate text styles for hierarchy
4. Include proper accessibility attributes
5. Test with different font sizes and accessibility settings
6. Maintain consistency across screens and components 