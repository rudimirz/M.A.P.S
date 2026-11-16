// The Crimson Sky — Action Lab: the hands-on mission games.
//   workbench  Mateo assembles Sentinel on a rotating stand, routes the harness and runs the tests (design phase)
//   ascent     Leila trims the guided ascent, throttles through max-Q, stages, and trims the orbit (Ch. 4)
//   downlink   Naomi schedules contested ground passes to bring the event packets home (Ch. 4)
//   peaks      Kiran aligns clocks, marks intensifications, rejects spacecraft artefacts, builds the case (Ch. 4)
//   burn       Leila plans Helios' correction burn with a manoeuvre node (Ch. 6)
//   lag        Kiran lines up upstream solar wind with Earth's response (Ch. 6)
// Vanilla canvas + DOM. Every hardware figure, price and rate is a 2064 game value; physics is simplified.
// mount(kind, root, ctx) → { update(ctx), destroy() }. Ops games call ctx.finish(grade, value, message) once.

const C = { bg: '#0b0710', ink: '#fff3e8', cream: '#f1e6d6', soft: '#cdbfd2', mute: '#a89cae', red: '#c23440', coral: '#ff7a6b', green: '#7fd6a4', amber: '#ffd27a',
  blue: '#9ac8ff', pink: '#ffb0c8', teal: '#9ae0c0', lilac: '#d6b8ff', gold: '#d9a85b', line: 'rgba(241,230,214,0.14)', faint: 'rgba(241,230,214,0.06)' };
