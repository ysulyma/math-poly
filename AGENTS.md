# AGENTS.md

Guidelines for AI agents working in the math-poly codebase.

## Project Overview

React/TypeScript application for interactive mathematical visualizations related to the paper "RO(G)-graded norms for prismatic and de Rham-Witt theory". Uses MathJax/KaTeX for LaTeX rendering.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Tailwind CSS 4, Biome (linting/formatting)

## Build Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

## Linting and Formatting

This project uses **Biome** for linting and formatting:

```bash
# Check for lint errors
npx biome check .

# Fix lint errors and format
npx biome check --write .

# Format only
npx biome format --write .
```

## Testing

**No test framework is currently configured.** There are no test files or test scripts.

If adding tests in the future, Vitest is recommended for Vite projects:
```bash
# (hypothetical) Run all tests
npm test

# (hypothetical) Run single test file
npm test -- src/utils.test.ts

# (hypothetical) Run tests matching pattern
npm test -- -t "legendre"
```

## Code Style Guidelines

### Formatting (enforced by Biome)

- **Indentation:** Tabs (not spaces)
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Trailing commas:** Yes
- **Line width:** Default (80 characters)

### Import Organization

Imports are auto-organized by Biome. Follow this order:

1. External library imports (alphabetized)
2. Relative imports
3. CSS imports last

```typescript
// External libraries first
import { MJX } from "@liqvid/mathjax/plain";
import { range } from "@liqvid/utils";
import { useCallback, useEffect, useState } from "react";

// Relative imports
import { macros } from "../macros";

// CSS imports last
import "./styles.css";
```

Use `import type` for type-only imports:
```typescript
import type { JSX } from "react";
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React components | PascalCase | `TR`, `App`, `HOTRSS` |
| Component files | PascalCase.tsx | `TR.tsx`, `App.tsx` |
| Utility modules | camelCase.ts | `utils.ts`, `latex.ts` |
| Functions | camelCase | `formatSum`, `handleNChange` |
| Variables | camelCase | `summands`, `rootElement` |
| Interfaces/Types | PascalCase | `TRConfig`, `TabData` |
| CSS files | kebab-case.css | `styles.css` |
| CSS classes | kebab-case or BEM-like | `tr-input-row`, `TabsTrigger` |

### TypeScript

- **Strict mode is enabled** - all code must pass strict type checking
- Use explicit interface definitions for component props
- Prefer union types for constrained values: `"char-p" | "torsion-free"`
- Use type assertions sparingly: `as HTMLElement`
- Non-null assertions (`!`) are allowed but use judiciously

```typescript
export interface TRConfig {
	n: number;
	alpha: number[];
	ringType: "char-p" | "torsion-free";
	page: number;
}
```

### React Patterns

- Use **function components** (no class components)
- Use `useCallback` for event handlers passed to children
- Use `useEffect` for side effects
- Use `useState` for local component state
- Wrap app in `React.StrictMode`
- Use `input.valueAsNumber` instead of `parseInt(input.value)` for number inputs

### Comments and Documentation

- Use JSDoc for function documentation:
```typescript
/** Get the p-adic valuation of n! */
export function legendre(n: number, p: number): number {
```

- Single-line comments for brief explanations:
```typescript
// components need to have a capital variable name
const Component = t.component;
```

### LaTeX/Math Handling

- Use `String.raw` template literals for LaTeX strings to avoid escaping backslashes:
```typescript
const { raw } = String;
left = raw`\dRW[${r - 1}]^j_S`;
```

- Inside `<MJX>`, use `\dRW[n]` (MathJax supports optional arguments)
- Inside `<KTX>`, use `\dRW{n}` (KaTeX does not support LaTeX optional arguments)
- String concatenation is allowed (Biome `useTemplate: "off"`)
- Custom macros are defined in `src/macros.ts`

#### Simplification/Fading Logic

- When `simplified === true`, any non-positive filtration value (e.g. `\Fil^{0}` or `\Fil^{-1}`) should be omitted. When `simplified === false`, it should be included but grayed out with the `\fade` macro.

- When `simplified === true`, `\dRW[n]` with `n < 0` should be replaced with `""` in the HOTRSS component, and `"0"` in the Answer component. When `simplified === false`, it should be grayed out with `\fade`. Note: this applies to the entire expression, e.g. `\dRW[-1] \otimes \{ \xi \}` should become `0`, not `0 \otimes \{\xi\}`.

### Error Handling

- Minimal explicit error handling in this codebase
- Use optional chaining for safety: `window.MathJax?.typesetPromise`
- Guard clauses for early returns: `if (!container) return;`

## Project Structure

```
src/
├── main.tsx          # React entry point
├── App.tsx           # Main app component with tab navigation
├── App.css           # App-specific styles
├── styles.css        # Global styles (imports Tailwind)
├── utils.ts          # Math utility functions
├── latex.ts          # LaTeX formatting utilities
├── macros.ts         # MathJax/LaTeX macro definitions
├── vite-env.d.ts     # Vite type declarations
└── tabs/             # Tab components
    └── TR.tsx        # TR (topological restriction) component
```

## Key Dependencies

- `@liqvid/katex` / `@liqvid/mathjax`: LaTeX rendering
- `@liqvid/utils`: Utility functions (e.g., `range`)
- `radix-ui`: UI primitives (Tabs)
- `classnames`: Conditional CSS class composition
- `tailwindcss`: Utility-first CSS

## Common Tasks

### Adding a new tab
1. Create component in `src/tabs/NewTab.tsx`
2. Import and add to `tabs` array in `src/App.tsx`

### Adding math utilities
Add functions to `src/utils.ts` with JSDoc comments.

### Adding LaTeX macros
Add to the `macros` string in `src/macros.ts`.
