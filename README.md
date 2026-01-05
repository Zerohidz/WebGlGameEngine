# WebGL2 Mini Game Engine

A 3D rendering engine built from scratch using WebGL 2.0 API.

## Project Requirements

- **Due Date:** January 7, 2026, 23:59
- **Core Features (100 pts):** Geometry generation, model loading, textures, lighting, camera, UI
- **Bonus Features (+50 pts):** Dual viewports, first-person controller

## Setup

```bash
npm install
npm run dev
```

## Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **gl-matrix** - Linear algebra (allowed helper library)
- **lil-gui** - UI controls (allowed helper library)
- **No React** - Vanilla TypeScript for WebGL imperative API

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript compilation check
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

## Project Structure

```
src/
├── main.ts              # Entry point
├── engine/              # Core engine (Renderer, Shader, Camera, Scene)
├── geometry/            # Primitives (Cube, Sphere, Cylinder, Prism)
├── loaders/             # OBJ & Texture loaders
├── lighting/            # Light system (Directional, Point)
├── materials/           # Material & Phong shader
├── controllers/         # First-person camera controller
├── shaders/             # GLSL vertex & fragment shaders
├── ui/                  # lil-gui scene management
└── utils/               # Helper utilities
```

## Implementation Plan

See [IMPLEMENTATION_PLAN.md](.gemini/antigravity/brain/.../implementation_plan.md) for detailed commit-by-commit breakdown.

## Progress Tracking

See [PROGRESS.md](PROGRESS.md) for current status, completed commits, and lessons learned.

**Current Status:** 3/15 commits completed (Commit 1-3: Setup, Shaders, Camera)

## Academic Integrity

All code is original work. No high-level 3D libraries (Three.js, Babylon.js, A-Frame) are used.