const FONT = "'IBM Plex Sans', sans-serif", PIX = "'Pixelify Sans', sans-serif";
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), sgn = (x) => (x >= 0 ? '+' : '−') + f1(Math.abs(x));
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 200) : ms));
function rng(seed) { let a = (seed >>> 0) || 7; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function el(tag, css, text) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
const BTN = {
  primary: `padding:10px 16px;min-height:44px;background:${C.red};border:1px solid ${C.red};color:${C.ink};cursor:pointer;font:600 14px ${FONT};white-space:nowrap;`,
  ghost: `padding:10px 14px;min-height:44px;background:transparent;border:1px solid rgba(241,230,214,0.3);color:${C.cream};cursor:pointer;font:500 14px ${FONT};white-space:nowrap;`,
};
function btn(label, kind, fn) { const b = el('button', BTN[kind || 'ghost'], label); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
function dis(b, d) { b.disabled = !!d; b.style.opacity = d ? '0.4' : '1'; b.style.cursor = d ? 'default' : 'pointer'; }
const row = (gap = 8) => el('div', `display:flex;flex-wrap:wrap;gap:${gap}px;align-items:center;`);
const kicker = (t, col) => el('span', `font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${col || C.mute};`, t);
function statBox(label) { const b = el('div', `display:flex;flex-direction:column;gap:2px;padding:9px 11px;background:${C.faint};border:1px solid ${C.line};min-width:0;`);
  const v = el('span', `font:600 19px ${FONT};color:${C.ink};font-variant-numeric:tabular-nums;`, '—'), l = el('span', `font-size:12px;color:${C.soft};`, label); b.append(v, l); return { box: b, v, l }; }
function logLine() { return el('div', `padding:10px 12px;border-left:3px solid ${C.coral};background:rgba(241,230,214,0.04);font-size:14px;color:${C.cream};line-height:1.45;min-height:22px;text-wrap:pretty;`); }
function say(node, text, col) { node.textContent = text; node.style.borderLeftColor = col || C.coral; }
function stage(parent, rw, rh) {
  const cv = el('canvas', `width:100%;aspect-ratio:${rw} / ${rh};display:block;touch-action:none;background:${C.bg};border:1px solid ${C.line};outline:none;`); cv.tabIndex = 0; parent.appendChild(cv);
  const s = { cv, g: cv.getContext('2d'), W: 0, H: 0, fs: 12 };
  s.fit = () => { const W = cv.clientWidth; if (!W) return false; const H = Math.round((W * rh) / rw), d = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
    const g = s.g; s.W = W; s.H = H; s.fs = Math.max(10, Math.round(W / 58)); g.setTransform(d, 0, 0, d, 0, 0); g.globalAlpha = 1; g.lineWidth = 1; g.setLineDash([]);
    g.font = `500 ${s.fs}px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; return true; };
  s.pt = (ev) => { const r = cv.getBoundingClientRect(); return [((ev.clientX - r.left) * s.W) / Math.max(1, r.width), ((ev.clientY - r.top) * s.H) / Math.max(1, r.height)]; };
  return s;
}
function T(g, s, x, y, col, align, font) { if (font) g.font = font; g.fillStyle = col || C.cream; g.textAlign = align || 'left'; g.fillText(s, x, y); }
function loop(fn) { let raf = 0, last = performance.now(), on = true; const f = (now) => { if (!on) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; try { fn(dt, now); } catch (e) { console.error(e); } raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => { on = false; cancelAnimationFrame(raf); }; }
const shown = (n) => !!(n && n.isConnected && n.offsetParent !== null);
function keys(root, fn) { const h = (ev) => { if (!shown(root)) return; const t = ev.target; if (t && t.closest && t.closest('input,textarea,select')) return; fn(ev); };
  window.addEventListener('keydown', h); window.addEventListener('keyup', h); return () => { window.removeEventListener('keydown', h); window.removeEventListener('keyup', h); }; }
function holdBtn(label, on, off) { const b = btn(label); b.style.touchAction = 'none'; b.addEventListener('pointerdown', (e) => { e.preventDefault(); on(); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((k) => b.addEventListener(k, off)); return b; }
// Pointer drag of a DOM chip with a floating ghost. onDrop(x, y) gets client coords; a short tap calls onTap.
function dragChip(node, label, col, onDrop, onTap) {
  node.style.touchAction = 'none';
  node.addEventListener('pointerdown', (ev) => {
    if (node.disabled) return; const x0 = ev.clientX, y0 = ev.clientY; let ghost = null;
    const mv = (e) => { if (!ghost && Math.hypot(e.clientX - x0, e.clientY - y0) > 6) { ghost = el('div', `position:fixed;z-index:9999;pointer-events:none;padding:6px 10px;background:${C.bg};border:1px solid ${col};color:${C.ink};font:600 13px ${FONT};box-shadow:0 6px 18px rgba(0,0,0,.5);`, label); document.body.appendChild(ghost); }
      if (ghost) { ghost.style.left = e.clientX + 12 + 'px'; ghost.style.top = e.clientY + 10 + 'px'; onDrop(e.clientX, e.clientY, true); } };
    const up = (e) => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
      if (ghost) { ghost.remove(); onDrop(e.clientX, e.clientY, false); } else if (e.type === 'pointerup') onTap(); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  });
}
const inRect = (node, x, y) => { const r = node.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };

// ======================================================================== WORKBENCH (Mateo · Sentinel)
const WB = new Map();
function workbench(root, ctx) {
  if (ctx.E.mission(ctx.S).id !== 'sentinel') return bay(root, ctx);
  const E = ctx.E, M = E.MISSIONS.sentinel, D = (id) => M.decisions.find((d) => d.id === id);
  const opt = (id) => { const d = D(id); return d.options.find((o) => o.id === ctx.S.choices[id]) || d.options.find((o) => o.id === d.def); };
  const vv = (id, map) => D(id).options.map((o) => ({ id: o.id, label: o.label, ...map(o) }));
  const FAM = [
    { slot: 'array', dec: 'm_arr', name: 'Solar array', col: '#6f8ce0', tag: 'SA', vars: vv('m_arr', (o) => ({ kg: o.kg, gen: o.W, W: o.dW || 0, spec: `${o.kg} kg · ${o.W} W in sunlight${o.id === 'sa45' ? ' · body panels' : ' · hinged wings'}` })) },
    { slot: 'battery', dec: 'm_bat', name: 'Battery', col: C.green, tag: 'BAT', vars: vv('m_bat', (o) => ({ kg: o.kg, Wh: o.Wh, spec: `${o.kg} kg · ${o.Wh} Wh usable` })) },
    { slot: 'computer', dec: 'm_proc', name: 'Flight computer', col: C.amber, tag: 'CPU', vars: vv('m_proc', (o) => ({ kg: o.kg, W: o.W, spec: `${o.kg} kg · ${o.W} W` })) },
    { slot: 'radio', dec: 'm_com', name: 'Radio', col: C.pink, tag: 'RF', vars: vv('m_com', (o) => ({ kg: o.kg, W: o.idle, tx: o.tx, spec: `${o.kg} kg · ${o.idle} W idle, ${o.tx} W keyed` })) },
    { slot: 'recorder', dec: 'm_rec', name: 'Data recorder', col: C.lilac, tag: 'REC', vars: vv('m_rec', (o) => ({ kg: o.kg, spec: `${o.kg} kg extra · ${o.MB >= 1000 ? o.MB / 1000 + ' GB' : o.MB + ' MB'}` })) },
    { slot: 'mag', need: 'mag', name: 'Magnetometer', col: C.teal, tag: 'MAG', vars: [{ id: 'mag', label: 'Fluxgate magnetometer', kg: 3, W: 3, k: 1, spec: '3 kg · 3 W · 1 kbps · boom tip or body' }] },
    { slot: 'pd', dec: 'm_pd', need: 'pd', name: 'Particle detector', col: C.coral, tag: 'PD', vars: vv('m_pd', (o) => ({ kg: o.kg, W: o.W, k: o.k, spec: `${o.kg} kg · ${o.W} W · ${o.k} kbps` })) },
    { slot: 'iono', need: 'iono', name: 'Plasma probe', col: '#ff9a8a', tag: 'PL', vars: [{ id: 'iono', label: 'Ionospheric plasma probe', kg: 2, W: 4, k: 4, spec: '2 kg · 4 W · 4 kbps' }] },
    { slot: 'gps', need: 'gps', name: 'GPS clock', col: C.blue, tag: 'GPS', vars: [{ id: 'gps', label: 'GPS-disciplined clock', kg: 0.2, W: 1, spec: '0.2 kg · 1 W · ~1 ms time-tags' }] },
    { slot: 'wheels', name: 'Reaction wheels', col: '#b9a9be', tag: 'RW', vars: [{ id: 'rw', label: 'Three reaction wheels', kg: 4, W: 5, spec: '4 kg · 5 W · pointing' }] },
    { slot: 'boom', name: 'Magnetometer boom', col: C.cream, tag: 'BM', vars: [{ id: 'boom', label: '1.5 m hinged boom', kg: 2, W: 0, spec: '2 kg · keeps the sensor away from the bus' }] },
    { slot: 'harness', name: 'Harness', col: C.gold, tag: 'HN', vars: [{ id: 'hn', label: 'Power & data harness', kg: 3, W: 4, spec: '3 kg · 4 W · thermal straps' }] },
  ];
  const fam = (s) => FAM.find((f) => f.slot === s), vof = (s, id) => { const f = fam(s); return f && f.vars.find((v) => v.id === id); };
  const nameOf = (s) => (s === 'array2' ? 'Solar array' : (fam(s) || { name: s }).name);
  const needs = () => { const n = opt('k_obj').inst.slice(); if (ctx.S.choices.k_time === 'gps') n.push('gps'); return n; };
  const required = () => ['array', 'battery', 'computer', 'radio', 'recorder', 'wheels', 'boom', 'harness', ...needs()];
  const LINKS = () => [['array', 'battery'], ['battery', 'computer'], ['computer', 'recorder'], ['recorder', 'radio'], ...needs().map((i) => [i, 'computer'])];
  const key = ctx.S.seed + ':' + ctx.S.mi;
  let st = WB.get(key);
  const fromAct = () => { const a = ctx.S.act && ctx.S.act.craft; return a && a.inst ? { inst: { ...a.inst }, links: (a.links || []).map((x) => x.slice()), magAt: a.magAt || 'boom', assisted: a.assisted !== false } : null; };
  if (!st) { st = fromAct() || { inst: {}, links: [], magAt: 'boom', assisted: true }; WB.set(key, st); }
  const linked = (a, b) => !!st.inst.harness && (st.assisted || st.links.some(([x, y]) => (x === a && y === b) || (x === b && y === a)));
  const V = { pending: {}, rot: -0.6, spinV: 0.18, dep: 0, depT: 0, boomDep: 0, pick: null, sel: null, drag: null, hover: null, linkFrom: null, flash: {}, anim: null, shakeT: 0, busy: false, tests: [], rotDrag: null };
  // layout
  const top = row(10), status = el('span', `font:600 12px ${FONT};letter-spacing:.14em;text-transform:uppercase;padding:5px 10px;border:1px solid ${C.line};color:${C.soft};`);
  const modeB = btn(''), spinB = btn(''); [modeB, spinB].forEach((b) => { b.style.minHeight = '36px'; b.style.padding = '6px 12px'; b.style.whiteSpace = 'nowrap'; });
  top.append(kicker('Integration bay · Sentinel A & B are built identically', C.amber), el('span', 'flex:1;'), status, modeB, spinB);
  const main = el('div', 'display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;');
  const left = el('div', 'flex:3 1 380px;min-width:0;display:flex;flex-direction:column;gap:10px;'), right = el('div', 'flex:2 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;');
  const cs = stage(left, 16, 10), log = logLine(), testsRow = row(8), testList = el('div', 'display:flex;flex-direction:column;gap:4px;');
  const bDeploy = btn('Deploy test'), bEcl = btn('Eclipse test'), bShake = btn('Vibration test'), bMag = btn('Magnetic test'), bQual = btn('Run qualification', 'primary');
  testsRow.append(bQual, bDeploy, bEcl, bShake, bMag); left.append(cs.cv, log, testsRow, testList);
  const stats = el('div', 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;'), sMass = statBox('Mass in the slot (incl. 3 kg margin)'), sPow = statBox('Sunlit power vs load'), sData = statBox('Science data'), sBat = statBox('Battery');
  stats.append(sMass.box, sPow.box, sData.box, sBat.box);
  const massBar = el('div', `height:8px;background:${C.faint};border:1px solid ${C.line};`), massFill = el('div', `height:100%;width:0;background:${C.green};transition:width .25s;`); massBar.appendChild(massFill);
  const reqNote = el('div', `font-size:13px;color:${C.soft};line-height:1.45;text-wrap:pretty;`), shelf = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;');
  right.append(kicker('Parts on the shelf · drag onto the craft, or click twice'), reqNote, shelf, stats, massBar);
  const ro = el('div', `padding:10px 12px;border:1px solid ${C.line};background:${C.faint};font-size:14px;color:${C.cream};`);
  root.append(top, ro, main); main.append(left, right);
  // geometry
  const P3 = (a, y, r) => ({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
  const geo = { cx: 0, cy: 0, R: 1, Hh: 1 };
  const scr = (p) => { const c = Math.cos(V.rot), s = Math.sin(V.rot), x = p.x * c - p.z * s, z = p.x * s + p.z * c; return { x: geo.cx + x * geo.R, y: geo.cy + p.y * geo.Hh + z * geo.R * 0.34, z }; };
  const MP = { battery: [2.36, 0.42], computer: [-0.785, -0.32], recorder: [-0.785, 0.4], pd: [0.785, -0.36], iono: [2.36, -0.4], wheels: [-2.36, 0.32], body: [-2.36, -0.42], harness: [0.785, 0.42] };
  function mount(slot) {
    if (slot === 'radio') return { x: 0, y: 1.32, z: 0 }; if (slot === 'gps') return { x: 0, y: -1.12, z: 0 };
    if (slot === 'boom') return P3(1.571, -0.85, 1);
    if (slot === 'boomtip') { const e = lerp(-1.4, 0.28, ease(V.boomDep)), L = 1.9; return P3(1.571, -0.85 - (L * Math.sin(e) * geo.R) / geo.Hh, 1 + L * Math.cos(e)); }
    if (slot === 'array') return P3(0, 0, 1.04); if (slot === 'array2') return P3(Math.PI, 0, 1.04);
    if (slot === 'mag') return mount(st.magAt === 'body' ? 'body' : 'boomtip');
    const p = MP[slot]; return P3(p[0], p[1], 1);
  }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r * k)},${Math.round(gg * k)},${Math.round(b * k)})`; };
  function drawBus(g) {
    const N = 8, rv = 1 / Math.cos(Math.PI / 8), ang = (k) => (k * Math.PI) / 4 + Math.PI / 8;
    const topV = [], botV = []; for (let k = 0; k < N; k++) { topV.push(scr(P3(ang(k), -1, rv))); botV.push(scr(P3(ang(k), 1, rv))); }
    const faces = []; for (let k = 0; k < N; k++) { const na = (k * Math.PI) / 4 + Math.PI / 4, nz = Math.sin(na + V.rot); if (nz > -0.02) faces.push({ k, nz, sh: 0.5 + 0.5 * Math.max(0, Math.cos(na + V.rot + 0.9)) }); }
    faces.sort((a, b) => a.nz - b.nz);
    const body = st.inst.array === 'sa45';
    for (const f of faces) { const k2 = (f.k + 1) % N, q = [topV[f.k], topV[k2], botV[k2], botV[f.k]];
      g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
      g.fillStyle = body && f.k % 2 === 0 ? shade('#2f4680', f.sh) : shade('#3a2c3e', f.sh); g.fill(); g.strokeStyle = 'rgba(217,168,91,0.75)'; g.stroke();
      if (body && f.k % 2 === 0) { g.strokeStyle = 'rgba(241,230,214,0.25)'; for (let i = 1; i < 4; i++) { const t = i / 4; g.beginPath(); g.moveTo(lerp(q[0].x, q[3].x, t), lerp(q[0].y, q[3].y, t)); g.lineTo(lerp(q[1].x, q[2].x, t), lerp(q[1].y, q[2].y, t)); g.stroke(); } } }
    g.beginPath(); topV.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fillStyle = '#4a3a50'; g.fill(); g.strokeStyle = C.gold; g.stroke();
    // launch adapter ring
    g.strokeStyle = 'rgba(241,230,214,0.35)'; g.beginPath(); for (let i = 0; i <= 24; i++) { const p = scr(P3((i / 24) * Math.PI * 2, 1.08, 0.55)); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); } g.stroke();
  }
  function wing(a0) {
    const v = vof('array', st.inst.array); if (!v || v.id === 'sa45') return null;
    const L = v.id === 'sa90' ? 2.5 : 1.9, d = ease(V.dep), psi = a0 + (1 - d) * (Math.PI / 2) * 0.98, Lc = L * (0.3 + 0.7 * d), hx = 1.04 * Math.cos(a0), hz = 1.04 * Math.sin(a0);
    const ex = hx + Lc * Math.cos(psi), ez = hz + Lc * Math.sin(psi), q = [scr({ x: hx, y: -0.62, z: hz }), scr({ x: ex, y: -0.62, z: ez }), scr({ x: ex, y: 0.62, z: ez }), scr({ x: hx, y: 0.62, z: hz })];
    return { z: (q[0].z + q[1].z) / 2, draw: (g) => { g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fillStyle = '#26335e'; g.fill(); g.strokeStyle = C.cream; g.stroke();
      g.strokeStyle = 'rgba(154,200,255,0.35)'; const n = v.id === 'sa90' ? 6 : 4; for (let i = 1; i < n; i++) { const t = i / n; g.beginPath(); g.moveTo(lerp(q[0].x, q[1].x, t), lerp(q[0].y, q[1].y, t)); g.lineTo(lerp(q[3].x, q[2].x, t), lerp(q[3].y, q[2].y, t)); g.stroke(); }
      g.beginPath(); g.moveTo(lerp(q[0].x, q[3].x, 0.5), lerp(q[0].y, q[3].y, 0.5)); g.lineTo(lerp(q[1].x, q[2].x, 0.5), lerp(q[1].y, q[2].y, 0.5)); g.stroke(); } };
  }
  function chip(g, p, f, alpha, fs) {
    const k = 0.85 + 0.15 * clamp(p.z + 0.5, 0, 1), w = fs * 2.7 * k, h = fs * 1.55 * k;
    g.globalAlpha = alpha; g.fillStyle = shade('#1a1420', 1); g.fillRect(p.x - w / 2, p.y - h / 2, w, h); g.strokeStyle = f.col; g.lineWidth = 1.5; g.strokeRect(p.x - w / 2, p.y - h / 2, w, h); g.lineWidth = 1;
    T(g, f.tag, p.x, p.y + fs * 0.36, f.col, 'center', `600 ${Math.round(fs * 0.85 * k)}px ${FONT}`); g.globalAlpha = 1;
  }
  const itemSlots = () => Object.keys(st.inst).filter((s) => !['array', 'boom', 'harness', 'radio'].includes(s));
  function draw(now, dt) {
    if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs;
    geo.cx = W * 0.5; geo.cy = H * 0.5; geo.R = Math.min(W, H * 1.6) * 0.13; geo.Hh = geo.R * 0.95;
    if (V.shakeT > 0 && !reduced()) { geo.cx += Math.sin(now * 0.09) * 4 * V.shakeT; geo.cy += Math.cos(now * 0.13) * 3 * V.shakeT; }
    const bg = g.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, W * 0.6); bg.addColorStop(0, '#1d1424'); bg.addColorStop(1, C.bg); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(241,230,214,0.05)'; for (let x = 0; x < W; x += W / 24) { g.beginPath(); g.moveTo(x, H * 0.78); g.lineTo(W / 2 + (x - W / 2) * 1.8, H); g.stroke(); }
    g.strokeStyle = 'rgba(241,230,214,0.12)'; g.beginPath(); g.ellipse(W / 2, H * 0.84, W * 0.2, H * 0.05, 0, 0, Math.PI * 2); g.stroke();
    T(g, 'ROTATING STAND · drag to turn · ← → keys', fs * 0.8, fs * 1.5, C.mute, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`);
    g.font = `500 ${fs}px ${FONT}`;
    // ecl tint
    const A = V.anim, at = A ? clamp((now - A.t0) / A.dur, 0, 1) : 0;
    const back = [], front = [];
    const put = (o) => { if (o) (o.z < 0 ? back : front).push(o); };
    put(wing(0)); put(wing(Math.PI));
    if (st.inst.boom) { const b0 = scr(mount('boom')), b1 = scr(mount('boomtip')); put({ z: (b0.z + b1.z) / 2, draw: (gg) => { gg.strokeStyle = C.cream; gg.lineWidth = 3; gg.beginPath(); gg.moveTo(b0.x, b0.y); gg.lineTo(b1.x, b1.y); gg.stroke(); gg.lineWidth = 1; gg.fillStyle = C.gold; gg.beginPath(); gg.arc(b0.x, b0.y, 3, 0, 7); gg.fill(); } }); }
    for (const s of itemSlots()) { const p = scr(mount(s)), f = fam(s); put({ z: p.z, draw: (gg) => chip(gg, p, f, p.z < -0.15 ? 0.35 : 1, fs) }); }
    if (st.inst.radio) { const a = scr({ x: 0, y: 1.05, z: 0 }), b = scr({ x: 0, y: 1.45, z: 0 }), x2 = st.inst.radio === 'x2m'; put({ z: 0.01, draw: (gg) => { gg.strokeStyle = C.pink; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(a.x, a.y); gg.lineTo(b.x, b.y); gg.stroke(); gg.lineWidth = 1;
      if (x2) { gg.beginPath(); gg.ellipse(b.x, b.y + 4, geo.R * 0.35, geo.R * 0.1, 0, 0, Math.PI); gg.stroke(); } else { gg.fillStyle = C.pink; gg.fillRect(b.x - 5, b.y - 2, 10, 4); } } }); }
    back.sort((a, b) => a.z - b.z).forEach((o) => o.draw(g)); drawBus(g); front.sort((a, b) => a.z - b.z).forEach((o) => o.draw(g));
    // cables
    if (st.inst.harness) for (const [a, b] of LINKS()) { if (!st.inst[a] || !st.inst[b] || !linked(a, b)) continue; const pa = scr(mount(a)), pb = scr(mount(b)); if (pa.z < -0.3 && pb.z < -0.3) continue;
      g.strokeStyle = a === 'array' || b === 'battery' && a === 'array' ? 'rgba(255,210,122,0.8)' : 'rgba(255,122,107,0.8)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(pa.x, pa.y); g.quadraticCurveTo((pa.x + pb.x) / 2, Math.max(pa.y, pb.y) + geo.R * 0.25, pb.x, pb.y); g.stroke(); g.lineWidth = 1; }
    if (V.linkFrom) { const p = scr(mount(V.linkFrom)); g.strokeStyle = C.coral; g.setLineDash([4, 4]); g.beginPath(); g.arc(p.x, p.y, fs * 1.8, 0, 7); g.stroke(); g.setLineDash([]); }
    // empty bays
    const target = V.drag || V.pick; const pulse = 0.5 + 0.5 * Math.sin(now / 180);
    if (ctx.canEdit) for (const s of required()) { if (st.inst[s] && s !== 'mag') continue; const spots = s === 'mag' ? (st.inst.mag ? [] : [st.inst.boom ? 'boomtip' : null, 'body'].filter(Boolean)) : s === 'array' ? ['array', 'array2'] : s === 'harness' ? [] : [s];
      for (const sp of spots) { const p = scr(mount(sp)); if (p.z < -0.2 && s !== 'radio' && s !== 'gps') continue; const hot = target && target.slot === s; g.strokeStyle = hot ? `rgba(255,122,107,${0.5 + 0.5 * pulse})` : 'rgba(241,230,214,0.28)'; g.setLineDash([3, 3]); g.beginPath(); g.arc(p.x, p.y, fs * (hot ? 1.3 + 0.3 * pulse : 0.9), 0, 7); g.stroke(); g.setLineDash([]);
        if (hot || V.hover === sp) T(g, sp === 'body' ? 'Body (beside the wheels)' : sp === 'boomtip' ? 'Boom tip' : nameOf(s), p.x, p.y - fs * 1.7, hot ? C.coral : C.soft, 'center'); } }
    if (target && target.slot === 'harness' && !st.inst.harness) { g.strokeStyle = `rgba(255,122,107,${0.4 + 0.4 * pulse})`; g.setLineDash([5, 4]); g.strokeRect(geo.cx - geo.R * 1.1, geo.cy - geo.Hh * 1.2, geo.R * 2.2, geo.Hh * 2.5); g.setLineDash([]); T(g, 'Drop anywhere on the bus', geo.cx, geo.cy - geo.Hh * 1.35, C.coral, 'center'); }
    for (const s in V.flash) { const k = (now - V.flash[s]) / 600; if (k > 1) { delete V.flash[s]; continue; } const p = scr(mount(s === 'array' ? 'array' : s)); g.strokeStyle = `rgba(127,214,164,${1 - k})`; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, fs * (1 + k * 2.5), 0, 7); g.stroke(); g.lineWidth = 1; }
    // test overlays
    if (A && A.kind === 'eclipse') {
      const P = A.P, sunF = (P.T - P.Ec) / P.T, inShadow = at > sunF; if (inShadow) { g.fillStyle = 'rgba(5,3,10,0.45)'; g.fillRect(0, 0, W, H); }
      const x0 = W * 0.06, x1 = W * 0.94, y = H * 0.9, bh = fs * 0.7; g.fillStyle = 'rgba(255,210,122,0.35)'; g.fillRect(x0, y, (x1 - x0) * sunF, bh); g.fillStyle = 'rgba(80,60,110,0.8)'; g.fillRect(x0 + (x1 - x0) * sunF, y, (x1 - x0) * (1 - sunF), bh);
      g.fillStyle = C.ink; g.fillRect(x0 + (x1 - x0) * at - 1, y - 4, 2, bh + 8);
      const soc = 1 - P.pw.dod * clamp((at - sunF) / (1 - sunF), 0, 1); const bx = W * 0.86, by = H * 0.12, bw = W * 0.06, bhh = H * 0.32; g.strokeStyle = C.cream; g.strokeRect(bx, by, bw, bhh);
      g.fillStyle = soc < 0.6 ? C.red : C.green; const ss = P.pw.net < 0 ? Math.max(0, soc - 0.25 * at) : soc; g.fillRect(bx + 2, by + 2 + (bhh - 4) * (1 - ss), bw - 4, (bhh - 4) * ss);
      T(g, Math.round(ss * 100) + ' %', bx + bw / 2, by + bhh + fs * 1.3, C.ink, 'center'); T(g, inShadow ? 'EARTH SHADOW · battery only' : 'SUNLIGHT · charging', x0, y - fs * 0.5, inShadow ? C.lilac : C.amber);
    }
    if (A && A.kind === 'mag') { const x0 = W * 0.06, x1 = W * 0.5, yc = H * 0.14; g.strokeStyle = C.teal; g.beginPath(); for (let i = 0; i <= 120; i++) { const x = lerp(x0, x1, i / 120), n = Math.sin(i * 7.1 + now / 90) * 0.15 + (st.magAt === 'body' ? Math.sin(i * 1.3 + now / 60) * 0.8 : 0); const y = yc + n * fs * 1.2; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      T(g, st.magAt === 'body' ? 'Wheel ripple in the magnetometer' : 'Magnetometer noise floor', x0, yc - fs * 1.6, st.magAt === 'body' ? C.amber : C.teal); }
    if (!ctx.canEdit && !Object.keys(st.inst).length) T(g, 'Mateo has not mounted anything yet.', W / 2, H * 0.1, C.soft, 'center');
  }
  function hitSpots(x, y, list) { let best = null, bd = cs.fs * 2.4; for (const sp of list) { const p = scr(mount(sp)); if (p.z < -0.35 && sp !== 'radio' && sp !== 'gps') continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = sp; } } return best; }
  const onBus = (x, y) => Math.abs(x - geo.cx) < geo.R * 1.15 && Math.abs(y - geo.cy) < geo.Hh * 1.3;
  function dropAt(slot, vid, x, y) {
    const spots = slot === 'mag' ? ['boomtip', 'body'] : slot === 'array' ? ['array', 'array2'] : [slot];
    if (slot === 'harness') { if (onBus(x, y)) return install(slot, vid); return say(log, 'The harness goes on the bus itself.', C.amber); }
    const hit = hitSpots(x, y, spots); if (hit) return install(slot, vid, hit);
    const other = hitSpots(x, y, ['battery', 'computer', 'recorder', 'pd', 'iono', 'wheels', 'body', 'radio', 'gps', 'boom', 'array', 'array2', 'boomtip']);
    say(log, other ? `That’s the ${other === 'body' || other === 'boomtip' ? 'magnetometer mount' : nameOf(other).toLowerCase()} bay. The ${fam(slot).name.toLowerCase()} needs its own mount.` : `Drop the ${fam(slot).name.toLowerCase()} on its bay — the dashed ring.`, C.amber);
  }
  function install(slot, vid, at) {
    if (!ctx.canEdit || V.busy) return; const f = fam(slot), v = vof(slot, vid);
    if (f.need && !needs().includes(f.need)) return say(log, `${f.name}: not in Kiran’s plan. It would be ${v.kg} kg of dead mass.`, C.amber);
    if (slot === 'mag') { if (at === 'boomtip' && !st.inst.boom) return say(log, 'Fit the boom first — then the magnetometer goes on its tip.', C.amber); st.magAt = at === 'body' ? 'body' : 'boom'; }
    const prev = st.inst[slot]; st.inst[slot] = vid; V.flash[slot] = performance.now(); V.pick = null; V.depT = 0; voidQual();
    if (f.dec && ctx.S.choices[f.dec] !== vid) { V.pending[f.dec] = vid; ctx.set(f.dec, vid); }
    const L = ledger();
    say(log, prev && prev !== vid ? `Swapped in the ${v.label}; the old one goes back on the shelf. Mass now ${f1(L.alloc)} kg in a ${L.lim} kg slot.`
      : `${v.label} locked in${slot === 'mag' ? (st.magAt === 'body' ? ' on the body, right beside the reaction wheels' : ' at the boom tip') : ''}. Mass ${f1(L.alloc)} / ${L.lim} kg.${slot === 'harness' && !st.assisted ? ' Manual wiring: click a part, then where it connects.' : ''}`, C.green);
    renderUI();
  }
  function remove(slot) { if (!ctx.canEdit || !st.inst[slot] || V.busy) return; delete st.inst[slot]; if (slot === 'boom' && st.magAt === 'boom' && st.inst.mag) delete st.inst.mag; st.links = st.links.filter(([a, b]) => a !== slot && b !== slot); V.sel = null; V.depT = 0; voidQual(); say(log, `${nameOf(slot)} removed and back on the shelf.`, C.soft); renderUI(); }
  function voidQual() { V.tests = []; const a = ctx.S.act && ctx.S.act.craft; if (a && a.ok && ctx.canEdit) ctx.act('craft', { ...packCraft(), ok: false }); }
  function ledger() { const cad = opt('k_cad'); let kg = 9, W = 0, gen = 0, Wh = 0, k = 0, tx = 0;
    for (const s in st.inst) { const v = vof(s, st.inst[s]); if (!v) continue; const ins = s === 'mag' || s === 'pd' || s === 'iono'; kg += v.kg || 0; W += (v.W || 0) * (ins ? cad.p : 1); gen += v.gen || 0; Wh += v.Wh || 0; tx += v.tx || 0; if (ins) k += v.k || 0; }
    return { kg, alloc: kg + 3, lim: opt('l_lv').lim, W, gen, Wh, tx, k: k ? k * cad.d + (cad.bg || 0) : 0 }; }
  function power() { const L = ledger(), r = E.evaluate(ctx.S), orb = opt('l_orb'), Tm = E.period(orb.h), Ec = E.eclipse0(orb.h) * (orb.ef ?? 1);
    return { T: Tm, Ec, orb, L, pw: E.orbitPower({ arrayW: L.gen, loadW: L.W, txW: L.tx, txMinPerOrbit: (r.passes * r.o.n_gs.min) / (1440 / Tm), periodMin: Tm, eclipseMin: Ec, batteryWh: Math.max(1, L.Wh) }) }; }
  const packCraft = () => { const L = ledger(); return { inst: { ...st.inst }, links: st.links.map((x) => x.slice()), magAt: st.magAt, magBody: st.magAt === 'body', assisted: st.assisted, kg: Math.round(L.alloc * 10) / 10, sig: E.craftSig(ctx.S),
    summary: `${f1(L.alloc)} kg each, ${L.gen} W array, ${L.Wh} Wh battery, magnetometer on the ${st.magAt === 'body' ? 'body' : 'boom'}` }; };
  async function runTest(kind) {
    if (V.busy) return; V.busy = true; renderUI(); const res = [];
    const push = (label, s, text) => { res.push({ label, s, text }); V.tests = res.slice(); renderTests(); };
    try {
      if (kind === 'qual' || kind === 'deploy') {
        if (kind === 'qual') {
          const miss = required().filter((s) => !st.inst[s]); if (miss.length) { push('Integration', 'fail', 'Missing: ' + miss.map(nameOf).join(', ') + '.'); return; }
          push('Integration', 'pass', `All ${required().length} systems fitted, including what Kiran asked for.`);
          const un = LINKS().filter(([a, b]) => !linked(a, b)); if (un.length) { push('Harness', 'fail', 'No path: ' + un.map(([a, b]) => nameOf(a) + ' → ' + nameOf(b)).join('; ') + '.'); return; }
          push('Harness', 'pass', 'Power and data paths are continuous.');
          const L = ledger(); if (L.alloc > L.lim + 1e-9) { push('Mass', 'fail', `${f1(L.alloc)} kg with the protected 3 kg margin — ${f1(L.alloc - L.lim)} kg over the ${L.lim} kg slot.`); return; }
          push('Mass', 'pass', `${f1(L.alloc)} / ${L.lim} kg including the protected 3 kg margin. Fits the launch adapter.`);
        }
        if (!st.inst.boom && !st.inst.array) { push('Deployment', 'check', 'Nothing to deploy yet.'); return; }
        V.depT = 0; V.dep = 0; V.boomDep = 0; await wait(250); V.depT = 1; await wait(1700);
        push('Deployment', 'pass', st.inst.array === 'sa45' ? 'Boom out to 1.5 m; the body panels need no hinge.' : 'Array hinges latched; boom out to 1.5 m. No contact with the antenna or the boom.');
        if (kind === 'deploy') return;
      }
      if (kind === 'qual' || kind === 'eclipse') {
        if (!st.inst.array || !st.inst.battery) { push('Eclipse', 'fail', 'No array or no battery fitted.'); return; }
        const P = power(); V.anim = { kind: 'eclipse', t0: performance.now(), dur: reduced() ? 300 : 3600, P }; await wait(3700); V.anim = null;
        if (P.pw.net < 0) { push('Eclipse', 'fail', `Loses ${f1(-P.pw.net)} Wh every orbit on ${P.orb.label}: flat after ~${P.pw.orbitsToEmpty.toFixed(0)} orbits. More array or less load.`); return; }
        push('Eclipse', P.pw.dod > 0.4 ? 'check' : 'pass', `Shadow ${P.Ec.toFixed(0)} of ${P.T.toFixed(0)} min on Leila’s orbit; battery dips ${Math.round(P.pw.dod * 100)} % (aim ≤ 40 %), net ${sgn(P.pw.net)} Wh per orbit.`);
        if (kind === 'eclipse') return;
      }
      if (kind === 'qual' || kind === 'shake') {
        V.shakeT = 1; await wait(1500); V.shakeT = 0;
        const loose = Object.keys(st.inst).filter((s) => !['harness', 'array', 'boom'].includes(s) && !st.inst.harness);
        if (loose.length) { push('Vibration', 'fail', 'Unsecured: no harness or straps — ' + loose.map(nameOf).join(', ') + ' rattle on their mounts.'); return; }
        push('Vibration', 'pass', 'Random vibration at qualification level: nothing loose, no resonance near the launcher’s.');
        if (kind === 'shake') return;
      }
      if (kind === 'qual' || kind === 'mag') {
        if (!st.inst.mag) { push('Magnetic cleanliness', 'check', 'No magnetometer fitted.'); return; }
        V.anim = { kind: 'mag', t0: performance.now(), dur: 1600 }; await wait(1700); V.anim = null;
        push('Magnetic cleanliness', st.magAt === 'body' ? 'check' : 'pass', st.magAt === 'body' ? 'On the body beside the reaction wheels: a ripple at the wheel rate. It will be in Kiran’s data.' : 'On the boom tip the wheels’ field is below the noise floor.');
      }
      if (kind === 'qual') { V.depT = 1; const c = packCraft(); ctx.act('craft', { ...c, ok: true }); say(log, `QUALIFIED: ${c.summary}. Leila can fly it.`, C.green); }
    } finally { V.busy = false; renderUI(); }
  }
  function renderTests() { testList.innerHTML = ''; for (const t of V.tests) { const r = el('div', `display:flex;gap:10px;align-items:baseline;font-size:13.5px;color:${C.cream};`); const col = { pass: C.green, check: C.amber, fail: C.red }[t.s];
    r.append(el('span', `flex:none;width:52px;font:600 11px ${FONT};letter-spacing:.12em;color:${col};`, t.s.toUpperCase()), el('span', `flex:none;width:150px;color:${C.soft};`, t.label), el('span', 'flex:1;min-width:0;text-wrap:pretty;', t.text)); testList.appendChild(r); } }
  function renderUI() {
    const can = ctx.canEdit, a = ctx.S.act && ctx.S.act.craft, sig = E.craftSig(ctx.S), stale = a && a.ok && a.sig !== sig;
    ro.style.display = can ? 'none' : 'block'; ro.textContent = a && a.ok ? `Mateo’s qualified Sentinel: ${a.summary}.` : 'Mateo’s workbench. Only Mateo can build here — you can turn the stand and watch.';
    status.textContent = a && a.ok && !stale ? 'Qualified' : stale ? 'Plan changed · re-qualify' : 'Not qualified'; status.style.color = a && a.ok && !stale ? C.green : stale ? C.amber : C.soft; status.style.borderColor = status.style.color;
    modeB.textContent = 'Wiring: ' + (st.assisted ? 'assisted' : 'manual'); dis(modeB, !can || V.busy); modeB.style.display = can ? '' : 'none';
    spinB.textContent = V.spinV ? 'Stop turning' : 'Turn the stand';
    [bDeploy, bEcl, bShake, bMag, bQual].forEach((b) => { dis(b, !can || V.busy); b.style.display = can ? '' : 'none'; });
    const nd = needs(); reqNote.textContent = `Kiran’s plan needs: ${nd.map((n) => fam(n).name.toLowerCase()).join(', ')}. Leila’s launcher slot: ${opt('l_lv').lim} kg. Orbit: ${opt('l_orb').label}.`;
    shelf.innerHTML = ''; shelf.style.display = can ? 'grid' : 'none';
    for (const f of FAM) for (const v of f.vars) {
      const on = st.inst[f.slot] === v.id, need = !f.need || nd.includes(f.need), picked = V.pick && V.pick.slot === f.slot && V.pick.vid === v.id;
      const c = el('button', `text-align:left;padding:8px 10px;min-height:44px;background:${on ? 'rgba(127,214,164,0.1)' : picked ? 'rgba(255,122,107,0.14)' : C.faint};border:1px solid ${on ? C.green : picked ? C.coral : C.line};color:${C.cream};cursor:${need ? 'grab' : 'not-allowed'};display:flex;flex-direction:column;gap:2px;opacity:${need ? 1 : 0.45};font-family:${FONT};`);
      c.type = 'button'; const hd = el('span', 'display:flex;gap:6px;align-items:center;'); hd.append(el('span', `width:9px;height:9px;flex:none;background:${f.col};`), el('span', 'font-size:13px;font-weight:600;line-height:1.25;', v.label));
      c.append(hd, el('span', `font-size:11.5px;color:${C.soft};line-height:1.3;`, v.spec), el('span', `font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${on ? C.green : !need ? C.mute : f.need ? C.teal : C.mute};`, on ? 'Installed' : !need ? 'Not in Kiran’s plan' : f.need ? 'Kiran needs this' : f.name));
      if (on) c.addEventListener('click', () => { V.sel = f.slot; say(log, `${v.label} (${v.spec}). `, C.soft); const rb = btn('Take it off'); rb.style.marginLeft = '8px'; rb.style.minHeight = '32px'; rb.style.padding = '4px 10px'; rb.onclick = () => remove(f.slot); log.appendChild(rb); });
      else dragChip(c, v.label, f.col, (x, y, moving) => { if (moving) { V.drag = { slot: f.slot, vid: v.id }; return; } V.drag = null; if (inRect(cs.cv, x, y)) { const p = cs.pt({ clientX: x, clientY: y }); dropAt(f.slot, v.id, p[0], p[1]); } },
        () => { if (!need) return say(log, `${f.name}: not in Kiran’s plan.`, C.amber); if (picked) { const at = f.slot === 'mag' ? (st.inst.boom ? 'boomtip' : 'body') : f.slot; install(f.slot, v.id, at); } else { V.pick = { slot: f.slot, vid: v.id }; say(log, `${v.label} in hand. Click its bay on the craft (or click the card again to fit it).`, C.coral); renderUI(); } });
      shelf.appendChild(c);
    }
    const L = ledger(), P = st.inst.array && st.inst.battery ? power() : null;
    sMass.v.textContent = `${f1(L.alloc)} / ${L.lim} kg`; sMass.v.style.color = L.alloc > L.lim ? C.red : C.ink;
    massFill.style.width = clamp((L.alloc / L.lim) * 100, 0, 100) + '%'; massFill.style.background = L.alloc > L.lim ? C.red : L.alloc > L.lim - 1 ? C.amber : C.green;
    sPow.v.textContent = `${L.gen} W / ${f1(L.W)} W`; sPow.l.textContent = P ? `Sunlit array vs load · ${sgn(P.pw.net)} Wh per orbit` : 'Sunlit array vs load'; sPow.v.style.color = P && P.pw.net < 0 ? C.red : C.ink;
    sData.v.textContent = `${f1(L.k)} kbps`; sBat.v.textContent = `${L.Wh} Wh`;
    renderTests();
  }
  modeB.onclick = () => { st.assisted = !st.assisted; V.linkFrom = null; voidQual(); say(log, st.assisted ? 'Assisted wiring: the harness routes itself.' : 'Manual wiring: click a part on the craft, then the part it connects to. Data goes to the computer; power from the array to the battery to the computer; computer → recorder → radio.', C.soft); renderUI(); };
  spinB.onclick = () => { V.spinV = V.spinV ? 0 : 0.18; renderUI(); };
  bQual.onclick = () => runTest('qual'); bDeploy.onclick = () => runTest('deploy'); bEcl.onclick = () => runTest('eclipse'); bShake.onclick = () => runTest('shake'); bMag.onclick = () => runTest('mag');
  // canvas pointer
  cs.cv.addEventListener('pointerdown', (ev) => {
    const [x, y] = cs.pt(ev);
    if (ctx.canEdit && V.pick) { dropAt(V.pick.slot, V.pick.vid, x, y); return; }
    if (ctx.canEdit && !st.assisted && st.inst.harness) { const hit = hitSpots(x, y, Object.keys(st.inst).filter((s) => s !== 'harness' && s !== 'boom').map((s) => (s === 'mag' ? 'mag' : s)));
      if (hit) { if (!V.linkFrom) { V.linkFrom = hit; say(log, `${nameOf(hit)}: now click what it connects to.`, C.coral); } else if (V.linkFrom !== hit) { const a = V.linkFrom, b = hit, ok = LINKS().some(([p, q]) => (p === a && q === b) || (p === b && q === a));
        V.linkFrom = null; if (ok) { if (!linked(a, b)) st.links.push([a, b]); voidQual(); say(log, `Routed ${nameOf(a)} ↔ ${nameOf(b)}. ${LINKS().filter(([p, q]) => st.inst[p] && st.inst[q] && !linked(p, q)).length} connections left.`, C.green); }
        else say(log, `No reason to wire ${nameOf(a)} to ${nameOf(b)}. Instruments talk to the computer; power runs array → battery → computer.`, C.amber); } else V.linkFrom = null; return; } }
    if (ctx.canEdit) { const hit = hitSpots(x, y, Object.keys(st.inst).filter((s) => s !== 'harness').map((s) => s)); if (hit) { const v = vof(hit, st.inst[hit]); say(log, `${v.label} · ${v.spec}. `, C.soft); const rb = btn('Take it off'); rb.style.marginLeft = '8px'; rb.style.minHeight = '32px'; rb.style.padding = '4px 10px'; rb.onclick = () => remove(hit); log.appendChild(rb); return; } }
    V.rotDrag = { x, rot: V.rot }; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
  });
  cs.cv.addEventListener('pointermove', (ev) => { const [x, y] = cs.pt(ev); if (V.rotDrag) V.rot = V.rotDrag.rot - (x - V.rotDrag.x) / (geo.R * 2.2); else V.hover = hitSpots(x, y, ['battery', 'computer', 'recorder', 'pd', 'iono', 'wheels', 'body', 'radio', 'gps', 'boom', 'boomtip', 'array', 'array2']); });
  const endRot = () => { V.rotDrag = null; }; cs.cv.addEventListener('pointerup', endRot); cs.cv.addEventListener('pointercancel', endRot);
  const unkey = keys(root, (ev) => { if (ev.type !== 'keydown') return; if (ev.key === 'ArrowLeft') { V.rot += 0.25; ev.preventDefault(); } else if (ev.key === 'ArrowRight') { V.rot -= 0.25; ev.preventDefault(); } else if (ev.key === 'Escape') { V.pick = null; V.linkFrom = null; renderUI(); } });
  const stop = loop((dt, now) => { if (!V.rotDrag && V.spinV && !reduced()) V.rot += V.spinV * dt; const k = Math.min(1, dt * 1.6); V.dep += (V.depT - V.dep) * k * 1.4; V.boomDep += (V.depT - V.boomDep) * k; if (Math.abs(V.depT - V.dep) < 0.002) V.dep = V.depT; draw(now, dt); });
  say(log, ctx.canEdit ? 'Mateo: drag each part onto its bay. The craft has to carry what Kiran asked for, fit Leila’s slot, and survive her orbit’s shadow.' : 'Watching Mateo’s workbench.', C.soft);
  renderUI();
  return {
    update(c) { const before = E.craftSig(ctx.S) + JSON.stringify((ctx.S.act || {}).craft || null); ctx = c;
      if (!ctx.canEdit) { const a = fromAct(); if (a) Object.assign(st, a); }
      else { for (const f of FAM) { if (!f.dec) continue; const ch = ctx.S.choices[f.dec]; if (V.pending[f.dec]) { if (V.pending[f.dec] === ch) delete V.pending[f.dec]; continue; } if (st.inst[f.slot] && ch && st.inst[f.slot] !== ch) st.inst[f.slot] = ch; }
        const nd = needs(); for (const f of FAM) if (f.need && st.inst[f.slot] && !nd.includes(f.need)) { delete st.inst[f.slot]; say(log, `Kiran dropped it from the plan: the ${f.name.toLowerCase()} comes off.`, C.amber); } }
      if (before !== E.craftSig(ctx.S) + JSON.stringify((ctx.S.act || {}).craft || null)) renderUI(); },
    destroy() { stop(); unkey(); },
  };
}

// ======================================================================== BAY (Mateo · Helios / Selene / Bridge)
const BAYCFG = {
  helios: { craft: 'Helios', N: 4, h: 1, slots: [{ dec: 'h_prop', tag: 'PRP', col: C.amber, at: [0.7, 0.45] }, { dec: 'h_rec', tag: 'REC', col: C.lilac, at: [-0.85, -0.35] }, { dec: 'h_ant', tag: 'HGA', col: C.pink, at: 'top' }, { dec: 'h_arr', tag: 'SA', col: C.blue, at: 'wing' }], special: 'point',
    intro: 'Helios: tanks, dish, array and recorder around Kiran’s instruments. It must fit Leila’s launcher and keep its Δv.' },
  selene: { craft: 'Selene', N: 6, h: 0.9, slots: [{ dec: 's_rec', tag: 'REC', col: C.lilac, at: [-0.8, 0.3] }, { dec: 's_port', tag: 'SVC', col: C.teal, at: [0.8, -0.25] }, { dec: 's_iso', tag: 'ISO', col: C.coral, at: [2.4, 0.3] }], special: 'heat',
    intro: 'Selene: the orbiter that carries the probes. Its recorder, a possible second data port, and how the transmitter is mounted.' },
  bridge: { craft: 'Bridge', N: 12, h: 1.3, slots: [{ dec: 'b_ls', tag: 'ECLSS', col: C.green, at: [-0.8, 0.2] }, { dec: 'b_shelter', tag: 'SHLD', col: C.teal, at: [0.75, -0.1] }, { dec: 'b_tools', tag: 'EVA', col: C.amber, at: [2.5, 0.55] }], special: 'drill',
    intro: 'Bridge: three people to the Moon and back. Life support, the radiation shelter and the tools that must work in pressure gloves.' },
};
function bay(root, ctx) {
  const E = ctx.E, M = E.mission(ctx.S), CF = BAYCFG[M.id]; if (!CF) { root.textContent = 'No workbench for this mission.'; return { update() {}, destroy() {} }; }
  const D = (k) => M.decisions.find((d) => d.id === k), SL = CF.slots.map((x) => ({ ...x, d: D(x.dec) })).filter((x) => x.d);
  const key = ctx.S.seed + ':' + ctx.S.mi; let st = WB.get(key);
  const fromAct = () => { const a = ctx.S.act && ctx.S.act.craft; return a && a.inst ? { inst: { ...a.inst } } : null; };
  if (!st) { st = fromAct() || { inst: {} }; WB.set(key, st); }
  const V = { pending: {}, rot: -0.5, spinV: 0.16, dep: 0, depT: 0, pick: null, drag: null, flash: {}, anim: null, busy: false, tests: [], rotDrag: null };
  const top = row(10), status = el('span', `white-space:nowrap;font:600 12px ${FONT};letter-spacing:.14em;text-transform:uppercase;padding:5px 10px;border:1px solid ${C.line};color:${C.soft};`), spinB = btn('');
  spinB.style.minHeight = '36px'; spinB.style.padding = '6px 12px'; top.append(kicker('Integration bay · ' + CF.craft, C.amber), el('span', 'flex:1;'), status, spinB);
  const ro = el('div', `padding:10px 12px;border:1px solid ${C.line};background:${C.faint};font-size:14px;color:${C.cream};`);
  const main = el('div', 'display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;'), left = el('div', 'flex:3 1 380px;min-width:0;display:flex;flex-direction:column;gap:10px;'), right = el('div', 'flex:2 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;');
  const cs = stage(left, 16, 10), log = logLine(), tRow = row(8), tList = el('div', 'display:flex;flex-direction:column;gap:4px;'), bQual = btn('Run qualification', 'primary', () => qual());
  tRow.append(bQual); left.append(cs.cv, log, tRow, tList);
  const shelf = el('div', 'display:flex;flex-direction:column;gap:10px;'), stats = el('div', 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;');
  right.append(kicker('Parts · drag onto the craft, or click twice'), shelf, kicker('Live from the design review'), stats); main.append(left, right); root.append(top, ro, main);
  const P3 = (a, y, r) => ({ x: r * Math.cos(a), y, z: r * Math.sin(a) }), geo = { cx: 0, cy: 0, R: 1, Hh: 1 };
  const scr = (p) => { const c = Math.cos(V.rot), sn = Math.sin(V.rot), x = p.x * c - p.z * sn, zz = p.x * sn + p.z * c; return { x: geo.cx + x * geo.R, y: geo.cy + p.y * geo.Hh + zz * geo.R * 0.34, z: zz }; };
  const mountOf = (sl) => (sl.at === 'top' ? { x: 0, y: -CF.h - 0.35, z: 0 } : sl.at === 'wing' ? P3(0, 0, 1.08) : P3(sl.at[0], sl.at[1] * CF.h, 1));
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
  const opt = (sl) => sl.d.options.find((o) => o.id === st.inst[sl.dec]);
  function prism(g) { const N = CF.N, rv = 1 / Math.cos(Math.PI / N), ang = (k) => (k * 2 * Math.PI) / N + Math.PI / N, h = CF.h, tp = [], bt = [];
    for (let k = 0; k < N; k++) { tp.push(scr(P3(ang(k), -h, rv))); bt.push(scr(P3(ang(k), h, rv))); }
    const faces = []; for (let k = 0; k < N; k++) { const na = ((k + 0.5) * 2 * Math.PI) / N + Math.PI / N, nz = Math.sin(na + V.rot); if (nz > -0.02) faces.push({ k, nz, sh: 0.5 + 0.5 * Math.max(0, Math.cos(na + V.rot + 0.9)) }); }
    faces.sort((a, b) => a.nz - b.nz).forEach((f) => { const k2 = (f.k + 1) % N, q = [tp[f.k], tp[k2], bt[k2], bt[f.k]]; g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
      g.fillStyle = shade(M.id === 'bridge' ? '#4a4452' : '#3a2c3e', f.sh); g.fill(); g.strokeStyle = M.id === 'bridge' ? 'rgba(241,230,214,0.35)' : 'rgba(217,168,91,0.75)'; g.stroke(); });
    g.beginPath(); tp.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fillStyle = '#4a3a50'; g.fill(); g.strokeStyle = C.gold; g.stroke();
    if (M.id === 'bridge') { const apex = scr({ x: 0, y: -h - 0.9, z: 0 }), cy0 = scr({ x: 0, y: -h, z: 0 }).y, l = geo.cx - geo.R * 1.03, rr = geo.R * 1.03 + geo.cx; g.fillStyle = '#5a5262'; g.beginPath(); g.moveTo(apex.x, apex.y); g.lineTo(rr, cy0); g.ellipse(geo.cx, cy0, geo.R * 1.03, geo.R * 0.35, 0, 0, Math.PI); g.lineTo(apex.x, apex.y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(241,230,214,0.35)'; g.stroke(); } }
  function features(g, fs) {
    if (M.id === 'helios') { const a = opt(SL.find((x) => x.dec === 'h_arr')), d = opt(SL.find((x) => x.dec === 'h_ant'));
      if (a) { const L = a.W >= 900 ? 2.6 : a.W >= 600 ? 2.1 : 1.6, k = 0.3 + 0.7 * ease(V.dep); [0, Math.PI].forEach((a0) => { const hx = 1.08 * Math.cos(a0), hz = 1.08 * Math.sin(a0), ex = hx + L * k * Math.cos(a0), ez = hz + L * k * Math.sin(a0);
        const q = [scr({ x: hx, y: -0.55, z: hz }), scr({ x: ex, y: -0.55, z: ez }), scr({ x: ex, y: 0.55, z: ez }), scr({ x: hx, y: 0.55, z: hz })]; g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fillStyle = '#26335e'; g.fill(); g.strokeStyle = C.cream; g.stroke(); }); }
      if (d) { const c = scr({ x: 0, y: -CF.h - 0.35, z: 0 }), r = geo.R * (d.kbps >= 256 ? 0.75 : 0.5); g.fillStyle = '#d8cfd8'; g.beginPath(); g.ellipse(c.x, c.y, r, r * 0.35, 0, 0, 7); g.fill(); g.strokeStyle = C.pink; g.stroke(); } }
    if (M.id === 'selene') { const n = (D('s_probes').options.find((o) => o.id === ctx.S.choices.s_probes) || { n: 3 }).n; for (let i = 0; i < n; i++) { const p = scr(P3((i / n) * Math.PI * 2 + 0.4, -CF.h - 0.25, 0.6)); g.fillStyle = [C.teal, C.amber, C.blue][i]; g.fillRect(p.x - fs * 0.7, p.y - fs * 0.45, fs * 1.4, fs * 0.9); }
      T(g, `${n} probe${n > 1 ? 's' : ''} on the adapter (Kiran)`, geo.cx, geo.cy - geo.Hh * (CF.h + 0.9), C.soft, 'center'); } }
  function chip(g, p, sl, fs) { const o = opt(sl), w = fs * (sl.tag.length > 3 ? 3.6 : 2.8), h = fs * 1.55; g.globalAlpha = p.z < -0.15 ? 0.35 : 1; g.fillStyle = '#1a1420'; g.fillRect(p.x - w / 2, p.y - h / 2, w, h); g.strokeStyle = sl.col; g.lineWidth = 1.5; g.strokeRect(p.x - w / 2, p.y - h / 2, w, h); g.lineWidth = 1;
    T(g, sl.tag, p.x, p.y + fs * 0.36, sl.col, 'center', `600 ${Math.round(fs * 0.85)}px ${FONT}`); g.globalAlpha = 1; if (o && /^(no|none|standard mounting)/i.test(o.id + ' ' + o.label) && o.kg === 0) { g.strokeStyle = sl.col; g.beginPath(); g.moveTo(p.x - w / 2, p.y + h / 2); g.lineTo(p.x + w / 2, p.y - h / 2); g.stroke(); } }
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs; geo.cx = W / 2; geo.cy = H * 0.55; geo.R = Math.min(W, H * 1.6) * 0.12; geo.Hh = geo.R * 0.95;
    const bg = g.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, W * 0.6); bg.addColorStop(0, '#1d1424'); bg.addColorStop(1, C.bg); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(241,230,214,0.12)'; g.beginPath(); g.ellipse(W / 2, H * 0.88, W * 0.2, H * 0.05, 0, 0, 7); g.stroke(); T(g, 'ROTATING STAND · drag to turn', fs * 0.8, fs * 1.5, C.mute, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`;
    const back = SL.filter((sl) => st.inst[sl.dec] && sl.at !== 'wing' && sl.at !== 'top' && scr(mountOf(sl)).z < 0), front = SL.filter((sl) => st.inst[sl.dec] && sl.at !== 'wing' && sl.at !== 'top' && scr(mountOf(sl)).z >= 0);
    back.forEach((sl) => chip(g, scr(mountOf(sl)), sl, fs)); prism(g); features(g, fs); front.forEach((sl) => chip(g, scr(mountOf(sl)), sl, fs));
    SL.filter((sl) => (sl.at === 'wing' || sl.at === 'top') && st.inst[sl.dec]).forEach((sl) => { const p = scr(mountOf(sl)); T(g, sl.tag, p.x, p.y - fs, sl.col, 'center', `600 ${Math.round(fs * 0.85)}px ${FONT}`); });
    const tgt = V.drag || V.pick, pulse = 0.5 + 0.5 * Math.sin(now / 180);
    if (ctx.canEdit) SL.forEach((sl) => { if (st.inst[sl.dec] && !(tgt && tgt.dec === sl.dec)) return; const p = scr(mountOf(sl)); const hot = tgt && tgt.dec === sl.dec; g.strokeStyle = hot ? `rgba(255,122,107,${0.5 + 0.5 * pulse})` : 'rgba(241,230,214,0.28)'; g.setLineDash([3, 3]); g.beginPath(); g.arc(p.x, p.y, fs * (hot ? 1.4 + 0.3 * pulse : 0.9), 0, 7); g.stroke(); g.setLineDash([]); if (hot) T(g, sl.d.label, p.x, p.y - fs * 1.8, C.coral, 'center'); });
    for (const k in V.flash) { const t = (now - V.flash[k]) / 600; if (t > 1) { delete V.flash[k]; continue; } const p = scr(mountOf(SL.find((x) => x.dec === k))); g.strokeStyle = `rgba(127,214,164,${1 - t})`; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, fs * (1 + t * 2.5), 0, 7); g.stroke(); g.lineWidth = 1; }
    const A = V.anim; if (A) { const k = clamp((now - A.t0) / A.dur, 0, 1);
      if (A.kind === 'point') { g.fillStyle = 'rgba(255,210,122,0.35)'; g.beginPath(); g.arc(W * 0.98, H * 0.3, H * 0.18, 0, 7); g.fill(); g.fillStyle = '#2b5a93'; g.beginPath(); g.arc(W * 0.05, H * 0.25, fs, 0, 7); g.fill(); T(g, 'SUN', W * 0.95, H * 0.3, C.amber, 'right'); T(g, 'EARTH · 1.5 M km', W * 0.05, H * 0.25 + fs * 2.2, C.blue);
        const c = scr({ x: 0, y: -CF.h - 0.35, z: 0 }); g.strokeStyle = C.teal; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(lerp(c.x, W * 0.05, k), lerp(c.y, H * 0.25, k)); g.stroke(); g.setLineDash([]); }
      if (A.kind === 'heat') { const tx = SL.find((x) => x.dec === 's_iso'), rc = SL.find((x) => x.dec === 's_rec'), a = scr(mountOf(tx)), b = scr(mountOf(rc)), iso = ctx.S.choices.s_iso === 'iso';
        const gr = g.createRadialGradient(a.x, a.y, 2, a.x, a.y, geo.R * (0.4 + k * (iso ? 0.4 : 1.6))); gr.addColorStop(0, 'rgba(255,107,107,0.7)'); gr.addColorStop(1, 'rgba(255,107,107,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        if (!iso && k > 0.5) { g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(lerp(a.x, b.x, (k - 0.5) * 2), lerp(a.y, b.y, (k - 0.5) * 2)); g.stroke(); g.lineWidth = 1; } T(g, 'TRANSMITTER FAULT · heat path', fs * 0.8, H - fs, C.red); }
      if (A.kind === 'drill') { const sh = scr(mountOf(SL.find((x) => x.dec === 'b_shelter'))), secs = ctx.S.choices.b_shelter === 'water' ? 30 : 75; for (let i = 0; i < 3; i++) { const sx = W * 0.2 + i * fs * 2, sy = H * 0.85; g.fillStyle = [C.blue, C.amber, C.teal][i]; g.beginPath(); g.arc(lerp(sx, sh.x + (i - 1) * fs, k), lerp(sy, sh.y, k), fs * 0.45, 0, 7); g.fill(); }
        T(g, `SOLAR STORM DRILL · crew in the shelter in ${Math.round(secs * k)} s`, fs * 0.8, H - fs, C.amber); } } }
  function install(dec, vid) { if (!ctx.canEdit || V.busy) return; const sl = SL.find((x) => x.dec === dec), o = sl.d.options.find((x) => x.id === vid); st.inst[dec] = vid; V.flash[dec] = performance.now(); V.pick = null; voidQual();
    if (ctx.S.choices[dec] !== vid) { V.pending[dec] = vid; ctx.set(dec, vid); } say(log, `${sl.d.label}: ${o.label} fitted. The review board updates on every screen.`, C.green); render(); }
  function dropAt(dec, vid, x, y) { const sl = SL.find((q) => q.dec === dec), p = scr(mountOf(sl)); if (Math.hypot(p.x - x, p.y - y) < cs.fs * 3.2 || (sl.at !== 'wing' && sl.at !== 'top' && Math.abs(x - geo.cx) < geo.R * 1.2 && Math.abs(y - geo.cy) < geo.Hh * (CF.h + 0.4))) install(dec, vid); else say(log, `The ${sl.d.label.toLowerCase()} goes on its bay — the dashed ring.`, C.amber); }
  function voidQual() { V.tests = []; const a = ctx.S.act && ctx.S.act.craft; if (a && a.ok && ctx.canEdit) ctx.act('craft', { inst: { ...st.inst }, ok: false, sig: E.craftSig(ctx.S) }); }
  async function qual() { if (V.busy) return; V.busy = true; V.tests = []; render(); const push = (label, s2, text) => { V.tests.push({ label, s: s2, text }); renderTests(); };
    try { const miss = SL.filter((sl) => !st.inst[sl.dec]); if (miss.length) { push('Integration', 'fail', 'Missing: ' + miss.map((x) => x.d.label).join(', ') + '.'); return; }
      push('Integration', 'pass', 'Every system Mateo owns is fitted.'); V.depT = 1; V.anim = { kind: CF.special, t0: performance.now(), dur: reduced() ? 300 : 2600 }; await wait(2700); V.anim = null;
      const c = ctx.S.choices;
      if (CF.special === 'point') { const d = D('h_ant').options.find((o) => o.id === c.h_ant); push('Pointing', 'pass', `Array on the Sun, ${d ? d.label : 'dish'} on Earth. Commands take about 5 s each way.`); }
      if (CF.special === 'heat') push('Thermal fault', c.s_iso === 'iso' ? 'pass' : 'check', c.s_iso === 'iso' ? 'A transmitter fault stays in its isolated mount; the recorder stays cool.' : 'Standard mounting: if the high-rate transmitter fails hot, the heat path reaches the recorder.');
      if (CF.special === 'drill') { push('Shelter drill', c.b_shelter === 'water' ? 'pass' : 'check', c.b_shelter === 'water' ? 'Crew behind the water wall in about 30 s.' : 'Improvised in the storage bay: 75 s to clear it and less shielding.'); push('Glove test', c.b_tools === 'glove' ? 'pass' : 'check', c.b_tools === 'glove' ? 'Every EVA tool works in pressure gloves.' : 'Standard tools in pressure gloves: each bolt takes more than twice as long.'); }
      const r = E.evaluate(ctx.S); for (const gt of r.gates) { await wait(260); push(gt.label, gt.status, gt.text); }
      if (r.gates.some((gt) => gt.status === 'fail')) { say(log, 'Qualification hold: a red gate. Fix it here or ask the others to change their part.', C.red); return; }
      ctx.act('craft', { inst: { ...st.inst }, ok: true, sig: E.craftSig(ctx.S), summary: SL.map((sl) => opt(sl).label).join(' · ') }); say(log, `QUALIFIED: ${CF.craft} is ready for Naomi’s review.`, C.green);
    } finally { V.busy = false; render(); } }
  function renderTests() { tList.innerHTML = ''; V.tests.forEach((t) => { const r = el('div', `display:flex;gap:10px;align-items:baseline;font-size:13.5px;color:${C.cream};`); r.append(el('span', `flex:none;width:52px;font:600 11px ${FONT};letter-spacing:.12em;color:${{ pass: C.green, check: C.amber, fail: C.red }[t.s]};`, t.s.toUpperCase()), el('span', `flex:none;width:140px;color:${C.soft};`, t.label), el('span', 'flex:1;min-width:0;text-wrap:pretty;', t.text)); tList.appendChild(r); }); }
  function render() { const can = ctx.canEdit, a = ctx.S.act && ctx.S.act.craft, ok = a && a.ok && a.sig === E.craftSig(ctx.S), stale = a && a.ok && !ok;
    ro.style.display = can ? 'none' : 'block'; ro.textContent = ok ? `Mateo’s qualified ${CF.craft}: ${a.summary}.` : `Mateo’s workbench. Only Mateo can build here.`;
    status.textContent = ok ? 'Qualified' : stale ? 'Plan changed · re-qualify' : 'Not qualified'; status.style.color = ok ? C.green : stale ? C.amber : C.soft; status.style.borderColor = status.style.color;
    spinB.textContent = V.spinV ? 'Stop turning' : 'Turn the stand'; bQual.style.display = can ? '' : 'none'; dis(bQual, V.busy);
    shelf.innerHTML = ''; shelf.style.display = can ? 'flex' : 'none';
    SL.forEach((sl) => { const grp = el('div', 'display:flex;flex-direction:column;gap:5px;'); grp.append(el('span', `font:600 12.5px ${FONT};color:${sl.col};`, sl.d.label + (sl.d.help ? ' · ' + sl.d.help : '')));
      const rw = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;');
      sl.d.options.forEach((o) => { const on = st.inst[sl.dec] === o.id, picked = V.pick && V.pick.dec === sl.dec && V.pick.vid === o.id;
        const c = el('button', `text-align:left;padding:8px 10px;min-height:44px;background:${on ? 'rgba(127,214,164,0.1)' : picked ? 'rgba(255,122,107,0.14)' : C.faint};border:1px solid ${on ? C.green : picked ? C.coral : C.line};color:${C.cream};cursor:grab;display:flex;flex-direction:column;gap:2px;font-family:${FONT};`);
        c.type = 'button'; c.append(el('span', 'font-size:13px;font-weight:600;line-height:1.25;', o.label), el('span', `font-size:11.5px;color:${C.soft};line-height:1.3;`, o.sub || ''), el('span', `font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${on ? C.green : C.mute};`, on ? 'Installed' : sl.tag));
        if (!on) dragChip(c, o.label, sl.col, (x, y, mv) => { if (mv) { V.drag = { dec: sl.dec }; return; } V.drag = null; if (inRect(cs.cv, x, y)) { const p = cs.pt({ clientX: x, clientY: y }); dropAt(sl.dec, o.id, p[0], p[1]); } },
          () => { if (picked) install(sl.dec, o.id); else { V.pick = { dec: sl.dec, vid: o.id }; say(log, `${o.label} in hand. Click its bay on the craft, or click the card again.`, C.coral); render(); } });
        rw.appendChild(c); }); grp.appendChild(rw); shelf.appendChild(grp); });
    stats.innerHTML = ''; let r = null; try { r = E.evaluate(ctx.S); } catch (e) { r = null; } if (r) r.metrics.slice(0, 4).forEach((mx) => { const b = statBox(mx.label); b.v.textContent = mx.value; b.v.style.color = { pass: C.ink, check: C.amber, fail: C.red }[mx.status] || C.ink; b.v.style.fontSize = '15px'; stats.appendChild(b.box); });
    renderTests(); }
  spinB.onclick = () => { V.spinV = V.spinV ? 0 : 0.16; render(); };
  cs.cv.addEventListener('pointerdown', (ev) => { const [x, y] = cs.pt(ev); if (ctx.canEdit && V.pick) { dropAt(V.pick.dec, V.pick.vid, x, y); return; } V.rotDrag = { x, rot: V.rot }; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } });
  cs.cv.addEventListener('pointermove', (ev) => { if (!V.rotDrag) return; const [x] = cs.pt(ev); V.rot = V.rotDrag.rot - (x - V.rotDrag.x) / (geo.R * 2.2); });
  const endR = () => { V.rotDrag = null; }; cs.cv.addEventListener('pointerup', endR); cs.cv.addEventListener('pointercancel', endR);
  const unkey = keys(root, (ev) => { if (ev.type !== 'keydown') return; if (ev.key === 'ArrowLeft') { V.rot += 0.25; ev.preventDefault(); } else if (ev.key === 'ArrowRight') { V.rot -= 0.25; ev.preventDefault(); } else if (ev.key === 'Escape') { V.pick = null; render(); } });
  const stop = loop((dt, now) => { if (!V.rotDrag && V.spinV && !reduced()) V.rot += V.spinV * dt; V.dep += (V.depT - V.dep) * Math.min(1, dt * 2); if (Object.keys(st.inst).length) V.depT = 1; draw(now); });
  say(log, ctx.canEdit ? 'Mateo: ' + CF.intro : 'Watching Mateo’s workbench.', C.soft); render();
  return { update(c) { const before = E.craftSig(ctx.S) + JSON.stringify((ctx.S.act || {}).craft || null); ctx = c;
      if (!ctx.canEdit) { const a = fromAct(); if (a) st.inst = a.inst; } else SL.forEach((sl) => { const ch = ctx.S.choices[sl.dec]; if (V.pending[sl.dec]) { if (V.pending[sl.dec] === ch) delete V.pending[sl.dec]; return; } if (st.inst[sl.dec] && ch && st.inst[sl.dec] !== ch) st.inst[sl.dec] = ch; });
      if (before !== E.craftSig(ctx.S) + JSON.stringify((ctx.S.act || {}).craft || null)) render(); }, destroy() { stop(); unkey(); } };
}

// ======================================================================== ASCENT (Leila · Sentinel)
function ascent(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 11), ph1 = R() * 6, ph2 = R() * 6, T1 = 16, T2 = 31, h = P.h || 580, inc = P.inc ?? 82;
  const MU = 398600.4418, RE = 6378.137, ISP = 320, G0 = 9.80665, DRY = 450, PAY = 2 * (P.kg || 45), FUEL0 = 18;
  const z = { st: 'pre', t: 0, pitch: 90, hold: 0, e: 0, err: 0, thr: 1, q: 0, load: 0, over: 0, sepAt: 0, late: 0, fuel: FUEL0, dv: 0, x: 0, y: 0, trail: [], parts: [], sepT: -1, orbA: 0, done: false, chart: [] };
  const prog = (t) => (t < 2 ? 90 : t < T1 ? lerp(90, 32, ease((t - 2) / (T1 - 2))) : lerp(32, 0, ease((t - T1 - 1.5) / (T2 - T1 - 1.5))));
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), stats = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;');
  const sAp = statBox('Apogee'), sPe = statBox('Perigee'), sErr = statBox('Off the target speed'), sFuel = statBox('Upper-stage propellant'); stats.append(sAp.box, sPe.box, sErr.box, sFuel.box);
  root.append(ctl, log, stats);
  const bGo = btn('Ignition', 'primary', () => { if (z.st !== 'pre') return; z.st = 'boost'; say(log, 'Liftoff. Guidance is flying the pitch program — keep it inside the corridor.', C.amber); render(); });
  const bUp = holdBtn('▲ Pitch up', () => (z.hold = 1), () => (z.hold = 0)), bDn = holdBtn('▼ Pitch down', () => (z.hold = -1), () => (z.hold = 0));
  const bThr = btn('Throttle down (T)', 'ghost', () => toggleThr()), bSep = btn('Separate stages (Space)', 'primary', () => sep(false));
  const burn = (dv) => () => { if (z.st !== 'orbit' || z.done) return; const m = DRY + PAY + z.fuel, use = m * (1 - Math.exp(-Math.abs(dv) / (ISP * G0)));
    if (use > z.fuel + 1e-9) return say(log, 'Not enough propellant for that burn. Release where we are, or try a smaller trim.', C.red);
    z.fuel -= use; z.dv += dv; z.burnFx = performance.now(); say(log, `${dv > 0 ? 'Prograde' : 'Retrograde'} ${Math.abs(dv)} m/s: ${f1(use)} kg of propellant. ${Math.abs(z.dv) <= 10 ? 'On target.' : 'Still ' + Math.round(Math.abs(z.dv)) + ' m/s off.'}`, Math.abs(z.dv) <= 10 ? C.green : C.amber); render(); };
  const bP10 = btn('Prograde +10', 'ghost', burn(10)), bR10 = btn('Retrograde −10', 'ghost', burn(-10)), bP2 = btn('+2', 'ghost', burn(2)), bR2 = btn('−2', 'ghost', burn(-2));
  const bRel = btn('Release both Sentinels', 'primary', () => release());
  function toggleThr() { if (z.st !== 'boost') return; z.thr = z.thr > 0.8 ? 0.7 : 1; say(log, z.thr < 1 ? 'Throttled to 70 % — through the bucket.' : 'Full thrust.', C.soft); render(); }
  function sep(auto) { if (z.st !== 'sep') return; z.late = z.t - z.sepAt; z.fuel = Math.max(4, z.fuel - Math.max(0, z.late - 0.6) * 2.2); z.st = 'upper'; z.sepT = z.t;
    say(log, auto ? 'Auto-separation after a long coast: gravity losses ate into the upper stage’s propellant.' : z.late < 0.8 ? 'Clean separation. Upper stage ignition.' : `Separation ${f1(z.late)} s late — some propellant lost to the coast.`, auto ? C.red : z.late < 0.8 ? C.green : C.amber); render(); }
  function insert() { z.st = 'orbit'; z.dv = Math.round(clamp(z.err, -160, 160)); say(log, `SECO. ${Math.abs(z.dv) <= 10 ? 'Right on the target orbit.' : `Insertion ${Math.abs(z.dv)} m/s ${z.dv > 0 ? 'fast' : 'slow'}: the orbit is lopsided. Trim it with the upper stage before releasing.`}`, Math.abs(z.dv) <= 10 ? C.green : C.amber); render(); }
  function orbit() { const r = RE + h, v = Math.sqrt(MU / r) + z.dv / 1000, a = 1 / (2 / r - (v * v) / MU), o = 2 * a - r; return { v, ap: Math.max(r, o) - RE, pe: Math.min(r, o) - RE, Tm: (2 * Math.PI * Math.sqrt(Math.abs(a) ** 3 / MU)) / 60, a, r }; }
  function release() { if (z.st !== 'orbit' || z.done) return; z.done = true; const e = Math.abs(z.dv), fu = z.fuel / FUEL0; let g = e <= 10 && fu >= 0.45 ? 'good' : e <= 25 ? 'ok' : 'bad'; if (g === 'good' && z.over > 1) g = 'ok';
    const o = orbit(); ctx.finish(g, e, `Released at ${Math.round(o.pe)} × ${Math.round(o.ap)} km, ${Math.round(e)} m/s off target, ${f1(z.fuel)} kg propellant left${z.over > 1 ? ' · max-Q overload logged' : ''}.`); render(); }
  function render() { renderCtl(); stat(); }
  function renderCtl() { const key = z.st + (z.done ? 'd' : ''); if (key === z.ctlKey) { bThr.textContent = z.thr < 1 ? 'Throttle up (T)' : 'Throttle down (T)'; return; } z.ctlKey = key; ctl.innerHTML = ''; if (z.st === 'pre') ctl.append(bGo); else if (z.st === 'boost') ctl.append(bUp, bDn, bThr); else if (z.st === 'sep') ctl.append(bSep, bUp, bDn); else if (z.st === 'upper') ctl.append(bUp, bDn); else if (!z.done) ctl.append(bR10, bR2, bP2, bP10, bRel);
    bThr.textContent = z.thr < 1 ? 'Throttle up (T)' : 'Throttle down (T)'; }
  function stat() { const o = orbit(), inO = z.st === 'orbit'; sAp.v.textContent = inO ? Math.round(o.ap) + ' km' : '—'; sPe.v.textContent = inO ? Math.round(o.pe) + ' km' : '—';
    sErr.v.textContent = inO ? Math.round(Math.abs(z.dv)) + ' m/s' : '—'; sErr.v.style.color = inO ? (Math.abs(z.dv) <= 10 ? C.green : Math.abs(z.dv) <= 25 ? C.amber : C.red) : C.ink; sFuel.v.textContent = f1(z.fuel) + ' kg'; }
  const unkey = keys(root, (ev) => { const k = ev.key, dn = ev.type === 'keydown';
    if (['ArrowUp', 'w', 'W'].includes(k)) { ev.preventDefault(); z.hold = dn ? 1 : z.hold === 1 ? 0 : z.hold; }
    else if (['ArrowDown', 's', 'S'].includes(k)) { ev.preventDefault(); z.hold = dn ? -1 : z.hold === -1 ? 0 : z.hold; }
    else if (dn && (k === 't' || k === 'T')) toggleThr(); else if (dn && k === ' ') { if (z.st === 'sep') { ev.preventDefault(); sep(false); } } });
  function step(dt) {
    if (z.st === 'boost' || z.st === 'sep' || z.st === 'upper') {
      const t0 = z.t; z.t += dt; const dist = (1.5 * Math.sin(0.9 * z.t + ph1) + 1.1 * Math.sin(2.2 * z.t + ph2)) * (z.st === 'upper' ? 0.75 : 1);
      z.pitch += prog(z.t) - prog(t0) + (dist + z.hold * 6) * dt; z.e = z.pitch - prog(z.t);
      const v = lerp(0, 7.56, ease(z.t / T2)), rad = (z.pitch * Math.PI) / 180; z.x += v * Math.cos(rad) * dt; z.y += v * Math.sin(rad) * dt;
      if ((z.tr = (z.tr || 0) + dt) > 0.08) { z.tr = 0; z.trail.push([z.x, z.y]); if (z.trail.length > 400) z.trail.shift(); z.chart.push([z.t, z.pitch]); }
      if (z.st === 'boost') { z.q = Math.exp(-(((z.t - 8) / 2.4) ** 2)); z.load = z.q * (z.thr > 0.8 ? 112 : 74); if (z.load > 100) { z.over += dt; if (!z.warned) { z.warned = 1; say(log, 'MAX-Q — structural load over the limit. Throttle down!', C.red); } }
        if (z.thr < 1 && z.q < 0.25 && z.t > 10.5) { z.thr = 1; say(log, 'Through max-Q. Guidance throttles back up.', C.soft); render(); }
        if (z.thr < 1 && z.q < 0.25 && z.t < 5) z.fuel = Math.max(4, z.fuel - 0.6 * dt);
        if (z.t >= T1) { z.st = 'sep'; z.sepAt = z.t; say(log, 'MECO. First stage burnt out — separate now!', C.coral); render(); } }
      else if (z.st === 'sep') { if (z.t - z.sepAt > 2.4) sep(true); }
      else { z.err += z.e * 4 * dt; if (z.t >= T2) insert(); }
      if (z.st !== 'orbit' && Math.abs(z.e) > 8 && !z.done) { z.err += Math.sign(z.e) * 40 * dt; }
    } else if (z.st === 'orbit') z.orbA += dt * (reduced() ? 0.2 : 0.6);
  }
  function draw(now) {
    if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs;
    if (z.st !== 'orbit') {
      const alt = z.st === 'pre' ? 0 : lerp(0, h, ease(z.t / T2)), sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#07040c'); sk.addColorStop(1, alt < h * 0.3 ? '#4a1a28' : '#1a0d1c'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(241,230,214,0.6)'; for (let i = 0; i < 50; i++) { g.globalAlpha = clamp(alt / 120, 0, 1) * (0.3 + (i % 3) * 0.2); g.fillRect((i * 173) % W, (i * 97) % (H * 0.7), 1.2, 1.2); } g.globalAlpha = 1;
      const shk = z.st === 'boost' && !reduced() ? z.q * (z.thr > 0.8 ? 3 : 1.2) : 0, ox = Math.sin(now * 0.07) * shk, oy = Math.cos(now * 0.11) * shk;
      const hz = H * 0.8 + (alt / h) * H * 0.3, Rp = W * 3.2; g.fillStyle = '#16314f'; g.beginPath(); g.arc(W * 0.3 + ox, hz + Rp + oy, Rp, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,122,107,0.55)'; g.lineWidth = 3; g.beginPath(); g.arc(W * 0.3 + ox, hz + Rp + oy, Rp + 3, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); g.lineWidth = 1;
      const rx = W * 0.34 + ox, ry = H * 0.52 + oy, sc = (H * 0.5) / Math.max(30, z.y + 10);
      g.strokeStyle = 'rgba(255,210,122,0.5)'; g.beginPath(); z.trail.forEach(([x, y], i) => { const px = rx - (z.x - x) * sc, py = ry + (z.y - y) * sc; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
      if (z.st === 'pre') { g.fillStyle = '#3a2c3e'; g.fillRect(rx - fs * 2.2, ry + fs * 2.6, fs * 0.6, fs * 4); }
      if (z.sepT > 0 && z.t - z.sepT < 3) { const k = z.t - z.sepT; g.save(); g.translate(rx - k * fs * 3, ry + k * k * fs * 1.2); g.rotate(k * 0.9); g.fillStyle = '#8a7d8e'; g.fillRect(-fs * 0.35, 0, fs * 0.7, fs * 3); g.restore(); }
      g.save(); g.translate(rx, ry); g.rotate(((90 - z.pitch) * Math.PI) / 180);
      const stage1 = z.st === 'pre' || z.st === 'boost', len = stage1 ? fs * 5.2 : fs * 2.2;
      if ((z.st === 'boost' || z.st === 'upper') && !reduced()) for (let i = 0; i < 3; i++) z.parts.push({ x: (R() - 0.5) * fs * 0.4, y: len * 0.5, vx: (R() - 0.5) * 20, vy: 60 + R() * 80 * (z.thr), life: 0.5 + R() * 0.4 });
      z.parts.forEach((p) => { g.globalAlpha = clamp(p.life, 0, 1); g.fillStyle = p.life > 0.6 ? C.amber : C.coral; g.fillRect(p.x, p.y, 2.5, 2.5); }); g.globalAlpha = 1;
      g.fillStyle = C.cream; g.fillRect(-fs * 0.35, -len * 0.5, fs * 0.7, len); g.fillStyle = C.red; g.beginPath(); g.moveTo(-fs * 0.35, -len * 0.5); g.lineTo(0, -len * 0.5 - fs * 0.9); g.lineTo(fs * 0.35, -len * 0.5); g.fill(); g.restore();
      // corridor chart
      const cx0 = W * 0.64, cx1 = W - fs, cy0 = fs * 2.2, cy1 = H * 0.5, X = (t) => cx0 + (t / T2) * (cx1 - cx0), Y = (p) => cy1 - (p / 90) * (cy1 - cy0);
      g.fillStyle = 'rgba(11,7,16,0.75)'; g.fillRect(cx0 - fs * 0.5, cy0 - fs * 1.6, cx1 - cx0 + fs, cy1 - cy0 + fs * 2.4); g.fillStyle = 'rgba(127,214,164,0.18)'; g.beginPath();
      for (let t = 0; t <= T2; t += 0.5) g.lineTo(X(t), Y(prog(t) + 2.5)); for (let t = T2; t >= 0; t -= 0.5) g.lineTo(X(t), Y(prog(t) - 2.5)); g.closePath(); g.fill();
      g.strokeStyle = C.ink; g.beginPath(); z.chart.forEach(([t, p], i) => (i ? g.lineTo(X(t), Y(p)) : g.moveTo(X(t), Y(p)))); g.stroke();
      T(g, 'PITCH vs GUIDANCE CORRIDOR', cx0, cy0 - fs * 0.5, C.soft, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`;
      const L = [`T+${z.t.toFixed(1)} s`, `ALT ${Math.round(alt)} km`, `VEL ${lerp(0, 7.56, ease(z.t / T2)).toFixed(2)} km/s`, `PITCH ${z.pitch.toFixed(1)}°`, `OFF CORRIDOR ${sgn(z.e)}°`];
      L.forEach((s, i) => T(g, s, fs, fs * 1.6 + i * fs * 1.4, i === 4 ? (Math.abs(z.e) > 2.5 ? C.red : C.green) : C.ink));
      if (z.st === 'boost') { const bx = fs, by = H - fs * 2.2, bw = W * 0.26; g.strokeStyle = C.line; g.strokeRect(bx, by, bw, fs * 0.8); g.fillStyle = z.load > 100 ? C.red : z.load > 80 ? C.amber : C.green; g.fillRect(bx, by, (bw * clamp(z.load, 0, 120)) / 120, fs * 0.8);
        g.fillStyle = C.ink; g.fillRect(bx + (bw * 100) / 120, by - 3, 2, fs * 0.8 + 6); T(g, `DYNAMIC PRESSURE · THROTTLE ${Math.round(z.thr * 100)} %`, bx, by - fs * 0.4, C.soft); }
      if (z.st === 'sep') T(g, 'SEPARATE', W * 0.34, H * 0.2, now % 500 < 250 ? C.coral : C.ink, 'center', `600 ${fs * 2}px ${PIX}`);
      if (z.st === 'pre') T(g, `TARGET · ${P.orbit || h + ' km'} · ${inc}°`, W * 0.5, H * 0.18, C.ink, 'center', `600 ${Math.round(fs * 1.5)}px ${PIX}`);
    } else {
      g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(241,230,214,0.5)'; for (let i = 0; i < 60; i++) g.fillRect((i * 173) % W, (i * 97) % H, 1, 1);
      const o = orbit(), cx = W * 0.4, cy = H * 0.52, k = (H * 0.32) / RE, er = RE * k; const eg = g.createRadialGradient(cx - er * 0.3, cy - er * 0.3, 2, cx, cy, er); eg.addColorStop(0, '#3d6fa8'); eg.addColorStop(1, '#0f2240'); g.fillStyle = eg; g.beginPath(); g.arc(cx, cy, er, 0, 7); g.fill();
      const ex = 3.2, tr = (RE + h) * k; g.strokeStyle = 'rgba(127,214,164,0.5)'; g.setLineDash([5, 5]); g.beginPath(); g.arc(cx, cy, tr, 0, 7); g.stroke(); g.setLineDash([]);
      const aa = o.a * k, c = ((o.ap - o.pe) / 2) * k * ex, bb = Math.sqrt(Math.max(1, aa * aa - (c / ex) ** 2)); const ax = aa + (aa - tr) * (ex - 1);
      g.strokeStyle = Math.abs(z.dv) <= 10 ? C.green : C.amber; g.lineWidth = 2; g.beginPath(); g.ellipse(cx + (z.dv >= 0 ? -c : c), cy, Math.max(4, ax), Math.max(4, bb + (ax - aa)), 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      const an = z.orbA, sx = cx + (z.dv >= 0 ? -c : c) + Math.cos(an) * ax, sy = cy + Math.sin(an) * (bb + (ax - aa)); g.fillStyle = C.ink; g.beginPath(); g.arc(sx, sy, fs * 0.35, 0, 7); g.fill();
      if (z.burnFx && now - z.burnFx < 600) { g.strokeStyle = C.amber; g.beginPath(); g.arc(sx, sy, fs * (0.5 + (now - z.burnFx) / 150), 0, 7); g.stroke(); }
      T(g, 'TARGET (dashed) vs ACTUAL ORBIT · ellipse exaggerated ×3', fs, fs * 1.6, C.soft);
      [`Apogee ${Math.round(o.ap)} km`, `Perigee ${Math.round(o.pe)} km`, `Period ${o.Tm.toFixed(1)} min`, `Inclination ${inc}°`, `Speed ${o.v.toFixed(3)} km/s`].forEach((s, i) => T(g, s, W * 0.72, H * 0.3 + i * fs * 1.5, C.ink));
    }
    z.parts = z.parts.filter((p) => { p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.life -= 0.03; return p.life > 0; });
  }
  render(); say(log, `Leila: ${P.orbit || h + ' km'}. The rocket steers itself — I keep it honest. ▲/▼ or W/S to trim, T for the throttle bucket, Space to separate.`, C.soft);
  const stop = loop((dt, now) => { if (!z.done) step(dt); draw(now); if (z.st === 'boost' || z.st === 'upper' || z.st === 'sep') { if ((z.rr = (z.rr || 0) + dt) > 0.25) { z.rr = 0; stat(); } } });
  return { update(c) { ctx = c; }, destroy() { stop(); unkey(); } };
}

// ======================================================================== DOWNLINK (Naomi · Sentinel)
const DSN = { nv: { n: 'Aegis · Nevada', lat: 35.4, lon: -116.9 }, es: { n: 'Aegis · Spain', lat: 40.4, lon: -4.2 }, au: { n: 'Aegis · Australia', lat: -35.4, lon: 148.9 }, spd: { n: 'University dish · São Paulo', lat: -23.5, lon: -46.6 }, kid: { n: 'Agency dish · Kiruna', lat: 67.9, lon: 21.1 }, jp: { n: 'Agency dish · Japan', lat: 36.1, lon: 138.4 } };
const STN = { sp: { n: 'São Paulo', lat: -23.5, lon: -46.6 }, kir: { n: 'Kiruna', lat: 67.9, lon: 21.1 }, ak: { n: 'Alaska dish', lat: 64.8, lon: -147.7 }, sv: { n: 'Svalbard', lat: 78.2, lon: 15.4 }, inv: { n: 'Inuvik', lat: 68.4, lon: -133.7 }, tro: { n: 'Troll', lat: -72, lon: 2.5 } };
function downlink(root, ctx) {
  const P = ctx.P || {}, deep = !!P.deep, R = rng(ctx.seed || 21), DUR = 60, GT = deep ? 1440 : 360, VIS = deep ? 72 : 21, CRAFT = P.craft || 'Sentinel', inc = ((P.inc ?? 82) * Math.PI) / 180, Tp = (2 * Math.PI * Math.sqrt((6378 + (P.h || 580)) ** 3 / 398600)) / 60;
  if (deep) Object.assign(STN, DSN);
  const own = deep ? (P.net === 'aegis' ? ['nv', 'es', 'au'] : P.net === 'mixed' ? ['spd', 'es', 'jp'] : ['spd', 'kid', 'jp']) : P.net === 'uni' ? ['sp'] : P.net === 'aegis' ? ['sv', 'inv', 'tro'] : ['sp', 'kir', 'ak'], aegisLane = P.net !== 'aegis';
  const AEG = deep ? ['nv', 'es', 'au'] : ['sv', 'inv', 'tro'];
  const lanes = own.map((k) => ({ k, ...STN[k], aegis: deep ? AEG.includes(k) : P.net === 'aegis' })); if (aegisLane) lanes.push({ k: 'aeg', n: deep ? 'Aegis priority (any site)' : 'Aegis priority (polar)', aegis: true, multi: AEG.filter((k) => !own.includes(k)) });
  const u0 = R() * 6.28, lon0 = R() * 360 - 180;
  const track = (tm) => { if (deep) return { lat: 0, lon: ((((lon0 - 0.25 * tm + 180) % 360) + 360) % 360) - 180 }; const u = u0 + (2 * Math.PI * tm) / Tp, lat = Math.asin(Math.sin(inc) * Math.sin(u)), lon = Math.atan2(Math.cos(inc) * Math.sin(u), Math.cos(u)) * 57.2958 + lon0 - 0.25 * tm; return { lat: lat * 57.2958, lon: ((((lon + 180) % 360) + 360) % 360) - 180 }; };
  const dist = (a, b) => { const r = Math.PI / 180, s = Math.sin(a.lat * r) * Math.sin(b.lat * r) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.cos((a.lon - b.lon) * r); return Math.acos(clamp(s, -1, 1)) / r; };
  const passes = []; lanes.forEach((ln, li) => { const keysL = ln.multi || [ln.k]; let on = null;
    for (let tm = 0; tm <= GT; tm += 0.5) { const p = track(tm), c = keysL.some((k) => dist(p, STN[k]) < VIS); if (c && on == null) on = tm; if ((!c || tm === GT) && on != null) { if (tm - on >= 2) passes.push({ li, a: on, b: tm, booked: false, contested: !ln.aegis && R() < 0.4, share: 1, id: passes.length }); on = null; } } });
  const CAP = deep ? ((P.recMB || 4000) >= 16000 ? 120 : 40) : (P.recMB || 256) >= 1000 ? 140 : 48, RATE = deep ? ((P.kbps || 64) / 64) * 0.11 : (P.kbps || 512) / 256, EV0 = deep ? 300 : 60, EV1 = deep ? 420 : 78, EVN = 30, RT = deep ? 40 : 12;
  const z = { t: 0, gm: 0, started: false, done: false, q: [], evSent: 0, evLost: 0, rtSent: 0, retries: 0, spent: 0, price: 0.12, called: false, favor: 1, prio: false, kiran: !!P.buffering, nextRt: 0, evMade: 0, fly: [], prompt: null, flash: 0 };
  const cs = stage(root, 2, 1), side = el('div', 'display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;'), log = logLine();
  const colA = el('div', 'flex:3 1 320px;min-width:0;display:flex;flex-direction:column;gap:8px;'), colB = el('div', 'flex:2 1 220px;min-width:0;display:flex;flex-direction:column;gap:8px;');
  const ctl = row(8), list = el('div', 'display:flex;flex-direction:column;gap:6px;'), card = el('div', ''), call = el('div', '');
  const sRec = statBox('Recorder'), sEv = statBox('Event packets verified on Earth'), sSp = statBox('Extra spend (game money)');
  const recBar = el('div', `display:grid;grid-template-columns:repeat(${Math.min(CAP, 48)},1fr);gap:1px;height:14px;`);
  colA.append(kicker('Upcoming passes · click to book'), list); colB.append(sRec.box, recBar, sEv.box, sSp.box, card, call);
  root.append(cs.cv, ctl, log, side); side.append(colA, colB);
  const bStart = btn('Start the shift', 'primary', () => { z.started = true; say(log, `Shift started. ${CRAFT} is recording.`, C.soft); renderCtl(); });
  const bPrio = btn('', 'ghost', () => { z.prio = !z.prio; say(log, z.prio ? 'Downlink order: event packets first, routine after.' : 'Downlink order: oldest first.', C.soft); renderCtl(); });
  const bKir = btn('Ask Kiran to cut the routine rate', 'ghost', () => { if (z.kiran) return; z.kiran = true; say(log, 'Kiran switches routine data to a low background rate. Less routine science, more room for the event.', C.teal); renderCtl(); });
  const hhmm = (tm) => { const m = Math.max(0, Math.round(tm)); return `T+${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
  const cost = (p) => (lanes[p.li].k === 'aeg' ? z.price : 0);
  function book(p) {
    if (z.done || p.b <= z.gm) return; if (p.booked) { if (p.a <= z.gm) return; p.booked = false; z.spent -= p.paid || 0; p.paid = 0; renderList(); return; }
    if (p.contested) { z.prompt = p; renderCard(); return; }
    p.booked = true; p.paid = cost(p); z.spent += p.paid; say(log, `${lanes[p.li].n} booked ${hhmm(p.a)}–${hhmm(p.b)}${p.paid ? ` · ${'$' + p.paid.toFixed(2)}M to Aegis` : ''}.`, C.green); renderList();
  }
  function renderCard() { card.innerHTML = ''; const p = z.prompt; if (!p) return; const b = el('div', `display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid ${C.amber};background:rgba(255,210,122,0.06);`);
    b.append(el('span', `font:600 14px ${FONT};color:${C.amber};`, `${lanes[p.li].n} ${hhmm(p.a)} is also requested`), el('span', `font-size:13px;color:${C.cream};text-wrap:pretty;`, 'A weather-satellite team booked the same antenna. One dish, one spacecraft at a time.'));
    const r = row(6); r.append(btn('Share it (half the pass)', 'ghost', () => { p.contested = false; p.share = 0.5; z.prompt = null; book(p); renderCard(); }),
      (() => { const x = btn(`Call in a favour (${z.favor} left)`, 'ghost', () => { if (!z.favor) return; z.favor--; p.contested = false; p.share = 1; z.prompt = null; book(p); say(log, 'The university gives you the whole pass — once.', C.green); renderCard(); }); dis(x, !z.favor); return x; })(),
      btn('Leave it', 'ghost', () => { z.prompt = null; renderCard(); }));
    b.appendChild(r); card.appendChild(b); }
  function renderList() { list.innerHTML = ''; const up = passes.filter((p) => p.b > z.gm).sort((a, b) => a.a - b.a).slice(0, 6);
    if (!up.length) list.appendChild(el('span', `font-size:13px;color:${C.soft};`, 'No more passes in this shift.'));
    for (const p of up) { const ln = lanes[p.li], live = p.a <= z.gm; const b = el('button', `display:flex;gap:10px;align-items:center;justify-content:space-between;text-align:left;padding:8px 10px;min-height:44px;background:${p.booked ? 'rgba(127,214,164,0.1)' : C.faint};border:1px solid ${p.booked ? C.green : ln.aegis && ln.k === 'aeg' ? C.amber : C.line};color:${C.cream};cursor:pointer;font-family:${FONT};`);
      b.type = 'button'; b.append(el('span', 'font-size:13.5px;', `${ln.n} · ${hhmm(p.a)} · ${Math.round(p.b - p.a)} min${live ? ' · NOW' : ''}`), el('span', `font-size:12px;color:${p.booked ? C.green : p.contested ? C.amber : C.soft};`, p.booked ? (p.share < 1 ? 'Booked · shared' : 'Booked') : p.contested ? 'Contested' : ln.k === 'aeg' ? '$' + z.price.toFixed(2) + 'M' : 'Free'));
      b.addEventListener('click', () => book(p)); list.appendChild(b); } }
  function renderCtl() { ctl.innerHTML = ''; if (!z.started) { ctl.append(bStart); return; } bPrio.textContent = z.prio ? 'Order: event first' : 'Order: oldest first'; ctl.append(bPrio, bKir); dis(bKir, z.kiran || z.done); dis(bPrio, z.done); }
  function renderStats() { sRec.v.textContent = `${z.q.length} / ${CAP} packets`; sRec.v.style.color = z.q.length >= CAP ? C.red : z.q.length > CAP * 0.8 ? C.amber : C.ink;
    sEv.v.textContent = `${z.evSent} / ${EVN}${z.evLost ? ` · ${z.evLost} overwritten` : ''}`; sEv.v.style.color = z.evLost ? C.red : z.evSent === EVN ? C.green : C.ink; sSp.v.textContent = '$' + z.spent.toFixed(2) + 'M';
    recBar.innerHTML = ''; const n = Math.min(CAP, 48), per = CAP / n; for (let i = 0; i < n; i++) { const pk = z.q[Math.floor(i * per)]; recBar.appendChild(el('div', `background:${pk ? (pk.ev ? C.coral : 'rgba(241,230,214,0.5)') : C.faint};`)); } }
  const activePass = () => passes.find((p) => p.booked && p.a <= z.gm && p.b > z.gm);
  function step(dt) {
    if (!z.started || z.done) return; z.t += dt; const g0 = z.gm; z.gm = (z.t / DUR) * GT; const dg = z.gm - g0;
    const rtEvery = z.kiran ? RT * 2.5 : RT; z.nextRt -= dg; if (z.nextRt <= 0) { z.nextRt += rtEvery; push({ ev: false }); }
    if (z.gm >= EV0 && z.evMade < EVN) { const want = Math.min(EVN, Math.floor(((z.gm - EV0) / (EV1 - EV0)) * EVN) + 1); while (z.evMade < want) { z.evMade++; push({ ev: true }); } if (z.evMade === 1 && !z.evSaid) { z.evSaid = 1; say(log, deep ? 'A shock front is crossing Helios — burst mode. Get those packets down.' : 'The recurrence is happening — Sentinel is recording at full rate. Get those packets down.', C.coral); } }
    if (!z.called && z.gm >= GT * 0.42 && aegisLane) { z.called = true; z.price = 0.25; call.innerHTML = ''; const b = el('div', `padding:10px 12px;border:1px solid ${C.red};background:rgba(194,52,64,0.12);display:flex;flex-direction:column;gap:4px;`);
      b.append(el('span', `font:600 13px ${FONT};color:${C.pink};letter-spacing:.12em;text-transform:uppercase;`, 'Incoming · Aegis Horizon'), el('span', `font-size:13.5px;color:${C.cream};`, 'Priority contacts are now $0.25M each, effective immediately.')); call.appendChild(b); say(log, 'Aegis just doubled its priority price.', C.red); renderList(); }
    const ap = activePass(); if (ap) { const ln = lanes[ap.li]; ap.acc = (ap.acc || 0) + RATE * dg * ap.share;
      while (ap.acc >= 1 && z.q.length) { ap.acc -= 1; let i = 0; if (z.prio) { const j = z.q.findIndex((p) => p.ev); if (j >= 0) i = j; } const pk = z.q[i];
        if (R() < 0.06) { z.retries++; z.flash = 1; continue; } z.q.splice(i, 1); if (pk.ev) z.evSent++; else z.rtSent++; z.fly.push({ k: 0, ev: pk.ev, st: ln.k }); } }
    if (z.gm >= GT) { z.done = true; const frac = z.evSent / EVN, g = frac >= 0.9 ? 'good' : frac >= 0.6 ? 'ok' : 'bad';
      ctx.finish(g, Math.round(frac * 100) + 1000 * Math.round(z.spent * 100), `${z.evSent} of ${EVN} event packets verified on the ground${z.evLost ? `, ${z.evLost} overwritten on board` : ''}${z.retries ? `, ${z.retries} CRC retries` : ''}. Extra spend $${z.spent.toFixed(2)}M.`); renderCtl(); }
  }
  function push(pk) { z.q.push(pk); if (z.q.length > CAP) { const old = z.q.shift(); if (old.ev) { z.evLost++; if (z.evLost === 1) say(log, 'Recorder full — the oldest event packets are being overwritten!', C.red); } } }
  function draw(now) {
    if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, mh = H * 0.64, X = (lon) => ((lon + 180) / 360) * W, Y = (lat) => ((90 - lat) / 180) * mh;
    g.fillStyle = '#0e0a16'; g.fillRect(0, 0, W, mh); g.strokeStyle = 'rgba(241,230,214,0.06)'; for (let l = -180; l <= 180; l += 30) { g.beginPath(); g.moveTo(X(l), 0); g.lineTo(X(l), mh); g.stroke(); } for (let l = -60; l <= 60; l += 30) { g.beginPath(); g.moveTo(0, Y(l)); g.lineTo(W, Y(l)); g.stroke(); }
    if (deep) { const sp0 = track(z.gm); g.fillStyle = 'rgba(255,210,122,0.08)'; g.beginPath(); g.ellipse(X(sp0.lon), Y(0), (VIS / 360) * W, (VIS / 180) * mh, 0, 0, 7); g.fill(); T(g, 'HELIOS IS ABOVE THE HORIZON HERE', X(sp0.lon), Y(0) - (VIS / 180) * mh * 0.7, C.amber, 'center', `500 ${Math.round(fs * 0.8)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`; } else {
    g.fillStyle = 'rgba(255,176,200,0.08)'; g.fillRect(0, Y(75), W, Y(60) - Y(75)); g.fillRect(0, Y(-60), W, Y(-75) - Y(-60)); T(g, 'AURORAL ZONES', fs * 0.5, Y(75) - fs * 0.3, C.pink, 'left', `500 ${Math.round(fs * 0.8)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`; }
    if (!deep) g.fillStyle = C.cream; if (!deep) for (let tm = z.gm - 60; tm < z.gm + 120; tm += 0.5) { const p = track(tm); g.globalAlpha = tm < z.gm ? 0.7 : 0.3; g.fillRect(X(p.lon) - 1, Y(p.lat) - 1, 2, 2); } g.globalAlpha = 1;
    const sp = track(z.gm), ap = activePass();
    const stns = new Set(); lanes.forEach((l) => (l.multi || [l.k]).forEach((k) => stns.add(k)));
    for (const k of stns) { const s = STN[k], ae = !own.includes(k); g.strokeStyle = ae ? 'rgba(255,210,122,0.18)' : 'rgba(127,214,164,0.18)'; g.beginPath(); g.ellipse(X(s.lon), Y(s.lat), (VIS / 360) * W / Math.max(0.3, Math.cos((s.lat * Math.PI) / 180)) * 0.5, (VIS / 180) * mh, 0, 0, 7); g.stroke();
      g.fillStyle = ae ? C.amber : C.green; g.beginPath(); g.arc(X(s.lon), Y(s.lat), 4, 0, 7); g.fill(); { const rt = ae || X(s.lon) > W * 0.75; T(g, s.n, X(s.lon) + (rt ? -6 : 6), Y(s.lat) + (ae ? -6 : 14), ae ? C.amber : C.green, rt ? 'right' : 'left'); } }
    if (ap) { const ln = lanes[ap.li], ks = ln.multi || [ln.k], k = ks.reduce((a, b) => (dist(sp, STN[a]) < dist(sp, STN[b]) ? a : b)), s = STN[k]; g.strokeStyle = C.teal; g.lineWidth = 2; g.setLineDash([6, 4]); g.lineDashOffset = -now / 40; g.beginPath(); g.moveTo(X(sp.lon), Y(sp.lat)); g.lineTo(X(s.lon), Y(s.lat)); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
      z.fly.forEach((f) => { f.k += 0.03; const x = lerp(X(sp.lon), X(s.lon), f.k), y = lerp(Y(sp.lat), Y(s.lat), f.k); g.fillStyle = f.ev ? C.coral : C.cream; g.fillRect(x - 2.5, y - 2.5, 5, 5); }); }
    z.fly = z.fly.filter((f) => f.k < 1).slice(-40);
    g.fillStyle = z.flash > 0 ? C.red : C.ink; g.beginPath(); g.arc(X(sp.lon), Y(sp.lat), fs * 0.45, 0, 7); g.fill(); z.flash = Math.max(0, z.flash - 0.05); T(g, deep ? 'HELIOS' : 'SENTINEL', X(sp.lon) + fs * 0.6, Y(sp.lat) + fs * 1.2, C.ink);
    // timeline
    const ty = mh + fs * 0.6, lh = (H - ty - fs * 1.6) / lanes.length, tx0 = W * 0.2, tx1 = W - fs * 0.5, TX = (tm) => tx0 + (tm / GT) * (tx1 - tx0);
    g.fillStyle = C.bg; g.fillRect(0, mh, W, H - mh); g.fillStyle = 'rgba(255,122,107,0.12)'; g.fillRect(TX(EV0), ty, TX(EV1) - TX(EV0), lh * lanes.length); T(g, 'EVENT', TX(EV0), H - fs * 0.5, C.coral);
    lanes.forEach((ln, i) => { const y = ty + i * lh; T(g, ln.n, fs * 0.5, y + lh * 0.65, ln.k === 'aeg' ? C.amber : C.cream, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); g.strokeStyle = C.line; g.beginPath(); g.moveTo(tx0, y + lh); g.lineTo(tx1, y + lh); g.stroke(); });
    passes.forEach((p) => { const y = ty + p.li * lh + lh * 0.18, x = TX(p.a), w = Math.max(3, TX(p.b) - TX(p.a)); g.fillStyle = p.booked ? 'rgba(127,214,164,0.7)' : p.contested ? 'rgba(255,210,122,0.35)' : 'rgba(241,230,214,0.2)'; g.fillRect(x, y, w, lh * 0.64); if (p.booked && p.share < 1) { g.fillStyle = 'rgba(11,7,16,0.6)'; g.fillRect(x + w / 2, y, w / 2, lh * 0.64); } });
    g.fillStyle = C.ink; g.fillRect(TX(z.gm), ty - 3, 2, lh * lanes.length + 6); T(g, hhmm(z.gm), TX(z.gm) + 4, ty + fs * 0.2, C.ink, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`);
    if (!z.started) { g.fillStyle = 'rgba(11,7,16,0.55)'; g.fillRect(0, 0, W, H); T(g, 'Book a few passes, then start the shift', W / 2, H / 2, C.ink, 'center', `600 ${Math.round(fs * 1.4)}px ${PIX}`); }
    cs.tl = { tx0, tx1, ty, lh, TX };
  }
  cs.cv.addEventListener('pointerdown', (ev) => { const [x, y] = cs.pt(ev), t = cs.tl; if (!t || y < t.ty) return; const li = Math.floor((y - t.ty) / t.lh), tm = ((x - t.tx0) / (t.tx1 - t.tx0)) * GT; const p = passes.find((q) => q.li === li && tm >= q.a - 3 && tm <= q.b + 3); if (p) book(p); });
  renderCtl(); renderList(); renderStats(); say(log, deep ? `Naomi: Helios sits 1.5 million km sunward; each dish sees it while its side of Earth faces the Sun. ${P.net === 'aegis' ? 'Our contract is with Aegis.' : 'Aegis sells priority time on its three sites.'} Recorder: ${CAP} packets; a shock makes ${EVN}.` : `Naomi: ${P.net === 'aegis' ? 'Aegis’s polar network is ours for this mission — but it is still their antenna.' : 'Our network first. Aegis sells priority time on its polar sites, if we need it.'} Recorder holds ${CAP} packets; the event makes ${EVN}.`, C.soft);
  let lastR = 0; const stop = loop((dt, now) => { step(dt); draw(now); if (now - lastR > 300) { lastR = now; renderStats(); const sigL = passes.filter((p) => p.b > z.gm).slice(0, 8).map((p) => p.id + (p.booked ? 'b' : '') + (p.a <= z.gm ? 'n' : '') + (p.contested ? 'c' : '')).join(',') + z.price; if (sigL !== z.sigL) { z.sigL = sigL; renderList(); } } });
  return { update(c) { ctx = c; }, destroy() { stop(); } };
}

// ======================================================================== PEAKS (Kiran · Sentinel)
function peaks(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 31), N = 720, DT = 0.25, PK = [30, 78, 126], AMP = [1.2, 1.35, 1.5], rx = clamp(P.rx ?? 1, 0, 1);
  const delta = P.gps ? 0 : 3 + Math.round(R() * 12) / 4, wheel = P.magBody ? Array.from({ length: 14 }, (_, i) => 5 + i * 12.5) : [], bus = 52 + R() * 8;
  const model = (t) => 1.1 * Math.exp(-0.5 * ((t - 30) / 4) ** 2) + (t > 30 ? 0.35 * Math.exp(-(t - 30) / 45) : 0);
  const noiseA = Array.from({ length: N + 1 }, () => (R() - 0.5) * 0.16), noiseB = Array.from({ length: N + 1 }, () => (R() - 0.5) * 0.16);
  const sky = (t) => { let s = 0.18 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.63); PK.forEach((p, i) => (s += AMP[i] * Math.exp(-0.5 * ((t - p) / 3.2) ** 2))); return s + (t > 30 ? 0.35 * Math.exp(-(t - 30) / 45) : 0); };
  const spike = (t, at) => at.reduce((s, p) => s + 0.95 * Math.exp(-0.5 * ((t - p) / 0.35) ** 2), 0);
  const A = (t) => sky(t) + noiseA[clamp(Math.round(t / DT), 0, N)] + spike(t, wheel), Braw = (t) => sky(t - delta) + noiseB[clamp(Math.round(t / DT), 0, N)] + spike(t, [bus + delta]);
  const gapsA = [], gapsB = []; if (rx < 0.999) { const G = (1 - rx) * 180 * 0.9; if (rx < 0.6) { gapsA.push([117, 137]); gapsB.push([117 + delta, 137 + delta]); const rest = Math.max(0, G - 20); gapsA.push([150, 150 + rest / 2]); gapsB.push([40 + delta, 40 + delta + rest / 2]); }
    else { gapsA.push([66, 66 + G * 0.55]); gapsB.push([138 + delta, 138 + delta + G * 0.45]); } }
  const inGap = (gs, t) => gs.some(([a, b]) => t >= a && t <= b);
  const z = { shift: P.gps ? delta : 0, aligned: !!P.gps, marks: [], flags: [], mode: 'peak', mistakes: 0, artMarked: 0, chips: [], placed: {}, pick: null, done: false, drag: null };
  const peakMissing = PK.filter((p) => inGap(gapsA, p) && inGap(gapsB, p + delta)).length;
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), board = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;'), chipRow = row(6), meter = el('div', `height:10px;background:${C.faint};border:1px solid ${C.line};`), meterF = el('div', `height:100%;width:0;background:${C.amber};`);
  meter.appendChild(meterF); const meterL = el('span', `font-size:12.5px;color:${C.soft};`);
  root.append(cs.cv, ctl, meterL, meter, log, kicker('Evidence · drag a card onto the hypothesis it decides'), chipRow, board);
  const bPeak = btn('Mark intensification', 'ghost', () => { z.mode = 'peak'; render(); }), bArt = btn('Flag spacecraft artefact', 'ghost', () => { z.mode = 'art'; render(); });
  const bClear = btn('Clear marks', 'ghost', () => { z.marks = []; earn(); render(); }), bPub = btn('Publish the analysis', 'primary', () => publish());
  const HY = [{ id: 'A', t: 'A · Each peak is a new solar-wind input', want: 'noinput', verb: 'ruled out' }, { id: 'B', t: 'B · A process near Earth repeats on its own', want: 'spacing', verb: 'supported' }, { id: 'C', t: 'C · The instrument made the peaks', want: 'both', verb: 'ruled out' }];
  const CH = { both: 'The same peaks on Sentinel A and B, at the same time', noinput: 'The model has one input at ~30 min, then a smooth recovery', spacing: 'Peaks ~48 min apart — not the model’s recovery', art: 'Narrow spikes on one spacecraft only' };
  const lanes = () => { const W = cs.W, H = cs.H, fs = cs.fs; return { x0: fs * 3.2, x1: W - fs, a: [fs * 2.4, H * 0.46], b: [H * 0.52, H - fs * 2.2] }; };
  const tx = (t) => { const L = lanes(); return L.x0 + (t / 180) * (L.x1 - L.x0); }, xt = (x) => { const L = lanes(); return ((x - L.x0) / (L.x1 - L.x0)) * 180; };
  const Bs = (t) => Braw(t + z.shift), gB = (t) => inGap(gapsB, t + z.shift);
  function corr() { let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0; for (let t = 0; t <= 180; t += 0.5) { if (inGap(gapsA, t) || gB(t)) continue; const a = A(t), b = Bs(t); n++; sa += a; sb += b; saa += a * a; sbb += b * b; sab += a * b; }
    if (n < 10) return 0; const c = sab / n - (sa / n) * (sb / n), va = saa / n - (sa / n) ** 2, vb = sbb / n - (sb / n) ** 2; return c / Math.sqrt(Math.max(1e-9, va * vb)); }
  function earn() { const ch = []; const got = z.marks.length, need = 3 - peakMissing; if (z.aligned && got >= Math.min(2, need)) ch.push('both'); if (got >= 2) ch.push('noinput', 'spacing'); if (z.flags.length) ch.push('art');
    z.chips = ch; for (const k in z.placed) if (!ch.includes(z.placed[k])) delete z.placed[k]; }
  function click(x, y) {
    if (z.done) return; const L = lanes(), lane = y < (L.a[1] + L.b[0]) / 2 ? 'A' : 'B', t = xt(x); if (t < 0 || t > 180) return;
    if (lane === 'A' ? inGap(gapsA, t) : gB(t)) return say(log, 'No data here — those packets never reached the ground. Nothing to analyse.', C.amber);
    const f = lane === 'A' ? A : Bs; let best = t, bv = -9; for (let s = Math.max(0, t - 3); s <= Math.min(180, t + 3); s += 0.1) { const v = f(s); if (v > bv && !(lane === 'A' ? inGap(gapsA, s) : gB(s))) { bv = v; best = s; } }
    const art = lane === 'A' ? wheel.find((w) => Math.abs(w - best) < 0.8) : Math.abs(bus + delta - z.shift - best) < 0.8 ? bus : null;
    if (z.mode === 'art') { if (art != null) { if (!z.flags.includes(lane + art)) z.flags.push(lane + art); say(log, lane === 'A' ? `Flagged: 0.3-minute spike every 12.5 min, only on A — the reaction wheels next to the magnetometer.` : 'Flagged: one spike on B only, when its transmitter keyed up — power-bus switching.', C.green); }
      else say(log, 'Nothing artificial there: it is broad and appears on both spacecraft.', C.soft); earn(); render(); return; }
    if (art != null) { z.mistakes++; z.artMarked++; say(log, 'That spike is a third of a minute wide and on one spacecraft only. The sky does not do that — check before calling it an intensification.', C.red); render(); return; }
    const tt = lane === 'A' ? best : best; const pk = PK.find((p) => Math.abs(p - tt) < 4.5);
    if (!pk) return say(log, 'Background wobble — the model expects that much.', C.soft);
    if (z.marks.includes(pk)) return say(log, 'Already marked.', C.soft);
    z.marks.push(pk); z.marks.sort((a, b) => a - b); say(log, `Intensification at ~${Math.round(pk)} min${z.marks.length > 1 ? ` · ${z.marks.slice(1).map((m, i) => Math.round(m - z.marks[i]) + ' min after the last').join(', ')}` : ''}.`, C.green); earn(); render();
  }
  cs.cv.addEventListener('pointerdown', (ev) => { const [x, y] = cs.pt(ev), L = lanes(); if (!z.aligned && y > L.b[0]) { z.drag = { x, s: z.shift, moved: false }; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } return; } click(x, y); });
  cs.cv.addEventListener('pointermove', (ev) => { if (!z.drag) return; const [x] = cs.pt(ev); const d = xt(x) - xt(z.drag.x); if (Math.abs(d) > 0.2) z.drag.moved = true; z.shift = clamp(z.drag.s - d, -2, 10); checkAlign(false); });
  cs.cv.addEventListener('pointerup', (ev) => { if (!z.drag) return; const [x, y] = cs.pt(ev), moved = z.drag.moved; z.drag = null; checkAlign(true); if (!moved) click(x, y); });
  function checkAlign(final) { const r = corr(); meterF.style.width = clamp(r, 0, 1) * 100 + '%'; meterF.style.background = r > 0.8 ? C.green : C.amber; meterL.textContent = z.aligned ? `Clocks aligned · B shifted ${f1(delta)} min · r = ${r.toFixed(2)}` : `Correlation A↔B r = ${r.toFixed(2)} · B shifted ${f1(z.shift)} min · drag the lower trace`;
    if (final && !z.aligned && Math.abs(z.shift - delta) <= 0.5) { z.aligned = true; z.shift = delta; say(log, `Locked: Sentinel B’s onboard clock ran ${f1(delta)} min behind. Now the two can be compared.`, C.green); earn(); render(); } }
  function placeChip(k, hid) { if (z.done) return; for (const h in z.placed) if (z.placed[h] === k) delete z.placed[h]; z.placed[hid] = k; z.pick = null; render(); }
  function render() {
    ctl.innerHTML = ''; bPeak.style.borderColor = z.mode === 'peak' ? C.coral : 'rgba(241,230,214,0.3)'; bArt.style.borderColor = z.mode === 'art' ? C.coral : 'rgba(241,230,214,0.3)'; ctl.append(bPeak, bArt, bClear, bPub);
    const need = HY.map((h) => h.want).filter((w) => z.chips.includes(w)), allPlaced = need.length === 3 && need.every((w) => Object.values(z.placed).includes(w));
    dis(bPub, z.done || !(allPlaced || (peakMissing && z.marks.length >= 2 && Object.keys(z.placed).length >= 2))); bPub.textContent = peakMissing ? 'Publish with what reached the ground' : 'Publish the analysis';
    chipRow.innerHTML = ''; z.chips.forEach((k) => { if (Object.values(z.placed).includes(k)) return; const c = el('button', `padding:8px 10px;min-height:40px;background:${z.pick === k ? 'rgba(255,122,107,0.16)' : C.faint};border:1px solid ${k === 'art' ? C.amber : C.teal};color:${C.cream};font:500 13px ${FONT};cursor:grab;text-align:left;max-width:280px;`, CH[k]); c.type = 'button';
      dragChip(c, CH[k], C.teal, (x, y, mv) => { if (mv) return; const hit = [...board.children].find((n) => inRect(n, x, y)); if (hit) placeChip(k, hit.dataset.h); }, () => { z.pick = z.pick === k ? null : k; render(); }); chipRow.appendChild(c); });
    if (!z.chips.length) chipRow.appendChild(el('span', `font-size:13px;color:${C.soft};`, 'Evidence appears as you align the clocks and mark the peaks.'));
    board.innerHTML = ''; HY.concat([{ id: 'N', t: 'Data notes · not about the sky', want: 'art', verb: 'filed' }]).forEach((h) => { const b = el('div', `display:flex;flex-direction:column;gap:6px;padding:10px;min-height:86px;border:1px solid ${z.done ? (z.placed[h.id] === h.want ? C.green : z.placed[h.id] ? C.red : C.line) : C.line};background:${C.faint};cursor:${z.pick ? 'pointer' : 'default'};`); b.dataset.h = h.id;
      b.append(el('span', `font:600 13.5px ${FONT};color:${C.ink};`, h.t)); const k = z.placed[h.id]; if (k) b.append(el('span', `font-size:12.5px;color:${C.teal};padding:4px 6px;border:1px solid rgba(154,224,192,0.4);`, CH[k]));
      if (z.done && z.placed[h.id] === h.want) b.append(el('span', `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${C.green};`, h.verb));
      b.addEventListener('click', () => { if (z.pick) placeChip(z.pick, h.id); }); board.appendChild(b); });
    checkAlign(false);
  }
  function publish() { if (z.done) return; z.done = true; const right = HY.filter((h) => z.placed[h.id] === h.want).length, found = z.marks.length, artOk = !wheel.length || z.flags.some((f) => f[0] === 'A');
    const score = found + (z.aligned ? 1 : 0) + right - z.mistakes - (artOk ? 0 : 1), g = score >= 6 && !z.artMarked && !peakMissing ? 'good' : score >= 4 ? 'ok' : 'bad';
    ctx.finish(g, Math.max(0, score) / 7, `${found} of 3 intensifications${peakMissing ? ' (one fell in a gap that never reached the ground)' : ''}, ${right} of 3 hypotheses decided correctly${z.artMarked ? ', a spacecraft spike mistaken for sky' : ''}${wheel.length && !artOk ? ', the wheel ripple not flagged' : ''}.`); render(); }
  function draw() {
    if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, L = lanes(); g.fillStyle = '#0d0914'; g.fillRect(0, 0, W, H);
    const lane = (y0, y1, f, gap, col, label, art) => { const mid = (y0 + y1) / 2 + (y1 - y0) * 0.2, k = (y1 - y0) / 3.6; g.strokeStyle = 'rgba(241,230,214,0.06)'; for (let t = 0; t <= 180; t += 30) { g.beginPath(); g.moveTo(tx(t), y0); g.lineTo(tx(t), y1); g.stroke(); }
      g.strokeStyle = 'rgba(168,156,174,0.7)'; g.setLineDash([4, 3]); g.beginPath(); for (let t = 0; t <= 180; t += 0.5) { const y = mid - model(t) * k; t ? g.lineTo(tx(t), y) : g.moveTo(tx(t), y); } g.stroke(); g.setLineDash([]);
      g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); let pen = false; for (let t = 0; t <= 180; t += DT) { if (gap(t)) { pen = false; continue; } const y = mid - f(t) * k; pen ? g.lineTo(tx(t), y) : g.moveTo(tx(t), y); pen = true; } g.stroke(); g.lineWidth = 1;
      for (let t = 0; t <= 180; t += 0.5) if (gap(t)) { g.fillStyle = 'rgba(194,52,64,0.13)'; g.fillRect(tx(t), y0, tx(0.5) - tx(0) + 0.5, y1 - y0); }
      T(g, label, L.x0, y0 - fs * 0.3, col, 'left'); z.flags.filter((x) => x[0] === art).forEach((x) => { const t = +x.slice(1) - (art === 'B' ? z.shift - delta : 0); T(g, '×', tx(art === 'B' ? t + delta - z.shift : t), y0 + fs, C.amber, 'center'); }); };
    lane(L.a[0], L.a[1], A, (t) => inGap(gapsA, t), C.teal, 'SENTINEL A · magnetometer', 'A'); lane(L.b[0], L.b[1], Bs, gB, C.blue, `SENTINEL B · magnetometer${z.aligned ? '' : ' · clock offset unknown'}`, 'B');
    z.marks.forEach((m) => { g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath(); g.moveTo(tx(m), L.a[0]); g.lineTo(tx(m), L.b[1]); g.stroke(); g.lineWidth = 1; T(g, Math.round(m) + ' min', tx(m) + 4, L.a[0] + fs * 0.9, C.amber); });
    g.fillStyle = C.mute; for (let t = 0; t <= 180; t += 30) T(g, t + ' min', tx(t), H - fs * 0.6, C.mute, 'center', `500 ${Math.round(fs * 0.85)}px ${FONT}`);
    T(g, 'dashed: model · solid: received · red band: never reached the ground', W - fs, fs * 1.2, C.soft, 'right', `500 ${Math.round(fs * 0.85)}px ${FONT}`);
  }
  render(); say(log, `Kiran: ${rx < 0.999 ? `Only ${Math.round(rx * 100)} % of the event packets reached the ground — the red bands are gone for good. ` : ''}${P.gps ? 'GPS time-tags: the clocks already agree. ' : 'First, line up B’s clock with A. '}Then the peaks.`, C.soft);
  const stop = loop(() => draw()); return { update(c) { ctx = c; }, destroy() { stop(); } };
}

// ======================================================================== BURN (Leila · Helios)
function burnGame(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 41), isp = P.isp || 220, wet = P.wet || 450, G0 = 9.80665, CRUISE = 40, TOL = 4;
  const ang = R() * 6.28, base = 3.8 + R() * 1.2, K = (s) => 1 + 5 * s ** 1.5, sig = (s) => 1.2 * (1 - s) + 0.2;
  const z = { s: 0, node: null, burn: [0, 0], total: 0, resid: [Math.cos(ang) * base, Math.sin(ang) * base], noise: [R() - 0.5, R() - 0.5], burns: 0, done: false, run: false, fx: 0, used: 0, drag: null };
  const needAt = (s) => [z.resid[0] * K(s), z.resid[1] * K(s)], estAt = (s) => { const n = needAt(s), q = sig(s) * 0.8; return [n[0] + z.noise[0] * q, n[1] + z.noise[1] * q]; };
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), stats = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;');
  const sNeed = statBox('Tracking solution at the node'), sPlan = statBox('Planned burn'), sTot = statBox('Δv spent'), sFuel = statBox('Propellant used'); stats.append(sNeed.box, sPlan.box, sTot.box, sFuel.box);
  root.append(cs.cv, ctl, log, stats);
  const bRun = btn('Start the cruise clock', 'primary', () => { z.run = true; render(); }), bNow = btn('Put the node at the spacecraft', 'ghost', () => { z.node = Math.min(0.97, z.s + 0.02); render(); }), bClr = btn('Clear node', 'ghost', () => { z.node = null; z.burn = [0, 0]; render(); });
  const geo = () => ({ ex: cs.W * 0.1, ey: cs.H * 0.62, lx: cs.W * 0.86, ly: cs.H * 0.44, sc: Math.min(cs.W, cs.H) * 0.012 });
  const arc = (s) => { const G = geo(); return [lerp(G.ex, G.lx, s), lerp(G.ey, G.ly, s) - Math.sin(s * Math.PI) * cs.H * 0.22]; };
  function execute() { const n = needAt(z.node), b = z.burn, m = Math.hypot(b[0], b[1]), mass = wet - z.used; z.total += m; z.used += mass * (1 - Math.exp(-m / (isp * G0)));
    const res = [n[0] - b[0], n[1] - b[1]]; z.resid = res.map((v) => v / K(z.node)); z.noise = [R() - 0.5, R() - 0.5]; z.burns++; z.fx = performance.now(); z.node = null; z.burn = [0, 0];
    const fin = Math.hypot(...needAt(1)); say(log, `Burn ${z.burns}: ${f1(m)} m/s. Left alone, Helios would now arrive ${f1(fin)} m/s off ${fin <= TOL ? '— inside the L1 insertion window.' : '— outside the window. Plan a trim.'}`, fin <= TOL ? C.green : C.amber); render(); }
  function finish() { if (z.done) return; z.done = true; const fin = Math.hypot(...needAt(1)); let total = z.total, g; if (fin > TOL) { total += 25; g = 'bad'; } else g = total <= 10 ? 'good' : total <= 30 ? 'ok' : 'bad';
    ctx.finish(g, total, `${f1(total)} m/s in total${fin > TOL ? ' (including a 25 m/s emergency trim on arrival)' : ''} · ${f1(z.used)} kg of propellant · arrival error ${f1(fin)} m/s.`); render(); }
  function render() { const key = (z.done ? 'd' : '') + (z.run ? 'r' : ''); if (key !== z.ctlKey) { z.ctlKey = key; ctl.innerHTML = ''; if (!z.done) { if (!z.run) ctl.append(bRun); ctl.append(bNow, bClr); } } const e = z.node != null ? estAt(z.node) : null;
    sNeed.v.textContent = e ? `${f1(Math.hypot(e[0], e[1]))} ± ${f1(sig(z.node) * 0.4)} m/s` : 'Place a node'; sPlan.v.textContent = f1(Math.hypot(z.burn[0], z.burn[1])) + ' m/s'; sTot.v.textContent = f1(z.total) + ' m/s'; sFuel.v.textContent = f1(z.used) + ' kg'; }
  cs.cv.addEventListener('pointerdown', (ev) => { if (z.done) return; const [x, y] = cs.pt(ev), G = geo();
    if (z.node != null) { const [nx, ny] = arc(z.node); if (Math.hypot(x - nx, y - ny) < cs.fs * 7) { z.drag = true; z.burn = [(x - nx) / G.sc, (y - ny) / G.sc]; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } render(); return; } }
    let best = null, bd = cs.fs * 2.5; for (let s = z.s + 0.02; s <= 0.97; s += 0.01) { const [ax, ay] = arc(s), d = Math.hypot(ax - x, ay - y); if (d < bd) { bd = d; best = s; } }
    if (best != null) { z.node = best; z.burn = [0, 0]; say(log, `Node at ${Math.round(best * 100)} % of the cruise. Drag from the node to set the burn onto the dashed tracking solution.`, C.soft); render(); } });
  cs.cv.addEventListener('pointermove', (ev) => { if (!z.drag || z.node == null) return; const [x, y] = cs.pt(ev), G = geo(), [nx, ny] = arc(z.node); z.burn = [(x - nx) / G.sc, (y - ny) / G.sc]; const m = Math.hypot(z.burn[0], z.burn[1]); if (m > 40) z.burn = z.burn.map((v) => (v * 40) / m); render(); });
  const up = () => { z.drag = false; }; cs.cv.addEventListener('pointerup', up); cs.cv.addEventListener('pointercancel', up);
  const unkey = keys(root, (ev) => { if (ev.type !== 'keydown' || z.node == null || z.done) return; const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[ev.key]; if (d) { ev.preventDefault(); z.burn = [z.burn[0] + d[0], z.burn[1] + d[1]]; render(); } });
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, G = geo(); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(W * 1.05, H * 0.4, 5, W * 1.05, H * 0.4, W * 0.35); sun.addColorStop(0, 'rgba(255,210,122,0.55)'); sun.addColorStop(1, 'rgba(255,210,122,0)'); g.fillStyle = sun; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(241,230,214,0.4)'; for (let i = 0; i < 50; i++) g.fillRect((i * 173) % W, (i * 97) % H, 1, 1);
    g.fillStyle = '#2b5a93'; g.beginPath(); g.arc(G.ex, G.ey, fs * 1.6, 0, 7); g.fill(); T(g, 'EARTH', G.ex, G.ey + fs * 3, C.soft, 'center');
    g.strokeStyle = 'rgba(127,214,164,0.6)'; g.setLineDash([3, 3]); g.beginPath(); g.arc(G.lx, G.ly, TOL * G.sc * 0.6 + fs, 0, 7); g.stroke(); g.setLineDash([]); T(g, 'L1 · insertion window', G.lx, G.ly - fs * 3, C.green, 'center');
    g.strokeStyle = 'rgba(241,230,214,0.25)'; g.beginPath(); for (let s = 0; s <= 1.001; s += 0.01) { const [x, y] = arc(s); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    const miss = needAt(1), [ax, ay] = arc(1), [cx, cy] = arc(z.s), px = ax + miss[0] * G.sc * 0.6, py = ay + miss[1] * G.sc * 0.6, out = Math.hypot(...miss) > TOL;
    g.strokeStyle = out ? C.red : C.green; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo((cx + px) / 2, (cy + py) / 2 - fs * 2, px, py); g.stroke(); g.setLineDash([]);
    g.fillStyle = out ? C.red : C.green; g.beginPath(); g.arc(px, py, fs * 0.35, 0, 7); g.fill(); T(g, 'predicted arrival', px + fs * 0.6, py + fs * 1.2, out ? C.red : C.green, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`;
    if (z.node != null) { const [nx, ny] = arc(z.node), e = estAt(z.node), q = sig(z.node) * 0.4;
      g.strokeStyle = 'rgba(154,224,192,0.7)'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + e[0] * G.sc, ny + e[1] * G.sc); g.stroke(); g.setLineDash([]); g.beginPath(); g.arc(nx + e[0] * G.sc, ny + e[1] * G.sc, Math.max(3, q * G.sc), 0, 7); g.stroke();
      g.strokeStyle = C.amber; g.lineWidth = 2.5; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + z.burn[0] * G.sc, ny + z.burn[1] * G.sc); g.stroke(); g.lineWidth = 1; g.fillStyle = C.amber; g.beginPath(); g.arc(nx + z.burn[0] * G.sc, ny + z.burn[1] * G.sc, fs * 0.4, 0, 7); g.fill();
      g.save(); g.translate(nx, ny); g.rotate(Math.PI / 4); g.strokeStyle = C.coral; g.strokeRect(-fs * 0.45, -fs * 0.45, fs * 0.9, fs * 0.9); g.restore(); }
    g.fillStyle = C.ink; g.beginPath(); g.arc(cx, cy, fs * 0.4, 0, 7); g.fill(); if (z.fx && now - z.fx < 700) { g.strokeStyle = C.amber; g.beginPath(); g.arc(cx, cy, fs * (0.6 + (now - z.fx) / 120), 0, 7); g.stroke(); }
    T(g, `HELIOS · cruise ${Math.round(z.s * 100)} %${z.run ? '' : ' · clock stopped'}`, fs, fs * 1.6, C.ink); T(g, 'Amber: your burn · dashed teal: tracking solution ± uncertainty', fs, fs * 3, C.soft, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); }
  render(); say(log, `Leila: Δv margin ${P.margin ?? '—'} m/s. Click the path ahead of Helios to drop a node, then drag the burn arrow (or use the arrow keys). When Helios reaches the node, the burn fires.`, C.soft);
  const stop = loop((dt, now) => { if (z.run && !z.done) { z.s = Math.min(1, z.s + dt / CRUISE); if (z.node != null && z.s >= z.node) { if (Math.hypot(z.burn[0], z.burn[1]) > 0.05) execute(); else { z.node = null; say(log, 'The node passed with no burn planned.', C.amber); render(); } } if (z.s >= 1) finish(); if ((z.rr = (z.rr || 0) + dt) > 0.3) { z.rr = 0; render(); } } draw(now); });
  return { update(c) { ctx = c; }, destroy() { stop(); unkey(); } };
}

// ======================================================================== LAG (Kiran · Helios)
function lagGame(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 51), TT = 360, IF = 170, V1 = 420, V2 = 620, L1 = 1.5e6 / V1 / 60, L2 = 1.5e6 / V2 / 60, ok = P.lagOk !== false;
  const feats = Array.from({ length: 16 }, () => ({ t: R() * (TT - 20), a: 0.5 + R() * 0.8, w: 2 + R() * 4 })), MYS = [90, 138, 186, 234, 282, 330];
  const U = (t) => feats.reduce((s, f) => s + f.a * Math.exp(-0.5 * ((t - f.t) / f.w) ** 2), 0) + 0.1 * Math.sin(t * 0.37);
  const nz = Array.from({ length: TT * 2 + 1 }, () => (R() - 0.5) * 0.08);
  const arrive = (ta) => { let v = 0; if (ta - L1 < IF && ta - L1 >= 0) v = Math.max(v, U(ta - L1)); if (ta - L2 >= IF) v = Math.max(v, U(ta - L2)); return v; };
  const EA = (t) => arrive(t) + MYS.reduce((s, m) => s + 0.9 * Math.exp(-0.5 * ((t - m) / 2.5) ** 2), 0) + nz[clamp(Math.round(t * 2), 0, TT * 2)];
  const z = { s1: 20, s2: 20, lock1: false, lock2: false, found: [], miss: 0, phase: 'align', done: false, drag: null };
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), m1 = el('span', `font-size:12.5px;color:${C.soft};`), m2 = el('span', `font-size:12.5px;color:${C.soft};`);
  root.append(cs.cv, m1, m2, ctl, log);
  const bDone = btn('These delays are my best fit', 'ghost', () => { z.phase = 'find'; say(log, 'Now click each peak near Earth that has no upstream feature to explain it.', C.soft); render(); }), bPub = btn('Publish the comparison', 'primary', () => publish());
  const shiftOf = (tp) => (ok ? (tp < IF ? z.s1 : z.s2) : z.s1);
  function corr(a, b, s) { let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0; for (let tp = a; tp < b; tp += 1) { const x = U(tp), y = EA(tp + s); n++; sa += x; sb += y; saa += x * x; sbb += y * y; sab += x * y; } const c = sab / n - (sa / n) * (sb / n); return c / Math.sqrt(Math.max(1e-9, (saa / n - (sa / n) ** 2) * (sbb / n - (sb / n) ** 2))); }
  function render() { ctl.innerHTML = ''; if (z.phase === 'align') ctl.append(bDone); else ctl.append(bPub); dis(bPub, z.done);
    const r1 = corr(0, ok ? IF : TT - 70, z.s1), r2 = ok ? corr(IF, TT - 45, z.s2) : 0; m1.textContent = `${ok ? 'Slow stream (before the interface)' : 'Whole record (no flow-speed data)'}: delay ${Math.round(z.s1)} min · r = ${r1.toFixed(2)}${z.lock1 ? ' · locked' : ''}`;
    m2.textContent = ok ? `Fast stream (after): delay ${Math.round(z.s2)} min · r = ${r2.toFixed(2)}${z.lock2 ? ' · locked' : ''}` : 'Without a plasma analyzer, Helios cannot measure the wind speed: one delay must fit both streams.'; }
  function tryLock() { if (Math.abs(z.s1 - L1) <= 1.5 && !z.lock1) { z.lock1 = true; z.s1 = L1; say(log, `Slow stream locked: ${Math.round(L1)} min at ${V1} km/s.`, C.green); } if (ok && Math.abs(z.s2 - L2) <= 1.5 && !z.lock2) { z.lock2 = true; z.s2 = L2; say(log, `Fast stream locked: ${Math.round(L2)} min at ${V2} km/s.`, C.green); }
    if (z.lock1 && (z.lock2 || !ok) && z.phase === 'align') { z.phase = 'find'; say(log, 'Aligned. Now click each peak near Earth that has no upstream feature to explain it.', C.soft); } render(); }
  const lay = () => { const W = cs.W, H = cs.H, fs = cs.fs; return { x0: fs, x1: W - fs, u: [fs * 2.4, H * 0.46], e: [H * 0.54, H - fs * 2] }; };
  const tx = (t) => { const L = lay(); return L.x0 + (t / TT) * (L.x1 - L.x0); }, xt = (x) => { const L = lay(); return ((x - L.x0) / (L.x1 - L.x0)) * TT; };
  cs.cv.addEventListener('pointerdown', (ev) => { if (z.done) return; const [x, y] = cs.pt(ev), L = lay();
    if (z.phase === 'align' && y < L.u[1] + cs.fs) { const t = xt(x), seg = ok && t - z.s2 >= IF ? 2 : 1; if ((seg === 1 && z.lock1) || (seg === 2 && z.lock2)) return; z.drag = { x, seg, s: seg === 1 ? z.s1 : z.s2 }; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } return; }
    if (z.phase === 'find' && y > L.e[0] - cs.fs) { const t = xt(x), m = MYS.find((q) => Math.abs(q - t) < 5); if (m != null) { if (!z.found.includes(m)) { z.found.push(m); say(log, `Peak at ${m} min: nothing upstream lines up with it. (${z.found.length} found)`, C.green); } }
      else { z.miss++; say(log, 'That one has an upstream counterpart — it is the solar wind arriving.', C.amber); } render(); } });
  cs.cv.addEventListener('pointermove', (ev) => { if (!z.drag) return; const [x] = cs.pt(ev), d = xt(x) - xt(z.drag.x), v = clamp(z.drag.s + d, 0, 90); if (z.drag.seg === 1) z.s1 = v; else z.s2 = v; render(); });
  cs.cv.addEventListener('pointerup', () => { if (z.drag) { z.drag = null; tryLock(); } });
  function publish() { if (z.done) return; z.done = true; const n = z.found.length, aligned = z.lock1 && (z.lock2 || !ok), g = ok && aligned && n >= 3 && z.miss <= 1 ? 'good' : n >= 2 || aligned ? 'ok' : 'bad';
    ctx.finish(g, n, `${aligned ? (ok ? 'Both streams aligned' : 'One fixed delay used') : 'Alignment left loose'} · ${n} unexplained peaks near Earth${z.miss ? ` · ${z.miss} misread` : ''}.`); render(); }
  function draw() { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, L = lay(); g.fillStyle = '#0d0914'; g.fillRect(0, 0, W, H);
    const tr = (y0, y1, f, col, shiftFn) => { const mid = y1 - (y1 - y0) * 0.15, k = (y1 - y0) / 2.6; g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); let pen = false; for (let t = 0; t <= TT; t += 0.5) { const x = shiftFn ? t + shiftFn(t) : t; if (x > TT) { pen = false; continue; } const y = mid - f(t) * k; pen ? g.lineTo(tx(x), y) : g.moveTo(tx(x), y); pen = true; } g.stroke(); g.lineWidth = 1; };
    g.strokeStyle = 'rgba(241,230,214,0.06)'; for (let t = 0; t <= TT; t += 30) { g.beginPath(); g.moveTo(tx(t), L.u[0]); g.lineTo(tx(t), L.e[1]); g.stroke(); }
    tr(L.u[0], L.u[1], U, C.amber, shiftOf); tr(L.e[0], L.e[1], EA, C.teal, null);
    if (ok) { const xi = tx(IF + z.s2); g.strokeStyle = C.pink; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(xi, L.u[0]); g.lineTo(xi, L.u[1]); g.stroke(); g.setLineDash([]); T(g, `stream interface · ${V1} → ${V2} km/s`, xi + 4, L.u[0] + fs, C.pink, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); g.font = `500 ${fs}px ${FONT}`; }
    T(g, `HELIOS AT L1 · shifted by the travel time${z.phase === 'align' ? ' · drag to align' : ''}`, L.x0, L.u[0] - fs * 0.4, C.amber); T(g, 'NEAR EARTH · Sentinel + ground stations', L.x0, L.e[0] - fs * 0.4, C.teal);
    z.found.forEach((m) => { g.strokeStyle = C.coral; g.lineWidth = 2; g.beginPath(); g.arc(tx(m), L.e[0] + (L.e[1] - L.e[0]) * 0.35, fs * 0.9, 0, 7); g.stroke(); g.lineWidth = 1; });
    for (let t = 0; t <= TT; t += 60) T(g, t + ' min', tx(t), H - fs * 0.5, C.mute, 'center'); }
  render(); say(log, 'Kiran: the wind takes about an hour to get here — but not always the same hour.', C.soft);
  const stop = loop(() => draw()); return { update(c) { ctx = c; }, destroy() { stop(); } };
}

// ======================================================================== FAULTS (Mateo · Sentinel Ch. 4B)
function faults(root, ctx) {
  const P = ctx.P || {}, kgA = P.kgA ?? 2.6, wA = P.wA ?? 10;
  const PARTS = [
    { id: 'ax7', slot: 'board', name: 'Aegis AX-7', spec: '2 kg · 8 W · single string', kg: 2, W: 8, gone: true },
    { id: 'red', slot: 'board', name: 'Redundant pair, cross-strapped', spec: '2.5 kg · 10 W · hot backup built in', kg: 2.5, W: 10, hot: true },
    { id: 'rt', slot: 'board', name: 'Rad-tolerant board (university)', spec: '1.4 kg · 6 W · memory scrubbing built in', kg: 1.4, W: 6, edac: true },
    { id: 'cots', slot: 'board', name: 'Commercial board', spec: '0.8 kg · 5 W · fast, no protection', kg: 0.8, W: 5 },
    { id: 'cold', slot: 'backup', name: 'Cold-spare board', spec: '0.9 kg · 0 W until switched on', kg: 0.9, W: 0 },
    { id: 'wd', slot: 'wd', name: 'Watchdog timer', spec: '0.1 kg · 0.3 W · resets a hung board', kg: 0.1, W: 0.3 },
    { id: 'edac', slot: 'mem', name: 'EDAC memory', spec: '0.2 kg · 1 W · corrects bit flips', kg: 0.2, W: 1 },
    { id: 'lim', slot: 'pwr', name: 'Latch-up current limiter', spec: '0.3 kg · 0.2 W · cuts power on a short', kg: 0.3, W: 0.2 },
  ];
  const SLOTS = [['board', 'Primary flight computer'], ['backup', 'Backup computer'], ['wd', 'Watchdog'], ['mem', 'Memory protection'], ['pwr', 'Power protection']];
  const TESTS = [['seu', 'Bit flip (single-event upset)'], ['latch', 'Latch-up (current spike)'], ['dead', 'Primary board dies'], ['ecl', 'Eclipse brownout'], ['mass', 'Mass in the slot']];
  const part = (id) => PARTS.find((p) => p.id === id), z = { fit: {}, runs: 0, res: null, anim: null, busy: false, done: false, pick: null };
  const tot = () => Object.values(z.fit).map(part).reduce((a, p) => ({ kg: a.kg + p.kg, W: a.W + p.W }), { kg: 0, W: 0 });
  function judge(id) { const b = part(z.fit.board), f = z.fit, t = tot(); if (!b) return { s: 'fail', gap: 99, text: 'No flight computer fitted.' };
    if (id === 'seu') return b.edac || f.mem ? { s: 'pass', gap: 0, text: 'The flipped bit is corrected in place. No gap.' } : f.wd ? { s: 'check', gap: 1, text: 'The board hangs; the watchdog resets it. One cycle lost, time-tags jump.' } : { s: 'fail', gap: 99, text: 'The board hangs. Housekeeping stops until someone commands a reset from the ground.' };
    if (id === 'latch') return !f.pwr ? { s: 'fail', gap: 99, text: 'Current spikes to 3 A with nothing to cut it. The board burns out.' } : b.hot || f.wd ? { s: 'pass', gap: 1, text: 'The limiter trips, the board power-cycles, packets resume.' } : { s: 'check', gap: 6, text: 'The limiter trips — and the board stays off until the next ground pass.' };
    if (id === 'dead') return b.hot ? { s: 'pass', gap: 0.5, text: 'Cross-strap: the twin takes over within one cycle.' } : f.backup && f.wd ? { s: 'pass', gap: 3, text: 'The watchdog powers up the cold spare. Three cycles lost; the recorder keeps everything.' } : f.backup ? { s: 'fail', gap: 99, text: 'The spare is on board — but nothing switches it on.' } : { s: 'fail', gap: 99, text: 'Single string. The mission ends here.' };
    if (id === 'ecl') return t.W <= wA + 1e-9 ? { s: 'pass', gap: 0, text: `Avionics draw ${f1(t.W)} W of the ${f1(wA)} W the battery can carry through eclipse.` } : { s: 'fail', gap: 4, text: `${f1(t.W)} W — over the ${f1(wA)} W eclipse budget. The battery browns out in shadow.` };
    return t.kg <= kgA + 1e-9 ? { s: 'pass', gap: 0, text: `${f1(t.kg)} kg of the ${f1(kgA)} kg left in the launch slot.` } : { s: 'fail', gap: 0, text: `${f1(t.kg)} kg — ${f1(t.kg - kgA)} kg over what the launch slot has left.` }; }
  const wrap = el('div', 'display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;'), L = el('div', 'flex:3 1 340px;min-width:0;display:flex;flex-direction:column;gap:10px;'), Rt = el('div', 'flex:2 1 230px;min-width:0;display:flex;flex-direction:column;gap:6px;');
  const cs = stage(L, 5, 2), board = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;'), ctl = row(8), log = logLine(), list = el('div', 'display:flex;flex-direction:column;gap:4px;');
  const sKg = statBox('Mass'), sW = statBox('Power in eclipse'), stats = el('div', 'display:grid;grid-template-columns:1fr 1fr;gap:6px;'); stats.append(sKg.box, sW.box);
  const tray = el('div', 'display:flex;flex-direction:column;gap:6px;');
  L.append(cs.cv, board, ctl, log, list); Rt.append(kicker('Replacement parts · drag onto the board, or click'), tray, stats); wrap.append(L, Rt); root.append(wrap);
  const bRun = btn('Run fault injection', 'primary', () => run()), bSign = btn('Sign off the architecture', 'ghost', () => sign());
  function fitP(id) { if (z.done || z.busy) return; const p = part(id); if (p.gone) return say(log, 'Aegis pulled every AX-7. There are none to fit.', C.red); z.fit[p.slot] = id; z.res = null; z.pick = null; render(); }
  function render() { board.innerHTML = ''; for (const [sid, lab] of SLOTS) { const p = part(z.fit[sid]), hotB = sid === 'backup' && !p && part(z.fit.board) && part(z.fit.board).hot;
      const d = el('div', `display:flex;flex-direction:column;gap:3px;padding:8px 10px;min-height:58px;border:1px ${p ? 'solid' : 'dashed'} ${p ? C.amber : z.pick && part(z.pick).slot === sid ? C.coral : 'rgba(241,230,214,0.25)'};background:${p ? 'rgba(255,210,122,0.07)' : C.faint};cursor:pointer;`); d.dataset.slot = sid;
      d.append(el('span', `font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:${C.mute};`, lab), el('span', `font:600 13px ${FONT};color:${p ? C.ink : C.soft};`, p ? p.name : hotB ? 'Built into the pair' : 'Empty'));
      d.addEventListener('click', () => { if (z.pick && part(z.pick).slot === sid) fitP(z.pick); else if (p && !z.busy && !z.done) { delete z.fit[sid]; z.res = null; render(); } }); board.appendChild(d); }
    tray.innerHTML = ''; for (const p of PARTS) { const on = Object.values(z.fit).includes(p.id), c = el('button', `text-align:left;padding:8px 10px;min-height:44px;background:${on ? 'rgba(127,214,164,0.1)' : z.pick === p.id ? 'rgba(255,122,107,0.14)' : C.faint};border:1px solid ${on ? C.green : p.gone ? 'rgba(194,52,64,0.5)' : C.line};color:${C.cream};display:flex;flex-direction:column;gap:2px;font-family:${FONT};opacity:${p.gone ? 0.5 : 1};cursor:${p.gone ? 'not-allowed' : 'grab'};`);
      c.type = 'button'; c.append(el('span', 'font-size:13px;font-weight:600;', p.name), el('span', `font-size:11.5px;color:${C.soft};`, p.spec), el('span', `font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${p.gone ? C.red : on ? C.green : C.mute};`, p.gone ? 'Supply cancelled' : on ? 'Fitted' : SLOTS.find((x) => x[0] === p.slot)[1]));
      if (!p.gone && !on) dragChip(c, p.name, C.amber, (x, y, mv) => { if (mv) return; const hit = [...board.children].find((n) => inRect(n, x, y)); if (hit) { if (hit.dataset.slot === p.slot) fitP(p.id); else say(log, `That bay takes a ${SLOTS.find((q) => q[0] === hit.dataset.slot)[1].toLowerCase()}.`, C.amber); } }, () => fitP(p.id));
      tray.appendChild(c); }
    const t = tot(); sKg.v.textContent = `${f1(t.kg)} / ${f1(kgA)} kg`; sKg.v.style.color = t.kg > kgA ? C.red : C.ink; sW.v.textContent = `${f1(t.W)} / ${f1(wA)} W`; sW.v.style.color = t.W > wA ? C.red : C.ink;
    ctl.innerHTML = ''; if (!z.done) ctl.append(bRun, bSign); dis(bRun, z.busy || !z.fit.board); dis(bSign, z.busy || !z.res);
    list.innerHTML = ''; (z.res || []).forEach((r) => { const ln = el('div', `display:flex;gap:10px;align-items:baseline;font-size:13.5px;`), col = { pass: C.green, check: C.amber, fail: C.red }[r.s];
      ln.append(el('span', `flex:none;width:48px;font:600 11px ${FONT};letter-spacing:.12em;color:${col};`, r.s.toUpperCase()), el('span', `flex:none;width:170px;color:${C.soft};`, r.name), el('span', 'flex:1;min-width:0;text-wrap:pretty;', r.text)); list.appendChild(ln); }); }
  async function run() { if (z.busy) return; z.busy = true; z.runs++; z.res = []; render();
    for (const [id, name] of TESTS) { const j = judge(id); z.anim = { id, name, j, t0: performance.now() }; await wait(1700); z.res.push({ name, ...j }); render(); }
    z.anim = null; z.busy = false; const fails = z.res.filter((r) => r.s === 'fail').length; say(log, fails ? `${fails} test${fails > 1 ? 's' : ''} failed. Change the architecture and run again — the date holds as long as you keep testing.` : 'Every fault recovers. Sign it off.', fails ? C.amber : C.green); render(); }
  function sign() { if (z.done || !z.res) return; z.done = true; const fails = z.res.filter((r) => r.s === 'fail').length, checks = z.res.filter((r) => r.s === 'check').length, arch = Object.values(z.fit).map((id) => part(id).name).join(' + ');
    const g = fails ? 'bad' : checks || z.runs > 3 ? 'ok' : 'good'; ctx.finish(g, 5 - fails, `${arch}: ${5 - fails} of 5 fault tests recovered after ${z.runs} run${z.runs > 1 ? 's' : ''}.`); render(); }
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, A = z.anim; g.fillStyle = '#0d0914'; g.fillRect(0, 0, W, H);
    const x0 = fs * 1.2, x1 = W - fs, yP = H * 0.42, yI = H * 0.8, k = A ? clamp((now - A.t0) / 1500, 0, 1) : 0, N = 24, fault = 0.35;
    T(g, A ? 'TEST CHAMBER · ' + A.name.toUpperCase() : 'TEST CHAMBER · housekeeping packets and board current', x0, fs * 1.4, A ? C.amber : C.soft);
    g.strokeStyle = C.line; g.beginPath(); g.moveTo(x0, yP); g.lineTo(x1, yP); g.moveTo(x0, yI); g.lineTo(x1, yI); g.stroke();
    const gap = A ? A.j.gap : 0, lost = (i) => { const tt = i / N; return A && tt >= fault && tt < fault + gap / N; };
    for (let i = 0; i < N; i++) { const tt = i / N; if (A && tt > k) break; const x = lerp(x0, x1, tt + 0.5 / N); g.fillStyle = lost(i) ? 'rgba(194,52,64,0.35)' : C.teal; g.fillRect(x - 3, yP - fs * 0.9, 6, fs * 0.9); }
    g.strokeStyle = C.amber; g.beginPath(); for (let i = 0; i <= 200; i++) { const tt = i / 200; if (A && tt > k) break; let c = 0.3 + 0.03 * Math.sin(i * 1.7); if (A) { if (A.id === 'latch' && tt > fault) c = tt < fault + 0.03 ? 1 : A.j.s === 'fail' ? 0 : tt < fault + gap / N ? 0 : 0.3; if (A.id === 'dead' && tt > fault) c = tt < fault + gap / N ? 0 : 0.3; if (A.id === 'ecl' && A.j.s === 'fail' && tt > 0.5) c = 0.3 * Math.max(0, 1 - (tt - 0.5) * 4); }
      const y = yI - c * H * 0.25; i ? g.lineTo(lerp(x0, x1, tt), y) : g.moveTo(lerp(x0, x1, tt), y); } g.stroke();
    if (A && k > fault && ['seu', 'latch', 'dead'].includes(A.id)) { const x = lerp(x0, x1, fault), a = clamp(1 - (k - fault) * 3, 0, 1); g.fillStyle = `rgba(255,122,107,${a})`; g.beginPath(); g.arc(x, (yP + yI) / 2, fs * (1 + (k - fault) * 6), 0, 7); g.fill(); T(g, 'FAULT', x + fs, (yP + yI) / 2, C.coral); }
    T(g, 'packets', x0, yP + fs * 1.2, C.mute); T(g, 'board current', x0, yI + fs * 1.2, C.mute);
    if (A && k >= 1) T(g, A.j.s.toUpperCase(), x1, fs * 1.4, { pass: C.green, check: C.amber, fail: C.red }[A.j.s], 'right', `600 ${Math.round(fs * 1.3)}px ${PIX}`); }
  render(); say(log, `Mateo: the AX-7 is gone. Build a computer architecture that survives its faults — within ${f1(kgA)} kg and ${f1(wA)} W.`, C.soft);
  const stop = loop((dt, now) => draw(now)); return { update(c) { ctx = c; }, destroy() { stop(); } };
}

// ======================================================================== POLL (Naomi · Bridge Ch. 21)
function poll(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 61), WIN = 90;
  const POOL = [
    { st: 'Weather', who: 'Weather officer', call: 'Upper-level winds 41 m/s, limit 45. GO.', data: 'Balloon from twenty minutes ago: a jet-stream core at 12 km, 52 m/s, drifting toward the pad.', real: true, fix: 'Hold for the next balloon. The core passes south.' },
    { st: 'Range', who: 'Range safety', call: 'Range is green. GO.', data: 'Radar: a fishing boat has entered the downrange hazard area, 14 km out.', real: true, fix: 'The coast guard escorts it out.' },
    { st: 'Life support', who: 'Life support', call: 'Cabin CO₂ 2 mmHg. Scrubber bed B a little warm. GO.', data: 'Bed B is 9 °C above bed A — and rising.', real: true, fix: 'Switch to bed A; the pad crew vents bed B.' },
    { st: 'Network', who: 'Ground network', call: 'Kiruna is down for maintenance; Aegis covers the ascent. GO.', data: 'Aegis has not confirmed the ascent track. No backup station is scheduled.', real: true, fix: 'The university dish takes Kiruna’s slot.' },
    { st: 'Pad', who: 'Pad leader', call: 'Light rain at the pad. GO.', data: 'Rain clears in ten minutes. No lightning within 40 km.', real: false },
    { st: 'Payload', who: 'Kiran', call: 'Probe C battery at 92 %. GO.', data: 'Limit is 85 %. Charging continues until T−2 minutes.', real: false },
  ];
  const pick = POOL.map((p) => ({ ...p, r: R() })).sort((a, b) => a.r - b.r), reals = pick.filter((p) => p.real).slice(0, 2), fines = pick.filter((p) => !p.real).slice(0, 1);
  const items = [{ st: 'Flight', who: 'Leila', call: 'Guidance aligned. Abort corridors loaded. GO.', data: 'Every abort mode verified against today’s trajectory.', real: false },
    { st: 'Propulsion', who: 'Mateo', call: 'Oxidiser tank 2 reads 0.4 bar above its twin. I think it’s the sensor. GO.', data: 'The redundant transducer on tank 2 reads nominal. The odd trace jumped at 03:12 — when the harness was reconnected.', real: false, tank: true },
    ...[...reals, ...fines].sort((a, b) => a.r - b.r)];
  if (P.grounded) items.unshift({ st: 'Safety board', who: 'Flight safety board', call: 'NO-GO. The program’s record of shortcuts does not clear a crew.', data: 'Risk register above the crewed-flight limit.', real: true, final: true });
  items.forEach((it) => (it.state = 'wait'));
  const z = { i: -1, left: WIN, miss: 0, falseH: 0, asked: 0, hold: 0, done: false, started: false, msg: '' };
  const cs = stage(root, 5, 2), card = el('div', `display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid ${C.line};background:${C.faint};min-height:120px;`), ctl = row(8), log = logLine();
  root.append(cs.cv, card, ctl, log);
  const bStart = btn('Begin the poll', 'primary', () => { z.started = true; next(); }), bGo = btn('GO', 'primary', () => answer('go')), bData = btn('Ask for the data', 'ghost', () => answer('data')), bHold = btn('HOLD', 'ghost', () => answer('hold'));
  bHold.style.borderColor = C.red;
  function next() { z.i++; if (z.i >= items.length) return end(); const it = items[z.i]; it.state = 'ask'; render(); }
  function answer(k) { if (z.done || z.hold > 0) return; const it = items[z.i]; if (!it) return;
    if (it.final) { it.state = 'hold'; return end(); }
    if (k === 'data') { if (it.shown) return; it.shown = true; z.left -= 3; z.asked++; render(); return; }
    if (k === 'go') { it.state = 'go'; if (it.real) { z.miss++; it.missed = true; } say(log, `${it.st}: GO.`, C.green); next(); return; }
    it.state = 'hold'; z.hold = 6; z.left -= 6; if (it.real) say(log, `HOLD on ${it.st}. ${it.fix}`, C.amber); else { z.falseH++; say(log, `HOLD on ${it.st} — ${it.tank ? 'Mateo shows you the redundant transducer: it is the sensor. The scrub decision comes after the poll.' : 'nothing was wrong. The clock lost six seconds.'}`, C.red); }
    render(); }
  function end() { if (z.done) return; z.done = true; const g = P.grounded ? 'bad' : z.left <= 0 ? 'bad' : z.miss === 0 && z.falseH <= 1 ? 'good' : z.miss <= 1 ? 'ok' : 'bad';
    const t = P.grounded ? 'The safety board will not clear the crew.' : z.left <= 0 ? 'The window closed during the poll.' : `${items.length} stations polled. ${z.miss ? z.miss + ' problem' + (z.miss > 1 ? 's' : '') + ' went through as GO' : 'Every real problem was held and fixed'}${z.falseH ? `, ${z.falseH} unnecessary hold${z.falseH > 1 ? 's' : ''}` : ''}. ${Math.max(0, Math.round(z.left))} s of window left.`;
    ctx.finish(g, z.miss, t); render(); }
  function render() { card.innerHTML = ''; ctl.innerHTML = ''; const it = items[z.i];
    if (!z.started) { card.append(el('span', `font:600 16px ${PIX};color:${C.ink};`, 'Final GO/NO-GO poll'), el('span', `font-size:14px;color:${C.cream};text-wrap:pretty;`, `${items.length} stations will report. Every GO is a signature. The launch window closes in ${WIN} seconds — holds and questions cost time, but a GO on a real problem flies with the crew.`)); ctl.append(bStart); return; }
    if (it && !z.done) { card.append(kicker(it.st + ' · ' + it.who, it.final ? C.red : C.amber), el('span', `font-size:16px;color:${C.ink};text-wrap:pretty;`, '“' + it.call + '”'));
      if (it.shown) card.append(el('span', `font-size:14px;color:${C.teal};text-wrap:pretty;padding-top:6px;border-top:1px solid ${C.line};`, it.data));
      if (it.final) { const b = btn('Acknowledge', 'primary', () => answer('hold')); ctl.append(b); } else { ctl.append(bGo, bData, bHold); dis(bData, !!it.shown); [bGo, bHold].forEach((b) => dis(b, z.hold > 0)); } }
    else if (z.done) card.append(el('span', `font-size:14px;color:${C.cream};`, 'Poll closed.')); }
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs; const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#1a1030'); sk.addColorStop(1, '#5a2a3a'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.fillStyle = '#0b0710'; g.fillRect(0, H * 0.82, W, H * 0.18); const px = W * 0.16; g.fillStyle = '#2a2030'; g.fillRect(px - fs * 2.2, H * 0.22, fs * 0.8, H * 0.6);
    g.fillStyle = C.cream; g.fillRect(px - fs * 0.6, H * 0.18, fs * 1.2, H * 0.64); g.fillStyle = C.red; g.beginPath(); g.moveTo(px - fs * 0.6, H * 0.18); g.lineTo(px, H * 0.1); g.lineTo(px + fs * 0.6, H * 0.18); g.fill();
    if (z.hold > 0) { g.fillStyle = `rgba(194,52,64,${0.12 + 0.08 * Math.sin(now / 150)})`; g.fillRect(0, 0, W, H); }
    const m = Math.max(0, z.left), mm = Math.floor(m / 60), ss = Math.floor(m % 60); T(g, `WINDOW ${mm}:${String(ss).padStart(2, '0')}${z.hold > 0 ? ' · HOLD' : ''}`, W * 0.62, H * 0.3, z.hold > 0 ? C.red : m < 20 ? C.amber : C.ink, 'center', `600 ${Math.round(fs * 2.6)}px ${PIX}`);
    const n = items.length, x0 = W * 0.32, x1 = W - fs, dx = (x1 - x0) / n; items.forEach((it, i) => { const x = x0 + dx * (i + 0.5), y = H * 0.62, col = { wait: '#4a3d52', ask: C.amber, go: C.green, hold: C.red }[it.state];
      g.fillStyle = col; g.beginPath(); g.arc(x, y, fs * 0.8, 0, 7); g.fill(); if (it.state === 'ask' && !z.done) { g.strokeStyle = C.amber; g.beginPath(); g.arc(x, y, fs * (1.1 + 0.25 * Math.sin(now / 160)), 0, 7); g.stroke(); }
      T(g, it.st, x, y + fs * 2.2, C.cream, 'center', `500 ${Math.round(fs * 0.8)}px ${FONT}`); }); }
  render(); say(log, 'Naomi: one voice per station. Listen to what they say — and to what they don’t.', C.soft);
  const stop = loop((dt, now) => { if (z.started && !z.done) { if (z.hold > 0) { z.hold -= dt; if (z.hold <= 0) { z.hold = 0; const it = items[z.i]; if (it && it.state === 'hold') next(); else render(); } } else z.left -= dt; if (z.left <= 0) { z.left = 0; end(); } } draw(now); });
  return { update(c) { ctx = c; }, destroy() { stop(); } };
}

