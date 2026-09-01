# 🎨 HENZ Design System

> **HENZ** - Highly Engineered Node Zero Styles
> *A premium design system for enterprise-grade applications*

---

## 🌟 Philosophy

**HENZ** (Highly Engineered Node Zero) is a design system built for **clarity, precision, and performance**. Every visual decision serves a purpose. No decorative fluff. No unnecessary complexity. Just **elegant, functional, and intentional** design.

### Core Principles

1. **🎯 Purpose Over Aesthetics** - Every pixel has a job
2. **⚡ Performance First** - Zero runtime CSS, optimized animations
3. **📐 Mathematical Precision** - 4px grid, consistent spacing
4. **🎨 Status-Driven** - Colors communicate meaning, not decoration
5. **♿ Accessibility by Default** - WCAG 2.1 AA minimum
6. **🔄 Consistency Always** - Reuse patterns, never reinvent

---

## 🚀 Quick Start

### Installation

HENZ is built on **Tailwind CSS v4** with zero-runtime generation:

```bash
# Core dependencies (already included in project)
npm install tailwindcss @tailwindcss/vite

# Additional utilities
npm install tw-animate-css lucide-react
```

### Basic Usage

```tsx
import { Panel, Button, StatusBadge, NetworkGraph } from '@/components/parallax';

function CriticalDisruptionCard() {
  return (
    <Panel className="p-4">
      <Panel.Header>
        <StatusBadge status="critical" className="mb-2" />
        <h2 className="text-[13px] font-semibold tracking-[0.02em] uppercase text-foreground">
          Critical Supplier Disruption
        </h2>
      </Panel.Header>
      <Panel.Content>
        <p className="text-sm text-muted-foreground mt-1">
          MedCore Components Ltd. (SUP-1001) - Production risk in 72 hours
        </p>
        <Button variant="critical" size="sm" className="mt-4">
          Analyze Incident
        </Button>
      </Panel.Content>
    </Panel>
  );
}
```

---

## 🎨 Visual Identity

### Color Palette

#### 🟥 Status Colors (The HENZ Heartbeat)

| Status | Hex | Tailwind | Usage | Preview |
|--------|-----|---------|-------|---------|
| **Critical** | `#ef4444` | `text-critical` | Disruptions, failures, errors | <span style="color: #ef4444; font-weight: bold;">● CRITICAL</span> |
| **Warning** | `#f59e0b` | `text-warning` | At-risk, partial, warnings | <span style="color: #f59e0b; font-weight: bold;">● WARNING</span> |
| **Success** | `#10b981` | `text-success` | Healthy, available, success | <span style="color: #10b981; font-weight: bold;">● SUCCESS</span> |
| **Info** | `#3b82f6` | `text-info` | Information, neutral, default | <span style="color: #3b82f6; font-weight: bold;">● INFO</span> |
| **Muted** | `#6b7280` | `text-muted-foreground` | Secondary text, disabled | <span style="color: #6b7280; font-weight: bold;">● MUTED</span> |

#### 🌌 Dark Theme Surfaces

| Surface | Hex | Tailwind | Usage |
|---------|-----|---------|-------|
| **Background** | `#0f172a` | `bg-background` | Page background |
| **Surface** | `#1e293b` | `bg-surface` | Card/panel backgrounds |
| **Surface-2** | `#334155` | `bg-surface-2` | Elevated surfaces, borders |
| **Surface-3** | `#475569` | `bg-surface-3` | Hover states |

#### 💎 Brand Colors

| Brand | Hex | Tailwind | Usage |
|-------|-----|---------|-------|
| **Primary** | `#0ea5e9` | `text-brand` | Primary actions, links |
| **Glow** | `#06b6d4` | `text-brand-glow` | Accents, highlights |
| **AI** | `#8b5cf6` | `text-ai` | AI/agent elements |

### Typography

#### 🔤 Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### 📏 Type Scale

