// Title-screen score: a slow A-minor loop on sampled instruments (FluidR3 GM via soundfont-player) through a reverb,
// over a filtered wind bed that plays even before the samples arrive. Browsers only allow audio after a user gesture.
export function createTitleMusic() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(), master = ctx.createGain(), comp = ctx.createDynamicsCompressor();
  master.gain.value = 0; master.connect(comp); comp.connect(ctx.destination);
  const G = (v, to) => { const g = ctx.createGain(); g.gain.value = v; g.connect(to || master); return g; };
  const bus = G(0.9), conv = ctx.createConvolver(), wet = G(0.6), sr = ctx.sampleRate, ir = ctx.createBuffer(2, sr * 4, sr);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2); }
  conv.buffer = ir; bus.connect(conv); conv.connect(wet);
  // wind bed
  const nb = ctx.createBuffer(1, sr * 4, sr), nd = nb.getChannelData(0); let last = 0;
  for (let i = 0; i < nd.length; i++) { last = last * 0.985 + (Math.random() * 2 - 1) * 0.015; nd[i] = last * 6; }
  const wind = ctx.createBufferSource(); wind.buffer = nb; wind.loop = true;
  const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 0.7;
  const wg = G(0.09); wind.connect(wf); wf.connect(wg); wg.connect(conv);
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 220; lfo.connect(lg); lg.connect(wf.frequency); lfo.start(); wind.start();
  // instruments
  const inst = {}, NAMES = { cb: 'contrabass', st: 'string_ensemble_1', ch: 'choir_aahs', ce: 'celesta' };
  const nameToUrl = (name, soundfont, format) => 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@044fab8e1456bfafc5776e86dfd6bb8697149aef/' + soundfont + '/' + name + '-' + format + '.js';
  const load = () => Object.keys(NAMES).forEach((k) => window.Soundfont.instrument(ctx, NAMES[k], { soundfont: 'FluidR3_GM', destination: bus, nameToUrl }).then((p) => { inst[k] = p; }).catch((e) => console.warn('title music', e)));
  if (window.Soundfont) load(); else { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js'; sc.onload = load; document.head.appendChild(sc); }
  const play = (k, n, t, g, d, a = 1.2, r = 2.5) => { const p = inst[k]; if (p) p.play(n, t, { gain: g, duration: d, attack: a, release: r }); };
  // Am · F · Dm · E, 8 s each
  const BAR = 8, CH = [
    { root: 'A1', pad: ['A2', 'E3', 'A3', 'C4'], top: ['E4', 'A4'] },
    { root: 'F1', pad: ['F2', 'C3', 'A3', 'C4'], top: ['C4', 'F4'] },
    { root: 'D2', pad: ['D3', 'A3', 'D4', 'F4'], top: ['A4', 'D5'] },
    { root: 'E1', pad: ['E2', 'B2', 'G#3', 'B3'], top: ['B4', 'E5'] },
  ];
  const BELL = ['A5', 'C6', 'E6', 'G5', 'D6', 'E5', 'A6'];
  let on = false, t0 = 0, nextBar = 0, timer = 0, bar = 0;
  function schedule() {
    const ahead = ctx.currentTime + 1.5;
    while (nextBar < ahead) {
      const c = CH[bar % 4], loop = Math.floor(bar / 4);
      play('cb', c.root, nextBar, 0.7, BAR + 1, 1.5, 3);
      c.pad.forEach((n) => play('st', n, nextBar, 0.28, BAR + 0.5, 2.5, 3.5));
      if (loop % 2 === 1 || bar % 4 >= 2) c.top.forEach((n) => play('ch', n, nextBar + 0.5, 0.22, BAR, 3, 4));
      for (let k = 0; k < 4; k++) if (Math.random() < 0.62) play('ce', BELL[Math.floor(Math.random() * BELL.length)], nextBar + k * 2 + Math.random() * 0.6, 0.18 + Math.random() * 0.1, 2.5, 0.01, 3);
      nextBar += BAR; bar++;
    }
  }
  return {
    get on() { return on; },
    start(vol = 0.7) {
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(vol, t + 3);
      if (on) return; on = true; t0 = t + 0.3; nextBar = t0; schedule(); clearInterval(timer); timer = setInterval(schedule, 400);
    },
    stop(fade = 2) {
      const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + fade);
      on = false; clearInterval(timer); timer = 0;
    },
    tick() { play('ce', 'E6', ctx.currentTime, 0.22, 0.8, 0.005, 1.2); },
    select() { play('ce', 'A5', ctx.currentTime, 0.3, 1.5, 0.005, 2); play('ce', 'E6', ctx.currentTime + 0.09, 0.26, 1.5, 0.005, 2); },
    destroy() { clearInterval(timer); try { ctx.close(); } catch (e) {} },
  };
}
