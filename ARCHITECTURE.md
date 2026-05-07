# PetVerse: Living AI World - Architecture & Systems Blueprint

## 1. Core Technology Stack
- **Frontend Framework**: Next.js 14+ (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (UI/Pet animations)
- **State Management**: Zustand (Client-side game state, sync with server)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime, REST/GraphQL)
- **AI Engine**: OpenAI (GPT-4o or similar) - exclusively for personality, dialogue, and emotional mapping based on DB state.
- **Hosting/Deployment**: Vercel

## 2. Infrastructure & Data Flow Rules
- **Database = Source of Truth**: All core stats (hunger, energy, happiness) live in PostgreSQL.
- **Server-Authoritative**: Clients optimistically update UI via Zustand but confirm state via Supabase.
- **AI Boundaries**: AI is NEVER consulted for math or game logic. The backend calculates constraints, sends the pet's "state summary" to the AI, and the AI resolves the *narrative reaction*.

---

## 3. Database Schema (Supabase PostgreSQL)

### `users`
- id (UUID), username, avatar_url, coins, created_at, last_seen

### `pets`
- id (UUID), owner_id (FK), name, species, skin/color
- **Core Stats**: `hunger` (0-100), `energy` (0-100), `happiness` (0-100), `cleanliness` (0-100)
- **Progression**: `level` (int), `xp` (int), `bond_level` (int)
- **Status**: `state` (Enum: normal, sleepy, bored, weak, critical)
- `last_updated_at` (Timestamp used for offline calculation bridging)

### `pet_memories`
- id, pet_id, category (short_term, emotional, relationship), memory_text, significance (1-10), created_at

### `friendships`
- id, user_id_1, user_id_2, status (pending, accepted)

### `pet_interactions`
- id, pet_id, actor_id (who acted - owner or friend), action_type (feed, play, clean, pet), timestamp

---

## 4. Logical Systems Design

### 4.1 Offline Simulation Engine
When a user opens the app or views a pet, `getServerSideProps` / Server Actions check `last_updated_at`.
1. Calculate $\Delta T$ (Time passed).
2. Decrease hunger, energy, happiness by $Rate \times \Delta T$.
3. If hunger < 20, state = 'weak'. Check boundaries.
4. Update `pets` table and `last_updated_at` = `NOW()`.

### 4.2 Multiplayer & Realtime (Supabase Realtime)
- Listeners attached to `pets` table (`eq: id`). When friends visit, they subscribe to the same channel.
- If friend clicks "Feed", mutation updates DB -> DB triggers Realtime update -> Both owner & friend see hunger go up.

### 4.3 AI Personality Injection Layer
**Trigger**: When user talks to pet, or randomly every X minutes.
**Context payload sent to OpenAI:**
```json
{
  "pet_name": "Luna",
  "stats": {"hunger": 10, "energy": 80, "happiness": 20},
  "state": "weak",
  "memories": ["Owner fed me a rare apple yesterday", "We reached bond level 5"],
  "recent_events": [],
  "user_input": "Hey Luna, why are you sad?"
}
```
**System Prompt Structure:** "You are Luna, a living pet. Your hunger is 10/100, which means you are starving. Act needy..."

### 4.4 Friend Emergency Protocol
cron job (e.g., via Supabase pg_cron or Vercel trigger):
1. Query pets where `hunger < 10` or `state = 'critical'` and `notified = false`.
2. Find `friendships` for the `owner_id`.
3. Insert into `notifications` (or trigger Push) to friends: "Luna needs urgent care!"