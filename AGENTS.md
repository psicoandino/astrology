# AGENTS.md — astransis

## Project

True Spaces: planetary transit viewer (IAU signs, geocentric).

## Commands

- `pnpm dev` — development server
- `pnpm build` — must pass before PR/deploy
- `pnpm lint` — ESLint

## Rules

- Do not add dependencies without justification.
- Astronomy logic lives in `lib/astronomy.ts`, `lib/iau.ts`, `lib/planets.ts`.
- Main UI: `components/TrueSpaces.tsx` (client component).
- Preserve mobile-first layout in `app/globals.css`.