```
┌─────────────┬──────────┬─────────────┬─────────────────────┐
│ Class        │ Size     │ Line Height │ Usage                 │
├─────────────┼──────────┼─────────────┼─────────────────────┤
│ .text-xs     │ 12px     │ 16px        │ Labels, captions      │
│ .text-sm     │ 14px     │ 20px        │ Secondary text       │
│ .text-base   │ 16px     │ 24px        │ Body text            │
│ .text-lg     │ 18px     │ 28px        │ Subheadings          │
│ .text-xl     │ 20px     │ 28px        │ Section titles        │
│ .text-2xl    │ 24px     │ 32px        │ Page titles          │
│ .text-3xl    │ 30px     │ 36px        │ Hero text            │
│ .text-4xl    │ 36px     │ 40px        │ Display text          │
└─────────────┴──────────┴─────────────┴─────────────────────┘
```

#### 🎯 Special Text Classes

```tsx
// Monospace numbers (for data display)
<span className="num">62,400</span>  // Tabular nums

// Label classes (uppercase, tracked)
<span className="label-xs">Disruption Detected</span>
<span className="label-sm">Active Disruptions</span>

// Tracking scale
.tracking-[0.02em]  // Tight tracking for headings
.tracking-[0.08em]  // Medium tracking for labels
.tracking-[0.1em]   // Wide tracking for badges
.tracking-[0.14em]  // Extra wide for node labels
.tracking-[0.18em]  // Maximum for IDs (INC-2048)
```

---

## 📐 Design Tokens

### 🎨 Color Tokens

```css
/* Semantic colors */
--color-critical: #ef4444;
--color-warning: #f59e0b;
--color-success: #10b981;
--color-info: #3b82f6;
--color-muted: #6b7280;

/* Surface colors */
--color-background: #0f172a;
--color-surface: #1e293b;
--color-surface-2: #334155;
--color-surface-3: #475569;

/* Border colors */
--color-border: #334155;
--color-border-strong: #475569;

/* Brand colors */
--color-brand: #0ea5e9;
--color-brand-glow: #06b6d4;
--color-ai: #8b5cf6;

/* Foreground colors */
--color-foreground: #f1f5f9;
--color-muted-foreground: #94a3b8;
```

### 📏 Spacing Tokens

```css
/* Base unit: 4px */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */ (default)
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 🔺 Border Radius

```css
--radius-sm: 0.125rem;   /* 2px */
--radius: 0.25rem;      /* 4px */ (default)
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Pill shape */
```

### ⚡ Transitions

```css
/* Default transition */
--transition: color, background-color, border-color;
--transition-duration: 200ms;
--transition-timing: cubic-bezier(0.25, 0.1, 0.5, 1); /* ease-out */

/* Slow transition */
--transition-duration-slow: 300ms;

/* Fast transition */
--transition-duration-fast: 150ms;
```

---

## 🧩 Component Library

### 📦 Layout Components

#### Panel

The fundamental container for all content.

**Variants:**
- `Panel` - Default panel
- `Panel.Header` - Panel header with border
- `Panel.Content` - Panel content area
- `panel-inset` - Panel with left border accent

```tsx
// Default panel
<Panel className="p-4">
  Content here
</Panel>

// Panel with header
<Panel>
  <Panel.Header>
    <h2 className="text-[13px] font-semibold tracking-[0.02em] uppercase">
      Title
    </h2>
  </Panel.Header>
  <Panel.Content>
    Content here
  </Panel.Content>
</Panel>

// Inset panel (with left border)
<div className="panel-inset border-critical/25 px-3 py-1.5">
  Critical content
</div>
```

**Styles:**
```css
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.panel-header {
  border-bottom: 1px solid var(--color-border);
  padding: 1rem;
}

.panel-content {
  padding: 1rem;
}

.panel-inset {
  border-left: 1px solid var(--color-border-strong);
}
```

#### Grid Layout

Responsive grid system based on 16px gaps.

```tsx
// 2 columns on small screens, 4 on extra large
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</div>

// Complex grid with different breakpoints
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
  {/* ... */}
</div>

// Grid with backdrop (for network graphs)
<div className="grid-backdrop overflow-x-auto rounded-sm border border-border bg-background/60">
  <svg viewBox="0 0 1330 430" className="h-auto w-full">
    {/* Network graph SVG */}
  </svg>
</div>
```

### 🔘 Form Components

#### Buttons

**Variants:**

```tsx
// Primary button (default)
<button className="btn">
  Primary Action
</button>

// Secondary button
<button className="btn btn-secondary">
  Secondary Action
</button>

// Critical button
<button className="btn btn-critical">
  Critical Action
