# Mengki Games

Two lightweight games built with **Vite and vanilla TypeScript** without a UI
framework: **Find Mengki** and **Catch the Bananas**. This codebase was migrated
from plain HTML, CSS, and JavaScript without a build process into a modular,
maintainable project structure.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Installation and development

```sh
npm install
npm run dev
```

Open the URL displayed by Vite, usually `http://localhost:5173`. Changes to
HTML, CSS, and TypeScript are reloaded automatically.

## Available commands

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Vite development server             |
| `npm run preview`      | Preview the production build locally          |
| `npm run typecheck`    | Check TypeScript types without creating files |
| `npm test`             | Run the core game-rule tests once             |
| `npm run format`       | Format the source code with Prettier          |
| `npm run format:check` | Check formatting without changing files       |
| `npm run build`        | Type-check and create a production build      |

Before creating a commit, run:

```sh
npm run format:check
npm run typecheck
npm test
npm run build
```

## Continuous integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on pushes and
pull requests targeting `main`, and can also be started manually. It installs
dependencies with `npm ci`, checks formatting and TypeScript, runs the tests,
builds the production bundle, and stores `dist/` as a seven-day workflow
artifact.

The workflow validates the project but does not deploy it. This keeps CI
independent from the Vercel deployment configuration that can be connected
later.

## Project structure

```text
├── index.html                 Markup and panels for both games
├── assets/                    Original images and animations
├── src/
│   ├── main.ts                Application entry point
│   ├── navigation.ts          Panel navigation and game lifecycle
│   ├── find-mengki.ts         Find Mengki interactions
│   ├── catch-banana.ts        Catch the Bananas loop and controls
│   ├── game-rules.ts          Pure game-rule functions
│   ├── game-constants.ts      Constants shared by both games
│   ├── mengki-positions.ts    Mengki position data
│   ├── model-context.ts       Optional model-context integration
│   ├── dom.ts                 DOM access helper
│   └── styles.css             Responsive styling
├── tests/game-rules.test.ts   Core game-rule tests
├── .github/workflows/ci.yml   GitHub Actions verification workflow
├── package.json               Scripts and development dependencies
├── package-lock.json          Locked dependency versions
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

`node_modules/`, `dist/`, coverage reports, tool caches, logs, local environment
files, and editor or operating-system metadata are ignored by Git and should
not be committed. `package-lock.json` should remain under version control to
keep dependency installation reproducible.

## Controls

| Game              | Desktop                                                     | Mobile                                             |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| Find Mengki       | Click Mengki; zoom with the mouse wheel or +/−; drag to pan | Tap Mengki; zoom with +/− or pinch; drag the image |
| Catch the Bananas | Use ←/→ or A/D                                              | Use the on-screen ← and → buttons                  |

## Production build and static deployment

```sh
npm run build
```

The production build is generated in `dist/`. To inspect it locally before
deployment, run:

```sh
npm run preview
```

Upload the **contents of `dist/`** to the public directory of any static web
server. The `base: './'` configuration keeps generated JavaScript, CSS, and
asset URLs relative so the game can be hosted at either a root domain or a
subdirectory.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name games.example.com;
    root /var/www/mengki;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

For GitHub Pages, deploy the contents of `dist/` through a Pages workflow or
branch. The project does not require a backend or database.

## Vite migration notes

- `index.html` is now the Vite HTML entry point and loads `src/main.ts` as a module.
- CSS lives in `src/styles.css` and is processed together with the assets by Vite.
- The games no longer share a single global script; each game has its own module and lifecycle.
- Testable game rules are separated from DOM manipulation.
- Source assets remain in `assets/`; Vite creates hashed copies for production builds.
- `dist/` is generated build output and is not stored in Git.

## Core rules

- Find Mengki contains 10 Mengkis; four are smaller and more concealed. The same Mengki can only be counted once.
- Catch the Bananas starts with 3 lives. Catching a banana adds one point, while missing one removes one life.
- Switching games stops active animations, removes active bananas, and releases the previous game's event listeners.

The Mengki illustrations and jungle background were created with AI assistance
for this project. The transparent GIF was assembled from the illustration
frames.

## Copyright

Copyright © 2026 Raden Argo Dahono. All rights reserved. Source code, Mengki character, and game assets are published for portfolio viewing only. No permission is granted to reuse, modify, or redistribute them without prior written consent.
