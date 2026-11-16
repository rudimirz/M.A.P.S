// The Last Field — cinematic stills: data + player.
// A shot is a finished illustration (img) or an <image-slot> placeholder (slot) the illustrator fills.
// art: 'pixel' marks a pixel-art stand-in drawn in code (tools/stills/stills.js); Solomon's drawing replaces the PNG under the same name.
// Lines are narration strings or [speaker, text] pairs. All text is verbatim from the book.
export const SPEAKERS = { Lucas: '#ffd27a', Mariana: '#ffb0c8', Reporter: '#9ac8ff', Kiran: '#9ae0c0', Rafael: '#c8c8d8' };

export const CINEMATICS = {
  prologue: [
    { key: 'p1', img: 'film/stills/1.png', cut: 1.4, cam: [[1.16, 0, -4], [1.05, 0, 1]], lines: ['At 02:17 in the morning, the sky above São Paulo began to change.', 'It happened so quietly that almost nobody noticed.'] },
    { key: 'p2', img: 'film/stills/2.png', cut: 1.2, cam: [[1.06, 0, 2], [1.14, 1, -2]], lines: ["The first sign was a faint reddish glow along the southern horizon, barely visible through the clouds and the city's artificial lighting.", 'Within minutes, however, the colour spread upward.'] },
    { key: 'p3', img: 'film/stills/3.png', cut: 1.2, cam: [[1.2, -1, 4], [1.05, 0, -1]], lines: ['The clouds took on a dark crimson hue, and immense, almost motionless curtains of light appeared behind them, stretching across a part of the sky where no one expected to see an aurora.'] },
    { key: 'p4', img: 'film/stills/4.png', cut: 1, cam: [[1.06, 2, 0], [1.18, -2, 1]], lines: ['On the eighteenth floor of an apartment building, eight-year-old Lucas Almeida was lying awake when he noticed the light entering his bedroom.', 'A dull red glow illuminated the ceiling, casting unfamiliar shadows across his books and the model rocket that hung above his bed.'] },
    { key: 'p5', img: 'film/stills/5.png', cut: 0.15, hold: 2.2, cam: [[1.02, 0, 0], [1.35, 4, 3]], lines: [] },
    { key: 'p6', img: 'film/stills/6.png', cut: 0.15, cam: [[1.1, -2, -1], [1.24, -5, -2]], lines: ['He climbed down, walked toward the window, and pulled the curtain aside.'] },
    { key: 'p7', img: 'film/stills/7.png', cut: 0.15, cam: [[1.45, -3, -5], [1.08, -1, -1]], lines: ['The entire city appeared to be burning.', 'High above them, enormous structures of light slowly changed shape, resembling curtains being pulled across the heavens by an invisible hand.'] },
    // Part 2, Solomon (Nov 2026): the wake-up is cut shot/reverse-shot on 8–11; 10 is reused (his 12 is the same image) with tighter pushes.
    { key: 'p8a', group: 'p2', img: 'film/stills/8.png', cut: 1, cam: [[1.04, 0, 0], [1.12, -1, 0]], lines: ["Lucas ran into his mother's bedroom.", ['Lucas', 'Mama, wake up!']] },
    { key: 'p8b', group: 'p2', img: 'film/stills/9.png', cut: 0.15, cam: [[1.05, 1, 0], [1.12, 2, -1]], lines: ['Mariana Almeida opened her eyes.', ['Mariana', 'What happened?']] },
    { key: 'p8c', group: 'p2', img: 'film/stills/10.png', cut: 0.15, cam: [[1.04, 0, 0], [1.1, -1, 0]], lines: [['Lucas', 'The sky.']] },
    { key: 'p8d', group: 'p2', img: 'film/stills/11.png', cut: 0.15, cam: [[1.05, 0, 0], [1.12, 1, -1]], lines: [['Mariana', 'What about it?']] },
    { key: 'p8e', group: 'p2', img: 'film/stills/10.png', cut: 0.15, cam: [[1.14, -2, 1], [1.22, -3, 1]], lines: [['Lucas', "It's red."]] },
    { key: 'p8f', group: 'p2', img: 'film/stills/11.png', cut: 0.15, cam: [[1.14, 2, -1], [1.2, 2, -2]], lines: ['She sat up, confused.', ['Mariana', 'What?']] },
    { key: 'p8g', group: 'p2', img: 'film/stills/10.png', cut: 0.15, cam: [[1.24, -3, 2], [1.38, -4, 2]], lines: [['Lucas', 'The whole sky is red!']] },
    { key: 'p9a', group: 'p2', img: 'film/stills/13.png', cut: 1.2, cam: [[1.12, 1, 1], [1.03, 0, 0]], lines: ['Mariana followed him into the living room.', 'She expected to see a fire in a neighbouring building, perhaps an industrial accident on the horizon.', 'Instead, she found herself standing motionless before the window.'] },
    { key: 'p9n', group: 'p2', img: 'film/stills/16.png', cut: 1, cam: [[1.04, 0, 0], [1.13, 3, -1]], lines: ['In neighbouring apartments, lights were turning on.', 'Somewhere below, a car alarm began to sound.'] },
    { key: 'p9c', group: 'p2', img: 'film/stills/15.png', cut: 0.6, cam: [[1.03, 0, 0], [1.12, -2, 1]], lines: ['Lucas pressed his palm against the glass.', ['Lucas', 'Is the Sun coming up?']] },
    { key: 'p9b', group: 'p2', img: 'film/stills/14.png', cut: 0.15, cam: [[1.04, 0, 0], [1.12, -2, 0]], lines: [['Mariana', 'Not for another few hours.']] },
    { key: 'p9d', group: 'p2', img: 'film/stills/15.png', cut: 0.15, cam: [[1.14, -2, 1], [1.22, -3, 1]], lines: [['Lucas', 'Then why is it bright?']] },
    { key: 'p9e', group: 'p2', img: 'film/stills/14.png', cut: 0.15, cam: [[1.12, -2, 0], [1.2, -3, 0]], lines: ['She had no answer.'] },
    { key: 'p10a', group: 'p2', img: 'film/stills/17.png', cut: 0.15, cam: [[1.03, 0, 0], [1.12, 1, 2]], lines: ['Her phone vibrated.', 'An emergency notification appeared, advising residents to remain calm and expect possible disruptions to electrical and communications services.'] },
    { key: 'p10b', group: 'p2', img: 'film/stills/18.png', cut: 0.6, cam: [[1.03, 0, 0], [1.14, 0, -1]], lines: ['As she read it, the television switched on by itself after a brief interruption in power.', ['Reporter', 'We are receiving reports of unusual atmospheric lights from several countries.'], ['Reporter', 'Researchers believe the displays may be associated with significant geomagnetic activity, although the full extent of the event remains unclear.'], ['Reporter', 'We are now hearing that satellite-navigation services are experiencing serious disturbances.'], ['Reporter', 'Authorities are asking people not to rely exclusively on automated navigation systems.']] },
    { key: 'p11a', group: 'p2', img: 'film/stills/19.png', cut: 0.15, cam: [[1.02, 0, 0], [1.08, 0, 0]], lines: ['The television screen went black.'] },
    { key: 'p11b', group: 'p2', img: 'film/stills/20.png', cut: 0.15, cam: [[1.03, 0, 0], [1.12, -2, 1]], lines: ['For a moment, the apartment was silent.', 'Then every light went out.', 'Mariana instinctively pulled Lucas close.', 'Outside, thousands of windows darkened in succession.', 'The city below them, normally alive with traffic and electric light even in the early hours, became a landscape of shadows.', 'Above it, the crimson sky continued to glow.'] },
    { key: 'p12', group: 'p2', img: 'film/stills/21.png', cut: 1, cam: [[1.03, 0, 0], [1.13, 0, 1]], lines: [['Lucas', 'Mama, are we going to die?'], 'She held him tighter.', ['Mariana', 'No, sweetheart.'], 'But she could not stop looking at the sky.', 'And for the first time in her life, Mariana did not know whether she was telling her son the truth.'] },
    { key: 'p13a', group: 'p3', img: 'film/stills/p3-01.png', cut: 1.4, cam: [[1.02,0,0],[1.1,1,1]], lines: ['Across the city, in a small university laboratory filled with old scientific instruments, Dr. Kiran Rao was watching a computer screen.'] },
    { key: 'p13b', group: 'p3', img: 'film/stills/p3-02.png', cut: 0.8, cam: [[1.03,0,0],[1.12,2,-1]], lines: ['He was thirty-one years old, thin, perpetually sleep-deprived, and possessed an extraordinary ability to forget everything unrelated to the problem immediately occupying his mind.','His black hair was untidy, his glasses slightly crooked, and a half-eaten packet of biscuits lay beside his keyboard.','His office was a place of astonishing disorder.','Scientific papers covered nearly every surface. Small circuit boards lay among coffee cups.'] },
    { key: 'p13c', group: 'p3', img: 'film/stills/p3-03.png', cut: 0.6, cam: [[1.03,0,0],[1.12,4,-1]], lines: ['On one wall, a handwritten note read: A beautiful theory is still wrong if nature disagrees with it.','Kiran had written it after his first major research paper was rejected.','He considered it one of the most important sentences in the room.'] },
    { key: 'p13d', group: 'p3', img: 'film/stills/p3-04.png', cut: 0.6, cam: [[1.03,0,0],[1.14,3,0]], lines: ['At 01:46, a monitoring program had alerted him to unusual variations in ground magnetic-field measurements.','He had initially assumed an instrumentation error.'] },
    { key: 'p13e', group: 'p3', img: 'film/stills/p3-05.png', cut: 0.6, cam: [[1.03,0,0],[1.12,2,0]], lines: ['A magnetic observatory in southern Brazil had recorded a sudden deviation in the horizontal component of Earth\'s magnetic field.','The variation was unusual but not, by itself, unprecedented.','Kiran checked another observatory. The disturbance appeared there too.','He checked measurements farther north. Again, he found it.','The amplitude and timing varied, as expected across a geographically distributed network, but the development of the disturbance was extraordinary.'] },
    { key: 'p13f', group: 'p3', img: 'film/stills/p3-06.png', cut: 0.6, cam: [[1.03,0,0],[1.12,-2,0]], lines: ['Kiran straightened in his chair.',['Kiran','That can\'t be right.'],'He opened archived solar-wind measurements from an upstream spacecraft.','The solar wind was not calm.','Earlier changes in its magnetic-field orientation had supplied energy to Earth\'s magnetic environment.','But the most intense portion of that forcing had weakened, and the magnetosphere should have been entering a different stage of its response.','Instead, the ground disturbances were becoming stronger.','That was not enough to establish a new phenomenon.','Magnetospheric systems could store energy and release it later.','Substorms, current systems, and particle populations could behave in complicated ways.','The problem was that none of the models Kiran was running reproduced the sequence he was observing.'] },
    { key: 'p13g', group: 'p3', img: 'film/stills/p3-07.png', cut: 0.6, cam: [[1.03,0,0],[1.14,0,0]], lines: ['He restarted his simulation.','The model predicted a strong disturbance, followed by partial recovery.','The real measurements showed a second intensification. Then another.','Kiran leaned closer.',['Kiran','Why are you doing that?']] },
    { key: 'p13h', group: 'p3', img: 'film/stills/p3-08.png', cut: 0.6, cam: [[1.03,0,0],[1.12,3,-1]], lines: ['He changed the boundary conditions.','He adjusted the assumed solar-wind propagation delay.','He checked the observation timestamps, recalibrated magnetic-field baselines, and removed stations from the comparison in case they were contaminated by local interference.'] },
    { key: 'p13i', group: 'p3', img: 'film/stills/p3-09.png', cut: 0.4, cam: [[1.03,0,0],[1.12,1,0]], lines: ['Nothing removed the discrepancy.'] },
    { key: 'p14a', group: 'p3', img: 'film/stills/p3-10.png', cut: 0.8, cam: [[1.03,0,0],[1.12,0,0]], lines: ['At 02:09, he called the laboratory\'s night technician.',['Kiran','Rafael, are you near the magnetometer control room?'],['Rafael','Yes. Why?'],['Kiran','Please check whether the timing receiver has lost synchronization.'],['Rafael','Again?'],['Kiran','Just check.'],'There was a pause.',['Rafael','The receiver is locked. Timing error is below our threshold.'],['Kiran','Any local electrical disturbances?'],['Rafael','Nothing that explains the measurements.']] },
    { key: 'p14b', group: 'p3', img: 'film/stills/p3-12.png', cut: 0.6, cam: [[1.03,0,0],[1.12,-2,0]], lines: ['Kiran opened another window.',['Kiran','Then can you explain why we\'re seeing what looks like a new intensification when the upstream forcing is declining?'],'Rafael was silent.',['Kiran','Rafael?'],['Rafael','Doctor, you need to come outside.'],['Kiran','Why?'],['Rafael','Just come outside.']] },
    { key: 'p14c', group: 'p3', img: 'film/stills/p3-11.png', cut: 1.2, cam: [[1.03,0,0],[1.14,4,-2]], lines: ['Kiran turned toward the laboratory window. He saw the red light.','For several seconds, he forgot about the data.'] },
    { key: 'p14d', group: 'p3', img: 'film/stills/p3-13.png', cut: 0.15, cam: [[1.03,0,0],[1.1,2,0]], lines: ['Then a low electrical hum came from the equipment racks.','The overhead lights flickered. One monitor restarted.','Another displayed a communication error.','The laboratory\'s backup power system activated with a mechanical click.'] },
    { key: 'p15a', group: 'p3', img: 'film/stills/p3-09.png', cut: 0.6, cam: [[1.12,1,0],[1.04,0,0]], lines: ['Kiran looked from the crimson sky to the measurements on his screen.','The strange light was not the mystery itself.','It was evidence of energy being deposited into the upper atmosphere, where excited atoms could emit auroral radiation.','But the scale and timing of the disturbance suggested that something much larger was happening.','His simulation completed. The final plot appeared beside the observations. They diverged dramatically.'] },
    { key: 'p15b', group: 'p3', img: 'film/stills/p3-14.png', cut: 0.6, cam: [[1.03,0,0],[1.1,0,1]], lines: ['Kiran took off his glasses, rubbed his eyes, and put them back on.','He checked the calculation one final time.'] },
    { key: 'p15c', group: 'p3', img: 'film/stills/p3-03.png', cut: 1, cam: [[1.08,-2,0],[1.22,-5,1]], lines: ['Then he whispered something that frightened him more than the red sky.',['Kiran','We don\'t understand what we\'re looking at.'],'He did not sleep again that night.'] },
  ],
  ch1_open: [
    { key: 'c1', group: 'c1', img: 'film/stills/ch01-01-morning-after.png', cut: 1.4, cam: [[1.12, 0, -2], [1.03, 0, 0]], lines: ['By sunrise, the world had begun to understand that the strange lights were not an isolated atmospheric phenomenon.'] },
    { key: 'c2', group: 'c1', img: 'film/stills/ch01-01-morning-after.png', cut: 0.6, cam: [[1.06, 3, 1], [1.16, 6, 2]], lines: ['Reports came from Argentina, South Africa, Australia, Brazil, and parts of Asia.', 'Some images were genuine auroras; others were misidentified clouds, artificial lights, or fabricated recordings spreading through social media.', 'Scientists worked to separate reliable observations from sensational claims.'] },
    { key: 'c3', group: 'c1', img: 'film/stills/ch01-03-traffic-worker.png', cam: [[1.14, 2, -4], [1.05, 0, -1]], lines: ['Satellites recorded unusual particle populations and changes in their operating environments.', 'Several spacecraft entered protective modes.', 'Power-grid operators began reporting geomagnetically induced currents in vulnerable long-distance transmission systems.'] },
    { key: 'c4', group: 'c1', img: 'film/stills/ch01-02-water-queue.png', cam: [[1.03, 0, 0], [1.12, 4, -2]], lines: ['Modern civilization depended upon interconnected systems that could fail in cascading ways.', 'In London, a hospital postponed non-emergency operations after a prolonged interruption to its external power supply.', 'In Mumbai, freight terminals reported navigation and scheduling failures.', 'In Johannesburg, operators isolated vulnerable parts of the power network to protect expensive transformers from damage.'] },
  ],
  ch1_mateo: [
    { key: 'm1', group: 'c1', img: 'film/stills/ch01-04-mateo-arrives.png', cut: 1, cam: [[1.03, 0, 0], [1.12, 3, -1]], lines: ['At 10:42, his friend Mateo Reyes arrived at the laboratory carrying two coffees and a bag of electronic components.', 'Mateo was thirty-three, broad-shouldered, with dark curls, perpetually rolled-up sleeves, and the peculiar calm of a person who had spent his life repairing machines that other people had declared impossible to fix.'] },
  ],
  ch1_close: [
    { key: 'e1', group: 'c1', img: 'film/stills/ch01-05-analyze-anomaly.png', cut: 1.4, cam: [[1.03, 0, 0], [1.13, 3, -1]], lines: ['Forty-eight hours after the first event, another major disturbance struck.', 'It was not identical to the first.', 'Yet several instruments detected a familiar delayed pattern.', 'This time, the scientific community could not dismiss the observations as a single exceptional event.'] },
    { key: 'e2', group: 'c1', img: 'film/stills/ch01-06-global-emergency.png', cut: 0.8, cam: [[1.03, 0, 0], [1.14, 4, -2]], lines: ['An international scientific emergency was declared.', 'A meeting was scheduled in Geneva.', 'Its purpose was simple: determine what was happening, how dangerous it might become, and what humanity should do next.', 'The first two questions proved considerably harder than anyone expected.'] },
  ],
};