// ======================================================================== PROBES (Leila · Selene Ch. 7)
function probes(root, ctx) {
  const P = ctx.P || {}, R = rng(ctx.seed || 71), n = clamp(P.n || 3, 1, 3), sepKm = P.sep || 3000, DV = 30, CAMP = 24;
  const pred = 0, actual = -(0.9 + R() * 0.4), flapA = 0.35 + R() * 0.2, flapW = 0.9 + R() * 0.5, thick = 0.55;
  const z = { pr: Array.from({ length: n }, (_, i) => ({ x: (i - (n - 1) / 2) * 0.3, y: 1.6, tx: (i - (n - 1) / 2) * 0.3, ty: 1.6, dv: 0, inT: 0, rec: [] })), drag: null, st: 'plan', t: 0, done: false, sel: 0 };
  const sheet = (x, t, real) => (real ? actual : pred) + flapA * Math.sin(flapW * t + x * 1.3) * (real ? 1 : 0.4);
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), stats = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;'), sDv = statBox('Separation Δv used'), sSp = statBox('Probe spread'), sIn = statBox('Time inside the sheet');
  stats.append(sDv.box, sSp.box, sIn.box); root.append(cs.cv, ctl, log, stats);
  const bGo = btn('Execute the separations', 'primary', () => go()), bAuto = btn('Spread evenly', 'ghost', () => { z.pr.forEach((p, i) => { p.tx = (i - (n - 1) / 2) * 1.6; p.ty = pred + (n === 3 ? [0.5, -0.5, 0][i] : (i ? -0.4 : 0.4)); cost(p); }); render(); });
  const geo = () => { const W = cs.W, H = cs.H; return { cx: W * 0.5, cy: H * 0.52, sx: W * 0.11, sy: H * 0.16 }; };
  const X = (x) => geo().cx + x * geo().sx, Y = (y) => geo().cy - y * geo().sy, ix = (px) => (px - geo().cx) / geo().sx, iy = (py) => (geo().cy - py) / geo().sy;
  function cost(p) { p.dv = Math.hypot(p.tx - p.x, p.ty - p.y) * 3.2; }
  const used = () => z.pr.reduce((a, p) => a + p.dv, 0);
  function spread() { if (n < 2) return { dz: 0, dx: 0 }; const ys = z.pr.map((p) => p.ty), xs = z.pr.map((p) => p.tx); return { dz: Math.max(...ys) - Math.min(...ys), dx: Math.max(...xs) - Math.min(...xs) }; }
  function render() { ctl.innerHTML = ''; if (z.st === 'plan') { ctl.append(bAuto, bGo); dis(bGo, used() > DV + 1e-9); }
    sDv.v.textContent = `${f1(used())} / ${DV} m/s`; sDv.v.style.color = used() > DV ? C.red : C.ink; const sp = spread(); sSp.v.textContent = n < 2 ? 'one probe' : `${Math.round(sp.dx * sepKm / 1.6)} km × ${Math.round(sp.dz * sepKm / 1.6)} km`;
    sIn.v.textContent = z.st === 'plan' ? '—' : z.pr.map((p) => Math.round((p.inT / Math.max(0.01, z.t)) * 100) + ' %').join(' · '); }
  function go() { if (z.st !== 'plan' || used() > DV) return; z.st = 'fly'; z.t = 0; say(log, 'Separation burns. The probes drift to their stations; the campaign runs.', C.soft); render(); }
  function end() { z.done = true; z.st = 'end'; const sp = spread(), frac = z.pr.map((p) => p.inT / z.t), best = Math.max(...frac), multi = frac.filter((f) => f > 0.12).length, vert = n > 1 ? clamp(sp.dz / 1.2, 0, 1) : 0, horiz = n > 1 ? clamp(sp.dx / 2.5, 0, 1) : 0;
    const q = clamp(0.35 * vert + 0.25 * horiz + 0.4 * best, 0, 1), g = q >= 0.6 && multi >= 2 ? 'good' : q >= 0.35 ? 'ok' : 'bad';
    ctx.finish(g, q, `The sheet sat ${Math.round(-actual * sepKm / 1.6)} km lower than predicted. ${multi} of ${n} probe${n > 1 ? 's' : ''} spent real time inside it; spread ${Math.round(sp.dx * sepKm / 1.6)} × ${Math.round(sp.dz * sepKm / 1.6)} km. Δv ${f1(used())} m/s.`); render(); }
  cs.cv.addEventListener('pointerdown', (ev) => { if (z.st !== 'plan') return; const [x, y] = cs.pt(ev); let best = -1, bd = cs.fs * 2.2; z.pr.forEach((p, i) => { const d = Math.hypot(X(p.tx) - x, Y(p.ty) - y); if (d < bd) { bd = d; best = i; } }); if (best >= 0) { z.drag = best; z.sel = best; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } } });
  cs.cv.addEventListener('pointermove', (ev) => { if (z.drag == null) return; const [x, y] = cs.pt(ev), p = z.pr[z.drag]; p.tx = clamp(ix(x), -3.6, 3.6); p.ty = clamp(iy(y), -2.4, 2.4); cost(p); render(); });
  const up = () => { z.drag = null; }; cs.cv.addEventListener('pointerup', up); cs.cv.addEventListener('pointercancel', up);
  const unkey = keys(root, (ev) => { if (ev.type !== 'keydown' || z.st !== 'plan') return; if (ev.key === 'Tab') { ev.preventDefault(); z.sel = (z.sel + 1) % n; return; } const d = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[ev.key]; if (d) { ev.preventDefault(); const p = z.pr[z.sel]; p.tx += d[0]; p.ty += d[1]; cost(p); render(); } });
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, G = geo(); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(241,230,214,0.4)'; for (let i = 0; i < 50; i++) g.fillRect((i * 173) % W, (i * 97) % H, 1, 1);
    const real = z.st !== 'plan', tt = z.t;
    const band = (real2, col, alpha) => { g.fillStyle = col; g.globalAlpha = alpha; g.beginPath(); for (let px = 0; px <= W; px += 6) { const y = Y(sheet(ix(px), tt, real2) + thick / 2); px ? g.lineTo(px, y) : g.moveTo(px, y); } for (let px = W; px >= 0; px -= 6) g.lineTo(px, Y(sheet(ix(px), tt, real2) - thick / 2)); g.closePath(); g.fill(); g.globalAlpha = 1; };
    if (!real || tt < 2) { g.setLineDash([5, 4]); g.strokeStyle = 'rgba(255,176,200,0.6)'; [1, -1].forEach((s2) => { g.beginPath(); for (let px = 0; px <= W; px += 6) { const y = Y(sheet(ix(px), tt, false) + (s2 * thick) / 2); px ? g.lineTo(px, y) : g.moveTo(px, y); } g.stroke(); }); g.setLineDash([]); T(g, 'PREDICTED PLASMA SHEET', fs, Y(pred + thick / 2) - fs * 0.5, C.pink); }
    if (real) { band(true, C.pink, clamp(tt / 2, 0, 1) * 0.28); T(g, 'MEASURED PLASMA SHEET', fs, Y(actual - thick / 2) + fs * 1.4, C.pink); }
    g.fillStyle = '#8a8296'; g.beginPath(); g.arc(W * 0.93, H * 0.12, fs * 1.6, 0, 7); g.fill(); T(g, 'MOON', W * 0.93, H * 0.12 + fs * 3, C.soft, 'center');
    const ox = X(0), oy = Y(1.6); g.fillStyle = C.cream; g.fillRect(ox - fs * 0.6, oy - fs * 0.4, fs * 1.2, fs * 0.8); T(g, 'SELENE', ox, oy - fs, C.soft, 'center');
    const cols = [C.teal, C.amber, C.blue];
    z.pr.forEach((p, i) => { const k = real ? ease(clamp(tt / 3, 0, 1)) : 0, x = lerp(p.x, p.tx, k), y = lerp(p.y, p.ty, k);
      if (!real) { g.strokeStyle = cols[i]; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(p.x), Y(p.y)); g.lineTo(X(p.tx), Y(p.ty)); g.stroke(); g.setLineDash([]); }
      const inside = real && Math.abs(y - sheet(x, tt, true)) < thick / 2; g.fillStyle = cols[i]; g.beginPath(); g.arc(X(real ? x : p.tx), Y(real ? y : p.ty), fs * (z.sel === i && !real ? 0.65 : 0.5), 0, 7); g.fill();
      if (inside) { g.strokeStyle = C.ink; g.beginPath(); g.arc(X(x), Y(y), fs * (0.8 + 0.2 * Math.sin(now / 120)), 0, 7); g.stroke(); }
      T(g, 'P' + (i + 1) + (real ? '' : ' · ' + f1(p.dv) + ' m/s'), X(real ? x : p.tx) + fs * 0.8, Y(real ? y : p.ty) - fs * 0.6, cols[i]); });
    if (real) { const x0 = W * 0.62, y0 = H * 0.72, w = W * 0.34, h = H * 0.22; g.fillStyle = 'rgba(11,7,16,0.8)'; g.fillRect(x0, y0, w, h); T(g, 'B-field at each probe', x0 + 6, y0 + fs * 1.1, C.soft);
      z.pr.forEach((p, i) => { g.strokeStyle = cols[i]; g.beginPath(); p.rec.forEach((v, j) => { const xx = x0 + 6 + (j / (CAMP * 20)) * (w - 12), yy = y0 + h * 0.3 + i * h * 0.22 + v * h * 0.1; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); g.stroke(); }); }
    T(g, z.st === 'plan' ? 'Drag each probe to its station (Tab + arrows also work). Spread them across the sheet — above, inside, below.' : `Campaign day ${Math.min(6, Math.floor((tt / CAMP) * 6) + 1)} of 6`, fs, fs * 1.5, C.ink); }
  render(); say(log, `Leila: ${n} probe${n > 1 ? 's' : ''}, ${DV} m/s of separation Δv between them, ${sepKm.toLocaleString('en')} km planned spacing. The model says where the plasma sheet sits. Models are often wrong.`, C.soft);
  const stop = loop((dt, now) => { if (z.st === 'fly') { z.t += dt * (reduced() ? 3 : 1); const k = ease(clamp(z.t / 3, 0, 1)); z.pr.forEach((p) => { const x = lerp(p.x, p.tx, k), y = lerp(p.y, p.ty, k), d = y - sheet(x, z.t, true), inS = Math.abs(d) < thick / 2; if (z.t > 3 && inS) p.inT += dt; if (z.t > 3) z.tIn = (z.tIn || 0); p.rec.push(inS ? Math.sin(z.t * 9 + x) * 1.2 : clamp(d, -1, 1) * 0.6); if (p.rec.length > CAMP * 20) p.rec.shift(); });
      if ((z.rr = (z.rr || 0) + dt) > 0.4) { z.rr = 0; render(); } if (z.t >= CAMP) end(); } draw(now); });
  return { update(c) { ctx = c; }, destroy() { stop(); unkey(); } };
}

