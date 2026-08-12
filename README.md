# Maple.io Server (server_ms)

A v95 MapleStory server emulator written in TypeScript using a microservice architecture, with a bundled Electron admin panel.

[![License](https://img.shields.io/github/license/archlo/server_ms)](LICENSE)
[![GitHub repo](https://img.shields.io/badge/repo-archlo/server_ms-blue)](https://github.com/archlo/server_ms)

## Architecture

A master process (`index.ts`) forks four server workers that communicate over TCP:

- **CenterServer** (port `8483`) — central coordinator: server registrations, account auth, character CRUD, world/channel listing
- **LoginServer** (port `8484`) — client handshake, encryption setup, delegates auth to CenterServer
- **ShopServer** (port `8485`) — cash shop: item purchases, gift sending, wishlist
- **ChannelServer** (port `8486`) — gameplay: fields, mobs, NPCs, items, skills, quests, parties, minirooms, guilds, events

The master process also exposes Prometheus metrics on port `3001` and an admin API server on port `3002`.

## Features

### Network & Protocol
- MapleStory AES + Shanda encryption
- Full packet reader/writer for all MapleStory types (bytes, shorts, ints, longs, FILETIME, positions, Maple-ASCII strings, fixed strings, null-terminated strings)
- Session-based connection management with ACK-wait, timeout, and reconnection handling

### Data Loading
- NX (PKG4) binary format reader — parses node trees with int/double/string/bitmap/audio values
- Providers for all WZ data: items, maps, mobs, NPCs, skills, quests, reactors, shops, rewards, strings, cash shop, maker recipes
- CRC-32 map integrity computation (footholds, portals, physics)

### Character System
- Full stat model: base stats, equips, buffs, forced stats, passive skills, temporary stats
- Job system: all classes (Warrior, Magician, Archer, Thief, Pirate, Cygnus, Aran, Evan, Resistance, DualBlade, GM) with job-advancement handling
- Skill system: skill records, SP management, job-specific skill processors
- Equipment: scroll enhancement, potential/option stats, sockets, upgrades, gold hammer, repair, skill resets
- Inventory: equip/use/setup/etc/special/cash inventories with full move/swap/add/remove operations
- Pet system: pet items, interaction, tameness, skills
- Cash shop locker

### Field System
- Field/map representation with user/mob/NPC/drop/reactor/summoned/town-portal/affected-area pools
- Instance fields for party quests and instanced content
- Foothold-based movement with full movement path parsing (normal, jump, teleport, action, stat-change, fall, flying block)
- Weather effects, field effects, clock displays, continent travel ships
- Elevator and subway events

### Combat
- Damage calculation engine (physical/magic, criticals, elemental attributes, weapon/magic attack, defense)
- Attack handling (melee, ranged, magic) with hit registration and mob damage application
- Mob temporary stats (buffs, debuffs, DOT/burned damage)
- Mob AI: chase, attack, fly, jump, movement control
- Summoned entity system (skill summons with assist/movement/attack modes)

### NPC & Dialog System
- Full generator-based script engine — scripts are ES6 generators that yield dialog messages and resume on player response
- Script API: `sayOk`/`sayNext`/`sayPrev`/`sayBoth`, `askYesNo`/`askAccept`/`askMenu`/`askSlideMenu`/`askNumber`/`askText`/`askBoxText`/`askAvatar`, warp methods, quest helpers, inventory manipulation, job advancement, effects
- 36 NPC script files covering all regions: Victoria Island, El Nath, Edelstein, Nihal Desert, Minar Forest, Mu Lung, Mushroom Castle, Neo City, Masteria, Golden Temple, World Tour, class quests/tutorials, party quests, free market, guild HQ, continent ships, hair/face styling, items, weddings, mini-dungeons, unity portals
- Shop dialog (buy/sell/recharge) and storage trunk dialog (deposit/withdraw items/mesos)

### Quest System
- WZ-driven quest data loading: metadata, start/complete acts and checks from QuestInfo.img/Act.img/Check.img
- 10 check types: item, mob kill count, level range, job, sub-job flags, skill, morph, buff, date, day of week, info-ex
- 8 act types: item give/take, mesos, EXP, fame, skill points, skills, buffs, pet tameness
- Per-character quest state tracking (none/in-progress/complete) with kill-count progress updates
- Quest packet handling: accept, complete (with reward selection), resign, lost-item restore, opening/complete NPC script triggers

### Social Systems
- Party system: create/invite/join/leave/expel, party search, party storage
- Friends: add/remove/accept, online status, friend chat
- Guilds: create/disband/join/leave, ranks, titles, emblem, BBS, skills, quests, notifications
- Messengers: create/invite/join/leave/chat rooms
- Mini-rooms: player shops, entrusted shops, trading, omok, memory game
- Memos/notes: send/read/delete
- Family system packets
- Alliance system: create/manage guild alliances

### Events
- Event manager with scheduled start/stop lifecycle
- Continent movement ships: Victoria Island, Ludibrium, Orbis, Leafre, Ariant
- Elevator (Ludibrium), Subway (Kerning City)

### Party Quests
- **Henesys PQ (Moon Bunny)** — Tory entrance dialog, Primrose Hill instance, Moon Bunny protection, Growlie rice-cake submission, Tommy bonus stage
- **Kerning PQ (First Time Together)** — Lakelis entrance, Cloto's 5 stages, Nella exit, stage-entry weather hints
- **Ludi Dimensional Crack PQ** (Lv. 120+) — 5 stages with passes, cracks, portal puzzle, platform math puzzle, boss
- **Escape! PQ (Prison Break)** (Lv. 50+) — 7 stages with stealth tower, guard elimination, maze, key recovery, boss
- **Lord Pirate PQ (Davy John)** (Lv. 60+) — 5 stages with chest spawns, Pirate Marks, door keys, boss

### Admin Panel
- Electron-based desktop admin panel (`admin/`) — command prompt, player management, notices, accounts
- Admin API server (port `3002`) + Channel admin proxy
- Admin commands (console-based)

### Other
- Character ranking
- MapleTV message system with queue management
- Broadcast messages (notices, popups, megaphones, item announcements)
- IChat/social packet handling

## Requirements

- **Node.js** 14+ (TypeScript 4.1, ts-node 9)
- **MySQL** database (see [SQL setup](#database-setup))
- **v95 MapleStory WZ/NX data** (see [WZ data](#wz-data) below)
- Windows or Linux

## Database Setup

The SQL files in `sql/` must be executed **in order**:

1. `sql/db_database.sql` — schema, tables, base data
2. `sql/db_drops.sql` — drop data
3. `sql/db_shopupdate.sql` — optional; requires the provided WZ files

## WZ Data

The server reads MapleStory data from **NX (PKG4) files** — it does **not** ship with them, and they are intentionally excluded from this repository.

Place the required `.nx` files in the `wz/` directory:

| File | Contents |
|------|----------|
| `Base.nx` | Global constants |
| `Character.nx` | Character, avatar, jobs |
| `Effect.nx` | Skill/field effects |
| `Etc.nx` | Miscellaneous data |
| `Item.nx` | All items, equips, consumables |
| `Map.nx` | Maps, maps, portals, physics |
| `Mob.nx` | Mobs, drop/reward linkage |
| `Morph.nx` | Morph/animation data |
| `Npc.nx` | NPCs |
| `Quest.nx` | Quest data |
| `Reactor.nx` | Reactors |
| `Skill.nx` | Skills |
| `Sound.nx` | Sound effects |
| `String.nx` | In-game strings |
| `TamingMob.nx` | Tamed mobs (mounts) |
| `UI.nx` | UI resources |

The NX directory defaults to `server/wz/` but can be overridden with the `NX_DIR` environment variable:

```bash
# Windows
set NX_DIR=C:\maple\nx
# Linux / macOS
export NX_DIR=/path/to/nx
```

> WZ files referenced in code as `Character.wz/...` are resolved to `Character.nx` automatically.

## Setup

```bash
npm install

# copy and configure environment
cp .env.example .env

# build TypeScript
npm run build

# start the server
npm run start
```

Configure the database in `.env`:

```env
DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASSWORD="root"
DB_SCHEMA="omega"
```

## Running

| Command | Description |
|---------|-------------|
| `npm run start` | Build + run with 4GB heap |
| `npm run build` | Clean + compile TypeScript |
| `npm run test` | Run unit tests (Mocha + Chai) |
| `start.bat` | Windows launcher: installs deps, creates `.env`, launches the Electron admin panel |

### Admin Panel

`start.bat` launches the Electron admin panel (`admin/`). Inside it, use the **Server** tab to start / restart / shutdown the maple server processes.

The admin API server listens on port `3002`. The default API token is set in `config/admin.hjson` — **change it before exposing the server publicly**.

## Configuration

JSON/HJSON config files in `config/`:

| File | Purpose |
|------|---------|
| `admin.hjson` | Admin API host/port/token |
| `center.hjson` | CenterServer port |
| `login.hjson` | LoginServer port, auto-register |
| `shop.hjson` | ShopServer port |
| `channel.hjson` | ChannelServer port |
| `game.hjson` | Gameplay toggles (enforceAdminAccount, enablePin, enablePic) |

## Project Structure

```
server_ms/
├── admin/          # Electron admin panel
├── config/         # Server configuration (HJSON)
├── data/           # Reward / shop YAML data
├── sql/            # MySQL schema + seed scripts
├── src/            # TypeScript source
│   ├── server/     # center / login / shop / channel workers
│   ├── world/      # gameplay: field, item, mob, quest, skill, script...
│   ├── wz-utils/   # NX (PKG4) reader
│   ├── protocol/   # packets & encryption
│   └── provider/   # WZ data providers
├── test/           # Mocha unit tests
├── wz/             # NX data (not committed)
├── index.ts        # Master entry point
└── package.json
```

## Conventions

- Classes: PascalCase
- Files, functions, variables: camelCase
- SQL tables/columns: snake_case
- Tests: `*.test.ts` in `test/`

## License

ISC — see the package manifest.