export const BOARD = [
  { title: 'Prologue · part 2 — Mariana and the blackout', shots: CINEMATICS.prologue.filter((s) => s.group === 'p2' && s.slot) },
  { title: 'Prologue · part 3 — Kiran', shots: CINEMATICS.prologue.filter((s) => s.group === 'p3' && s.slot) },
  { title: 'Chapter One — The First Seventy-Two Hours', shots: [...CINEMATICS.ch1_open, ...CINEMATICS.ch1_mateo, ...CINEMATICS.ch1_close].filter((s) => s.slot) },
].filter((g) => g.shots.length);

const c01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = c01(x); return x * x * (3 - 2 * x); };
const outCubic = (x) => 1 - Math.pow(1 - c01(x), 3);
const textOf = (l) => (Array.isArray(l) ? l[1] : l);
export const lineDur = (l) => {
  const n = textOf(l).split(' ').length;
  return Array.isArray(l) ? Math.min(6, Math.max(1.9, 0.9 + n * 0.3)) : Math.min(9.5, Math.max(3.2, 1.2 + n * 0.33));
};

// root: element holding one [data-shot="key"] layer per shot; sub: empty subtitle container.
export function playCinematic({ root, sub, shots, auto = true, onEnd }) {
  const layers = shots.map((s) => root.querySelector('[data-shot="' + s.key + '"]'));
  layers.forEach((el, i) => {
    if (!el || !shots[i].img || el.querySelector('img')) return;
    const im = document.createElement('img'); im.src = shots[i].img; im.alt = '';
    im.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;';
    el.appendChild(im);
  });
  const plan = shots.map((s) => (s.cut ?? 1) + (s.lines.length ? s.lines.reduce((a, l) => a + lineDur(l) + 0.45, 0) : s.hold || 2.4));
  const T = () => performance.now() / 1000;
  const start = shots.map(() => 0);
  let si = 0, prev = -1, li = -1, lineT = 0, outT = 0, endT = 0, endDur = 1, spans = [], rule = null, raf = 0, stopped = false;
  start[0] = T();

  function build(l) {
    const who = Array.isArray(l) ? l[0] : null;
    sub.innerHTML = ''; sub.style.opacity = '1'; sub.style.transform = 'none';
    rule = document.createElement('div');
    rule.style.cssText = 'height:3px; width:0; background:#e0364a; box-shadow:0 0 14px #e0364a;';
    sub.appendChild(rule);
    if (who) {
      const n = document.createElement('div'); n.textContent = who.toUpperCase();
      n.style.cssText = "font-family:'Pixelify Sans', monospace; font-size:clamp(17px, 2vw, 28px); font-weight:700; letter-spacing:.2em; color:" + (SPEAKERS[who] || '#fff6ea') + '; text-shadow:0 2px 10px #000;';
      sub.appendChild(n);
    }
    const box = document.createElement('div');
    box.style.cssText = "display:flex; flex-wrap:wrap; justify-content:center; column-gap:.27em; max-width:1400px; font-family:'Cormorant Garamond', Georgia, serif; font-weight:600; font-style:" + (who ? 'normal' : 'italic') + '; font-size:clamp(28px, 4.3vw, 64px); line-height:1.2; color:#fff6ea; text-align:center; text-shadow:0 3px 18px rgba(0,0,0,.95), 0 0 6px rgba(0,0,0,.9), 0 0 40px rgba(224,54,74,.35);';
    spans = textOf(l).split(' ').map((w) => { const s = document.createElement('span'); s.textContent = w; s.style.cssText = 'display:inline-block; opacity:0;'; box.appendChild(s); return s; });
    sub.appendChild(box);
  }
  const step = () => Math.min(0.085, 1.2 / Math.max(1, spans.length));
  const revealT = () => spans.length * step() + 0.5;
  function showLine(i) { li = i; lineT = T(); outT = 0; build(shots[si].lines[i]); }
  function clear() { sub.innerHTML = ''; spans = []; rule = null; li = -1; outT = 0; }
  function next() {
    const s = shots[si];
    if (li >= 0 && li < s.lines.length - 1) return showLine(li + 1);
    clear();
    if (si < shots.length - 1) { prev = si; si++; start[si] = T(); return; }
    endT = T(); endDur = 1;
  }
  function advance() {
    if (stopped || endT) return;
    const t = T(), s = shots[si];
    if (li < 0) { if (s.lines.length) showLine(0); else next(); return; }
    if (outT) return;
    if (t - lineT < revealT()) { lineT = t - revealT(); return; }
    outT = t;
  }
  function skip() { if (!stopped && !endT) { endT = T(); endDur = 0.45; } }
  function stop() { stopped = true; cancelAnimationFrame(raf); }
  function frame() {
    if (stopped) return;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    const t = T(), s = shots[si], cut = s.cut ?? 1, lead = Math.min(0.9, cut * 0.75);
    const fin = endT ? smooth((t - endT) / endDur) : 0;
    layers.forEach((el, i) => {
      if (!el) return;
      let a = 0;
      if (i === si) a = cut <= 0.2 ? 1 : smooth((t - start[i]) / cut);
      else if (i === prev && t - start[si] < cut + 0.1) a = 1;
      a *= 1 - fin;
      el.style.opacity = String(a);
      el.style.zIndex = i === si ? '2' : i === prev ? '1' : '0';
      if (a > 0) {
        const c = shots[i].cam || [[1.04, 0, 0], [1.12, 0, -1]], p = smooth((t - start[i]) / plan[i]), L = (k) => c[0][k] + (c[1][k] - c[0][k]) * p;
        el.style.transform = 'translate(' + L(1).toFixed(3) + '%, ' + L(2).toFixed(3) + '%) scale(' + L(0).toFixed(4) + ')';
      }
    });
    if (endT) { sub.style.opacity = String(1 - fin); if (fin >= 1) { stop(); if (onEnd) onEnd(); } return; }
    if (li < 0) {
      if (s.lines.length) { if (t - start[si] > lead) showLine(0); }
      else if (auto && t - start[si] > (s.hold || 2.4)) next();
      return;
    }
    const lt = t - lineT, st = step();
    spans.forEach((el, k) => {
      const e = outCubic((lt - k * st) / 0.5);
      el.style.opacity = String(e);
      el.style.transform = 'translateY(' + ((1 - e) * 18).toFixed(1) + 'px)';
      el.style.filter = e < 1 ? 'blur(' + ((1 - e) * 5).toFixed(1) + 'px)' : 'none';
    });
    if (rule) rule.style.width = (110 * smooth(lt / 0.8)).toFixed(1) + 'px';
    if (!outT && auto && lt > lineDur(s.lines[li])) outT = t;
    if (outT) {
      const k = smooth((t - outT) / 0.35);
      sub.style.opacity = String(1 - k); sub.style.transform = 'translateY(' + (-8 * k).toFixed(1) + 'px)';
      if (k >= 1) next();
    }
  }
  raf = requestAnimationFrame(frame);
  // pump: run one frame by hand (the co-op host's hidden tab gets no animation frames).
  return { advance, skip, stop, pump: () => { if (!stopped) frame(); } };
}
