// Canvas drawing for the Chapter One analysis minigames. View boxes: chart 600×230, front 600×300 (fit, centred).
const KCOL = { calm: '#7ab0ff', moderate: '#ffc24a', intense: '#ff5a6a' };
const FONT = '"IBM Plex Sans", system-ui, sans-serif';
const hhmm = (m) => { const tot = Math.max(0, Math.round(m)), h = 2 + Math.floor(tot / 60); return '0' + h + ':' + String(tot % 60).padStart(2, '0'); };
const viewH = (mg) => (mg.kind === 'front' ? 300 : mg.kind === 'trim' ? 104 : 230);
function fit(cv, VW, VH) { const W = cv.clientWidth, H = cv.clientHeight, k = Math.min(W / VW, H / VH); return { k, ox: (W - VW * k) / 2, oy: (H - VH * k) / 2 }; }

export function viewPoint(cv, mg, cx, cy) {
  const r = cv.getBoundingClientRect(), f = fit(cv, 600, viewH(mg));
  return { x: (cx - r.left - f.ox) / f.k, y: (cy - r.top - f.oy) / f.k };
}

export function drawMinigame(cv, mg, D) {
  const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H || !D || !mg) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), bw = Math.round(W * dpr), bh = Math.round(H * dpr);
  if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
  const g = cv.getContext('2d'), VH = viewH(mg), f = fit(cv, 600, VH), bg = mg.kind === 'front' ? '#0a0912' : mg.kind === 'regions' ? '#070a14' : '#0b1120';
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = bg; g.fillRect(0, 0, bw, bh);
  if (mg.kind === 'front') {
    const s = dpr * f.k, cx = dpr * f.ox - 40 * s, cy = dpr * f.oy + 150 * s, sun = g.createRadialGradient(cx, cy, 10 * s, cx, cy, 230 * s);
    sun.addColorStop(0, 'rgba(255,214,120,0.95)'); sun.addColorStop(0.35, 'rgba(255,150,70,0.35)'); sun.addColorStop(1, 'rgba(255,120,60,0)');
    g.fillStyle = sun; g.fillRect(0, 0, Math.min(bw, cx + 230 * s), bh);
  }
  g.setTransform(dpr * f.k, 0, 0, dpr * f.k, dpr * f.ox, dpr * f.oy);
  if (mg.kind === 'front') drawFront(g, mg, D); else if (mg.kind === 'regions') drawRegions(g, mg); else if (mg.kind === 'trim') drawTrim(g, mg); else drawChart(g, mg, D);
}

