# Codon Collider

A daily DNA-merge puzzle where you swipe matching sequences together to build life from a single base to a complete biosphere. A BioKEA game.

> **Status:** private beta. Public release pending.

![Codon Collider gameplay](docs/screenshot.png)
<!-- TODO: drop a real screenshot or gif at docs/screenshot.png before going public -->

## The science angle

Every tile on the board is a step up the ladder of biological organization — Nucleotide, Codon, Gene, Operon, Chromosome, Genome, Cell — the same hierarchy a wet-lab scientist actually traverses when they read, assemble, and interpret a sequence. Merging identical tiles is a playable analogue of how three bases collapse into one codon, codons into genes, and genes into the full instruction set for an organism. Codon Collider is part of [BioKEA](https://biokea.ai)'s effort to make the language of modern biology — sequencing, the genetic code, the leap from molecule to ecosystem — feel intuitive in a 60-second puzzle.

## Play

- **Endless** — open-ended runs against your local high score; classic 2048-style feel.
- **Daily** — one seeded board per day, shareable score, leaderboard rank, streak tracking.
- **Custom** — any seed string (or shared `?seed=` URL) for friend-vs-friend boards.
- **Lab variant** — adds powerups (Centrifuge, Enzyme, Polymerase) that drop into your inventory as your score climbs; pair with any mode.
- **Win condition** — reach the **Ecosystem** tier (2048-equivalent). Keep going to chase Biome and Biosphere.

### Controls

- **Move** — Arrow keys, WASD, or swipe.
- **Powerups (lab variant)** — click a slot in the Powerup Bar; click a tile to target if required.
- **Restart / Undo / Help / Codex / Leaderboard / Mute** — buttons under the board.

## Tech

- React 18 + TypeScript + Vite 6
- Tailwind CSS + Radix UI primitives for the interface
- `@tanstack/react-query` for async state
- `@biokea/leaderboard` shared client backs the daily / custom-seed leaderboard (optional — set env vars below or it silently no-ops)
- Bun as package manager and runtime
- All game state, discoveries, achievements, and personal bests persist to `localStorage`

## Local dev

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # production build into dist/
```

Optional shared BioKEA leaderboard:

```bash
cp .env.example .env   # then fill in:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
```

The app reads these via `import.meta.env`; no keys are committed.

## License

MIT — see [LICENSE](LICENSE).

---

Made by [BioKEA](https://biokea.ai).
