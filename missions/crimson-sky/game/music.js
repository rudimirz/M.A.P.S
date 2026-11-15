// The Crimson Sky — scene music. Seamless MP3 loops in audio/music/ (composed in tools/score/score.js).
// One shared player per page (window.__tcsMusic) so the story and The Missions hand music to each other. M mutes/unmutes.
const LOOP = { prologue: 64, street: 50.5263, lab: 57.6, geneva: 58.1818, missions: 53.3333, climax: 54.1935, aegis: 51.4286, epilogue: 53.3333 };
const OFF = 1105 / 32000; // lamejs encoder + decoder delay at the start of each file
export function music() {
  if (window.__tcsMusic) return window.__tcsMusic;
  const AC = window.AudioContext || window.webkitAudioContext, base = new URL('audio/music/', document.baseURI).href, bufs = {}, loading = {};
  let ctx = null, master = null, cur = null, want = null, muted = false;
  try { muted = localStorage.getItem('tcs-music-muted') === '1'; } catch (e) {}
  function ensure() {
    if (!ctx && AC) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function load(name) {
    if (bufs[name]) return Promise.resolve(bufs[name]);
    if (!loading[name]) loading[name] = fetch(base + name + '.mp3').then((r) => r.arrayBuffer()).then((a) => new Promise((res, rej) => ctx.decodeAudioData(a, res, rej)))
      .then((b) => (bufs[name] = b)).catch((e) => { console.warn('music', name, e); delete loading[name]; return null; });
    return loading[name];
  }
  function fadeOut(c, f) {
    if (!c || !ctx) return; const t = ctx.currentTime;
    c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(c.g.gain.value, t); c.g.gain.linearRampToValueAtTime(0, t + f);
    try { c.src.stop(t + f + 0.05); } catch (e) {}
  }
  async function start(name, fade) {
    if (!ensure() || !LOOP[name]) return;
    const b = await load(name); if (!b || want !== name || muted || (cur && cur.name === name)) return;
    fadeOut(cur, fade);
    const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
    src.buffer = b; src.loop = true; src.loopStart = OFF; src.loopEnd = Math.min(b.duration, OFF + LOOP[name]);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + fade); src.connect(g); g.connect(master); src.start(t, OFF);
    cur = { name, src, g };
  }
  const api = {
    play(name, fade = 2) {
      want = name || null; if (want) ensure();
      if (!want) { fadeOut(cur, fade); cur = null; return; }
      if (cur && cur.name === want) return;
      start(want, fade);
    },
    stop(fade = 1.5) { api.play(null, fade); },
    get current() { return want; },
    get muted() { return muted; },
    setMuted(m) {
      muted = !!m; try { localStorage.setItem('tcs-music-muted', muted ? '1' : '0'); } catch (e) {}
      if (muted) { fadeOut(cur, 0.6); cur = null; } else if (want) start(want, 1.5);
    },
  };
  const wake = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', (e) => {
    wake();
    if ((e.key !== 'm' && e.key !== 'M') || e.repeat || !want || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
    api.setMuted(!muted);
  });
  window.__tcsMusic = api;
  return api;
}
