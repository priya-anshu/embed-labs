# UI Components

Base components following embedLabs' minimal, professional design system.

## Design Principles

- **Clean & Minimal**: No unnecessary decoration
- **CSS-First**: Prefer CSS transitions over JavaScript animations
- **Performance**: Lightweight, accessible components
- **Professional**: Serious education platform aesthetic

## Components

### Button

Professional button with CSS-only hover transitions.

```tsx
import { Button } from "@/components/ui";

// Primary button (default)
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Ghost button
<Button variant="ghost">Skip</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card

Minimal container for content grouping.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

<Card variant="outlined">
  <CardHeader>
    <CardTitle>Course Title</CardTitle>
  </CardHeader>
  <CardContent>
    Course content goes here
  </CardContent>
</Card>
```

### Skeleton

Shimmer loading state for async content.

```tsx
import { Skeleton } from "@/components/ui";

// Text skeleton
<Skeleton variant="text" />

// Rectangular skeleton (default)
<Skeleton variant="rectangular" className="h-32" />

// Circular skeleton (for avatars)
<Skeleton variant="circular" />
```

### Fade

Subtle Framer Motion fade transition (use sparingly).

```tsx
import { Fade } from "@/components/ui";

// Only use when CSS transitions aren't sufficient
<Fade duration={0.2}>
  <div>Content that fades in</div>
</Fade>
```

## Transition Utilities

Use CSS transitions from `@/utils/transitions`:

```tsx
import { transitions } from "@/utils/transitions";

// Standard transition
<div className={transitions.standard}>Hover me</div>

// Fast transition
<button className={transitions.fast}>Quick feedback</button>

// Fade only
<div className={transitions.fade}>Opacity transition</div>
```

## Guidelines

1. **Always prefer CSS transitions** - Use `utils/transitions` or Tailwind classes
2. **Framer Motion is last resort** - Only use `Fade` component when CSS won't work
3. **Keep it minimal** - No fancy animations, keep it professional
4. **Loading states** - Always use `Skeleton` components, not spinners
5. **Accessibility** - All components include proper focus states