// ======================================================================== EVA (Mateo · Bridge Ch. 23)
function eva(root, ctx) {
  const P = ctx.P || {}, port = !!P.port, glove = P.glove !== false, CLOCK = 75;
  const NODES = [{ x: 0.1, y: 0.62, n: 'Airlock' }, { x: 0.24, y: 0.42, n: 'Handrail 1' }, { x: 0.4, y: 0.3, n: 'Handrail 2' }, { x: 0.56, y: 0.34, n: 'Truss' }, { x: 0.7, y: 0.5, n: port ? 'Service port' : 'Damaged connector' }];
  const STEPS = port ? [['cover', 'Open the thermal cover', 1.5], ['bolt', 'Release 4 bolts', 1.2], ['align', 'Align the connector key', 0], ['seat', 'Seat and lock the plug', 1.4], ['verify', 'Naomi verifies the checksums', 0]]
    : [['cover', 'Peel back the scorched blanket', 2], ['cut', 'Cut the damaged harness', 2], ['bolt', 'Release 4 bolts', 1.2], ['splice', 'Splice the bypass lead', 2.6], ['align', 'Align the connector key', 0], ['seat', 'Seat and lock the plug', 1.4], ['verify', 'Naomi verifies the checksums', 0]];
  const z = { at: 0, clip: [0], left: CLOCK, ext: false, viol: 0, step: 0, bolts: 0, hold: 0, holding: false, dial: 0, done: false, started: false, sun: 0, aligned: 0, verifyT: 0 };
  const cs = stage(root, 2, 1), ctl = row(8), log = logLine(), stats = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;'), sT = statBox('EVA time left'), sTe = statBox('Tethers'), sSt = statBox('Task');
  stats.append(sT.box, sTe.box, sSt.box); root.append(cs.cv, ctl, log, stats);
  const bStart = btn('Leave the airlock', 'primary', () => { z.started = true; say(log, 'Two tethers, always one clipped. Clip ahead (C), then move (→), then unclip behind.', C.soft); render(); });
  const bClip = btn('Clip ahead (C)', 'ghost', () => clip()), bMove = btn('Move → (D)', 'ghost', () => move()), bUn = btn('Unclip behind (U)', 'ghost', () => unclip());
  const bWork = holdBtn('Work (hold Space)', () => (z.holding = true), () => (z.holding = false)), bKey = btn('Lock the key (Enter)', 'primary', () => key()), bExt = btn('Ask Leila for two more minutes', 'ghost', () => ext());
  const cur = () => STEPS[z.step], atPort = () => z.at === NODES.length - 1;
  function clip() { if (z.done || atPort()) return; const nx = z.at + 1; if (z.clip.includes(nx)) return; if (z.clip.length >= 2) return say(log, 'Both hooks are in use. Unclip the one behind first.', C.amber); z.clip.push(nx); say(log, `Clipped to ${NODES[nx].n}.`, C.green); render(); }
  function move() { if (z.done || atPort()) return; const nx = z.at + 1; if (!z.clip.includes(nx)) { z.viol++; say(log, 'Leila: “Tether first, Mateo.” Move logged as a safety violation — clip ahead before you let go.', C.red); }
    z.at = nx; z.left -= 3; if (atPort()) say(log, `At the ${NODES[z.at].n.toLowerCase()}. ${STEPS[0][1]}.`, C.soft); render(); }
  function unclip() { const back = z.clip.filter((c) => c < z.at); if (!back.length) return; if (z.clip.length < 2) return say(log, 'That is your only tether.', C.red); z.clip = z.clip.filter((c) => c !== back[0]); render(); }
  function key() { if (cur()[0] !== 'align') return; const d = Math.abs(((z.dial % 360) + 360) % 360 - 0); const err = Math.min(d, 360 - d); if (err < 14) { z.step++; say(log, 'Keyed. The plug slides home.', C.green); } else { z.left -= 2; say(log, `Off by ${Math.round(err)}° — the pins bind. Back it out and try again.`, C.amber); } render(); }
  function ext() { if (z.ext || z.done) return; z.ext = true; z.left += 20; say(log, 'Leila: “Two minutes. Not one second more.”', C.amber); render(); }
  function end(ok) { if (z.done) return; z.done = true; const g = !ok ? 'bad' : z.viol === 0 && !z.ext ? 'good' : z.viol <= 1 ? 'ok' : 'bad';
    ctx.finish(g, z.viol, ok ? `Connected ${port ? 'through the secondary port' : 'through a hand-spliced bypass'}${z.ext ? ' with the two-minute extension' : ''}${z.viol ? ` · ${z.viol} tether violation${z.viol > 1 ? 's' : ''}` : ''}.` : 'Out of EVA time. Leila calls Mateo back before the work is finished.'); render(); }
  function render() { ctl.innerHTML = ''; if (z.done) return; if (!z.started) { ctl.append(bStart); return; }
    if (!atPort()) ctl.append(bClip, bMove, bUn); else { const s = cur(); if (s && s[0] === 'align') ctl.append(bKey); else if (s && s[0] !== 'verify') ctl.append(bWork); }
    if (z.left < 25 && !z.ext) ctl.append(bExt);
    sT.v.textContent = Math.max(0, Math.ceil(z.left)) + ' s'; sT.v.style.color = z.left < 15 ? C.red : C.ink; sTe.v.textContent = z.clip.map((c) => NODES[c].n).join(' + ') || 'none'; sTe.v.style.color = z.clip.length ? C.ink : C.red; sSt.v.textContent = atPort() && cur() ? cur()[1] : !atPort() ? 'Translate to the work site' : 'Done'; }
  const unkey = keys(root, (ev) => { const k = ev.key, dn = ev.type === 'keydown'; if (!z.started || z.done) return;
    if (k === ' ') { ev.preventDefault(); z.holding = dn; return; } if (!dn) return;
    if (k === 'c' || k === 'C') clip(); else if (k === 'd' || k === 'D' || k === 'ArrowRight') { ev.preventDefault(); move(); } else if (k === 'u' || k === 'U') unclip(); else if (k === 'Enter') { ev.preventDefault(); key(); } });
  function draw(now) { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, shade = Math.sin(z.sun) < -0.3; g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(241,230,214,0.45)'; for (let i = 0; i < 60; i++) g.fillRect((i * 173) % W, (i * 97) % H, 1, 1);
    const mg = g.createRadialGradient(W * 0.9, H * 1.4, 10, W * 0.9, H * 1.4, H * 1.1); mg.addColorStop(0, '#8a8296'); mg.addColorStop(1, '#3a3442'); g.fillStyle = mg; g.beginPath(); g.arc(W * 0.9, H * 1.45, H * 0.85, 0, 7); g.fill();
    g.fillStyle = shade ? '#2a2432' : '#4a3d52'; g.fillRect(W * 0.04, H * 0.52, W * 0.18, H * 0.26); T(g, 'BRIDGE', W * 0.13, H * 0.84, C.soft, 'center');
    g.fillStyle = shade ? '#2a2a3a' : '#5b6a8a'; g.fillRect(W * 0.6, H * 0.36, W * 0.2, H * 0.3); g.fillStyle = shade ? '#1a2240' : '#26335e'; g.fillRect(W * 0.8, H * 0.42, W * 0.16, H * 0.16); T(g, 'SELENE', W * 0.7, H * 0.72, C.soft, 'center');
    g.strokeStyle = C.gold; g.lineWidth = 2; g.beginPath(); NODES.forEach((nd, i) => (i ? g.lineTo(nd.x * W, nd.y * H) : g.moveTo(nd.x * W, nd.y * H))); g.stroke(); g.lineWidth = 1;
    NODES.forEach((nd, i) => { g.fillStyle = z.clip.includes(i) ? C.green : C.gold; g.beginPath(); g.arc(nd.x * W, nd.y * H, fs * 0.4, 0, 7); g.fill(); });
    const me = NODES[z.at]; z.clip.forEach((c) => { const nd = NODES[c]; g.strokeStyle = C.green; g.beginPath(); g.moveTo(me.x * W, me.y * H); g.quadraticCurveTo((me.x + nd.x) / 2 * W, Math.max(me.y, nd.y) * H + fs * 2, nd.x * W, nd.y * H); g.stroke(); });
    g.fillStyle = C.ink; g.beginPath(); g.arc(me.x * W, me.y * H - fs * 1.2, fs * 0.7, 0, 7); g.fill(); g.fillRect(me.x * W - fs * 0.5, me.y * H - fs * 0.6, fs, fs * 1.4);
    if (shade) { g.fillStyle = 'rgba(255,243,232,0.18)'; g.beginPath(); g.moveTo(me.x * W, me.y * H - fs * 1.2); g.lineTo(me.x * W + fs * 8, me.y * H - fs * 3); g.lineTo(me.x * W + fs * 8, me.y * H + fs * 1.5); g.closePath(); g.fill(); }
    if (atPort() && cur() && !z.done) { const s = cur(), bx = W * 0.62, by = H * 0.06, bw = W * 0.34;
      g.fillStyle = 'rgba(11,7,16,0.85)'; g.fillRect(bx, by, bw, H * 0.26); T(g, s[1].toUpperCase(), bx + fs * 0.6, by + fs * 1.4, C.amber);
      if (s[0] === 'align') { const cx = bx + bw / 2, cy = by + H * 0.16, r = H * 0.07; g.strokeStyle = C.cream; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.fillStyle = C.green; g.fillRect(cx - 2, cy - r - fs * 0.6, 4, fs * 0.6); const a = (z.dial * Math.PI) / 180 - Math.PI / 2; g.strokeStyle = C.amber; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); g.lineWidth = 1; }
      else if (s[0] === 'verify') { for (let i = 0; i < 12; i++) { const k = ((now / 600 + i / 12) % 1); g.fillStyle = C.teal; g.fillRect(bx + fs + k * (bw - fs * 2), by + H * 0.16, 5, 5); } }
      else { const need = s[2] * (glove ? 1 : 2.3) * (shade ? 1.4 : 1), k = clamp(z.hold / need, 0, 1); g.strokeStyle = C.line; g.strokeRect(bx + fs * 0.6, by + H * 0.14, bw - fs * 1.2, fs); g.fillStyle = C.green; g.fillRect(bx + fs * 0.6, by + H * 0.14, (bw - fs * 1.2) * k, fs);
        if (s[0] === 'bolt') T(g, `Bolt ${z.bolts + 1} of 4${glove ? '' : ' · standard tools in pressure gloves'}`, bx + fs * 0.6, by + H * 0.23, C.soft); else if (!glove) T(g, 'Standard tools in pressure gloves: slow', bx + fs * 0.6, by + H * 0.23, C.soft); } }
    T(g, shade ? 'IN SHADOW · helmet lights · work is slower' : 'SUNLIGHT', fs, fs * 1.5, shade ? C.lilac : C.amber); T(g, `EVA ${Math.max(0, Math.ceil(z.left))} s`, W - fs, fs * 1.5, z.left < 15 ? C.red : C.ink, 'right', `600 ${Math.round(fs * 1.4)}px ${PIX}`);
    if (!z.started) { g.fillStyle = 'rgba(11,7,16,0.5)'; g.fillRect(0, 0, W, H); T(g, port ? 'Secondary service port · one EVA' : 'No secondary port · bypass by hand', W / 2, H / 2, C.ink, 'center', `600 ${Math.round(fs * 1.4)}px ${PIX}`); } }
  render(); say(log, `Mateo: ${port ? 'the secondary port is on the far side of the bus.' : 'no secondary port. I splice around the scorched connector.'} ${glove ? 'Glove tools.' : 'Standard tools — in these gloves every bolt is a fight.'}`, C.soft);
  const stop = loop((dt, now) => { if (z.started && !z.done) { z.sun += dt * 0.25; z.left -= dt; const s = cur(); const shade = Math.sin(z.sun) < -0.3;
      if (atPort() && s) { if (s[0] === 'align') z.dial = (z.dial + dt * 140) % 360; else if (s[0] === 'verify') { z.verifyT += dt; if (z.verifyT > 2.5) { z.step++; end(true); } }
        else if (z.holding) { z.hold += dt; const need = s[2] * (glove ? 1 : 2.3) * (shade ? 1.4 : 1); if (z.hold >= need) { z.hold = 0; if (s[0] === 'bolt' && ++z.bolts < 4) say(log, `Bolt ${z.bolts} out.`, C.soft); else { z.bolts = 0; z.step++; say(log, `${s[1]}: done.`, C.green); render(); } } } }
      if (z.left <= 0) { z.left = 0; end(false); } if ((z.rr = (z.rr || 0) + dt) > 0.3) { z.rr = 0; render(); } } draw(now); });
  return { update(c) { ctx = c; }, destroy() { stop(); unkey(); } };
}

