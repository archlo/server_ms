# maple-io-server

v95 MapleStory server emulator written in TypeScript using a microservice architecture.

## Architecture

Four server processes communicate over TCP:

- **CenterServer** — central coordinator: manages login/shop/channel server registrations, account auth, character CRUD, world/channel listing
- **LoginServer** — client handshake, encryption setup, delegates auth to CenterServer
- **ChannelServer** — gameplay: fields, mobs, NPCs, items, skills, quests, parties, minirooms, guilds, events
- **ShopServer** — cash shop: item purchases, gift sending, wishlist

A master process (`index.ts`) forks all four workers and exposes Prometheus metrics on port 3001.

## Features

### Network & Protocol
- MapleStory AES + Shanda encryption
- Full packet reader/writer with all MapleStory types (bytes, shorts, ints, longs, FILETIME, positions, Maple-ASCII strings, fixed strings, null-terminated strings)
- Session-based connection management with ACK-wait, timeout, and reconnection handling

### Data Loading
- NX (PKG4) binary format reader — parses node trees with int/double/string/bitmap/audio values
- Providers for all WZ data: items, maps, mobs, NPCs, skills, quests, reactors, shops, rewards, strings, cash shop, maker recipes
- CRC-32 map integrity computation (footholds, portals, physics)

### Character System
- Full stat model: base stats, equips, buffs, forced stats, passive skills, temporary stats
- Job system: all classes (Warrior, Magician, Archer, Thief, Pirate, Cygnus, Aran, Evan, Resistance, DualBlade, GM) with job-advancement handling
- Skill system: skill records, SP management, skill processors with job-specific handlers
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
- **Henesys PQ (Moon Bunny)**: full implementation — Tory entrance dialog, Primrose Hill instance with mob/reactor spawning, Moon Bunny protection, Growlie rice-cake submission with clear/fail logic, Tommy bonus stage
- **Kerning PQ (First Time Together)**: full implementation — Lakelis entrance with party gating, Cloto's 5 stages (coupon collection, rope puzzle, platform puzzle, Curse Eyes elimination, King Slime boss), Nella exit, stage-entry weather hints and gate object-state effects
- **Ludi Dimensional Crack PQ** (Lv. 120+): 5 stages — collect 20 Dimensional Passes, clear dimensional cracks, box maze portal puzzle, platform math puzzle, boss clear
- **Escape! PQ (Prison Break)** (Lv. 50+): 7 stages — stealth tower, guard elimination, maze, prison key recovery, Prison Guard boss
- **Lord Pirate PQ (Davy John)** (Lv. 60+): 5 stages — chest mob spawns, Pirate Mark collection (Rookie/Rising/Veteran), door-key mechanics, Captain Davy John boss

### Other
- Admin commands (console-based)
- Character ranking
- MapleTV message system with queue management
- Broadcast messages (notices, popups, megaphones, item announcements, etc.)
- IChat/social packet handling

## Setup

```bash
npm install
cp .env.example .env   # configure database and server settings
npm run build
npm run start
```

## Running

| Command | Description |
|---------|-------------|
| `npm run start` | Build + run with 4GB heap |
| `npm run build` | Clean + compile TypeScript |
| `npm run test`  | Run unit tests (Mocha + Chai) |

## Conventions

- Classes: PascalCase
- Files, functions, variables: camelCase
- SQL tables/columns: snake_case
- Tests: `*.test.ts` in `test/`