</button>

// Ghost button
<button className="btn btn-ghost">
  <Icon className="size-4" />
</button>

// Icon button
<button className="btn btn-icon">
  <Icon className="size-4" />
</button>

// Small button
<button className="btn btn-sm">
  Small
</button>

// With loading state
<button className="btn" disabled>
  <Loader className="size-4 animate-spin" />
  Processing...
</button>
```

**Styles:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem; /* 11px */
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-foreground);
  transition: all 200ms ease-out;
}

.btn:hover {
  background: var(--color-surface-2);
  color: var(--color-foreground);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-critical {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-critical);
}

.btn-critical:hover {
  background: rgba(239, 68, 68, 0.25);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.625rem; /* 10px */
}

.btn-icon {
  padding: 0.5rem;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: var(--color-muted-foreground);
}

.btn-ghost:hover {
  background: var(--color-surface-2);
  color: var(--color-foreground);
}
```

#### Inputs

```tsx
// Text input
<input
  type="text"
  className="input"
  placeholder="Enter value..."
/>

// Text input with label
<div className="form-group">
  <label className="form-label">Supplier Name</label>
  <input type="text" className="input" />
  <p className="form-hint">Enter the supplier identifier</p>
</div>

// Search input
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <input
    type="search"
    className="input pl-10"
    placeholder="Search suppliers..."
  />
</div>

// Select dropdown
<select className="input">
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Styles:**
```css
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-foreground);
  transition: border-color 200ms, box-shadow 200ms;
}

.input::placeholder {
  color: rgba(148, 163, 184, 0.6); /* muted-foreground/60 */
}

.input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.5);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted-foreground);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}
```

### 🏷️ Status Indicators

#### StatusBadge

Compact status indicator for inline use.

```tsx
<StatusBadge status="critical">Critical</StatusBadge>
<StatusBadge status="warning">At Risk</StatusBadge>
<StatusBadge status="success">Healthy</StatusBadge>
<StatusBadge status="info">Available</StatusBadge>
<StatusBadge status="muted">Partial</StatusBadge>

// With icon
<StatusBadge status="critical">
  <OctagonAlert className="size-3" />
  Critical
</StatusBadge>

// Minimal (icon only)
<StatusBadge status="critical" minimal />
```

**Styles:**
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: 1;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
}

.status-badge-critical {
  border: 1px solid rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-critical);
}

.status-badge-warning {
  border: 1px solid rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-badge-success {
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-badge-info {
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.status-badge-muted {
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-muted-foreground);
}

.status-badge-minimal {
  padding: 0.125rem;
}
```

#### SourceBadge

Indicator showing data source (SAP, demo, etc.)

```tsx
<SourceBadge source="sap" />
<SourceBadge source="demo" />
<SourceBadge source="sap" label="SAP S/4HANA" />
```

**Styles:**
```css
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid;
  border-radius: var(--radius-sm);
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.35);
  color: rgba(59, 130, 246, 0.9);
}
```

### 📊 Data Visualization

#### Progress Bar

```tsx
// Basic progress bar
<Progress value={75} />

// With status color
<Progress value={75} status="warning" />
<Progress value={25} status="critical" />
<Progress value={100} status="success" />

// Custom height
<Progress value={50} className="h-2" />
```

**Styles:**
```css
.progress {
  height: 0.375rem;
  width: 100%;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--color-surface-2);
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 500ms ease-out;
}

.progress-warning .progress-bar {
  background: var(--color-warning);
}

.progress-critical .progress-bar {
  background: var(--color-critical);
}

.progress-success .progress-bar {
  background: var(--color-success);
}
```

#### ResilienceGauge

Circular gauge for resilience scores.

```tsx
<ResilienceGauge value={87} />
<ResilienceGauge value={87} status="success" />
<ResilienceGauge value={45} status="critical" />
```

**Styles:**
```css
.resilience-gauge {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
}

.resilience-gauge svg {
  transform: rotate(-90deg);
}

.resilience-gauge circle:first-of-type {
  stroke: var(--color-surface-2);
}

.resilience-gauge-success circle:last-of-type {
  stroke: var(--color-success);
}

.resilience-gauge-warning circle:last-of-type {
  stroke: var(--color-warning);
}

.resilience-gauge-critical circle:last-of-type {
  stroke: var(--color-critical);
}
```

