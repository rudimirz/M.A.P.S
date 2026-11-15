<div align="center">

<!-- TO COMPLETE: Add the team game banner. ![Banner](docs/media/banner.png) -->

# M.A.P.S.

**Design the mission. Fly it. Live with the decisions.**

![Engine: Web and Three.js](https://img.shields.io/badge/Engine-Web%20%2F%20Three.js-334155) ![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-f7df1e) ![Project license: Pending](https://img.shields.io/badge/Project%20license-Pending-64748b) [![Status: Playable prototype](https://img.shields.io/badge/Status-Playable%20prototype-059669)](https://playmaps.online/)

**[▶ Play in your browser](https://playmaps.online/)**

</div>

## Gameplay

Run a space agency where every launch starts with a choice. Pick a mission, work within its constraints, and see what your crew can achieve when the plan meets the conditions in flight. M.A.P.S. is an educational mission-design game built for the [NASA Space Apps Space Mission Design Game challenge](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/).

<!-- TO COMPLETE: Add a short gameplay capture. ![Gameplay](docs/media/gameplay.gif) -->

| Campaign | What you do |
| --- | --- |
| **Moon Mission: The Rocket’s Fine Print** | Design a lunar south pole mission, then fly, explore and report your findings. Choose among crater mapping, ice confirmation and sample return objectives. |
| **Ganymede: The Integrated Front** | Design a ship, manage a transit crisis and explore Ganymede. Bring back a sample across five levels with three difficulty settings and four possible endings. The current build is in English. |
| **The Crimson Sky** | Investigate an unusually red sky over São Paulo. Explore a 2.5D world, solve science minigames, then make spacecraft decisions across four missions. |
| **ATALAYA** | In a seven-chapter solo story, design, test, launch and operate a CubeSat that observes hurricanes. Available in English and Spanish. |

## Features

- 🛰️ **Mission design trade-offs.** Balance budget, mass, power and data as you choose a launcher and assemble a spacecraft in Moon Mission.
- 🎮 **Hands-on tasks.** Steer during lunar landing, work the antenna and explore the crater. The Crimson Sky combines exploration with practical science minigames.
- 👥 **Crew play.** Moon Mission supports solo play, up to four local players and online rooms. Ganymede lets you assign crew roles to people or bots.
- 📊 **Consequences you can see.** Moon Mission reports how your decisions affected the outcome. Ganymede and The Crimson Sky offer multiple endings.
- 🌐 **Three interface languages.** The M.A.P.S. menu and Moon Mission prologue support English, Spanish and Portuguese.

## Controls

| Action | Keyboard | Controller |
| --- | --- | --- |
| Navigate menus and activate a focused button | Tab to move focus, Enter or Space to activate | — |
| Steer during Moon Mission’s landing | Left and Right arrows | — |
| Fire the landing thruster | Hold Space | — |
| Walk in The Crimson Sky | WASD or arrow keys | — |
| Talk or interact in The Crimson Sky’s story chapters | E, Z, Enter or Space | — |
| Run in The Crimson Sky | Hold Shift or X | — |

The campaign screens and mission setup use mouse controls. Individual minigames display their own instructions. Controller mappings are currently undocumented.

## How to play

### Players

1. On a computer, open [playmaps.online](https://playmaps.online/).
2. Select **Play**, then pick a campaign. The public web build opens directly in your browser.

> [!TIP]
> For Moon Mission on separate computers, select **Play online**. The host shares the game tab. Other players join with the room code, and the host admits them.

### Developers

Serve the browser files from the repository root. The local setup below was verified with Python **3.11.10**.

```bash
git clone https://github.com/rudimirz/M.A.P.S.git
cd M.A.P.S
python -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/) in a desktop browser with WebGL. The stack is HTML, CSS and JavaScript, with Three.js **r149** for the Moon Mission visuals, Three.js **0.160.0** for The Crimson Sky, React **18.3.1** for Ganymede and PeerJS **1.5.4** for online rooms.

> [!NOTE]
> Serve the files over HTTP for local development. The Crimson Sky uses ES modules and CDN resources. Online rooms require an internet connection. The public site uses HTTPS for tab sharing.

## Architecture and credits

| Path | Contents |
| --- | --- |
| [`index.html`](index.html) | Main menu and mission selector |
| [`missions/luna/`](missions/luna/) | Moon Mission, minigames, videos, sounds and narration |
| [`missions/ganimedes/`](missions/ganimedes/) | Ganymede campaign and mission assets |
| [`missions/crimson-sky/`](missions/crimson-sky/) | The Crimson Sky campaign, illustrations, game modules and audio |
| [`missions/atalaya/`](missions/atalaya/) | ATALAYA static client and campaign assets |
| [`credits.json`](credits.json) | Team, campaign and AI-use disclosures |

### M.A.P.S. team

| Member | Profile | Photo |
| --- | --- | --- |
| Rubén Mauricio Romero Ramírez | [LinkedIn](https://www.linkedin.com/in/rudimirz/) | [Portrait](missions/luna/media/team/mauricio.jpg) |
| Joseph Arroyo Hernández | [LinkedIn](https://www.linkedin.com/in/josepharroyohernandez/) | [Portrait](missions/luna/media/team/joseph.jpg) |
| Solomon Perriyil | [LinkedIn](https://www.linkedin.com/in/solomon-perriyil-67380b217/) | [Portrait](missions/luna/media/team/solomon.jpg) |
| Soumya Shree | [LinkedIn](https://www.linkedin.com/in/soumya-shree-s-779790266/) | [Portrait](missions/luna/media/team/soumya.jpg) |

### Resources and licensing

- **NASA science.** The Moon Mission uses [LCROSS](https://science.nasa.gov/mission/lcross/) and [LRO](https://science.nasa.gov/mission/lro/) resources. See the [in-game lunar science reference](missions/luna/nasa-luna.html).
- **Assets.** See the [Moon Mission sound credits](missions/luna/sfx/ATTRIBUTION.md), [Ganymede sound credits](missions/ganimedes/sfx/ATTRIBUTION.md), [The Crimson Sky art and music credits](missions/crimson-sky/README.md#credits) and [ATALAYA credits](missions/atalaya/credits.txt).
- **AI use.** Grok Imagine was used for cinematics and character video. ElevenLabs generated the Moon Mission prologue narration. Ganymede’s intro videos and crew portraits also use AI. Claude Design and OpenAI Codex assisted with the project. [AI disclosures](credits.json)
- **License.** The project-wide license is pending. Bundled libraries have their own MIT notices. [Three.js](missions/luna/three.LICENSE.txt) · [React](missions/luna/multiplayer-demo/react.LICENSE.txt) · [PeerJS](missions/luna/peerjs.LICENSE.txt)
