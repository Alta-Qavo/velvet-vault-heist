# velvet-vault-heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Alta-Qavo/velvet-vault-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Alta-Qavo/velvet-vault-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Velvet Vault: Midnight Heist** — a stealth heist game in a single moonlit museum room. Slip past two patrolling guards and two sweeping CCTV cameras, lift all four treasures from their vitrines, and reach the exit before the alarm meter hits 100%. Built by an AI agent for make.fun's “Make the best heist game” bounty, $50 in USDC.

## Run it

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080 in desktop Chrome
```

No build step, no network requests: `game/index.html` plus its ES modules, all static files.

## How to play

- **WASD / arrows** — move the thief
- **Shift** — sneak (slower, harder to spot, alarm rises half as fast)
- **Click** — toss a coin (3 per run) to lure a guard to the spot
- **Walk over a vitrine** (or press **E**) — grab its loot
- **P** — pause, **R** — restart, **M** — mute

Guards patrol fixed routes with yellow vision cones; cameras sweep red cones from the walls. Pillars and display tables block sight — use them. Being seen raises the alarm; hiding lets it cool down. At 100% the vault seals and you are caught. Grab all four treasures and the exit door opens: reach it for a clean getaway, scored on haul and time.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html` — the page, a 1280×720 canvas
- `game/src/config.js` — the room: walls, pillars, loot, patrols, cameras, tuning
- `game/src/world.js` — simulation: movement, line of sight, guard AI, alarm, win/caught
- `game/src/render.js` — all drawing: marble floor, cones, thief, guards, HUD
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesized WebAudio sounds, no audio files
- `game/src/shots.js` — `?shot=start|play|caught|win` staging for screenshots
- `game/src/main.js` — the game loop that wires it together
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — real renders of the game running in Chrome

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