// ======================================================================== ANOMALY (Kiran · Ch. 30 open data)
function anomaly(root, ctx) {
  const R = rng(ctx.seed || 81), TT = 720, KINDS3 = ['art', 'art', 'sw', 'sw', 'sw', 'new'];
  const times = [];
  for (let i = 0; i < 500 && times.length < 6; i++) {
    const t = 50 + R() * (TT - 100);
    if (times.every((u) => Math.abs(u - t) > 70)) times.push(t);
  }
  // Five reports can leave no legal room for a sixth. Use separated windows if placement stalls.
  if (times.length < 6) {
    const slot = (TT - 100) / 6;
    times.length = 0;
    for (let i = 0; i < 6; i++) times.push(50 + (i + 0.4 + R() * 0.2) * slot);
  }
  times.sort((a, b) => a - b);
  const kinds = KINDS3.map((k) => ({ k, r: R() })).sort((a, b) => a.r - b.r).map((x) => x.k), C6 = times.map((t, i) => ({ t, k: kinds[i], st: R() < 0.5 ? 'A' : 'B', lab: null, amp: kinds[i] === 'new' ? 0.55 : 0.8 + R() * 0.5 }));
  const nz = Array.from({ length: 3 }, () => Array.from({ length: TT + 1 }, () => (R() - 0.5) * 0.12));
  const bump = (t, c, w) => Math.exp(-0.5 * ((t - c) / w) ** 2);
  const up = (t) => 0.15 * Math.sin(t / 37) + C6.reduce((s, c) => s + (c.k === 'sw' ? c.amp * bump(t, c.t - 55, 6) : 0), 0) + nz[0][Math.round(clamp(t, 0, TT))];
  const gr = (t, st) => 0.1 * Math.sin(t / 53 + (st === 'A' ? 0 : 1)) + C6.reduce((s, c) => s + (c.k === 'sw' ? c.amp * bump(t, c.t, 7) : c.k === 'new' ? c.amp * bump(t, c.t, 4) : c.k === 'art' && c.st === st ? 1.1 * bump(t, c.t, 0.6) : 0), 0) + nz[st === 'A' ? 1 : 2][Math.round(clamp(t, 0, TT))];
  const z = { sel: 0, shift: 0, done: false };
  const cs = stage(root, 2, 1), card = el('div', `display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid ${C.line};background:${C.faint};`), ctl = row(8), log = logLine(), list = row(6);
  root.append(cs.cv, list, card, ctl, log);
  const LAB = { art: 'Instrument artefact', sw: 'Solar wind arriving', new: 'Unexplained' };
  const bPub = btn('Publish the review', 'primary', () => publish());
  function render() { list.innerHTML = ''; C6.forEach((c, i) => { const b = el('button', `padding:6px 10px;min-height:40px;background:${z.sel === i ? 'rgba(255,122,107,0.16)' : C.faint};border:1px solid ${z.done ? (c.lab === c.k ? C.green : C.red) : c.lab ? C.teal : C.line};color:${C.cream};font:500 13px ${FONT};cursor:pointer;`, `#${i + 1} · ${Math.round(c.t)} min${c.lab ? ' · ' + LAB[c.lab] : ''}`); b.type = 'button'; b.onclick = () => { z.sel = i; render(); }; list.appendChild(b); });
    card.innerHTML = ''; const c = C6[z.sel]; card.append(kicker(`Public report #${z.sel + 1} · t = ${Math.round(c.t)} min`, C.amber), el('span', `font-size:14px;color:${C.cream};text-wrap:pretty;`, 'Someone on the open network says the Cascade is back. Compare both ground stations and the upstream wind (shift it by the travel time), then file it.'));
    const r = row(6); Object.keys(LAB).forEach((k) => { const b = btn(LAB[k], c.lab === k ? 'primary' : 'ghost', () => { if (z.done) return; c.lab = k; const nx = C6.findIndex((q) => !q.lab); if (nx >= 0) z.sel = nx; render(); }); dis(b, z.done); r.appendChild(b); }); card.appendChild(r);
    ctl.innerHTML = ''; if (!z.done) ctl.append(bPub); dis(bPub, z.done || C6.some((q) => !q.lab)); }
  function publish() { if (z.done) return; z.done = true; const ok = C6.filter((c) => c.lab === c.k).length, nw = C6.find((c) => c.k === 'new'), g = ok >= 6 || (ok >= 5 && nw.lab === 'new') ? 'good' : ok >= 4 ? 'ok' : 'bad';
    ctx.finish(g, ok, `${ok} of 6 public reports filed correctly. ${nw.lab === 'new' ? `The one at ${Math.round(nw.t)} min fits nothing we know — it is logged, small and open.` : 'The one signal that fits nothing was filed under something familiar.'}`); render(); }
  cs.cv.addEventListener('pointerdown', (ev) => { const [x, y] = cs.pt(ev), W = cs.W, H = cs.H, t = ((x - cs.fs) / (W - 2 * cs.fs)) * TT; if (y < H * 0.3) { z.drag = { x, s: z.shift }; try { cs.cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ } return; }
    let bi = -1, bd = 25; C6.forEach((c, i) => { if (Math.abs(c.t - t) < bd) { bd = Math.abs(c.t - t); bi = i; } }); if (bi >= 0) { z.sel = bi; render(); } });
  cs.cv.addEventListener('pointermove', (ev) => { if (!z.drag) return; const [x] = cs.pt(ev); z.shift = clamp(z.drag.s + ((x - z.drag.x) / (cs.W - 2 * cs.fs)) * TT, 0, 90); });
  const upE = () => { if (z.drag) { z.drag = null; if (Math.abs(z.shift - 55) < 5) { z.shift = 55; say(log, 'Upstream aligned: 55 minutes of travel time.', C.green); } } }; cs.cv.addEventListener('pointerup', upE); cs.cv.addEventListener('pointercancel', upE);
  function draw() { if (!cs.fit()) return; const g = cs.g, W = cs.W, H = cs.H, fs = cs.fs, x0 = fs, x1 = W - fs, X = (t) => x0 + (t / TT) * (x1 - x0); g.fillStyle = '#0d0914'; g.fillRect(0, 0, W, H);
    const lanes = [['UPSTREAM SOLAR WIND · drag to shift by the travel time', C.amber, (t) => up(t - z.shift), fs * 2, H * 0.3], ['GROUND STATION A', C.teal, (t) => gr(t, 'A'), H * 0.36, H * 0.62], ['GROUND STATION B', C.blue, (t) => gr(t, 'B'), H * 0.66, H - fs * 2]];
    lanes.forEach(([lab, col, f, y0, y1]) => { const mid = y1 - (y1 - y0) * 0.2, k = (y1 - y0) / 2; g.strokeStyle = col; g.lineWidth = 1.3; g.beginPath(); for (let t = 0; t <= TT; t += 1) { const y = mid - f(t) * k; t ? g.lineTo(X(t), y) : g.moveTo(X(t), y); } g.stroke(); g.lineWidth = 1; T(g, lab, x0, y0 - fs * 0.3, col, 'left', `500 ${Math.round(fs * 0.85)}px ${FONT}`); });
    C6.forEach((c, i) => { g.strokeStyle = z.sel === i ? C.coral : 'rgba(255,122,107,0.35)'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(c.t), fs * 1.6); g.lineTo(X(c.t), H - fs * 1.6); g.stroke(); g.setLineDash([]); T(g, '#' + (i + 1), X(c.t) + 3, H - fs * 1.7, z.sel === i ? C.coral : C.soft, 'left', `600 ${Math.round(fs * 0.9)}px ${FONT}`); });
    for (let t = 0; t <= TT; t += 120) T(g, t / 60 + ' h', X(t), H - fs * 0.4, C.mute, 'center', `500 ${Math.round(fs * 0.8)}px ${FONT}`); }
  render(); say(log, 'Kiran: the data are open now. Six people think they have seen the Cascade come back. Check each one with them.', C.soft);
  const stop = loop(() => draw()); return { update(c) { ctx = c; }, destroy() { stop(); } };
}

const GAMES = { workbench, ascent, downlink, peaks, burn: burnGame, lag: lagGame, faults, poll, probes, eva, anomaly };
export const KINDS = ['faults', 'ascent', 'downlink', 'peaks', 'burn', 'lag', 'probes', 'poll', 'eva', 'anomaly'];
export function mount(kind, root, ctx) {
  root.innerHTML = ''; root.style.display = 'flex'; root.style.flexDirection = 'column'; root.style.gap = '10px'; root.style.fontFamily = FONT; root.style.color = C.cream;
  const f = GAMES[kind]; if (!f) { root.textContent = 'Unknown game: ' + kind; return { update() {}, destroy() {} }; }
  let done = false; const c0 = { ...ctx, finish: (g, v, m) => { if (done) return; done = true; ctx.finish && ctx.finish(g, v, m); } };
  const inst = f(root, c0); return { update: (c) => inst.update({ ...c, finish: c0.finish }), destroy: () => { inst.destroy(); root.innerHTML = ''; } };
}
