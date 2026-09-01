# 🎨 Parallax Design System & Styling Guide

> **Comprehensive styling documentation for the Capability Navigator application**

---

## 📋 Table of Contents

- [🎨 Parallax Design System & Styling Guide](#-parallax-design-system--styling-guide)
- [📋 Table of Contents](#-table-of-contents)
- [🚀 Quick Start](#-quick-start)
- [🎯 Design Principles](#-design-principles)
- [📐 Design Tokens](#-design-tokens)
  - [Color System](#color-system)
  - [Typography](#typography)
  - [Spacing](#spacing)
  - [Border Radius](#border-radius)
  - [Shadows](#shadows)
  - [Transitions](#transitions)
- [🧩 Component Styling Patterns](#-component-styling-patterns)
  - [Layout Components](#layout-components)
  - [Form Components](#form-components)
  - [Data Visualization](#data-visualization)
  - [Status Indicators](#status-indicators)
- [🎨 Color Semantics](#-color-semantics)
  - [Status Colors](#status-colors)
  - [Brand Colors](#brand-colors)
  - [Surface Colors](#surface-colors)
- [📏 Spacing System](#-spacing-system)
- [🔤 Typography Scale](#-typography-scale)
- [💡 Best Practices](#-best-practices)
- [⚡ Performance Considerations](#-performance-considerations)
- [🛠️ Tooling & Workflow](#-tooling--workflow)
- [📁 File Structure](#-file-structure)
- [🔄 Migration Guide](#-migration-guide)
- [📚 Resources](#-resources)

---

## 🚀 Quick Start

### Installation

The Parallax design system is built on **Tailwind CSS v4** with custom configurations.

```bash
# Install dependencies
npm install tailwindcss @tailwindcss/vite

# The system uses these core dependencies:
# - tailwindcss: ^4.2.1
# - @tailwindcss/vite: ^4.2.1
# - tw-animate-css: ^1.3.4 (for animations)
```

### Basic Usage

```tsx
import { Panel, Button, StatusBadge } from '@/components/parallax';

function DisruptionCard() {
  return (
    <Panel className="p-4">
      <StatusBadge status="critical" className="mb-2">
        Critical Disruption
      </StatusBadge>
      <Button variant="primary" size="sm">
        Analyze Incident
      </Button>
    </Panel>
  );
}
```

---

## 🎯 Design Principles

### 1. **Clarity First**
Every visual element must serve a clear purpose. Remove decorative elements that don't enhance understanding.

### 2. **Hierarchy Through Contrast**
Use color, size, and spacing to establish clear visual hierarchy. Primary actions should be immediately apparent.

### 3. **Consistency Over Creativity**
Reuse existing patterns before creating new ones. Consistency builds trust and reduces cognitive load.

### 4. **Status-Driven Design**
The application is data-heavy with multiple states (critical, warning, success, info). Colors and visual treatments must clearly communicate status.

### 5. **Accessibility by Default**
All components must meet WCAG 2.1 AA standards. Color combinations must have sufficient contrast.

### 6. **Performance Aware**
CSS should be efficient. Avoid unnecessary animations on large datasets.

---

## 📐 Design Tokens

### Color System

#### Semantic Colors

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--color-critical` | `#ef4444` | Critical errors, disruptions | <span style="color: #ef4444">Critical</span> |
| `--color-warning` | `#f59e0b` | Warnings, at-risk states | <span style="color: #f59e0b">Warning</span> |
| `--color-success` | `#10b981` | Success, healthy states | <span style="color: #10b981">Success</span> |
| `--color-info` | `#3b82f6` | Information, neutral states | <span style="color: #3b82f6">Info</span> |
| `--color-muted` | `#6b7280` | Secondary text, disabled states | <span style="color: #6b7280">Muted</span> |

#### Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#0f172a` | Primary background |
| `--color-surface` | `#1e293b` | Card/panel backgrounds |
| `--color-surface-2` | `#334155` | Elevated surfaces |
| `--color-border` | `#334155` | Default borders |
| `--color-border-strong` | `#475569` | Strong borders |

#### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#0ea5e9` | Primary brand color |
| `--color-brand-glow` | `#06b6d4` | Brand accents |
| `--color-ai` | `#8b5cf6` | AI/agent-related elements |

### Typography

#### Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | `400` | Body text |
| `--font-medium` | `500` | Emphasis, labels |
| `--font-semibold` | `600` | Headings, buttons |
| `--font-bold` | `700` | Strong emphasis |

#### Font Sizes

```css
/* Text styles */
.text-xs        { font-size: 0.75rem; line-height: 1rem; }
.text-sm        { font-size: 0.875rem; line-height: 1.25rem; }
.text-base      { font-size: 1rem; line-height: 1.5rem; }
.text-lg        { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl        { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl       { font-size: 1.5rem; line-height: 2rem; }
.text-3xl       { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl       { font-size: 2.25rem; line-height: 2.5rem; }

/* Monospace text */
.num            { font-variant-numeric: tabular-nums; }
.label-xs       { font-size: 0.625rem; letter-spacing: 0.1em; }
```

### Spacing

The spacing system uses a **4px base unit** with Tailwind's default scale:

```css
/* Common spacing utilities */
.gap-1        { gap: 0.25rem; }   /* 4px */
.gap-2        { gap: 0.5rem; }    /* 8px */
.gap-3        { gap: 0.75rem; }  /* 12px */
.gap-4        { gap: 1rem; }     /* 16px */
.gap-6        { gap: 1.5rem; }   /* 24px */
.gap-8        { gap: 2rem; }     /* 32px */

/* Panel spacing */
.panel         { padding: 1rem; }
.panel-inset   { padding: 1rem; border-left: 1px solid var(--color-border); }
```

### Border Radius

```css
/* Border radius scale */
.rounded-none   { border-radius: 0; }
.rounded-sm     { border-radius: 0.125rem; }  /* 2px */
.rounded        { border-radius: 0.25rem; }   /* 4px */
.rounded-md     { border-radius: 0.375rem; }  /* 6px */
.rounded-lg     { border-radius: 0.5rem; }    /* 8px */
.rounded-xl     { border-radius: 0.75rem; }  /* 12px */
.rounded-full   { border-radius: 9999px; }
```

### Shadows

```css
/* Custom shadow tokens */
.shadow-sm      { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow         { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-md      { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg      { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-glow    { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
```

### Transitions

```css
/* Default transition */
.transition        { transition-property: color, background-color, border-color; }
.transition-all    { transition-property: all; }

/* Duration scale */
.duration-150     { transition-duration: 150ms; }
.duration-200     { transition-duration: 200ms; }
.duration-300     { transition-duration: 300ms; }
.duration-500     { transition-duration: 500ms; }
.duration-700     { transition-duration: 700ms; }

/* Timing functions */
.ease-out         { transition-timing-function: cubic-bezier(0.25, 0.1, 0.5, 1); }
.ease-in-out      { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
```

---

## 🧩 Component Styling Patterns

### Layout Components

#### Panel Component

The primary container for content sections.

```tsx
// Usage
<Panel>
  <Panel.Header>
    <h2 className="text-[13px] font-semibold tracking-[0.02em] uppercase">
      Network Resilience
    </h2>
  </Panel.Header>
  <Panel.Content>
    {/* Content here */}
  </Panel.Content>
</Panel>

// Styles
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.panel-inset {
  border-left: 1px solid var(--color-border-strong);
}
```

#### Grid Layouts

```tsx
// Responsive grid patterns
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {/* Grid items */}
</div>

// Common breakpoints:
// - sm: 640px
// - md: 768px
// - lg: 1024px
// - xl: 1280px
// - 2xl: 1536px
```

### Form Components

#### Input Fields

```tsx
<input
  type="text"
  className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm 
            placeholder:text-muted-foreground/60 
            focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
/>
```

#### Buttons

```tsx
// Primary button
<button className="inline-flex items-center gap-1.5 rounded-sm border border-border 
          bg-surface-2 px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] 
          text-foreground uppercase transition-colors 
          hover:bg-surface-3 hover:text-foreground">
  Action
</button>

// Critical button
<button className="inline-flex items-center gap-1.5 rounded-sm 
          border border-critical/50 bg-critical/15 px-3.5 py-2 
          font-mono text-[11px] tracking-[0.1em] text-critical uppercase
          transition-colors hover:bg-critical/25">
  Critical Action
</button>

// Icon button
<button className="p-2 rounded-sm border border-border text-muted-foreground
          hover:bg-surface-2 hover:text-foreground transition-colors">
  <Icon className="size-4" />
</button>
```

### Data Visualization

#### Status Badges

```tsx
// Critical badge
<span className="inline-flex items-center gap-1.5 rounded-sm 
      border border-critical/45 bg-critical/12 px-1.5 py-0.5 
      font-mono text-[10px] leading-4 tracking-[0.09em] uppercase text-critical">
  <span className="size-1.5 rounded-full bg-current" />
  Critical
</span>

// Warning badge
<span className="inline-flex items-center gap-1.5 rounded-sm 
      border border-warning/40 bg-warning/10 px-1.5 py-0.5 
      font-mono text-[10px] leading-4 tracking-[0.09em] uppercase text-warning">
  At Risk
</span>

// Success badge
<span className="inline-flex items-center gap-1.5 rounded-sm 
      border border-success/40 bg-success/10 px-1.5 py-0.5 
      font-mono text-[10px] leading-4 tracking-[0.09em] uppercase text-success">
  Healthy
</span>
```

#### Progress Indicators

```tsx
// Linear progress bar
<div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
  <div 
    className="h-full rounded-full bg-warning transition-[width] duration-500 ease-out"
    style={{ width: '75%' }}
  />
</div>

// Circular gauge (ResilienceGauge component)
<div className="relative inline-grid place-items-center" style={{ width: 56, height: 56 }}>
  <svg width="56" height="56" className="-rotate-90">
    <circle cx="28" cy="28" r="25.5" fill="none" stroke="var(--color-surface-2)" strokeWidth="5" />
    <circle 
      cx="28" cy="28" r="25.5" fill="none" 
      stroke="var(--color-success)" strokeWidth="5" 
      strokeLinecap="round" 
      strokeDasharray="147.4 12.8" 
      className="transition-[stroke-dasharray] duration-700 ease-out"
    />
  </svg>
  <span className="absolute inset-0 grid place-items-center">
    <span className="num text-[13px] font-semibold leading-none">87</span>
  </span>
</div>
```

#### Tables

```tsx
<div className="grid-backdrop overflow-x-auto rounded-sm border border-border bg-background/60">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border">
        <th className="px-4 py-2 text-left font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
          Supplier
        </th>
        <th className="px-4 py-2 text-left font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
          Status
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border/70">
        <td className="px-4 py-2">MedCore Components Ltd.</td>
        <td className="px-4 py-2">
          <StatusBadge status="critical" />
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Indicators

#### Network Graph Nodes

```tsx
// Supplier node (critical)
<g transform="translate(24, 69)" className="cursor-pointer transition-opacity duration-300">
  <rect 
    width="132" height="42" rx="4" 
    fill="color-mix(in oklab, var(--color-critical) 16%, var(--color-surface))" 
    stroke="var(--color-critical)" strokeWidth="1"
  />
  <text x="9" y="16" className="fill-current text-[8.5px] tracking-[0.14em] uppercase text-muted-foreground">
    Supplier
  </text>
  <text x="9" y="31" className="text-[11px] font-medium text-foreground">
    MedCore
  </text>
</g>

// Factory node (available)
<g transform="translate(404, 109)" className="cursor-pointer transition-opacity duration-300">
  <rect 
    width="132" height="42" rx="4" 
    fill="var(--color-surface)" 
    stroke="var(--color-border-strong)" strokeWidth="1"
  />
  <text x="9" y="16" className="fill-current text-[8.5px] tracking-[0.14em] uppercase text-muted-foreground">
    Factory
  </text>
  <text x="9" y="31" className="text-[11px] font-medium text-foreground">
    Plant 02
  </text>
</g>
```

---

## 🎨 Color Semantics

### Status Colors

The application uses a **status-driven color system** where colors communicate meaning:

| Status | Color | Usage | Background | Border | Text |
|--------|-------|-------|------------|--------|------|
| **Critical** | `#ef4444` (red-500) | Disruptions, failures | `bg-critical/12` | `border-critical/45` | `text-critical` |
| **Warning** | `#f59e0b` (amber-500) | At-risk, partial | `bg-warning/10` | `border-warning/40` | `text-warning` |
| **Success** | `#10b981` (emerald-500) | Healthy, available | `bg-success/10` | `border-success/40` | `text-success` |
| **Info** | `#3b82f6` (blue-500) | Information, neutral | `bg-info/10` | `border-info/40` | `text-info` |
| **Muted** | `#6b7280` (gray-500) | Disabled, secondary | `bg-surface-2` | `border-border` | `text-muted-foreground` |

#### Color Mixing for Subtle States

```css
/* Critical state with subtle background */
background: color-mix(in oklab, var(--color-critical) 16%, var(--color-surface));

/* Warning state with subtle background */
background: color-mix(in oklab, var(--color-warning) 12%, var(--color-surface));

/* Success state with subtle background */
background: color-mix(in oklab, var(--color-success) 16%, var(--color-surface));
```

### Brand Colors

| Color | Value | Usage |
|-------|-------|-------|
| Brand Primary | `#0ea5e9` (sky-500) | Primary actions, links |
| Brand Glow | `#06b6d4` (cyan-500) | Accents, highlights |
| AI/Agent | `#8b5cf6` (violet-500) | AI-related elements |

### Surface Colors

The application uses a **dark theme** with elevated surfaces:

```css
--color-background: #0f172a;      /* Darkest - page background */
--color-surface: #1e293b;         /* Default - card backgrounds */
--color-surface-2: #334155;       /* Elevated - inset panels */
--color-border: #334155;          /* Default borders */
--color-border-strong: #475569;   /* Strong borders */
```

---

## 📏 Spacing System

### Base Unit: 4px

All spacing is based on a **4px grid**:

```
4px  = 0.25rem = space-1
8px  = 0.5rem  = space-2
12px = 0.75rem = space-3
16px = 1rem    = space-4  (default)
24px = 1.5rem  = space-6
32px = 2rem    = space-8
48px = 3rem    = space-12
64px = 4rem    = space-16
```

### Common Spacing Patterns

```tsx
// Panel padding
<div className="p-4">...</div>          // 16px

// Grid gaps
<div className="gap-4">...</div>        // 16px between items
<div className="gap-6">...</div>        // 24px between items

// Inline gaps
<div className="gap-x-4">...</div>       // 16px horizontal gap
<div className="gap-y-2">...</div>       // 8px vertical gap

// Section spacing
<div className="mt-6">...</div>          // 24px top margin
<div className="mb-8">...</div>          // 32px bottom margin
```

---

## 🔤 Typography Scale

### Font Sizes & Line Heights

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `.text-xs` | 0.75rem | 1rem | Labels, captions |
| `.text-sm` | 0.875rem | 1.25rem | Secondary text |
| `.text-base` | 1rem | 1.5rem | Body text |
| `.text-lg` | 1.125rem | 1.75rem | Subheadings |
| `.text-xl` | 1.25rem | 1.75rem | Headings |
| `.text-2xl` | 1.5rem | 2rem | Section titles |
| `.text-3xl` | 1.875rem | 2.25rem | Page titles |
| `.text-4xl` | 2.25rem | 2.5rem | Hero text |

### Special Text Classes

```tsx
// Monospace numbers (for data)
<span className="num">42</span>

// Label text (small, uppercase, tracking wide)
<span className="label-xs">Disruption Detected</span>

// Uppercase tracking
<span className="tracking-[0.02em] uppercase">Network Resilience</span>
<span className="tracking-[0.08em] uppercase">Active Disruptions</span>
<span className="tracking-[0.1em] uppercase">Critical</span>
<span className="tracking-[0.14em] uppercase">Supplier</span>
<span className="tracking-[0.18em] uppercase">INC-2048</span>
```

---

## 💡 Best Practices

### 1. **Use Semantic Classes**

✅ **Do:** Use utility classes that describe intent
```tsx
<div className="text-critical">Error message</div>
<button className="bg-surface-2 hover:bg-surface-3">Click</button>
```

❌ **Don't:** Use arbitrary values without meaning
```tsx
<div style={{ color: '#ef4444' }}>Error message</div>
<button style={{ background: '#334155' }}>Click</button>
```

### 2. **Leverage Tailwind's `@apply` Sparingly**

Use `@apply` only for complex, repeated utility combinations. Prefer inline utility classes.

### 3. **Component Composition**

Build complex UIs by composing simple, styled components:

```tsx
// ✅ Good: Composed from smaller styled components
<Panel>
  <Panel.Header>
    <StatusBadge status="critical" />
    <Title level="h2">Disruption Analysis</Title>
  </Panel.Header>
  <Panel.Content>
    <NetworkGraph />
  </Panel.Content>
</Panel>

// ❌ Bad: Monolithic component with inline styles
<div style={{ border: '1px solid #334155', borderRadius: '4px', padding: '16px' }}>
  <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
    {/* ... */}
  </div>
</div>
```

### 4. **Status-Based Styling**

Use the semantic color system consistently:

```tsx
function StatusIndicator({ status }: { status: 'critical' | 'warning' | 'success' | 'info' }) {
  const variants = {
    critical: 'text-critical border-critical/45 bg-critical/12',
    warning: 'text-warning border-warning/40 bg-warning/10',
    success: 'text-success border-success/40 bg-success/10',
    info: 'text-info border-info/40 bg-info/10',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm 
          border px-1.5 py-0.5 font-mono text-[10px] leading-4 
          tracking-[0.09em] uppercase ${variants[status]}`}>
      {status}
    </span>
  );
}
```

### 5. **Responsive Design**

Use Tailwind's responsive prefixes:

```tsx
// Mobile-first approach
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {/* On mobile: 1 column, sm (640px+): 2 columns, xl (1280px+): 4 columns */}
</div>

// Hide on mobile, show on larger screens
<div className="hidden lg:flex">...</div>

// Different padding on mobile vs desktop
<div className="p-4 md:p-6">...</div>
```

### 6. **Accessibility**

```tsx
// Always include focus states
<button className="focus:outline-none focus:ring-2 focus:ring-brand/50">
  Click me
</button>

// Ensure sufficient color contrast
// ✅ Good contrast (4.5:1+)
<span className="text-foreground">Text on surface</span>

// ❌ Bad contrast
<span className="text-critical/50">Red text on dark background</span>

// Use semantic HTML
<button aria-label="Close panel" aria-hidden="true">
  <XIcon />
</button>
```

---

## ⚡ Performance Considerations

### 1. **CSS Bundle Size**

- Tailwind CSS v4 uses **zero-runtime** CSS generation
- Only the utilities you use are included in the final CSS
- No purge configuration needed

### 2. **Animation Performance**

```tsx
// ✅ Good: Hardware-accelerated properties
<div className="transition-transform duration-200">
  {/* transform, opacity are GPU-accelerated */}
</div>

// ⚠️ Use sparingly: Properties that trigger layout/repaint
<div className="transition-all duration-200">
  {/* Avoid animating width, height, top, left */}
</div>

// Use tw-animate-css for complex animations
import 'tw-animate-css';
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  {/* Pre-defined animations */}
</div>
```

### 3. **SVG Optimization**

```tsx
// ✅ Good: Inline SVG with currentColor
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="currentColor" strokeWidth="2">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</svg>

// ✅ Good: Use Lucide icons (already optimized)
import { AlertTriangle } from 'lucide-react';
<AlertTriangle className="size-4 text-critical" />
```

---

## 🛠️ Tooling & Workflow

### Development Tools

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

### VS Code Extensions (Recommended)

- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **PostCSS Language Support** - Syntax highlighting
- **ESLint** - Linting support
- **Prettier** - Code formatting

### Browser Tools

- **Tailwind CSS DevTools** - Inspect Tailwind classes in browser
- **React Developer Tools** - Inspect React components

---

## 📁 File Structure

```
src/
├── components/
│   └── parallax/
│       ├── primitives.tsx      # Base styled components (Panel, Button, etc.)
│       ├── NetworkGraph.tsx    # Network visualization
│       ├── StatusBadge.tsx     # Status indicator component
│       ├── RecommendationCard.tsx
│       └── ...
├── lib/
│   └── parallax/
│       ├── data.ts             # Mock data & types
│       ├── engine.ts           # Recovery path engine
│       └── store.tsx           # Application state
├── services/
│   ├── api.ts                 # API client
│   ├── config.ts              # API configuration
│   ├── disruptionService.ts   # Disruption API service
│   ├── masterService.ts       # Master data service
│   └── ...
├── styles/
│   └── globals.css            # Global CSS (Tailwind directives)
└── types/
    └── parallax.ts            # TypeScript types

server/
├── src/
│   ├── api/
│   │   ├── router.ts          # API route definitions
│   │   ├── disruptions.ts     # Disruption endpoints
│   │   ├── master.ts           # Master data endpoints
│   │   └── health.ts          # Health endpoint
│   └── db/
│       ├── schema.ts          # Database schema
│       ├── seed.ts            # Database seeding
│       └── client.ts          # Database client
```

---

## 🔄 Migration Guide

### From Tailwind v3 to v4

The project uses **Tailwind CSS v4** with the new `@tailwindcss/vite` plugin:

```diff
- // tailwind.config.js (v3)
+ // vite.config.ts (v4)
  import { defineConfig } from '@lovable.dev/vite-tanstack-config';
  
  export default defineConfig({
    vite: {
-     plugins: [tailwindcss()],
+     // Tailwind v4 is handled by @lovable.dev/vite-tanstack-config
    },
  });
```

Key changes in v4:
- **No tailwind.config.js** - Configuration via CSS `@config` or `@source` directives
- **Zero-runtime** - All CSS is generated at build time
- **Simplified syntax** - No more `@apply`, use `@theme` instead

### Adding New Colors

```css
/* In globals.css */
@theme {
  --color-brand: #0ea5e9;
  --color-brand-glow: #06b6d4;
  --color-ai: #8b5cf6;
}
```

---

## 📚 Resources

### Official Documentation

- [Tailwind CSS v4](https://tailwindcss.com)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [@tailwindcss/vite](https://github.com/tailwindlabs/tailwindcss-vite)

### Design Inspiration

- [Tailwind UI](https://tailwindui.com) - Official component library
- [Heroicons](https://heroicons.com) - MIT-licensed icons
- [Lucide Icons](https://lucide.dev) - Community icon library

### Color Tools

- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Mixing Calculator](https://codepen.io/sosuke/pen/Pjoqqp)

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial design system documentation |
| 1.1.0 | 2025-02 | Added component patterns section |
| 1.2.0 | 2025-03 | Added accessibility guidelines |

---

## 🤝 Contributing

When adding new components or styles:

1. **Follow existing patterns** - Check if a similar component already exists
2. **Use semantic classes** - Prefer utility classes over custom CSS
3. **Document new patterns** - Add examples to this guide
4. **Test responsiveness** - Verify on mobile, tablet, and desktop
5. **Check accessibility** - Use browser dev tools to verify contrast

---

## 📄 License

This styling guide is part of the **Parallax Capability Navigator** project.

© 2025 Parallax Team. All rights reserved.

---

*Last updated: September 1, 2026*
