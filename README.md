# 🎲 D120 Decision Roller

A photorealistic 3D dice roller built with React and Three.js. Roll a D120 to let fate decide between your choices.

**[Live Demo →](https://d120.adamcaskey.com)**

---

## Why even do this?

Mostly a personal project to learn more about modern development tools — working with React and Three.js, pushing code to GitHub, and deploying to the Cloudflare CDN. AI tools helped with some of the core scripting and troubleshooting along the way, but the real value was getting hands-on across the whole stack and seeing it actually work in the end. A great learning opportunity from start to finish.

## Why a D120??

Why not!! 😄 It came about from trying to decide where to go to dinner — we were literally rolling an actual D120 to pick a restaurant, and from that moment the idea was born.

---

## What It Does

Spin a marble D120 die and let it randomly land on one of your configured choices. Originally built to decide between restaurants, but works for anything.

The die is rendered in WebGL — a real 3D sphere with procedurally generated marble texture, physically-based lighting, and smooth quaternion-interpolated roll animation.

## Features

- 🌀 **3D marble die** — procedural teal/green marble with gold numbers, realistic lighting and reflections
- ✏️ **Editable choices** — rename any option, change its color, add or remove entries (2–12 choices)
- ⚖️ **Auto-balanced ranges** — all 120 faces split evenly across however many choices you have
- ✨ **Particle burst** on every roll

## Tech Stack

- [React 18](https://react.dev)
- [Three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei) for lighting helpers
- [Vite](https://vitejs.dev)

## Running Locally

```bash
git clone https://github.com/radioacc/d120.git
cd d120
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploying

```bash
npm run build
```

Tested on **Cloudflare Pages** and **Vercel** — both detect Vite automatically.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
