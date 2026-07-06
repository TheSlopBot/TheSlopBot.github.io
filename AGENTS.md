# Agent conventions

Canonical reference for naming, layout, whitespace, and control flow. `.cursor/rules` extend this file.

## Layout

| Kind | Location |
|------|----------|
| App shell | `src/App.tsx`, `src/main.tsx` |
| Features | `src/features/<domain>/` |
| Theme tokens (TS) | `src/theme/tokens.ts` |
| Theme tokens (CSS) | `src/index.css` `:root` — values must match `tokens.ts` |

## Naming

| Kind | Pattern |
|------|---------|
| Components | `PascalCase.tsx`, `export default` |
| Hooks | `useName.ts` in the same feature folder |
| Event handlers | `handle` + action (`handleSubmit`) |
| Pure helpers | verb/noun, no `use` prefix |
| CSS classes | BEM on the block root (`page-header__link`) |

## TypeScript

- Arrow functions only — no `function` keyword, no `class`.
- Single-quoted strings; trailing commas in multiline literals.
- `interface` for object shapes; `type` for unions.
- `import type` for type-only imports.
- No `any`; no comments in agent-generated code.
- Exported hooks and factories: explicit parameter and return types.
- Factory guard at entry: `if (!dep) throw new Error('dep is not defined')`.

## Whitespace

- Four-space indent in TS/TSX/CSS.
- Blank line between logical steps inside multi-statement arrow bodies.
- Single-expression arrows: one line, no block body.

## Control flow

- Prefer early returns over nested conditionals.
- Optional callbacks: `onClose?.()`.

## React

- Named imports from `'react'` only.
- Hooks before any early return; no side effects in render.
- `useEffect` only for external subscriptions and browser sync.
- No inline `style` on JSX — use colocated CSS and custom properties.

## CSS

- Master theme (`src/index.css`) owns all color, font, radius, motion, and scrollbar tokens.
- Feature CSS references `var(--token)` only — no hardcoded hex/rgb/rgba in features.
- Transition every interactive property (color, border-color, opacity, transform).
- Respect `prefers-reduced-motion: reduce` for animation and continuous loops.
