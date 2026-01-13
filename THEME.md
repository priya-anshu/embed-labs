# Theme System Requirements

## Overview

embedLabs must support a professional, low-contrast dual-theme system (light and dark). The theme system is **NOT YET IMPLEMENTED** - this document outlines design constraints and requirements for future implementation.

## Design Constraints

### 1. Dual Theme Support
- **Light Theme**: Professional, clean appearance for daytime use
- **Dark Theme**: AMOLED-style (true black or near-black), not gray-heavy
- Both themes must be fully functional and accessible

### 2. Color Palette Requirements

#### Light Theme
- **Low-Contrast**: Professional, reduced eye strain
- **Semantic Colors**: Use semantic tokens, not literal colors

#### Dark Theme (AMOLED-Style)
- **True Black or Near-Black**: Background should be `#000000` or very close (`#0a0a0a` max)
- **Avoid Gray-Heavy Themes**: Minimize use of gray tones in backgrounds
- **Strong Readability**: Text must remain highly readable on black backgrounds
- **Restrained Accent Colors**: Use subtle, minimal accent colors
- **Accessibility First**: Maintain WCAG contrast ratios despite dark theme

#### General Requirements
- **No Hardcoded Colors**: Never use `#000000`, `bg-black`, `text-white`, etc. in components
- **Theme Tokens**: All colors must reference CSS variables or Tailwind theme tokens
- **Semantic Naming**: Use semantic color names, not literal colors

### 3. Theme-Friendly Styling Rules

#### ✅ DO:
- Use CSS variables: `var(--background)`, `var(--foreground)`
- Use Tailwind theme tokens: `bg-background`, `text-foreground`, `border-border`
- Use opacity modifiers: `bg-foreground/10`, `text-muted-foreground/80`
- Use semantic color names: `background`, `foreground`, `muted`, `border`

#### ❌ DON'T:
- Hardcode hex colors: `#ffffff`, `#000000`
- Use literal color names: `bg-black`, `text-white`, `bg-zinc-900`
- Assume color values: Always use tokens
- Mix theme-aware and hardcoded colors

### 4. Architecture Requirements

#### Current State (Theme-Ready)
- ✅ CSS variables defined in `app/globals.css`
- ✅ Dark mode media query exists (system preference detection)
- ✅ Components use semantic tokens (`bg-background`, `text-foreground`)
- ✅ No hardcoded colors in UI components

#### Future Implementation (Not Yet Done)
- ⏳ Theme switching logic (light/dark toggle)
- ⏳ Theme persistence (localStorage/cookies)
- ⏳ Theme provider/context (if needed)
- ⏳ User preference override (manual theme selection)

### 5. Scalability Requirements

The theme system must be designed to support:
- **Current**: Light and dark themes
- **Future**: Potential high-contrast mode
- **Future**: Custom user themes (if needed)
- **Future**: System preference detection with manual override

## Current Implementation Status

### CSS Variables (`app/globals.css`)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --ring: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --muted: #171717;
    --muted-foreground: #a3a3a3;
    --border: #262626;
    --ring: #ededed;
  }
}
```

### Component Compliance

All UI components currently use theme tokens:
- ✅ `Button`: Uses `bg-foreground`, `text-background`, `bg-muted`
- ✅ `Card`: Uses `bg-background`, `border-border`
- ✅ `Skeleton`: Uses `bg-muted` (shimmer uses opacity, needs review)

### Areas Requiring Attention

1. **Skeleton Shimmer**: Currently uses `via-white/10` - should use theme-aware color
2. **Theme Switching**: Logic not implemented (intentional - future work)
3. **Dark Mode Colors**: Current dark mode is gray-heavy - needs AMOLED-style update
   - Current `--muted: #171717` and `--border: #262626` are too gray
   - Should use true black (`#000000`) or near-black (`#0a0a0a`) for backgrounds
   - Muted elements should use minimal gray, prefer opacity on foreground instead
4. **Color Palette**: Final AMOLED dark mode palette TBD during implementation

