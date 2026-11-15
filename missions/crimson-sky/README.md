# The Crimson Sky

A story game for the browser. One night the sky over São Paulo turns red; four people — a physicist, an engineer, a pilot and a director — set out to understand why. You play the whole story alone or with up to three friends, each on their own screen.

- **Prologue and Chapters 1–3:** a 2.5D pixel world you walk through, illustrated cinematics, analysis minigames.
- **Chapters 4–30:** the four missions (Sentinel, Helios, Selene, Bridge), played from the Mission Hall: design the spacecraft together, then live the book's events. Every character has a minigame.
- **Epilogue and credits.** Four possible endings, decided by what you carry forward: evidence, trust, risk, the friendship between Kiran and Mateo, Aegis's influence and the crew's radiation dose.

## Run it

Requirements: a desktop browser with WebGL (Chrome, Edge, Firefox or Safari) and an internet connection (fonts, three.js, the page runtime and the online rooms load from public CDNs).

Serve this folder with any static web server and open its address. Example:

```
cd "The Crimson Sky"
python3 -m http.server 8000
# open http://localhost:8000/
```

It also works uploaded as-is to any static host (GitHub Pages, Netlify, itch.io HTML game). Opening the file directly (`file://`) will not work: the game loads ES modules.

## Controls

**Title** — ↑ ↓ choose · ← → language (English / Español / Português) · Z, Enter or Space to accept.

**Story chapters**
- Arrows or WASD — walk
- Z, E, Enter or Space — talk, interact, next line
- X or Shift (hold) — run
- H — help inside a minigame
- Esc — skip a cinematic
- M — music on/off (also hides the minimap)
- Touch screens get on-screen buttons.

**Missions**
- Arrows or WASD — walk the Mission Hall; E or click — use a station (each seat's desk, the review board, the integration bay).
- Everything else is mouse/touch: design choices, events, decisions.
- Minigames: drag to select (Kiran), click the right box (Mateo, Naomi), hold ↑ / ↓ or the on-screen buttons (Leila), Space or Enter to fire a pulse.

## Playing together

1. Everyone opens the game and chooses **Play**.
2. One player chooses **Host a room** and reads out the 5-letter code.
3. The others choose **Join** and type the code. Up to four players; AI teammates take the empty seats.
4. The host presses **Start the story together**. Every screen plays the same scene; the controls follow the story — whoever's character is on screen, speaking, or doing the task. A pill in the corner says whose turn it is.

Notes:
- If someone's connection drops, the game reconnects by itself for two minutes and keeps their seat. A player who reloads can join again with the same code (it is prefilled) and catches up to the host's scene.
- The host must keep their tab open: closing or reloading it ends the room. The host can switch tabs; the game keeps running.
- On very strict networks, add your own TURN server in the browser console:
  `localStorage.setItem('tcs-turn', JSON.stringify({ urls: 'turn:your.server:3478', username: 'user', credential: 'pass' }))`
- Several tabs on the same computer can also join each other (useful for testing).
- The missions are saved in the host's browser (**Continue saved campaign**).

## Demo path (about 5 minutes)

| Time | What to do | What it shows |
|---|---|---|
| 0:00 | On the title, press ← → | Three languages |
| 0:15 | **Play → Start now** | Illustrated prologue with animated subtitles (Esc skips after ~40 s) |
| 1:00 | Walk as Lucas, talk with Z; continue into Kiran's lab and his first analysis minigame | The 2.5D world and how the science is played |
| 2:15 | Reload. Screen A: **Play → Host a room**. Screen B (another device or tab): **Play → Join** with the code | Co-op on separate screens |
| 2:45 | Host: **Skip to the missions**. Both players walk the Mission Hall to their stations | Four roles, one spacecraft |
| 3:15 | Change one design choice and watch the review board's gates and score update on both screens; Naomi authorizes the launch | Shared, host-authoritative state |
| 4:00 | Play the first events (portraits, book dialogue, consequences carried forward) | How decisions shape the ending |
| 4:45 | Mention: every character has a minigame (Ch. 8, 13/15, 20, 23, 27–29) and there are four endings | |

## What's in this folder

| Path | Contents |
|---|---|
| `index.html` | Opens the game |
| `The Crimson Sky.dc.html` | Title, prologue, Chapters 1–3, epilogue, credits |
| `The Crimson Sky - Missions.dc.html` | The missions (Chapters 4–30), the lobby and the rooms |
| `support.js` | Page runtime |
| `game/` | Story engine, mission engine, Mission Hall, minigames, networking, music player |
| `film/stills/`, `film/portraits/` | Illustrations and character portraits |
| `audio/music/` | The eight music tracks |
| `CHECKSUMS.txt` | SHA-256 of every file (`sha256sum -c CHECKSUMS.txt`) |

## Credits

Based on the original science-fiction novel by the author. Illustrations and portraits: Solomon. Music: eight original tracks composed for the game, with FluidR3 GM samples distributed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) by [midi-js-soundfonts](https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/044fab8e1456bfafc5776e86dfd6bb8697149aef/README.md). OpenAI Codex assisted with integration and verification.

## Known limitations

- Cinematics for Chapters 4–30 will be added when their illustrations are finished.
- No voice acting yet.
- The room ends if the host closes their tab.
