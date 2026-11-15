# M.A.P.S.

An educational space mission design game for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/). Open the MAPS menu to choose a campaign.

[Play M.A.P.S.](https://playmaps.online/)

Design a mission to the lunar south pole and choose whether to map a crater, confirm ice, or return a sample. Pick a launch plan, build within budget, then fly, explore and transmit your findings. The final report shows how the decisions affected the outcome.

## Campaigns

- **Moon Mission: The Rocket’s Fine Print** by Rubén Mauricio Romero.
- **Ganymede: The Integrated Front** by Soumya Shree. The current English build has five playable levels.
- **The Crimson Sky** by Solomon Perriyil. The current build includes the prologue, story chapters, four missions and epilogue.
- **ATALAYA** by Joseph Arroyo is awaiting its playable build.

## How to play

1. Open the game on a computer with a keyboard and mouse.
2. Choose **Play** in the game and select the Moon Mission card.
3. Choose solo play or a local crew of up to four people on one computer. The language switch supports English, Spanish and Portuguese.
4. To play Moon Mission with friends on separate computers, select **Play online**. The host shares the game tab and approves guests who enter the room code. Online rooms use public PeerJS signaling and WebRTC.

To serve the repository locally, run `python -m http.server 8000` from the root and open `http://localhost:8000`.

## NASA resources

- [Lunar Crater Observation and Sensing Satellite (LCROSS)](https://science.nasa.gov/mission/lcross/) informs the Cabeus ice-confirmation scenario.
- [Lunar Reconnaissance Orbiter (LRO)](https://science.nasa.gov/mission/lro/) informs the terrain, lighting and cold-trap explanations in the south-pole briefing.

The game uses simplified parameters for play. The game's Credits menu includes the lunar science reference.

## Team and media

Rubén Mauricio Romero, Joseph Arroyo, Solomon Perriyil and Soumya Shree.

Grok Imagine generated the game’s cinematics and character video. ElevenLabs generated the English narration. Claude Design and OpenAI Codex assisted with design and code. See [AI disclosures](credits.json), [CC0 sound credits](missions/luna/sfx/ATTRIBUTION.md), the [Three.js MIT notice](missions/luna/three.LICENSE.txt) and the [React MIT notice](missions/luna/multiplayer-demo/react.LICENSE.txt).

Ganymede credits its introductory videos and crew art as AI-generated. Its mission menu links to the credited NASA resources. The Crimson Sky lists its story, art and music credits in its [campaign README](missions/crimson-sky/README.md). [PeerJS MIT license](missions/luna/peerjs.LICENSE.txt).