## Development Guidelines

### When Creating New Components

1. **Always use theme tokens**:
   ```tsx
   // ✅ Good
   <div className="bg-background text-foreground border-border" />
   
   // ❌ Bad
   <div className="bg-white text-black border-gray-300" />
   ```

2. **Use semantic color names**:
   ```tsx
   // ✅ Good
   <div className="bg-muted text-muted-foreground" />
   
   // ❌ Bad
   <div className="bg-gray-100 text-gray-600" />
   ```

3. **Use opacity for variations**:
   ```tsx
   // ✅ Good
   <div className="bg-foreground/10 hover:bg-foreground/20" />
   
   // ❌ Bad
   <div className="bg-gray-100 hover:bg-gray-200" />
   ```

### When Adding Colors

1. Add CSS variable to `app/globals.css`
2. Add Tailwind token in `@theme inline` block
3. Update both light and dark theme definitions
4. Use semantic naming (not literal colors)

## Future Implementation Checklist

When implementing theme switching:

- [ ] Create theme context/provider (if needed)
- [ ] Implement theme toggle component
- [ ] Add theme persistence (localStorage)
- [ ] Support system preference + manual override
- [ ] Update skeleton shimmer to use theme-aware color
- [ ] Test all components in both themes
- [ ] Verify accessibility in both themes
- [ ] Document theme switching API

## AMOLED Dark Mode Requirements

### Design Philosophy
- **True Black Background**: Use `#000000` or very near-black (`#0a0a0a` maximum)
- **Minimal Gray Usage**: Avoid gray-heavy backgrounds and borders
- **High Contrast Text**: Ensure strong readability on black backgrounds
- **Restrained Accents**: Use subtle, minimal accent colors sparingly
- **Battery Efficient**: True black saves battery on AMOLED displays

### Color Strategy for Dark Mode

#### Backgrounds
- **Primary Background**: `#000000` (true black) or `#0a0a0a` (near-black)
- **Muted Backgrounds**: Avoid gray backgrounds - use opacity on foreground instead
- **Example**: `bg-foreground/5` instead of `bg-gray-900`

#### Text
- **Primary Text**: High-contrast light color (`#ededed` or `#ffffff`)
- **Muted Text**: Use opacity, not gray: `text-foreground/70` instead of `text-gray-400`
- **Maintain Readability**: Ensure WCAG AA contrast ratios

#### Borders & Dividers
- **Minimal Borders**: Use very subtle borders (`#1a1a1a` or opacity-based)
- **Avoid Gray Borders**: Prefer `border-foreground/10` over `border-gray-800`

#### Accent Colors
- **Restrained Usage**: Use accent colors sparingly and subtly
- **Low Saturation**: Prefer muted, desaturated accent colors
- **Purposeful**: Only use accents for important interactive elements

### Current Dark Mode Status

**⚠️ Current Implementation is Gray-Heavy (Needs Update)**

Current dark mode colors in `globals.css`:
```css
--background: #0a0a0a;        /* ✅ Near-black - acceptable */
--foreground: #ededed;        /* ✅ High contrast - good */
--muted: #171717;             /* ❌ Too gray - should use opacity instead */
--muted-foreground: #a3a3a3;  /* ⚠️ Consider opacity-based approach */
--border: #262626;             /* ❌ Too gray - should be more subtle */
--ring: #ededed;               /* ✅ Good for focus states */
```

**Required Changes (Future Implementation):**
- Update `--muted` to use opacity-based approach or true black
- Update `--border` to be more subtle (near-black with opacity)
- Consider `--muted-foreground` using opacity instead of gray
- Ensure all components work with true black backgrounds

## Notes

- **Current colors are placeholders** - Final AMOLED dark mode palette will be defined during theme implementation
- **Dark mode is gray-heavy currently** - Will be updated to AMOLED-style (true black) during implementation
- **System preference detection works** - But manual theme switching is not yet implemented
- **All components are theme-ready** - They will automatically adapt when AMOLED dark mode is implemented