// Chapter Two: Sun → L1 → bow shock → Earth (core / low orbit) → magnetotail at lunar distance. Same order as RG in the engine.
const RPOS = [[44, 118], [232, 118], [318, 118], [384, 120], [384, 90], [548, 118]];
const RLAB = ['The Sun', 'Sun–Earth L1', 'Bow shock', "Earth's core", 'Low Earth orbit', 'Magnetotail · lunar distance'];
const RTAG = { 1: 'L1 · DRIVING', 4: 'NEAR EARTH', 5: 'MAGNETOTAIL' };
export function regionAt(x, y) { let b = 0, bd = 1e9; RPOS.forEach(([px, py], i) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; b = i; } }); return b; }
function drawRegions(g, mg) {
  g.fillStyle = '#070a14'; g.fillRect(0, 0, 600, 230);
  for (let i = 0; i < 80; i++) { g.fillStyle = i % 5 ? '#1a2240' : '#3a4670'; g.fillRect((i * 97 + 13) % 600, (i * 53 + 7) % 230, 1, 1); }
  const sg = g.createRadialGradient(-12, 118, 8, -12, 118, 130); sg.addColorStop(0, 'rgba(255,224,140,1)'); sg.addColorStop(0.3, 'rgba(255,160,70,0.55)'); sg.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = sg; g.fillRect(0, 0, 170, 230);
  g.strokeStyle = 'rgba(255,194,122,0.4)'; g.lineWidth = 1.5;
  [40, 76, 160, 196].forEach((y) => { const x1 = 300 + ((y - 118) ** 2) / 120 - 10; g.beginPath(); g.moveTo(96, y); g.lineTo(x1, y); g.moveTo(x1 - 6, y - 4); g.lineTo(x1, y); g.lineTo(x1 - 6, y + 4); g.stroke(); });
  g.strokeStyle = 'rgba(255,214,122,0.6)'; g.beginPath(); for (let y = 12; y <= 224; y += 2) { const x = 318 + ((y - 118) ** 2) / 120; if (y === 12) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
  g.strokeStyle = 'rgba(106,216,255,0.55)'; g.beginPath(); for (let y = 44; y <= 192; y += 2) { const x = 350 + ((y - 118) ** 2) / 70; if (y === 44) g.moveTo(x, y); else g.lineTo(x, y); } g.lineTo(600, 196); g.moveTo(350 + (74 ** 2) / 70, 44); g.lineTo(600, 40); g.stroke();
  g.strokeStyle = 'rgba(106,216,255,0.4)'; g.lineWidth = 1;
  [24, 36].forEach((k) => { g.beginPath(); g.ellipse(384 + k * 0.15, 118, k * 1.05, k * 0.8, 0, 0, Math.PI * 2); g.stroke(); });
  [-1, 1].forEach((s) => [10, 22].forEach((o) => { g.beginPath(); g.moveTo(396, 118 + s * o * 0.5); g.quadraticCurveTo(470, 118 + s * (o + 8), 600, 118 + s * (o + 14)); g.stroke(); }));
  g.strokeStyle = 'rgba(200,200,220,0.3)'; g.setLineDash([3, 5]); g.beginPath(); g.arc(384, 118, 172, -0.42, 0.42); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#a8a8b4'; g.beginPath(); g.arc(553, 152, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1e5aa8'; g.beginPath(); g.arc(384, 120, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a9a6a'; g.fillRect(377, 113, 7, 5); g.fillRect(387, 122, 6, 6);
  g.fillStyle = '#ff5a6a'; g.fillRect(378, 104, 12, 2); g.fillRect(378, 134, 12, 2);
  g.strokeStyle = 'rgba(232,240,255,0.35)'; g.beginPath(); g.arc(384, 120, 30, 0, Math.PI * 2); g.stroke();
  g.font = '600 12px ' + FONT; g.textAlign = 'center'; g.fillStyle = '#c8b8a8'; g.fillText('SUN', 30, 216); g.fillText('EARTH', 384, 158); g.fillText('MOON', 553, 172);
  const placed = mg.placed || [];
  RPOS.forEach(([x, y], i) => {
    const on = placed.includes(i), sel = mg.listening && mg.idx === i, bad = mg.tried === i;
    if (on) {
      g.fillStyle = '#9ae0c0'; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 7, y); g.lineTo(x, y + 9); g.lineTo(x - 7, y); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(154,224,192,0.5)'; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.stroke();
      g.font = '700 12px ' + FONT; g.fillStyle = '#9ae0c0'; g.textAlign = 'center'; g.fillText(RTAG[i] || '', x, i === 4 ? y - 18 : y + 26);
    } else {
      g.strokeStyle = bad ? '#ff6b6b' : sel ? '#fff6ea' : 'rgba(241,230,214,0.55)'; g.lineWidth = sel ? 2 : 1.2;
      g.beginPath(); g.arc(x, y, sel ? 10 : 6, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    }
    if (sel) {
      const t = RLAB[i]; g.font = '600 14px ' + FONT; const w = g.measureText(t).width + 14, lx = Math.min(600 - w - 2, Math.max(2, x - w / 2)), ly = i === 4 ? y - 40 : y - 36;
      g.fillStyle = '#e8f0ff'; g.fillRect(lx, ly, w, 20); g.fillStyle = '#070a14'; g.textAlign = 'center'; g.fillText(t, lx + w / 2, ly + 15);
    }
  });
  g.fillStyle = '#8a7e92'; g.font = '600 12px ' + FONT; g.textAlign = 'right'; g.fillText('Schematic · not to scale', 596, 224);
}

// Chapter Three budget review: payload totals against one modest satellite's limits.
function drawTrim(g, mg) {
  const t = (mg.items || []).reduce((a, it) => (it.on ? { m: a.m + it.m, p: a.p + it.p, c: a.c + it.c } : a), { m: 0, p: 0, c: 0 });
  g.fillStyle = '#0b0d18'; g.fillRect(0, 0, 600, 104);
  [['MASS', t.m, 9, 36, (v) => (Math.round(v * 10) / 10) + ' kg'], ['POWER', t.p, 9, 44, (v) => (Math.round(v * 10) / 10) + ' W'], ['COST', t.c, 3.4, 14, (v) => '$' + v.toFixed(1) + 'M']].forEach(([lab, v, lim, max, f], i) => {
    const y = 6 + i * 32, x0 = 92, w = 370, sx = (q) => x0 + Math.min(1, q / max) * w, ok = v <= lim + 1e-9;
    g.font = '600 14px ' + FONT; g.textAlign = 'left'; g.fillStyle = '#cdbfd2'; g.fillText(lab, 14, y + 18);
    g.fillStyle = '#161a2c'; g.fillRect(x0, y + 5, w, 18); g.fillStyle = ok ? '#7fd6a4' : '#ff6b6b'; g.fillRect(x0, y + 5, Math.max(2, sx(v) - x0), 18);
    const lx = Math.round(sx(lim)) + 0.5; g.strokeStyle = '#ffd27a'; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(lx, y); g.lineTo(lx, y + 28); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    g.textAlign = 'right'; g.fillStyle = ok ? '#9ae0c0' : '#ff9a8a'; g.font = '700 15px ' + FONT; g.fillText(f(v) + '  /  ' + f(lim), 594, y + 19);
    if (mg.circle && lab === 'COST') { g.strokeStyle = '#ff4a5a'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(532, y + 14, 66, 16, -0.04, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
  });
}

function drawChart(g, mg, D) {
  const X = (t) => 24 + (t / 180) * 552, Y = (v) => 196 - (v / 1.3) * 178;
  g.fillStyle = '#0b1120'; g.fillRect(0, 0, 600, 230);
  g.font = '15px ' + FONT; g.textAlign = 'center';
  for (let m = 0; m <= 180; m += 30) { const x = X(m); g.fillStyle = '#16203a'; g.fillRect(x, 14, 1, 182); g.fillStyle = '#9aa8c6'; g.fillText(hhmm(m), x, 218); }
  for (let v = 0.25; v < 1.3; v += 0.25) { g.fillStyle = '#131b30'; g.fillRect(24, Y(v), 552, 1); }
  g.fillStyle = '#6a7a9a'; g.fillRect(24, 196, 552, 1);
  if (mg.band) {
    const x0 = X(mg.band[0]), x1 = X(mg.band[1]);
    g.fillStyle = 'rgba(255,210,80,0.13)'; g.fillRect(x0, 14, x1 - x0, 182);
    g.strokeStyle = '#ffd250'; g.lineWidth = 1; g.setLineDash([4, 4]); g.strokeRect(x0 + 0.5, 14.5, x1 - x0 - 1, 181); g.setLineDash([]);
  }
  const trace = (fn, t1) => { g.beginPath(); for (let t = 0; t <= t1 + 0.001; t += 0.5) { const x = X(t), y = Y(fn(t)); if (t === 0) g.moveTo(x, y); else g.lineTo(x, y); } };
  const mp = mg.modelProg || 0;
  if (mp > 0 && mg.gap) {
    g.beginPath(); g.moveTo(X(26), Y(D.obs(26)));
    for (let t = 26; t <= 180; t += 0.5) g.lineTo(X(t), Y(D.obs(t)));
    for (let t = 180; t >= 26; t -= 0.5) g.lineTo(X(t), Y(D.model(t)));
    g.closePath(); g.fillStyle = 'rgba(224,54,74,0.26)'; g.fill();
    g.fillStyle = '#ff8a7a'; g.font = '600 15px ' + FONT; g.textAlign = 'left'; g.fillText('model error grows →', X(124), Y(0.95));
  }
  g.lineJoin = 'round';
  trace(D.obs, 180); g.strokeStyle = '#ffa04a'; g.lineWidth = 2.5; g.stroke();
  if (mp > 0) { trace(D.model, 180 * mp); g.strokeStyle = '#5ad0ff'; g.lineWidth = 2; g.stroke(); }
  (mg.marks || []).forEach((t) => {
    const x = X(t), y = Y(D.obs(t));
    g.strokeStyle = 'rgba(255,122,107,0.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x, 196); g.stroke();
    g.fillStyle = '#ff7a6b'; g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x + 6, y - 10); g.lineTo(x, y - 4); g.lineTo(x - 6, y - 10); g.closePath(); g.fill();
    g.fillStyle = '#ffd8cf'; g.font = '600 15px ' + FONT; g.textAlign = 'center'; g.fillText(hhmm(t), x, y - 21);
  });
  if (mg.spans && mg.marks && mg.marks.length > 1) {
    g.strokeStyle = '#ffd250'; g.fillStyle = '#ffd250'; g.lineWidth = 1.5; g.font = '700 16px ' + FONT; g.textAlign = 'center';
    for (let i = 1; i < mg.marks.length; i++) {
      const a = X(mg.marks[i - 1]) + 5, b = X(mg.marks[i]) - 5, y = 186;
      g.beginPath(); g.moveTo(a, y - 4); g.lineTo(a, y); g.lineTo(b, y); g.lineTo(b, y - 4); g.stroke();
      g.fillText((mg.marks[i] - mg.marks[i - 1]) + ' min', (a + b) / 2, y - 6);
    }
  }
  if (mg.listening && mg.axis === 'x') {
    const t = mg.cursor * 180, x = X(t), y = Y(D.obs(t));
    g.strokeStyle = 'rgba(232,240,255,0.8)'; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, 14); g.lineTo(x, 196); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#e8f0ff'; g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill();
    const label = hhmm(t); g.font = '600 15px ' + FONT;
    const w = g.measureText(label).width + 12, lx = Math.min(600 - w - 2, Math.max(2, x - w / 2));
    g.fillStyle = '#e8f0ff'; g.fillRect(lx, 0, w, 19); g.fillStyle = '#0b1120'; g.textAlign = 'center'; g.fillText(label, lx + w / 2, 15);
  }
}

function drawFront(g, mg, D) {
  const top = 20, ch = 26, cell = Math.max(0, Math.min(9, Math.floor((mg.cursor || 0) * 10))), bx = 196, bw = 34, tx = 262;
  g.strokeStyle = 'rgba(255,200,120,0.18)'; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const y = 30 + i * 30; g.beginPath(); g.moveTo(50, y); g.lineTo(186, y); g.stroke(); }
  D.FRONT.forEach((k, i) => { g.globalAlpha = 0.88; g.fillStyle = KCOL[k]; g.fillRect(bx, top + i * ch, bw, ch - 2); });
  g.globalAlpha = 1;
  g.strokeStyle = 'rgba(241,230,214,0.45)'; g.lineWidth = 1; g.setLineDash([4, 5]); g.beginPath(); g.moveTo(tx, top); g.lineTo(tx, top + 260); g.stroke(); g.setLineDash([]);
  g.strokeStyle = 'rgba(122,176,255,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(600, 22); g.quadraticCurveTo(440, 150, 600, 278); g.stroke();
  g.fillStyle = '#3a6ad0'; g.beginPath(); g.arc(548, 150, 15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5ad09a'; g.beginPath(); g.arc(544, 146, 6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,246,234,0.35)'; g.lineWidth = 1.5;
  [60, 150, 240].forEach((y) => { g.beginPath(); g.moveTo(300, y); g.lineTo(430, y); g.moveTo(423, y - 4); g.lineTo(430, y); g.lineTo(423, y + 4); g.stroke(); });
  (mg.reads || []).forEach((r, n) => {
    const y = top + r.cell * ch + ch / 2;
    g.fillStyle = KCOL[r.kind]; g.beginPath(); g.arc(282, y, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a0912'; g.font = '700 12px ' + FONT; g.textAlign = 'center'; g.fillText(String(n + 1), 282, y + 4.5);
  });
  if (mg.listening) {
    const my = top + mg.cursor * 260;
    g.strokeStyle = '#fff6ea'; g.lineWidth = 1.5; g.strokeRect(bx - 1, top + cell * ch - 1, bw + 2, ch);
    g.strokeStyle = 'rgba(255,246,234,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 7, my); g.lineTo(bx + bw + 1, top + cell * ch + ch / 2); g.stroke();
    g.fillStyle = '#d8dce8'; g.fillRect(tx - 6, my - 5, 12, 10);
    g.fillStyle = '#5a7ac8'; g.fillRect(tx - 18, my - 3, 11, 6); g.fillRect(tx + 7, my - 3, 11, 6);
  }
  g.font = '600 14px ' + FONT; g.fillStyle = '#e2d4c4'; g.textAlign = 'center';
  g.fillText('SUN', 30, 294); g.fillText('UPSTREAM MONITOR', tx, 15); g.fillText('SOLAR-WIND FRONT', bx + bw / 2, 294); g.fillText("EARTH'S MAGNETOSPHERE", 512, 15);
  g.fillStyle = '#a89cae'; g.font = '600 12px ' + FONT; g.textAlign = 'right'; g.fillText('Schematic · not to scale', 596, 276);
}

// Minimap: whole current scene, 1 px per tile scaled up (crisp), plus doors, people, objective ◆ and the player arrow.
let mapCache = { key: '', c: null };
export function drawMinimap(cv, m, t) {
  const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H || !m) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), bw = Math.round(W * dpr), bh = Math.round(H * dpr);
  if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
  const cols = m.W - m.x0 + 1, rows = m.D - m.z0 + 1;
  if (mapCache.key !== m.key) {
    const c = document.createElement('canvas'); c.width = cols; c.height = rows; const tg = c.getContext('2d');
    for (let z = 0; z < rows; z++) for (let x = 0; x < cols; x++) {
      const k = (x + m.x0) + ',' + (z + m.z0);
      tg.fillStyle = m.block.has(k) || (m.cblock && m.cblock.has(k)) ? '#211b2c' : '#4f4660'; tg.fillRect(x, z, 1, 1);
    }
    mapCache = { key: m.key, c };
  }
  const g = cv.getContext('2d'), pad = 7, s = Math.min((W - pad * 2) / cols, (H - pad * 2) / rows);
  const ox = (W - cols * s) / 2, oy = (H - rows * s) / 2;
  const X = (x) => ox + (Math.min(m.W, Math.max(m.x0, x)) - m.x0 + 0.5) * s, Y = (z) => oy + (Math.min(m.D, Math.max(m.z0, z)) - m.z0 + 0.5) * s;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  g.imageSmoothingEnabled = false; g.drawImage(mapCache.c, ox, oy, cols * s, rows * s);
  g.strokeStyle = 'rgba(241,230,214,0.35)'; g.lineWidth = 1; g.strokeRect(ox - 0.5, oy - 0.5, cols * s + 1, rows * s + 1);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4), lim = (v, a, b) => Math.min(b, Math.max(a, v));
  m.warps.forEach((w) => { const d = lim(s * 0.7, 3, 8); g.fillStyle = w.lead ? '#ff7a6b' : w.lock ? '#5a4a3c' : '#c89a3c'; g.fillRect(X(w.x) - d / 2, Y(w.z) - d / 2, d, d); });
  m.actors.forEach((a) => { g.fillStyle = a.talk ? '#f1e6d6' : '#9a8fa6'; g.beginPath(); g.arc(X(a.x), Y(a.z), lim(s * 0.3, 1.8, 4), 0, Math.PI * 2); g.fill(); });
  (m.target ? [m.target] : m.warps.filter((w) => w.lead)).forEach((p) => {
    const x = X(p.x), y = Y(p.z), r = lim(s * 0.45, 3.5, 5.5), dy = y - r - 5 - pulse * 2;
    g.strokeStyle = 'rgba(255,122,107,' + (0.25 + 0.5 * pulse).toFixed(2) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 2 + pulse * 3, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x, dy - r); g.lineTo(x + r * 0.8, dy); g.lineTo(x, dy + r); g.lineTo(x - r * 0.8, dy); g.closePath();
    g.fillStyle = '#ff7a6b'; g.fill(); g.strokeStyle = '#0f0b16'; g.lineWidth = 1.2; g.stroke();
  });
  const px = X(m.px), py = Y(m.pz), ang = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][m.dir] || 0, r = lim(s * 0.62, 4.5, 7);
  const glow = g.createRadialGradient(px, py, 0, px, py, r * 2.4); glow.addColorStop(0, 'rgba(255,246,234,0.35)'); glow.addColorStop(1, 'rgba(255,246,234,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(px, py, r * 2.4, 0, Math.PI * 2); g.fill();
  g.save(); g.translate(px, py); g.rotate(ang);
  g.beginPath(); g.moveTo(r, 0); g.lineTo(-r * 0.7, r * 0.72); g.lineTo(-r * 0.35, 0); g.lineTo(-r * 0.7, -r * 0.72); g.closePath();
  g.fillStyle = m.who === 'kiran' ? '#9ae0c0' : '#ffd27a'; g.fill(); g.strokeStyle = '#0f0b16'; g.lineWidth = 1.4; g.stroke();
  g.restore();
}
