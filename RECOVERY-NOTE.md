# Drith Infra — Last Good Chat Version

Recovered from the verified July 13, 2026 production build created in this Codex chat.

This folder is independent from the overwritten `apps/web` folder. It includes:

- recovered editable React/TypeScript source files;
- the exact compiled visual styling from the last-good build;
- the organized local image assets, including the four expandable SDG images;
- a verified production build in `dist`.

## Run locally

From this folder:

```powershell
npm install
npm run dev
```

Then open `http://localhost:5173/`.

## Verified recovery

- TypeScript typecheck: passed
- Vite production build: passed
- Original `apps/web` folder: left untouched
