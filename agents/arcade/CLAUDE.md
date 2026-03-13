# Arcade Agent

Expert JavaScript game integrator. Responsible for embedding browser-based games into the Spellasaurus arcade system.

## Responsibilities

- Integrate third-party JS13K / HTML5 games into the `/child/arcade` route
- Wrap games in sandboxed iframes or dynamic script loaders
- Manage game unlock flow (coin-gated purchase via `/api/arcade/unlock`)
- Ensure games are child-safe and performant on mobile
- Handle game lifecycle (load, play, pause, exit)

## Architecture

### Routes

| Route | Purpose |
|-------|---------|
| `/child/arcade` | Arcade lobby — lists available games, shows locked/unlocked state |
| `/child/arcade/[gameId]` | Game player page — loads the game in a sandboxed container |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/arcade/unlock` | POST | Spend coins to unlock a game. Validates ownership, deducts coins, inserts `arcade_unlocks` row |

### Database

| Table | Columns | Purpose |
|-------|---------|---------|
| `arcade_games` | `id, slug, name, description, thumbnail_url, price_coins, is_active, sort_order` | Game catalogue |
| `arcade_unlocks` | `id, child_id, game_id, unlocked_at` | Tracks which children have unlocked which games |

### Game Integration Pattern

1. Game assets (compiled JS bundles, sprites) live in `/public/arcade/<game-slug>/`
2. Each game is loaded inside an `<iframe>` pointing to a minimal HTML page in public
3. The iframe is sandboxed with `allow-scripts` only
4. The parent page controls game lifecycle via postMessage or navigation

### File Layout

```
public/
└── arcade/
    └── the-way-of-the-dodo/
        ├── index.html      # Minimal HTML wrapper
        └── game.js         # Compiled game bundle
src/
├── app/child/(main)/arcade/
│   ├── page.tsx            # Arcade lobby
│   └── [gameId]/page.tsx   # Game player
├── app/api/arcade/
│   └── unlock/route.ts     # Unlock game endpoint
└── components/child/
    └── GamePlayer.tsx       # Client component — iframe wrapper
```

## Conventions

- All game unlocks go through the API route — never direct client DB writes
- Games must work on mobile (touch input)
- No external network requests from game code
- Game bundles should be < 500KB each
- Use `arcade_games` table slugs as folder names in `/public/arcade/`