#### Network Graph

The signature visualization component for supply chain networks.

```tsx
<NetworkGraph
  nodes={graphNodes}
  edges={graphEdges}
  onNodeClick={handleNodeClick}
  selectedNode={selectedNodeId}
/>
```

**Node Styles:**
```css
/* Supplier node */
.network-node-supplier {
  fill: var(--color-surface);
  stroke: var(--color-border-strong);
}

/* Supplier node (critical) */
.network-node-supplier-critical {
  fill: color-mix(in oklab, var(--color-critical) 16%, var(--color-surface));
  stroke: var(--color-critical);
}

/* Factory node */
.network-node-factory {
  fill: var(--color-surface);
  stroke: var(--color-border-strong);
}

/* Machine node */
.network-node-machine {
  fill: var(--color-surface);
  stroke: var(--color-border-strong);
}

/* Capability node */
.network-node-capability {
  fill: color-mix(in oklab, var(--color-warning) 12%, var(--color-surface));
  stroke: var(--color-warning);
}

/* Outcome node */
.network-node-outcome {
  fill: var(--color-surface);
  stroke: var(--color-border-strong);
}
```

---

## 🎨 Component Patterns

### 📋 Card Patterns

#### Metric Card

```tsx
<Panel>
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="label-xs">Network Resilience</p>
      <p className="num mt-3 font-semibold text-4xl text-success">
        87<span className="ml-1 text-base font-normal text-muted-foreground">/ 100</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">+6.4% this month</p>
    </div>
    <div className="shrink-0 self-center">
      <ResilienceGauge value={87} />
    </div>
  </div>
</Panel>
```

#### List Card

```tsx
<Panel>
  <Panel.Header>
    <h2 className="text-[13px] font-semibold tracking-[0.02em] uppercase">
      Active Disruptions
    </h2>
  </Panel.Header>
  <Panel.Content>
    <div className="divide-y divide-border">
      {disruptions.map(disruption => (
        <DisruptionRow key={disruption.id} disruption={disruption} />
      ))}
    </div>
  </Panel.Content>
</Panel>
```

### 🎯 Status Patterns

#### Disruption Header

```tsx
<div className="flex items-start gap-3">
  <span className="size-9 grid place-items-center rounded-sm 
        border border-critical/40 bg-critical/10 shrink-0">
    <PulseRing className="size-3" />
    <OctagonAlert className="lucide lucide-octagon-alert size-4 text-critical" />
  </span>
  <div className="min-w-0">
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm 
          border border-info/35 bg-info/8 px-1.5 py-0.5 font-mono 
          text-[9px] leading-4 tracking-[0.18em] text-info/90 uppercase">
      <Database className="size-2.5" />
      SAP S/4HANA
    </span>
    <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.01em]">
      MedCore Components Ltd. unavailable
    </h2>
    <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
      Cold-chain packaging component — PARALLAX treats this as a lost capability, 
      not a lost supplier.
    </p>
  </div>
</div>
```

#### Stat Row

```tsx
<div className="flex items-baseline justify-between gap-4 
      border-b border-border/70 py-2">
  <span className="label-xs shrink-0">Affected</span>
  <span className="text-right text-xs text-foreground">ThermoShield Packaging</span>
</div>
```

### 🔗 Navigation Patterns

#### Next Steps

