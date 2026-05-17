# True Spaces (astransis)

Real geocentric planetary positions · IAU zodiac boundaries · [Astronomy Engine](https://github.com/cosinekitty/astronomy).

## Commands

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build (run before deploy)
pnpm start    # serve production build locally
```

## Deploy (Vercel)

1. Push this folder to GitHub (repo root = this project).
2. [vercel.com](https://vercel.com) → Import repository.
3. Framework: **Next.js** (auto-detected). Build: `pnpm build`. Output: default.
4. Deploy — no env vars required.

## Structure

- `app/` — Next.js App Router
- `components/TrueSpaces.tsx` — main UI
- `lib/` — astronomy calculations
- `legacy/index.html` — original single-file version (reference)

## Stack

Next.js · TypeScript · astronomy-engine · html2canvas