```tsx
<div className="divide-y divide-border">
  <a 
    href="/capability-map" 
    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/70"
  >
    <span className="mt-0.5">
      <GitBranch className="size-4 text-info" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium">Decompose the lost capability</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        See which sub-capabilities survived the disruption.
      </span>
    </span>
    <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground 
          transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
  </a>
</div>
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use semantic color tokens**
   ```tsx
   // ✅ Good
   <div className="text-critical">Error</div>
   <div className="bg-surface">Content</div>
   
   // ❌ Bad
   <div style={{ color: '#ef4444' }}>Error</div>
   <div style={{ background: '#1e293b' }}>Content</div>
   ```

2. **Compose components**
   ```tsx
   // ✅ Good
   <Panel>
     <Panel.Header>Title</Panel.Header>
     <Panel.Content>Content</Panel.Content>
   </Panel>
   
   // ❌ Bad
   <div className="border border-border rounded p-4">
     <div className="border-b border-border pb-2 mb-2">Title</div>
     <div>Content</div>
   </div>
   ```

3. **Use the type scale consistently**
   ```tsx
   // ✅ Good
   <h1 className="text-2xl font-semibold">Page Title</h1>
   <h2 className="text-xl font-semibold">Section Title</h2>
   <p className="text-base">Body text</p>
   <span className="text-sm">Secondary text</span>
   
   // ❌ Bad
   <h1 style={{ fontSize: '28px' }}>Page Title</h1>
   <p style={{ fontSize: '15px' }}>Body text</p>
   ```

4. **Leverage the spacing system**
   ```tsx
   // ✅ Good
   <div className="p-4">...</div>
   <div className="gap-4">...</div>
   <div className="mt-6">...</div>
   
   // ❌ Bad
   <div style={{ padding: '18px' }}>...</div>
   <div style={{ marginTop: '22px' }}>...</div>
   ```

5. **Always include focus states**
   ```tsx
   // ✅ Good
   <button className="focus:outline-none focus:ring-2 focus:ring-brand/50">
     Click
   </button>
   
   // ❌ Bad
   <button>Click</button>
   ```

### ❌ DON'T

1. **Don't use arbitrary values**
   ```tsx
   // ❌ Bad
   <div className="text-[17px]">...</div>
   <div className="p-[13px]">...</div>
   
   // ✅ Good
   <div className="text-lg">...</div>
   <div className="p-3">...</div>
   ```

2. **Don't create new color variants**
   ```tsx
   // ❌ Bad
   <div className="text-[#ff0000]">...</div>
   <div className="bg-[#1a1a1a]">...</div>
   
   // ✅ Good
   <div className="text-critical">...</div>
   <div className="bg-background">...</div>
   ```

3. **Don't use !important**
   ```css
   /* ❌ Bad */
   .my-class {
     color: red !important;
   }
   
   /* ✅ Good - Use Tailwind's utility precedence */
   <div className="text-critical">...</div>
   ```

4. **Don't inline complex styles**
   ```tsx
   // ❌ Bad
   <div style={{ 
     display: 'flex', 
     alignItems: 'center',
     gap: '12px',
     padding: '16px',
     border: '1px solid #334155',
     borderRadius: '4px'
   }}>
     ...
   </div>
   
   // ✅ Good
   <Panel className="p-4">
     <div className="flex items-center gap-3">
       ...
     </div>
   </Panel>
   ```

5. **Don't use @apply for simple cases**
   ```css
   /* ❌ Bad */
   .my-button {
     @apply inline-flex items-center gap-1.5 rounded-sm border border-border 
            bg-surface px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] 
            uppercase transition-colors hover:bg-surface-2;
   }
   
   /* ✅ Good - Just use the classes directly */
   <button className="inline-flex items-center gap-1.5 rounded-sm border border-border 
           bg-surface px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] 
           uppercase transition-colors hover:bg-surface-2">
     Click
   </button>
   ```

---

## ⚡ Performance

### CSS Optimization

- **Tailwind v4** generates **zero-runtime CSS**
- Only used utilities are included in the bundle
- No purge configuration needed
- Average CSS bundle size: **~10-20KB** (gzipped)

### Animation Guidelines

```tsx
// ✅ Good - Hardware-accelerated properties
<div className="transition-transform duration-200">
  {/* transform, opacity are GPU-accelerated */}
</div>

// ✅ Good - Use tw-animate-css for complex animations
import 'tw-animate-css';
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  Content
</div>

// ⚠️ Use sparingly - Triggers layout/repaint
<div className="transition-all duration-200">
  {/* Avoid animating: width, height, top, left, right, bottom */}
</div>

// ❌ Bad - Don't animate on large lists
{items.map(item => (
  <div key={item.id} className="transition-all duration-500">
    {item.name}
  </div>
))}
```

### SVG Optimization

```tsx
// ✅ Good - Inline SVG with currentColor
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="currentColor" strokeWidth="2">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</svg>

// ✅ Good - Use Lucide icons
import { AlertTriangle, Database, GitBranch } from 'lucide-react';
<AlertTriangle className="size-4 text-critical" />

// ❌ Bad - Don't import heavy icon libraries
import { Icon } from 'heavy-icon-library';
```

---

## 🛠️ Tooling

### VS Code Extensions

- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **PostCSS Language Support** - Syntax highlighting for CSS
- **ESLint** - Linting support
- **Prettier** - Code formatting
- **GitLens** - Git integration

### Browser DevTools

- **Tailwind CSS DevTools** - Inspect Tailwind classes
- **React Developer Tools** - Inspect component hierarchy
- **Accessibility Inspector** - Check contrast ratios

### Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Format
npm run format
```

---

## 📁 File Structure

```
src/
├── components/
│   └── parallax/
│       ├── primitives.tsx      # Base components (Panel, Button, Badge)
│       ├── NetworkGraph.tsx    # Network visualization
│       ├── StatusBadge.tsx     # Status indicator
│       ├── ResilienceGauge.tsx # Circular gauge
│       ├── Progress.tsx        # Progress bar
│       ├── SourceBadge.tsx     # Data source indicator
│       └── ...
├── lib/
│   └── parallax/
│       ├── data.ts             # Mock data & types
│       ├── engine.ts           # Recovery engine
│       └── store.tsx           # State management
├── services/
│   ├── api.ts                 # API client
│   ├── config.ts              # Configuration
│   └── *.ts                   # Service layers
├── styles/
│   └── globals.css            # Global styles & Tailwind config
└── types/
    └── parallax.ts            # TypeScript types

server/
├── src/
│   ├── api/
│   │   ├── router.ts          # Route definitions
│   │   ├── *.ts               # API handlers
│   └── db/
│       ├── schema.ts          # Database schema
│       ├── seed.ts            # Data seeding
│       └── client.ts          # DB client
```

---

## 🔄 Migration Guide

### From Tailwind v3 to v4

The project uses **Tailwind CSS v4** with `@tailwindcss/vite`:

```diff
- // tailwind.config.js (v3)
+ // vite.config.ts (v4)
  import { defineConfig } from '@lovable.dev/vite-tanstack-config';
  
  export default defineConfig({
    vite: {
-     plugins: [tailwindcss()],
+     // Tailwind v4 handled by @lovable.dev/vite-tanstack-config
    },
  });
```

Key v4 changes:
- **No tailwind.config.js** - Use `@config` or `@source` in CSS
- **Zero-runtime** - All CSS generated at build time
- **No purge** - Automatic tree-shaking
- **Simpler syntax** - Direct `@theme` usage

### Adding New Tokens

```css
/* In globals.css */
@theme {
  --color-new-brand: #3b82f6;
  --space-20: 5rem;
}
```

---

## 📚 Resources

### Documentation

- [Tailwind CSS v4](https://tailwindcss.com)
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [@tailwindcss/vite](https://github.com/tailwindlabs/tailwindcss-vite)
- [Lucide Icons](https://lucide.dev)

### Tools

- [Tailwind Play](https://play.tailwindcss.com) - Online editor
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [CSS Triggers](https://csstriggers.com) - Performance reference
- [Can I Use](https://caniuse.com) - Browser compatibility

### Inspiration

- [Tailwind UI](https://tailwindui.com) - Official components
- [Heroicons](https://heroicons.com) - MIT icons
- [DaisyUI](https://daisyui.com) - Component library
- [Skeleton UI](https://www.skeleton.dev) - Design system

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial HENZ design system |
| 1.1.0 | 2025-02 | Added component library |
| 1.2.0 | 2025-03 | Added best practices section |
| 1.3.0 | 2025-04 | Added performance guidelines |
| 2.0.0 | 2025-09 | Complete redesign for Parallax project |

---

## 🤝 Contributing

When adding styles or components:

1. ✅ **Follow existing patterns** - Check for similar components
2. ✅ **Use semantic classes** - Prefer utility classes
3. ✅ **Document new patterns** - Add to this guide
4. ✅ **Test responsiveness** - Verify on all breakpoints
5. ✅ **Check accessibility** - Use dev tools
6. ✅ **Keep it simple** - Less is more

---

## 📄 License

HENZ Design System © 2025 Parallax Team

Part of the **Capability Navigator** project. All rights reserved.

---

> **"Design is not just what it looks like and feels like. Design is how it works."** - Steve Jobs

*Last updated: September 1, 2026*
