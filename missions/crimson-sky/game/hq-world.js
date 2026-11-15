// The Crimson Sky — Mission Hall: the walkable 2.5D hub for The Missions (co-op). Sprites, helpers and
// rendering are shared with Chapter One (copied from game/ch1-engine.js); the hall, stations and crew AI are below.
export function createHQ(THREE, o) {
  const { container, fadeEl, hooks } = o;
  let sounds = o.sounds !== false;
  let pixelScale = o.pixelScale || 3, dynamicCam = o.dynamicCam !== false;
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  const cv = renderer.domElement;
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated;';
  container.appendChild(cv);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.3, 300);
  const resize = () => {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(Math.max(64, Math.round(w / pixelScale)), Math.max(48, Math.round(h / pixelScale)), false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  // ---------- helpers ----------
  const rng = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const toTex = (c) => { const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = toTex(c); t.userData = { c, g }; return t; };
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const lam = (color, x = {}) => new THREE.MeshLambertMaterial({ color, ...x });
  const addMat = (color, map, opacity = 1, side = THREE.FrontSide) => new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side });
  const add = (parent, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const shadeHex = (hex, l) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, l); return c; };
  let simT = 0; const timers = [];
  const wait = (ms) => new Promise((r) => timers.push({ t: simT + ms / 1000, r }));
  const DV = [[0, 1], [0, -1], [-1, 0], [1, 0]], OPP = [1, 0, 3, 2];
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const radialTex = ctex(64, 64, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 6; i++) { const v = 34 + i * 38; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(32, 32, 31 * (1 - i / 6.4), 0, Math.PI * 2); g.fill(); } });
  const coneTex = ctex(8, 48, (g) => { for (let i = 0; i < 6; i++) { const v = 210 - i * 34; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, i * 8, 8, 8); } });
  const rectGlowTex = ctex(32, 32, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 5; i++) { const v = 40 + i * 42; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(2 + i * 2, 0, 28 - i * 4, 30 - i * 5); } });
  const shadowGeo = new THREE.CircleGeometry(0.3, 14);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false });

  // ---------- pixel sprites ----------
  // Kiran: hand-drawn 16×24 maps matching Solomon's design (voluminous messy hair, thin glasses, stubble,
  // mauve shirt with dark triangles open over a black tee). Legs and arm swing are added per frame.
  const KIRAN_MAP = {"pal":{"H":"#1c121a","S":"#b8774a","s":"#9a6440","E":"#1a1014","G":"#0e0c12","L":"#a4a8dc","B":"#9c6642","m":"#6e4230","P":"#9a8296","p":"#56445a","q":"#76627a","C":"#b6a2b4","T":"#1e1a22","K":"#2c2a36","F":"#1c1818","h":"#3a2430"},"front":["..H.HH.HHH.H.H..",".HHHHHHHHHHHHHH.","HHHHHHHHHHHHHHHH",".HHHhhHHHHhhHHH.","HHHHHSHHSHHHSHHH",".HHSSHSSSSHSSHH.","..HHGGGSSGGGHH..","..HHLELGGLELHH..","..HsSSSssSSSsH..","...HSSSSSSSSH...","...HBSSmmSSBH...",".....BBSSBB.....","...PPCTSSTCPP...","..PPpPCTTCPpPP..","..PppPPTTPPppP..","..PPPPpTTpPPPP..","..PPPppTTppPPP..","..SqqqqTTqqqqS.."],"back":["..H.HH.HHH.H.H..",".HHHHHHHHHHHHHH.","HHHHHHHHHHHHHHHH",".HHHhhHHHHhhHHH.","HHHHHHHHHHHHHHHH",".HHHHHHHHHHHHHH.","..HHHHHHHHHHHH..","..HHHHHHHHHHHH..",".HHHHHHHHHHHHHH.","..HHHHHHHHHHHH..","...HHHHHHHHHH...",".....sSSSSs.....","...PPCCCCCCPP...","..PPpPPPPPPpPP..","..PppPPPPPPppP..","..PPPPpPPpPPPP..","..PPPppPPppPPP..","..SqqqqqqqqqqS.."],"side":["...H.HHH.HH.H...","..HHHHHHHHHHHH..",".HHHHHHHHHHHHHH.",".HHHhhHHHHHHHHHH",".HHHSHHHHHHHHHH.","..HSSSSHHHHHHHH.","..GGGGGsHHHHHH..","..LELSSsHHHHHH..",".SSSSSSsHHHHH...","..SSSSSSHHHHH...","..mBSSSsHHH.....","...BBBs.........","....CSCPPPP.....","....PPpPPPP.....","....PppPPpP.....","....PPPPppP.....","....PpPPPPP.....","....qqqqqqq....."]};
  function drawMapChar(g, dir, f, m) {
    const R = (x, y, w, h, c) => { g.fillStyle = m.pal[c] || c; g.fillRect(x, y, w, h); };
    const step = f === 1 ? 1 : f === 3 ? -1 : 0;
    if (dir < 2) { const lift = [step === 1 ? 1 : 0, step === -1 ? 1 : 0]; R(5, 18, 6, 1, 'K'); [[5, lift[0]], [9, lift[1]]].forEach(([x, l]) => { R(x, 19, 2, 3 - l, 'K'); R(x, 22 - l, 2, 2, 'F'); }); }
    else if (step === 0) { R(6, 18, 4, 4, 'K'); R(5, 22, 4, 2, 'F'); }
    else { R(9, 18, 2, 4, 'K'); R(9, 22, 3, 2, 'F'); R(4, 18, 2, 4, 'K'); R(3, 22, 3, 2, 'F'); R(5, 18, 5, 1, 'K'); }
    const map = dir === 0 ? m.front : dir === 1 ? m.back : m.side;
    for (let y = 0; y < map.length; y++) for (let x = 0; x < 16; x++) { const c = map[y][x]; if (c !== '.') R(x, y, 1, 1, c); }
    if (dir < 2) { if (step === 1) { R(2, 17, 1, 1, 'q'); R(2, 16, 1, 1, 'S'); } if (step === -1) { R(13, 17, 1, 1, 'q'); R(13, 16, 1, 1, 'S'); } }
    else if (step === 0) { R(7, 13, 2, 4, 'q'); R(7, 17, 2, 1, 'S'); }
    else if (step === 1) { R(5, 13, 2, 3, 'q'); R(4, 16, 2, 1, 'S'); }
    else { R(9, 13, 2, 3, 'q'); R(10, 16, 2, 1, 'S'); }
  }
  function drawChar(g, dir, f, p) {
    if (p.map) return drawMapChar(g, dir, f, p.map);
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const step = f === 1 ? 1 : f === 3 ? -1 : 0;
    if (dir < 2) {
      const lift = [step === 1 ? 1 : 0, step === -1 ? 1 : 0];
      [[5, lift[0]], [9, lift[1]]].forEach(([x, l]) => { R(x, 18, 2, 4 - l, p.pants); R(x, 22 - l, 2, 2, p.shoe); });
      R(4, 11, 8, 7, p.shirt); R(4, 17, 8, 1, p.shirt2);
      const al = step === 1 ? 1 : 0, ar = step === -1 ? 1 : 0;
      R(3, 12, 1, 5 - al, p.shirt2); R(3, 17 - al, 1, 1, p.skin);
      R(12, 12, 1, 5 - ar, p.shirt2); R(12, 17 - ar, 1, 1, p.skin);
      if (p.rolled) { R(3, 15, 1, 2 - al, p.skin); R(12, 15, 1, 2 - ar, p.skin); }
      if (p.vest) R(4, 14, 8, 1, p.vest);
      if (p.sleeve) { R(4, 11, 1, 2, p.shirt2); R(11, 11, 1, 2, p.shirt2); }
      if (p.pattern) [[4, 12], [6, 14], [5, 16], [10, 13], [9, 15], [11, 16], [8, 12]].forEach(([x, y]) => R(x, y, 1, 1, p.pattern));
      if (dir === 0) {
        R(7, 11, 2, 1, p.skin);
        if (p.tee) { R(7, 12, 2, 6, p.tee); R(6, 11, 1, 1, p.shirt2); R(9, 11, 1, 1, p.shirt2); }
        if (p.zip) R(6, 14, 1, 4, p.zip);
        if (p.print) { R(7, 13, 2, 3, p.print); R(7, 13, 1, 1, p.print2); }
        R(4, 3, 8, 8, p.skin); R(3, 1, 10, 4, p.hair); R(3, 5, 1, p.long ? 8 : 4, p.hair); R(12, 5, 1, p.long ? 8 : 4, p.hair);
        R(4, 5, 3, 1, p.hair); R(9, 5, 2, 1, p.hair); R(6, 7, 1, 2, p.eye); R(9, 7, 1, 2, p.eye);
        if (p.glasses) { R(5, 6, 6, 1, p.glasses); R(5, 7, 1, 1, p.lens || p.glasses); R(10, 7, 1, 1, p.lens || p.glasses); R(7, 7, 2, 1, p.skin); }
        if (p.curls) { R(2, 2, 1, 2, p.hair); R(13, 2, 1, 2, p.hair); R(4, 0, 2, 1, p.hair); R(8, 0, 2, 1, p.hair); R(11, 0, 1, 1, p.hair); }
        if (p.cap) { R(3, 1, 10, 2, p.cap); R(2, 3, 12, 1, p.cap); }
        if (p.blush) { R(5, 9, 1, 1, p.blush); R(10, 9, 1, 1, p.blush); }
        if (p.stubble) { R(5, 10, 6, 1, p.stubble); R(4, 9, 1, 1, p.stubble); R(11, 9, 1, 1, p.stubble); }
        if (p.messy) { R(2, 2, 1, 4, p.hair); R(13, 2, 1, 4, p.hair); R(4, 0, 8, 1, p.hair); if (!p.glasses) R(7, 5, 2, 1, p.hair); }
        if (p.bun) R(6, 0, 4, 1, p.hair);
        if (p.hair2) { R(3, 1, 2, 1, p.hair2); R(p.messy ? 2 : 3, 2, 1, 1, p.hair2); }
      } else {
        R(4, 3, 8, 8, p.skin); R(3, 1, 10, 10, p.hair); if (p.long) R(3, 11, 10, 3, p.hair);
        if (p.curls) { R(2, 2, 1, 3, p.hair); R(13, 2, 1, 3, p.hair); R(4, 0, 2, 1, p.hair); R(8, 0, 2, 1, p.hair); }
        if (p.cap) { R(3, 1, 10, 2, p.cap); R(2, 3, 12, 1, p.cap); }
        if (p.messy) { R(2, 2, 1, 6, p.hair); R(13, 2, 1, 6, p.hair); R(4, 0, 8, 1, p.hair); }
        if (p.bun) R(6, 0, 4, 1, p.hair);
        if (p.hair2) { R(3, 1, 2, 1, p.hair2); R(p.messy ? 2 : 3, 2, 1, 1, p.hair2); }
      }
    } else {
      if (step === 0) { R(6, 18, 4, 4, p.pants); R(5, 22, 4, 2, p.shoe); }
      else { R(9, 18, 2, 4, p.pants); R(9, 22, 3, 2, p.shoe); R(4, 18, 2, 4, p.pants); R(3, 22, 3, 2, p.shoe); R(5, 18, 5, 1, p.pants); }
      R(5, 11, 6, 7, p.shirt); R(5, 17, 6, 1, p.shirt2);
      if (step === 0) { R(7, 12, 2, 5, p.shirt2); R(7, 17, 2, 1, p.skin); }
      else if (step === 1) { R(5, 12, 2, 4, p.shirt2); R(4, 16, 2, 1, p.skin); }
      else { R(9, 12, 2, 4, p.shirt2); R(10, 16, 2, 1, p.skin); }
      R(4, 3, 7, 8, p.skin); R(3, 1, 9, 4, p.hair); R(8, 3, 4, 7, p.hair); R(3, 4, 2, 1, p.hair);
      if (p.long) R(8, 10, 4, 5, p.hair);
      R(5, 7, 1, 2, p.eye);
      if (p.glasses) { R(4, 6, 4, 1, p.glasses); R(4, 7, 1, 1, p.lens || p.glasses); }
      if (p.curls) { R(2, 2, 1, 2, p.hair); R(5, 0, 2, 1, p.hair); R(9, 0, 2, 1, p.hair); R(12, 3, 1, 2, p.hair); }
      if (p.cap) { R(3, 1, 9, 2, p.cap); R(2, 3, 5, 1, p.cap); }
      if (p.vest) R(5, 14, 6, 1, p.vest);
      if (p.tee) R(5, 12, 1, 5, p.tee);
      if (p.zip) R(6, 14, 1, 3, p.zip);
      if (p.pattern) [[6, 12], [9, 14], [6, 16], [10, 12]].forEach(([x, y]) => R(x, y, 1, 1, p.pattern));
      if (p.stubble) R(4, 10, 4, 1, p.stubble);
      if (p.blush) R(6, 9, 1, 1, p.blush);
      if (p.messy) { R(4, 0, 7, 1, p.hair); R(12, 2, 1, 6, p.hair); R(2, 2, 1, 2, p.hair); }
      if (p.bun) R(12, 3, 2, 3, p.hair);
      if (p.hair2) { R(10, 1, 2, 1, p.hair2); R(p.messy ? 12 : 11, 2, 1, 1, p.hair2); }
    }
  }
  function outline(g, col) {
    const id = g.getImageData(0, 0, 16, 24), d = id.data, out = [];
    const A = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 24 && d[(y * 16 + x) * 4 + 3] > 0;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) if (!A(x, y) && (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1))) out.push([x, y]);
    g.fillStyle = col; out.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  }
  function charFrames(p) {
    const out = [[], [], [], []];
    for (let dir = 0; dir < 3; dir++) for (let f = 0; f < 4; f++) {
      const c = document.createElement('canvas'); c.width = 16; c.height = 24; const g = c.getContext('2d');
      drawChar(g, dir, f, p); outline(g, '#120e18'); out[dir][f] = toTex(c);
      if (dir === 2) { const m = document.createElement('canvas'); m.width = 16; m.height = 24; const mg = m.getContext('2d'); mg.translate(16, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); out[3][f] = toTex(m); }
    }
    return out;
  }
  const PAL = {
    lucas: { hair: '#2a1a1c', hair2: '#6a3226', skin: '#e0a078', shirt: '#b9b0a6', shirt2: '#2c2a4a', sleeve: true, print: '#7a86c8', print2: '#d8503a', pants: '#34364e', shoe: '#e4e2ee', eye: '#1a1420', blush: '#c07a56', messy: true },
    mariana: { hair: '#2a1618', hair2: '#5e2c26', skin: '#c98e66', shirt: '#9a7870', shirt2: '#7a5c56', pants: '#3a3048', shoe: '#2a2030', eye: '#1a1014', blush: '#a86c4a', bun: true, curls: true },
    nb1: { hair: '#5a4030', skin: '#d6a07a', shirt: '#4f7a5a', shirt2: '#3c5e45', pants: '#2e2e3a', shoe: '#1e1e26', eye: '#1a1420' },
    nb2: { hair: '#a7a4ae', skin: '#b07a58', shirt: '#c8a050', shirt2: '#9c7a36', pants: '#3a3440', shoe: '#201a20', eye: '#1a1420' },
    nb3: { hair: '#3a2420', skin: '#e0b090', shirt: '#d0d0dc', shirt2: '#a8a8b8', pants: '#44405a', shoe: '#201a20', eye: '#1a1420', long: true },
    worker: { hair: '#2a1c18', skin: '#b07a58', shirt: '#f07a28', shirt2: '#d0642a', pants: '#2a3048', shoe: '#1a1a20', eye: '#1a1420', vest: '#f0f0a0', cap: '#f4f0e0' },
    kiran: { map: KIRAN_MAP },
    leila: { hair: '#2a1714', hair2: '#6a3424', skin: '#c48a60', shirt: '#2c2a36', shirt2: '#1e1c28', tee: '#9a7a5a', pants: '#2a2a34', shoe: '#2a2220', eye: '#1a1014', blush: '#a8704c', long: true, curls: true, messy: true },
    naomi: { hair: '#1c1418', hair2: '#cfcad6', skin: '#e2b494', shirt: '#2a1820', shirt2: '#4a1c28', zip: '#c8a050', pants: '#24202a', shoe: '#1a1418', eye: '#1a1014', blush: '#c88a78', bun: true },
    mateo: { hair: '#2c1a16', hair2: '#7a3424', skin: '#c8865a', stubble: '#a06840', shirt: '#33484c', shirt2: '#24363a', tee: '#2a1c1e', zip: '#e8742a', pants: '#2c2c36', shoe: '#3a2a20', eye: '#1a1420', curls: true, messy: true },
  };
  const FR = {}; Object.keys(PAL).forEach((k) => (FR[k] = charFrames(PAL[k])));

  // Character billboards face the camera, so their upper half sits "behind" anything just behind their tile (the lab desks
  // cut through heads). Draw them at a depth 0.65 m closer to the camera; screen size and position are unchanged.
  const spriteMat = (map) => {
    const m = new THREE.SpriteMaterial({ map, alphaTest: 0.5 });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('gl_Position = projectionMatrix * mvPosition;',
        'gl_Position = projectionMatrix * mvPosition;\n\tvec4 lfBias = projectionMatrix * vec4( mvPosition.xy, mvPosition.z + 0.65, 1.0 );\n\tgl_Position.z = lfBias.z / lfBias.w * gl_Position.w;');
    };
    return m;
  };
  function actor(frames, height) {
    const g = new THREE.Group();
    const sp = new THREE.Sprite(spriteMat(frames[0][0]));
    sp.center.set(0.5, 0); sp.scale.set(height * 2 / 3, height, 1); g.add(sp);
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; sh.scale.set(1.25 * height / 1.4, 0.8 * height / 1.4, 1); g.add(sh);
    return { g, sp, frames, x: 0, z: 0, tx: 0, tz: 0, dir: 0, p: 0, moving: false, parity: 0, f: 0, solid: true };
  }
  const showFrame = (a) => { const m = a.frames[a.dir][a.f]; if (a.sp.material.map !== m) a.sp.material.map = m; };

  // ---------- Mission Hall: the walkable 2.5D hub for The Missions ----------
  const H = hooks || {};
  const ROLES = ['Kiran', 'Mateo', 'Leila', 'Naomi'];
  const st = { mission: 'sentinel', phase: 'design', player: 'Kiran', crew: {}, gates: [], gauges: null, budget: null, red: false, alert: false, highlight: {}, story: false };
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#0a0910');
  sc.add(new THREE.AmbientLight('#a0a4c4', 1.3));
  sc.add(new THREE.HemisphereLight('#ffe8e0', '#2a2438', 0.7));
  const dl = new THREE.DirectionalLight('#ffe4d8', 0.95); dl.position.set(4, 9, 8); sc.add(dl);
  const redL = new THREE.PointLight('#ff4a5a', 4, 9, 1.4); redL.position.set(6, 2.6, 0.6); sc.add(redL);
  const bayL = new THREE.PointLight('#d8e4ff', 5, 5, 1.5); bayL.position.set(6, 3, 4); sc.add(bayL);
  const XW = 12, ZD = 8, block = new Set(), key = (x, z) => x + ',' + z;
  const B = (x, z) => block.add(key(x, z)), rect = (x0, z0, x1, z1) => { for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) B(x, z); };
  const hardBlocked = (x, z) => x < 0 || z < 1 || x > XW || z > ZD || block.has(key(x, z));

  // floor: 16 px per tile, tile (x, z) centred on integer coordinates
  const fT = ctex(13 * 16, 9 * 16, (g, w, h) => { const r = rng(11);
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.fillStyle = ((x + y) / 16) % 2 ? '#3b3d4a' : '#373946'; g.fillRect(x, y, 16, 16); g.fillStyle = '#2b2d38'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16); g.fillStyle = '#464858'; g.fillRect(x, y, 15, 1); }
    for (let i = 0; i < 700; i++) { g.fillStyle = r() < 0.5 ? '#31333e' : '#43455a'; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
    const x0 = 4 * 16 + 4, z0 = 2 * 16 + 4, x1 = 9 * 16 - 4, z1 = 7 * 16 - 4;
    for (let x = x0; x < x1; x += 2) { g.fillStyle = (x >> 2) & 1 ? '#e8b23a' : '#24222a'; g.fillRect(x, z0, 2, 2); g.fillRect(x, z1 - 2, 2, 2); }
    for (let y = z0; y < z1; y += 2) { g.fillStyle = (y >> 2) & 1 ? '#e8b23a' : '#24222a'; g.fillRect(x0, y, 2, 2); g.fillRect(x1 - 2, y, 2, 2); }
    g.fillStyle = '#5a5c70'; for (let x = 8; x < w - 8; x += 6) g.fillRect(x, 7 * 16 + 8, 3, 1);
  });
  const fl = add(sc, new THREE.PlaneGeometry(13, 9), lam('#ffffff', { map: fT }), 6, 0, 4); fl.rotation.x = -Math.PI / 2;
  const wT = ctex(16, 48, (g) => { g.fillStyle = '#2e2c3a'; g.fillRect(0, 0, 16, 48); g.fillStyle = '#383646'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 30, 16, 1); g.fillStyle = '#24222e'; g.fillRect(0, 31, 16, 17); g.fillStyle = '#1c1a24'; for (let x = 0; x < 16; x += 8) g.fillRect(x, 31, 1, 17); g.fillStyle = '#16141c'; g.fillRect(0, 46, 16, 2); g.fillStyle = '#34323f'; g.fillRect(7, 2, 1, 27); });
  const wm = (rx) => { const t = wT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); t.needsUpdate = true; return lam('#ffffff', { map: t }); };
  const cap = lam('#1c1a24');
  const wall = (w, h, d, x, y, z, rx) => { const m = wm(rx); add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
  wall(14.2, 3.4, 0.6, 6, 1.7, -0.8, 14); wall(0.6, 3.4, 9.6, -0.8, 1.7, 4.1, 9); wall(0.6, 3.4, 9.6, 12.8, 1.7, 4.1, 9);
  add(sc, BOX(5.2, 0.42, 0.3), lam('#3a3848'), 2.1, 0.21, 8.75); add(sc, BOX(5.2, 0.42, 0.3), lam('#3a3848'), 9.9, 0.21, 8.75);

  // windows onto the crimson sky
  const skyT = ctex(48, 14, () => {});
  const drawSky = (t) => { const g = skyT.userData.g, gr = g.createLinearGradient(0, 0, 0, 14); gr.addColorStop(0, '#2a0614'); gr.addColorStop(0.55, '#8a1424'); gr.addColorStop(1, '#e0503a'); g.fillStyle = gr; g.fillRect(0, 0, 48, 14);
    for (let x = 0; x < 48; x++) { const a = 0.5 + 0.5 * Math.sin(x * 0.35 + t * 0.7) * Math.sin(x * 0.11 - t * 0.4); g.fillStyle = `rgba(255,130,140,${(0.15 + a * 0.35).toFixed(2)})`; g.fillRect(x, 1, 1, 3 + (a * 7 | 0)); }
    g.fillStyle = '#14080e'; [[0, 11, 7], [6, 9, 4], [11, 10, 6], [18, 8, 3], [22, 10, 8], [31, 9, 5], [37, 11, 6], [43, 8, 5]].forEach(([x, y, bw]) => g.fillRect(x, y, bw, 14 - y));
    skyT.needsUpdate = true; };
  [1.8, 10.2].forEach((x) => { add(sc, BOX(3.6, 0.92, 0.08), lam('#14121a'), x, 2.62, -0.46); add(sc, new THREE.PlaneGeometry(3.44, 0.78), new THREE.MeshBasicMaterial({ map: skyT }), x, 2.62, -0.41); for (let i = 1; i < 4; i++) add(sc, BOX(0.05, 0.78, 0.05), lam('#14121a'), x - 1.72 + i * 0.86, 2.62, -0.39); });

  // mission wall: orbit display + resource gauges fed by the shared simulator
  const scrT = ctex(96, 52, () => {});
  add(sc, BOX(3.4, 1.86, 0.1), lam('#121018'), 6, 1.95, -0.45);
  add(sc, new THREE.PlaneGeometry(3.24, 1.7), new THREE.MeshBasicMaterial({ map: scrT }), 6, 1.95, -0.39);
  const earthC = document.createElement('canvas'); earthC.width = earthC.height = 29;
  (() => { const g = earthC.getContext('2d'), R = 14, bl = Array.from({ length: 7 }, (_, i) => { const r = rng(40 + i); return [r() * 22 - 11, r() * 16 - 8, 3 + r() * 4]; });
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (x * x + y * y <= R * R) { g.fillStyle = Math.abs(y) / R > 0.8 ? '#ff4a5a' : bl.some(([bx, by, br]) => (x - bx) ** 2 + (y - by) ** 2 < br * br) ? '#2a7a5a' : '#1a4a8a'; g.fillRect(x + R, y + R, 1, 1); } })();
  function drawScreen(t) {
    const g = scrT.userData.g, w = 96, h = 52, cx = 30.5, cy = 26.5, ops = st.phase === 'ops';
    g.fillStyle = '#070c16'; g.fillRect(0, 0, w, h); g.fillStyle = '#0e1a2c'; for (let x = 4; x < w; x += 8) g.fillRect(x, 0, 1, h); for (let y = 4; y < h; y += 8) g.fillRect(0, y, w, 1);
    const orbit = (front) => { g.fillStyle = ops ? '#9ac8ff' : '#3a6a9a'; for (let a = 0; a < 6.28; a += 0.05) if ((Math.sin(a) > 0) === front) g.fillRect((cx + Math.cos(a) * 25) | 0, (cy + Math.sin(a) * 8 - Math.cos(a) * 4) | 0, 1, 1); };
    orbit(false); g.drawImage(earthC, 16, 12); orbit(true);
    const a = t * 0.9, sx = cx + Math.cos(a) * 25, sy = cy + Math.sin(a) * 8 - Math.cos(a) * 4;
    if (Math.sin(a) > 0 || (sx - cx) ** 2 + (sy - cy) ** 2 > 200) { g.fillStyle = '#fff3e8'; g.fillRect((sx | 0) - 1, (sy | 0) - 1, 3, 3); }
    const G = st.gauges; g.fillStyle = '#5a2430'; g.fillRect(60, 12, 34, 1);
    for (let i = 0; i < 4; i++) { const x = 62 + i * 8, gg = G && G[i]; g.fillStyle = '#14202e'; g.fillRect(x, 8, 5, 38); const v = gg ? clamp(gg.pct, 0, 1.15) : 0.3 + 0.22 * Math.sin(t * 2.2 + i * 1.7), hh = Math.round(33 * v); g.fillStyle = gg ? gg.color : '#3a6a9a'; g.fillRect(x, 46 - hh, 5, hh); }
    if ((st.alert || st.red) && Math.sin(t * 8) > 0) { g.fillStyle = '#ff4a5a'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); }
    scrT.needsUpdate = true;
  }
  add(sc, BOX(2.6, 0.8, 0.6), lam('#2a2836'), 6, 0.4, 0.05); add(sc, BOX(2.5, 0.06, 0.66), lam('#4a4858'), 6, 0.82, 0.08);
  const boardLeds = []; for (let i = 0; i < 6; i++) { const m = new THREE.MeshBasicMaterial({ color: '#2a2834' }); add(sc, BOX(0.18, 0.03, 0.12), m, 5.1 + i * 0.36, 0.86, 0.22); boardLeds.push(m); }

  const monitor = (x, z, tex, w = 0.8, h = 0.52, ry = 0) => { const gm = new THREE.Group(); gm.position.set(x, 0, z); gm.rotation.y = ry; sc.add(gm); add(gm, BOX(0.08, 0.24, 0.08), lam('#1a1a22'), 0, 0.9, -0.1); add(gm, BOX(w + 0.08, h + 0.08, 0.05), lam('#121218'), 0, 1.04 + h / 2, -0.12); add(gm, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), 0, 1.04 + h / 2, -0.09); return gm; };
  const legs = (cx, cz, w, d) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => add(sc, BOX(0.06, 0.74, 0.06), lam('#2a2a34'), cx + sx * (w / 2 - 0.08), 0.37, cz + sz * (d / 2 - 0.08)));

  // Kiran — science desk
  add(sc, BOX(0.8, 2.0, 0.8), lam('#2a2c36'), 0, 1.0, 0); B(0, 0);
  for (let i = 0; i < 9; i++) add(sc, BOX(0.05, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: i % 4 ? '#40e080' : '#ff4a5a' }), -0.12 + (i % 3) * 0.12, 1.7 - Math.floor(i / 3) * 0.35, 0.41);
  add(sc, BOX(2.9, 0.06, 0.8), lam('#5a5a68'), 2, 0.76, 0.05); legs(2, 0.05, 2.9, 0.8); rect(1, 0, 3, 0);
  const codeT = ctex(48, 32, (g, w, h) => { g.fillStyle = '#0e1420'; g.fillRect(0, 0, w, h); const r = rng(4); for (let y = 2; y < h - 1; y += 3) { let x = 2 + (r() * 3 | 0) * 2; const n = 1 + (r() * 4 | 0); for (let k = 0; k < n; k++) { const L = 3 + (r() * 9 | 0); g.fillStyle = ['#7ab8ff', '#e8d080', '#a0e0a0', '#c8c8d8', '#ff9a7a'][r() * 5 | 0]; g.fillRect(x, y, L, 1); x += L + 2; if (x > w - 4) break; } } });
  const waveT = ctex(64, 40, () => {});
  const drawWave = (t) => { const g = waveT.userData.g; g.fillStyle = '#0b1120'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#18223a'; for (let x = 4; x < 64; x += 10) g.fillRect(x, 2, 1, 34); for (let y = 6; y < 36; y += 8) g.fillRect(4, y, 58, 1);
    for (let i = 0; i < 58; i++) { const k = i + t * 8, v = 0.12 + 0.78 * Math.pow(Math.max(0, Math.sin(k * 0.13)), 6) + 0.04 * Math.sin(k * 1.3); g.fillStyle = '#ff7a6b'; g.fillRect(4 + i, (34 - 28 * v) | 0, 1, 2); }
    waveT.needsUpdate = true; };
  monitor(1.5, 0.05, codeT); monitor(2.5, 0.05, waveT, 0.92, 0.58);
  ['#8a3a3a', '#3a5a8a', '#d8d0b8'].forEach((c, i) => (add(sc, BOX(0.36, 0.07, 0.26), lam(c), 3.25, 0.83 + i * 0.07, 0.15).rotation.y = i * 0.2));
  add(sc, new THREE.CylinderGeometry(0.05, 0.045, 0.11, 8), lam('#ecebe6'), 1.0, 0.85, 0.25);

  // Mateo — workbench
  add(sc, BOX(2.9, 0.1, 0.84), lam('#6a5a48'), 10, 0.8, 0.05); add(sc, BOX(2.8, 0.7, 0.7), lam('#3a3440'), 10, 0.38, 0.05); rect(9, 0, 11, 0);
  const pegT = ctex(48, 20, (g) => { g.fillStyle = '#8a7a62'; g.fillRect(0, 0, 48, 20); g.fillStyle = '#6a5c48'; for (let y = 2; y < 20; y += 3) for (let x = 2; x < 48; x += 3) g.fillRect(x, y, 1, 1);
    g.fillStyle = '#c8ccd4'; g.fillRect(5, 3, 1, 10); g.fillRect(3, 3, 5, 2); g.fillStyle = '#e8742a'; g.fillRect(12, 4, 2, 9); g.fillStyle = '#c8ccd4'; g.fillRect(12, 2, 2, 2); g.fillStyle = '#d8b040'; g.fillRect(20, 3, 6, 4); g.fillStyle = '#3a3a44'; g.fillRect(22, 7, 2, 8); g.fillStyle = '#c03040'; g.fillRect(31, 3, 3, 3); g.fillRect(32, 6, 1, 8); g.fillStyle = '#c8ccd4'; g.fillRect(39, 3, 1, 12); g.fillRect(42, 3, 1, 12); g.fillRect(39, 3, 4, 1); });
  add(sc, BOX(2.6, 1.0, 0.05), lam('#4a3e30'), 10, 1.6, -0.47); add(sc, new THREE.PlaneGeometry(2.5, 0.92), lam('#ffffff', { map: pegT }), 10, 1.6, -0.44);
  add(sc, BOX(0.4, 0.3, 0.4), lam('#c8ccd8'), 9.3, 1.0, 0.1); add(sc, BOX(0.45, 0.08, 0.45), lam('#d8a840'), 9.3, 1.19, 0.1); (add(sc, BOX(0.6, 0.02, 0.3), lam('#2a3a7a'), 9.75, 0.87, 0.25).rotation.y = 0.3);
  add(sc, BOX(0.3, 0.12, 0.22), lam('#c03040'), 10.7, 0.91, 0.1); add(sc, new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), lam('#e8e8ee'), 10.7, 1.06, 0.1);
  add(sc, BOX(0.82, 0.7, 0.82), lam('#6a5a3a'), 12, 0.35, 1); add(sc, BOX(0.6, 0.4, 0.6), lam('#7a6a46'), 12, 0.9, 1); add(sc, BOX(0.82, 0.55, 0.82), lam('#5a6a4a'), 12, 0.275, 2); B(12, 1); B(12, 2);

  // Leila — flight console (left wall)
  add(sc, BOX(0.8, 0.06, 1.9), lam('#4a5068'), 0, 0.76, 5.5); add(sc, BOX(0.7, 0.72, 1.8), lam('#2a2e3e'), -0.05, 0.37, 5.5); rect(0, 5, 0, 6);
  const trackT = ctex(64, 36, () => {});
  const drawTrack = (t) => { const g = trackT.userData.g; g.fillStyle = '#081420'; g.fillRect(0, 0, 64, 36); g.fillStyle = '#10283a'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 1, 36); for (let y = 2; y < 36; y += 8) g.fillRect(0, y, 64, 1);
    g.fillStyle = '#1e4a3a'; [[6, 8, 10, 7], [22, 6, 8, 12], [36, 10, 14, 8], [50, 20, 8, 6]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    for (let k = 0; k < 2; k++) for (let x = 0; x < 64; x++) { g.fillStyle = k ? '#9ac8ff' : '#4a7ab8'; g.fillRect(x, (18 - 12 * Math.sin((x + k * 22) * 0.098)) | 0, 1, 1); }
    const px = (t * 6) % 64, py = 18 - 12 * Math.sin(px * 0.098); g.fillStyle = '#fff3e8'; g.fillRect((px | 0) - 1, (py | 0) - 1, 3, 3);
    g.fillStyle = '#ffd27a'; g.fillRect(40, 13, 2, 2); g.fillRect(14, 22, 2, 2); trackT.needsUpdate = true; };
  monitor(0.05, 5.5, trackT, 1.1, 0.62, Math.PI / 2);
  add(sc, new THREE.CylinderGeometry(0.18, 0.14, 0.34, 8), lam('#6a4a3a'), 0, 0.17, 8); add(sc, new THREE.IcosahedronGeometry(0.32, 0), lam('#3a6a4a'), 0, 0.6, 8); B(0, 8);

  // Naomi — director's desk (right wall)
  add(sc, BOX(0.8, 0.06, 1.9), lam('#5a3a44'), 12, 0.76, 5.5); add(sc, BOX(0.7, 0.72, 1.8), lam('#2e2228'), 12.05, 0.37, 5.5); rect(12, 5, 12, 6);
  const budT = ctex(48, 32, () => {});
  const drawBudget = () => { const g = budT.userData.g; g.fillStyle = '#140c12'; g.fillRect(0, 0, 48, 32); g.fillStyle = '#2a1c24'; for (let y = 4; y < 30; y += 6) g.fillRect(2, y, 44, 1);
    const f = st.budget == null ? 0.6 : clamp(st.budget, 0, 1.2), bw = Math.round(40 * Math.min(1, f)); g.fillStyle = f > 1 ? '#ff6b6b' : f > 0.93 ? '#ffd27a' : '#7fd6a4'; g.fillRect(4, 8, bw, 5); g.fillStyle = '#4a3a44'; g.fillRect(4 + bw, 8, 40 - bw, 5);
    (st.gates || []).slice(0, 6).forEach((c, i) => { g.fillStyle = c; g.fillRect(4 + i * 7, 20, 5, 5); }); budT.needsUpdate = true; };
  monitor(11.95, 5.5, budT, 0.9, 0.56, -Math.PI / 2);
  add(sc, new THREE.CylinderGeometry(0.18, 0.14, 0.34, 8), lam('#6a4a3a'), 12, 0.17, 8); add(sc, new THREE.IcosahedronGeometry(0.32, 0), lam('#4a7a4a'), 12, 0.6, 8); B(12, 8);

  // integration bay: the current spacecraft on a turntable
  add(sc, new THREE.CylinderGeometry(1.35, 1.45, 0.24, 24), lam('#4a4c5a'), 6, 0.12, 4);
  add(sc, new THREE.CylinderGeometry(1.2, 1.2, 0.02, 24), lam('#5a5c6c'), 6, 0.25, 4);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#7fd6a4' }); add(sc, new THREE.TorusGeometry(1.38, 0.03, 4, 32), ringMat, 6, 0.24, 4).rotation.x = Math.PI / 2;
  rect(5, 3, 7, 5);
  const turn = new THREE.Group(); turn.position.set(6, 0.26, 4); sc.add(turn);
  const beam = add(sc, new THREE.CylinderGeometry(1.0, 1.2, 2.2, 20, 1, true), addMat('#6a8aff', coneTex, 0.16, THREE.DoubleSide), 6, 1.36, 4);
  const metal = lam('#c8ccd8'), gold = lam('#d8a840'), cell = lam('#2a3a7a'), dark = lam('#24222c'), white = lam('#e8e8ee', { side: THREE.DoubleSide });
  const wing = (p, x, y, z, w, d) => { const m = add(p, BOX(w, 0.02, d), cell, x, y, z); add(m, BOX(w + 0.03, 0.012, 0.02), metal, 0, 0, d / 2); return m; };
  const crafts = {};
  crafts.sentinel = (() => { const g = new THREE.Group(); [-0.75, 0.75].forEach((x) => { add(g, new THREE.CylinderGeometry(0.04, 0.12, 0.35, 6), dark, x, 0.17, 0); add(g, BOX(0.42, 0.5, 0.42), metal, x, 0.6, 0); add(g, BOX(0.43, 0.1, 0.43), gold, x, 0.88, 0); wing(g, x - 0.44, 0.62, 0, 0.45, 0.32); wing(g, x + 0.44, 0.62, 0, 0.45, 0.32); const bm = add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), white, x + 0.1, 1.2, 0); bm.rotation.z = -0.3; add(g, new THREE.SphereGeometry(0.04, 6, 4), gold, x + 0.2, 1.53, 0); }); return g; })();
  crafts.helios = (() => { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.05, 0.12, 0.25, 6), dark, 0, 0.12, 0); add(g, new THREE.CylinderGeometry(0.42, 0.42, 0.7, 6), metal, 0, 0.6, 0); add(g, new THREE.CylinderGeometry(0.43, 0.43, 0.12, 6), gold, 0, 0.98, 0); add(g, new THREE.CylinderGeometry(0.75, 0.75, 0.03, 20), lam('#e8dcb8'), 0, 1.16, 0); wing(g, -0.86, 0.6, 0, 0.9, 0.38); wing(g, 0.86, 0.6, 0, 0.9, 0.38); const dish = add(g, new THREE.SphereGeometry(0.26, 10, 6, 0, Math.PI * 2, 0, 1.0), white, 0, 0.55, 0.46); dish.rotation.x = Math.PI / 2; return g; })();
  crafts.selene = (() => { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.12, 0.12, 1.25, 8), dark, 0, 0.62, 0); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4, p = new THREE.Group(); p.position.set(Math.cos(a) * 0.42, 0.38 + (i % 2) * 0.48, Math.sin(a) * 0.42); p.rotation.y = -a; g.add(p); add(p, new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8), i % 2 ? gold : metal, 0, 0, 0); add(p, BOX(0.02, 0.2, 0.42), cell, 0.21, 0, 0); add(p, new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), white, 0, 0.36, 0); } return g; })();
  crafts.bridge = (() => { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.2, 0.32, 0.22, 10), dark, 0, 0.11, 0); add(g, new THREE.CylinderGeometry(0.42, 0.42, 0.7, 12), lam('#a8acb8'), 0, 0.57, 0); add(g, new THREE.CylinderGeometry(0.12, 0.46, 0.62, 12), white, 0, 1.23, 0); add(g, new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), dark, 0, 1.58, 0); [-1, 1].forEach((s) => { add(g, new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), metal, s * 0.6, 0.57, 0).rotation.z = Math.PI / 2; add(g, new THREE.CylinderGeometry(0.4, 0.4, 0.02, 16), cell, s * 1.0, 0.57, 0).rotation.x = Math.PI / 2; }); return g; })();
  crafts.story = (() => { const g = new THREE.Group(); add(g, new THREE.IcosahedronGeometry(0.45, 0), new THREE.MeshLambertMaterial({ color: '#1a1014', emissive: '#5a0a14' }), 0, 0.9, 0); const r1 = add(g, new THREE.TorusGeometry(0.72, 0.02, 4, 28), new THREE.MeshBasicMaterial({ color: '#ff4a5a' }), 0, 0.9, 0); r1.rotation.x = 1.2; g.userData.spin = r1; return g; })();
  const globeT = ctex(64, 32, (g) => { g.fillStyle = '#123a6a'; g.fillRect(0, 0, 64, 32); const r = rng(5); g.fillStyle = '#2a7a5a'; for (let i = 0; i < 14; i++) g.fillRect(r() * 60 | 0, 6 + r() * 20 | 0, 4 + r() * 8 | 0, 2 + r() * 5 | 0); g.fillStyle = '#ff4a5a'; g.fillRect(0, 3, 64, 2); g.fillRect(0, 27, 64, 2); g.fillStyle = '#e8f0ff'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 30, 64, 2); });
  crafts.ops = (() => { const g = new THREE.Group(); const gl = add(g, new THREE.SphereGeometry(0.6, 16, 10), new THREE.MeshBasicMaterial({ map: globeT, transparent: true, opacity: 0.92 }), 0, 1.0, 0); const orb = new THREE.Group(); orb.position.set(0, 1.0, 0); orb.rotation.x = 0.45; g.add(orb); add(orb, new THREE.TorusGeometry(0.95, 0.008, 3, 40), new THREE.MeshBasicMaterial({ color: '#9ac8ff' }), 0, 0, 0).rotation.x = Math.PI / 2; add(orb, BOX(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: '#fff3e8' }), 0.95, 0, 0); g.userData = { gl, orb }; return g; })();
  Object.values(crafts).forEach((g) => { g.visible = false; turn.add(g); });
  function showCraft() { const id = st.story ? 'story' : st.phase === 'ops' ? 'ops' : crafts[st.mission] ? st.mission : 'sentinel'; Object.entries(crafts).forEach(([k, g]) => (g.visible = k === id)); beam.visible = id === 'ops' || id === 'story'; }

  // stations: desk tiles, a stand tile in front, and a floating marker
  const STN = {
    Kiran: { stand: [2, 1], face: 1, tiles: [[1, 0], [2, 0], [3, 0]], mark: [2, 1.95, 0.1] },
    Mateo: { stand: [10, 1], face: 1, tiles: [[9, 0], [10, 0], [11, 0]], mark: [10, 2.3, 0.1] },
    Leila: { stand: [1, 5], face: 2, tiles: [[0, 5], [0, 6]], mark: [0.15, 2.0, 5.5] },
    Naomi: { stand: [11, 5], face: 3, tiles: [[12, 5], [12, 6]], mark: [11.85, 2.0, 5.5] },
    board: { stand: [6, 1], face: 1, tiles: [[5, 0], [6, 0], [7, 0]], mark: [6, 3.0, -0.2] },
    bay: { stand: [6, 6], face: 1, tiles: [[5, 3], [6, 3], [7, 3], [5, 4], [6, 4], [7, 4], [5, 5], [6, 5], [7, 5]], mark: [6, 2.55, 4] },
  };
  const tileOf = {}; Object.entries(STN).forEach(([id, s]) => s.tiles.forEach(([x, z]) => (tileOf[key(x, z)] = id)));
  const MC = { Kiran: '#9ae0c0', Mateo: '#ffd27a', Leila: '#9ac8ff', Naomi: '#ffb0c8', board: '#ff7a6b', bay: '#ff7a6b' };
  const markTex = (col) => ctex(9, 9, (g) => { g.fillStyle = '#120e18'; [[4, 0, 1], [3, 1, 3], [2, 2, 5], [1, 3, 7], [0, 4, 9], [1, 5, 7], [2, 6, 5], [3, 7, 3], [4, 8, 1]].forEach(([x, y, w]) => g.fillRect(x, y, w, 1)); g.fillStyle = col; [[4, 1, 1], [3, 2, 3], [2, 3, 5], [1, 4, 7], [2, 5, 5], [3, 6, 3], [4, 7, 1]].forEach(([x, y, w]) => g.fillRect(x, y, w, 1)); g.fillStyle = '#ffffff'; g.fillRect(3, 3, 1, 1); });
  const markers = {}; Object.entries(STN).forEach(([id, s]) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: markTex(MC[id]), transparent: true, alphaTest: 0.3 })); m.center.set(0.5, 0); const [x, y, z] = s.mark; m.position.set(x, y, z); m.userData = { y, ph: x }; sc.add(m); markers[id] = m; });
  const pickMat = new THREE.MeshBasicMaterial({ visible: false }), pick = [];
  [['Kiran', 2, 1.1, 0.05, 3, 2.2, 1.1], ['Mateo', 10, 1.1, 0.05, 3, 2.2, 1.1], ['board', 6, 1.5, -0.1, 3.6, 3, 1], ['Leila', 0, 1.1, 5.5, 1, 2.2, 2], ['Naomi', 12, 1.1, 5.5, 1, 2.2, 2], ['bay', 6, 1, 4, 3, 2, 3]].forEach(([id, x, y, z, w, h, d]) => { const m = add(sc, BOX(w, h, d), pickMat, x, y, z); m.userData.station = id; pick.push(m); });

  // crew
  const bub = (glyph) => ctex(11, 11, (g) => { g.fillStyle = '#120e18'; g.fillRect(1, 0, 9, 9); g.fillRect(0, 1, 11, 7); g.fillRect(4, 9, 3, 1); g.fillRect(5, 10, 1, 1); g.fillStyle = '#fff3e8'; g.fillRect(1, 1, 9, 7); g.fillRect(2, 0, 7, 1); g.fillRect(2, 8, 7, 1); g.fillRect(5, 9, 1, 1); glyph(g); });
  const BUB = {
    need: bub((g) => { g.fillStyle = '#c23440'; g.fillRect(5, 2, 1, 4); g.fillRect(5, 7, 1, 1); }),
    ready: bub((g) => { g.fillStyle = '#2c8a5a'; [[2, 4], [3, 5], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2]].forEach(([x, y]) => g.fillRect(x, y, 1, 1)); }),
    work: bub((g) => { g.fillStyle = '#5a4a6a'; [3, 5, 7].forEach((x) => g.fillRect(x, 4, 1, 1)); }),
  };
  const crew = {};
  function place(a, x, z, dir) { a.x = a.tx = x; a.z = a.tz = z; a.dir = dir; a.moving = false; a.p = 0; a.f = 0; a.g.position.set(x, 0, z); showFrame(a); }
  ROLES.forEach((r) => { const a = actor(FR[r.toLowerCase()], 1.5); a.role = r; a.waitT = 2 + Math.random() * 6; a.bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: BUB.work, alphaTest: 0.5 })); a.bub.center.set(0.5, 0); a.bub.scale.set(0.34, 0.34, 1); a.bub.position.y = 1.58; a.bub.visible = false; a.g.add(a.bub); sc.add(a.g); crew[r] = a; const [x, z] = STN[r].stand; place(a, x, z, STN[r].face); });
  const occupied = (x, z, self) => ROLES.some((r) => { const a = crew[r]; return a !== self && ((a.x === x && a.z === z) || (a.tx === x && a.tz === z)); });
  function bfs(sx, sz, tx, tz) {
    if (sx === tx && sz === tz) return [];
    const prev = new Map([[key(sx, sz), null]]), q = [[sx, sz]];
    while (q.length) { const [x, z] = q.shift(); for (const [dx, dz] of DV) { const nx = x + dx, nz = z + dz, k = key(nx, nz); if (prev.has(k) || hardBlocked(nx, nz)) continue; prev.set(k, [x, z]);
      if (nx === tx && nz === tz) { const path = [[nx, nz]]; let c = [x, z]; while (!(c[0] === sx && c[1] === sz)) { path.unshift(c); c = prev.get(key(c[0], c[1])); } return path; }
      q.push([nx, nz]); } }
    return null;
  }
  function stepPath(a) { const [nx, nz] = a.path[0]; if (occupied(nx, nz, a)) return false; a.path.shift(); a.dir = nx > a.x ? 3 : nx < a.x ? 2 : nz > a.z ? 0 : 1; a.tx = nx; a.tz = nz; a.moving = true; a.p = 0; return true; }
  function moveActor(a, dt, speed) {
    if (a.moving) { a.p += dt * speed; if (a.p >= 1) { a.x = a.tx; a.z = a.tz; a.moving = false; a.parity ^= 1; a.p = 0; } }
    const k = a.moving ? a.p : 0; a.g.position.set(lerp(a.x, a.tx, k), 0, lerp(a.z, a.tz, k));
    a.f = a.moving ? (a.p < 0.5 ? (a.parity ? 1 : 3) : 0) : 0; showFrame(a);
  }

  // player
  const held = []; let run = false, paused = false, P = null, pending = null, started = false;
  const faceTo = (id) => { for (let d = 0; d < 4; d++) if (tileOf[key(P.x + DV[d][0], P.z + DV[d][1])] === id) return d; return STN[id].face; };
  function nearStation() { const f = tileOf[key(P.x + DV[P.dir][0], P.z + DV[P.dir][1])]; if (f) return f; for (const [dx, dz] of DV) { const id = tileOf[key(P.x + dx, P.z + dz)]; if (id) return id; } return null; }
  function open(id) { P.dir = faceTo(id); showFrame(P); H.onStation && H.onStation(id); }
  function goTo(id) {
    const s = STN[id]; if (!s || !P) return; const sx = P.moving ? P.tx : P.x, sz = P.moving ? P.tz : P.z; let best = null; const seen = new Set();
    s.tiles.forEach(([tx, tz]) => DV.forEach(([dx, dz]) => { const x = tx + dx, z = tz + dz, k = key(x, z); if (seen.has(k) || hardBlocked(x, z) || occupied(x, z, P)) return; seen.add(k); const p = bfs(sx, sz, x, z); if (p && (!best || p.length < best.length)) best = p; }));
    if (!best) return; P.path = best; pending = id; held.length = 0;
  }
  function interact() { if (curSet) { if (!paused) H.onStation && H.onStation('bay'); return; } if (!P || paused || P.moving) return; const id = nearStation(); if (id) open(id); }
  function updPlayer(dt) {
    if (!P.moving && !paused) {
      if (held.length) { P.path = null; pending = null; const d = held[held.length - 1]; P.dir = d; const nx = P.x + DV[d][0], nz = P.z + DV[d][1]; if (!hardBlocked(nx, nz) && !occupied(nx, nz, P)) { P.tx = nx; P.tz = nz; P.moving = true; P.p = 0; } }
      else if (P.path && P.path.length) { if (stepPath(P)) P.waitT2 = 0; else if ((P.waitT2 = (P.waitT2 || 0) + dt) > 1.2) { P.path = null; pending = null; } }
      else if (P.path) { P.path = null; if (pending) { const id = pending; pending = null; open(id); } }
    }
    moveActor(P, dt, run ? 7 : 4.2);
  }
  const SPOTS = [[4, 2], [8, 2], [5, 2], [7, 2], [4, 6], [8, 6], [3, 4], [9, 4]];
  function updNPC(a, dt) {
    if (!a.moving) {
      if (a.path && a.path.length) { if (stepPath(a)) a.waitT2 = 0; else if ((a.waitT2 = (a.waitT2 || 0) + dt) > 1.5) { a.path = null; a.waitT2 = 0; } }
      else { a.path = null; const [hx, hz] = STN[a.role].stand;
        if (a.x !== hx || a.z !== hz) { a.dir = 1; if ((a.waitT -= dt) <= 0) { a.path = bfs(a.x, a.z, hx, hz) || []; a.waitT = 7 + Math.random() * 9; } }
        else { a.dir = STN[a.role].face; if ((a.waitT -= dt) <= 0) { a.waitT = 2.5 + Math.random() * 2; if (st.phase === 'design' && !st.story && st.crew[a.role] !== 'need') { const s = SPOTS[(Math.random() * SPOTS.length) | 0]; a.path = bfs(a.x, a.z, s[0], s[1]); } else a.waitT = 6; } } }
    }
    moveActor(a, dt, 3.2);
  }

  // camera follows the player inside the hall
  const cam = { x: 6, z: 4.2 };
  function camUpdate(dt, snap) {
    const asp = camera.aspect || 1.6, far = clamp(1.7 / asp, 1, 1.7), fov = 38;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    const px = P ? P.g.position.x : 6, pz = P ? P.g.position.z : 4, k = snap ? 1 : 1 - Math.exp(-dt * 3), span = asp < 1.2 ? 3.2 : asp < 1.6 ? 1.6 : 1;
    cam.x = lerp(cam.x, clamp(px, 6 - span, 6 + span), k); cam.z = lerp(cam.z, asp < 1.2 ? clamp(pz, 3, 5.4) : 4.2, k);
    camera.position.set(cam.x, 7.9 * far, cam.z + 8.8 * far); camera.lookAt(cam.x, 0.9, cam.z - 0.7);
  }

  // input: keyboard + click/tap to walk
  const KEYS = { ArrowDown: 0, s: 0, S: 0, ArrowUp: 1, w: 1, W: 1, ArrowLeft: 2, a: 2, A: 2, ArrowRight: 3, d: 3, D: 3 };
  const inField = (e) => !!(e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable="true"]'));
  const onBtn = (e) => !!(e.target && e.target.closest && e.target.closest('button,a'));
  const kd = (e) => { if (paused || inField(e)) return; if (e.key in KEYS) { e.preventDefault(); const d = KEYS[e.key]; if (!held.includes(d)) held.push(d); } else if (e.key === 'Shift') run = true; else if ((e.key === 'e' || e.key === 'E' || ((e.key === 'Enter' || e.key === ' ') && !onBtn(e))) && !e.repeat) { e.preventDefault(); interact(); } };
  const ku = (e) => { if (e.key in KEYS) { const i = held.indexOf(KEYS[e.key]); if (i >= 0) held.splice(i, 1); } else if (e.key === 'Shift') run = false; };
  const blur = () => { held.length = 0; run = false; };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floorP = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  const aim = (e) => { const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(pick, false); return h.length ? h[0].object.userData.station : null; };
  const pdown = (e) => { if (curSet) { if (!paused) H.onStation && H.onStation('bay'); return; } if (paused || !P) return; const id = aim(e); if (id) { goTo(id); return; } if (!ray.ray.intersectPlane(floorP, hit)) return; const x = Math.round(hit.x), z = Math.round(hit.z); if (tileOf[key(x, z)]) { goTo(tileOf[key(x, z)]); return; } if (hardBlocked(x, z)) return; const p = bfs(P.moving ? P.tx : P.x, P.moving ? P.tz : P.z, x, z); if (p) { P.path = p; pending = null; held.length = 0; } };
  const pmove = (e) => { if (e.pointerType === 'mouse') cv.style.cursor = !paused && aim(e) ? 'pointer' : 'default'; };
  cv.addEventListener('pointerdown', pdown); cv.addEventListener('pointermove', pmove);

  let last = performance.now(), raf = 0, T = 0, drawT = 1, prompt;
  // ---------- story sets: 2.5D dioramas for story events (office, hospital, archive, lab, briefing, cabin) ----------
  FR.voss = charFrames({ hair: '#d0ced4', hair2: '#9a98a2', skin: '#dcae8e', shirt: '#1c1a24', shirt2: '#100e16', tee: '#ece8f0', print: '#8a1a2a', print2: '#b02a3a', pants: '#16141c', shoe: '#0c0a10', eye: '#1a1420' });
  FR.evelyn = charFrames({ hair: '#7a6a62', hair2: '#a89890', skin: '#e0b494', shirt: '#5a6a7a', shirt2: '#44525e', tee: '#e8e4dc', pants: '#3a3a44', shoe: '#2a2228', eye: '#1a1420', glasses: '#3a3034', lens: '#c8d0e0', bun: true });
  FR.mercer = charFrames({ hair: '#e6e2da', hair2: '#b8b4ac', skin: '#e2b294', shirt: '#7a6a54', shirt2: '#5a4c3c', tee: '#d8d0c0', pants: '#3a3430', shoe: '#2a2018', eye: '#1a1420', glasses: '#3a3a44', lens: '#c8d0e0' });
  BUB.talk = bub((g) => { g.fillStyle = '#3a3048'; g.fillRect(2, 3, 7, 1); g.fillRect(2, 5, 5, 1); });
  const setLights = (s, bg, amb, key) => { s.background = new THREE.Color(bg); s.add(new THREE.AmbientLight(amb, 1.25)); s.add(new THREE.HemisphereLight('#ffe8e0', '#1a1828', 0.55)); const d = new THREE.DirectionalLight(key || '#ffe4d8', 0.85); d.position.set(3, 8, 9); s.add(d); };
  const tileTex = (a, b, line, seed) => ctex(176, 128, (g, w, h) => { const r = rng(seed); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.fillStyle = ((x + y) / 16) % 2 ? a : b; g.fillRect(x, y, 16, 16); g.fillStyle = line; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16); } for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? line : b; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); } });
  function shell(s, W, D, fTex, wall, trim) {
    const f = add(s, new THREE.PlaneGeometry(W + 1, D + 1), lam('#ffffff', { map: fTex }), W / 2, 0, D / 2); f.rotation.x = -Math.PI / 2;
    const wm = lam(wall); add(s, BOX(W + 2, 3.2, 0.4), wm, W / 2, 1.6, -0.7); add(s, BOX(0.4, 3.2, D + 1.4), wm, -0.7, 1.6, D / 2 - 0.2); add(s, BOX(0.4, 3.2, D + 1.4), wm, W + 0.7, 1.6, D / 2 - 0.2);
    add(s, BOX(W + 2, 0.12, 0.42), lam(trim), W / 2, 0.06, -0.48);
  }
  const winSky = (s, x, y, w, h) => { add(s, BOX(w + 0.16, h + 0.16, 0.08), lam('#14121a'), x, y, -0.46); add(s, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyT }), x, y, -0.41); };
  const scr = (s, x, y, z, w, h, tex) => { add(s, BOX(w + 0.1, h + 0.1, 0.04), lam('#101016'), x, y, z - 0.03); return add(s, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), x, y, z); };
  const ecgT = ctex(48, 24, () => {});
  const drawEcg = (t) => { const g = ecgT.userData.g; g.fillStyle = '#06120c'; g.fillRect(0, 0, 48, 24); g.fillStyle = '#0e2a1a'; for (let x = 0; x < 48; x += 6) g.fillRect(x, 0, 1, 24);
    for (let x = 0; x < 48; x++) { const ph = (x + t * 18) % 24, v = ph > 10 && ph < 11 ? -8 : ph >= 11 && ph < 12 ? 6 : ph > 14 && ph < 17 ? -2 : 0; g.fillStyle = '#5aff9a'; g.fillRect(x, 13 + v, 1, 1); } ecgT.needsUpdate = true; };
  const portT = ctex(48, 48, () => {});
  const drawPort = (v, t) => { const g = portT.userData.g; g.fillStyle = v === 'pad' ? '#6a9ad0' : '#03040a'; g.fillRect(0, 0, 48, 48);
    if (v !== 'pad') for (let i = 0; i < 40; i++) { g.fillStyle = i % 4 ? '#3a4a6a' : '#c8d0e8'; g.fillRect((i * 37) % 48, (i * 23 + 5) % 48, 1, 1); }
    const disc = (cx, cy, r, c1, c2) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) { g.fillStyle = x + y * 0.6 > r * 0.4 ? c2 : c1; g.fillRect(cx + x, cy + y, 1, 1); } };
    if (v === 'pad') { g.fillStyle = '#9ac0e8'; g.fillRect(0, 30, 48, 18); g.fillStyle = '#3a3a44'; g.fillRect(30, 6, 4, 42); for (let y = 8; y < 46; y += 4) g.fillRect(28, y, 8, 1); g.fillStyle = '#e8e4dc'; g.fillRect(18, 4, 8, 44); g.fillStyle = '#c23440'; g.fillRect(18, 4, 8, 3); }
    else if (v === 'earth') { disc(24, 26, 15, '#1e5aa8', '#0e2a58'); g.fillStyle = '#3a9a6a'; g.fillRect(18, 20, 6, 4); g.fillRect(27, 28, 5, 5); }
    else if (v === 'moon') disc(26, 24, 14, '#a8a8b4', '#5a5a66');
    else if (v === 'sun') { disc(10, 12, 7, '#fff0c0', '#ffb050'); if (Math.sin(t * 6) > 0) { g.fillStyle = '#ff4a5a'; g.fillRect(0, 0, 48, 2); g.fillRect(0, 46, 48, 2); } }
    else { for (let x = 0; x < 48; x++) { const a = 0.5 + 0.5 * Math.sin(x * 0.3 + t * 1.2); g.fillStyle = `rgba(255,74,90,${(0.25 + a * 0.5).toFixed(2)})`; g.fillRect(x, (18 + Math.sin(x * 0.2 + t) * 4) | 0, 1, (6 + a * 6) | 0); } disc(40, 40, 5, '#1e5aa8', '#0e2a58'); }
    portT.needsUpdate = true; };
  const lakeT = ctex(48, 16, (g) => { const gr = g.createLinearGradient(0, 0, 0, 16); gr.addColorStop(0, '#5a1424'); gr.addColorStop(0.5, '#c0503a'); gr.addColorStop(0.62, '#6a7a90'); gr.addColorStop(1, '#2a3a50'); g.fillStyle = gr; g.fillRect(0, 0, 48, 16); g.fillStyle = '#3a3040'; [[0, 7, 10], [12, 8, 8], [30, 6, 7], [40, 8, 8]].forEach(([x, y, w]) => g.fillRect(x, y, w, 3)); g.fillStyle = '#e8e0ff'; g.fillRect(22, 4, 1, 6); });
  const SET = {};
  SET.office = (() => { const s = new THREE.Scene(); setLights(s, '#08070c', '#b0acd0'); shell(s, 10, 6, tileTex('#1e1a24', '#221e28', '#16121c', 3), '#1c1a24', '#3a2a24');
    winSky(s, 5, 1.9, 9.4, 2.6); for (let i = 1; i < 6; i++) add(s, BOX(0.06, 2.6, 0.06), lam('#14121a'), 0.3 + i * 1.57, 1.9, -0.38);
    add(s, BOX(2.8, 0.74, 0.9), lam('#2a1e1a'), 5, 0.37, 1.3); add(s, BOX(2.9, 0.05, 1.0), lam('#4a3428'), 5, 0.76, 1.3); add(s, BOX(0.5, 0.02, 0.32), lam('#e8e4dc'), 4.6, 0.79, 1.2);
    add(s, new THREE.CylinderGeometry(0.18, 0.14, 0.34, 8), lam('#3a2a24'), 0.4, 0.17, 4.6); add(s, new THREE.IcosahedronGeometry(0.34, 0), lam('#2a5a3a'), 0.4, 0.62, 4.6);
    const gl = add(s, new THREE.PlaneGeometry(3.5, 2), addMat('#ffd8a0', rectGlowTex, 0.22), 5, 0.012, 1.8); gl.rotation.x = -Math.PI / 2;
    return { s, W: 10, D: 6, host: ['Voss', 5, 0.3, 0], spots: [[3.4, 2.4, 3], [6.6, 2.4, 2], [3.2, 3.5, 3], [6.8, 3.5, 2], [5, 3.9, 1]] }; })();
  SET.hospital = (() => { const s = new THREE.Scene(); setLights(s, '#0c0e12', '#b8c0cc', '#fff4e8'); shell(s, 8, 6, tileTex('#c8ccd2', '#bcc0c8', '#a8acb4', 5), '#a8b8bc', '#7a8a90');
    winSky(s, 5.6, 1.9, 3.2, 1.3);
    add(s, BOX(1.1, 0.5, 2.2), lam('#d8dce4'), 2.2, 0.25, 1.6); add(s, BOX(1.15, 0.12, 1.5), lam('#6a8ab8'), 2.2, 0.56, 2.0); add(s, BOX(0.8, 0.12, 0.4), lam('#f4f4f8'), 2.2, 0.56, 0.75); add(s, BOX(1.2, 0.8, 0.08), lam('#8a96a0'), 2.2, 0.6, 0.48);
    add(s, BOX(0.26, 0.22, 0.24), lam('#c08860'), 2.2, 0.72, 0.8); add(s, BOX(0.3, 0.1, 0.28), lam('#3a2a24'), 2.2, 0.86, 0.76);
    add(s, new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), lam('#a8acb4'), 3.2, 0.75, 0.7); scr(s, 3.2, 1.6, 0.74, 0.6, 0.32, ecgT); add(s, BOX(0.5, 0.45, 0.5), lam('#5a6a7a'), 4.2, 0.23, 2.6);
    return { s, W: 8, D: 6, skip: ['Elena'], spots: [[3.4, 1.9, 2], [4.4, 3.2, 2], [5.4, 3.4, 2], [6.2, 2.6, 2], [3.6, 4, 1]], upd: (t) => drawEcg(t) }; })();
  SET.archive = (() => { const s = new THREE.Scene(); setLights(s, '#07060a', '#8a8070', '#ffd8a0'); shell(s, 10, 7, tileTex('#2a2620', '#26221c', '#1e1a16', 7), '#2a2622', '#3a2a20');
    const bx = lam('#8a7a5a'), bx2 = lam('#6a5a40'), shelf = lam('#3a3a40');
    const rack = (x, z, w) => { add(s, BOX(w, 2.2, 0.5), shelf, x, 1.1, z); for (let k = 0; k < 4; k++) for (let i = 0; i < Math.floor(w * 2.4); i++) add(s, BOX(0.32, 0.3, 0.42), (i + k) % 3 ? bx : bx2, x - w / 2 + 0.22 + i * 0.4, 0.25 + k * 0.52, z + 0.06); };
    rack(2.5, -0.1, 4); rack(7.5, -0.1, 4); rack(1.4, 5.2, 2.4); rack(8.6, 5.2, 2.4);
    add(s, BOX(1.8, 0.74, 0.8), lam('#4a3a2c'), 5, 0.37, 2.0); scr(s, 5.3, 1.12, 1.78, 0.6, 0.38, codeT);
    [[4.5, 1.98, 0.3], [4.8, 2.05, -0.4]].forEach(([x, z, r]) => (add(s, BOX(0.24, 0.01, 0.32), lam('#ecebe4'), x, 0.76, z).rotation.y = r));
    const lp = new THREE.PointLight('#ffd8a0', 5, 5, 1.5); lp.position.set(5, 2.4, 2.4); s.add(lp);
    const pool = add(s, new THREE.PlaneGeometry(3, 3), addMat('#ffd8a0', radialTex, 0.3), 5, 0.012, 2.6); pool.rotation.x = -Math.PI / 2;
    return { s, W: 10, D: 7, host: ['Evelyn', 5.6, 1.4, 0], spots: [[4.4, 2.9, 1], [5.6, 3.1, 1], [3.4, 3.4, 3], [6.6, 3.4, 2], [5, 4.4, 1]] }; })();
  SET.lab = (() => { const s = new THREE.Scene(); setLights(s, '#06060a', '#6a6e94', '#c8d0ff'); shell(s, 10, 6, tileTex('#5a5e5c', '#525654', '#444846', 9), '#5a5c66', '#2a2834');
    winSky(s, 8.2, 1.85, 2.6, 1.1);
    [3, 6].forEach((x) => { add(s, BOX(2.6, 0.06, 0.8), lam('#6a6a74'), x, 0.76, 0.6); add(s, BOX(2.5, 0.7, 0.7), lam('#3a3a44'), x, 0.36, 0.6); });
    scr(s, 2.6, 1.3, 0.58, 0.8, 0.5, codeT); scr(s, 3.6, 1.32, 0.58, 0.9, 0.56, waveT); scr(s, 6, 1.3, 0.58, 0.8, 0.5, codeT);
    const sl = new THREE.PointLight('#7ab8ff', 3, 4, 1.6); sl.position.set(3.2, 1.4, 1.4); s.add(sl);
    return { s, W: 10, D: 6, spots: [[3.2, 1.6, 1], [5.2, 2.8, 2], [6.4, 2.4, 2], [2, 2.8, 3], [7.4, 3, 2]] }; })();
  SET.briefing = (() => { const s = new THREE.Scene(); setLights(s, '#0a0a10', '#a0a4c4'); shell(s, 10, 6, tileTex('#3a3448', '#36304a', '#2a2438', 11), '#2e2c3a', '#c8a050');
    add(s, BOX(3.6, 1.2, 0.08), lam('#14121a'), 7.6, 1.8, -0.46); add(s, new THREE.PlaneGeometry(3.44, 1.06), new THREE.MeshBasicMaterial({ map: lakeT }), 7.6, 1.8, -0.41);
    scr(s, 2.6, 1.8, -0.4, 2.6, 1.4, scrT);
    add(s, BOX(4.6, 0.06, 1.5), lam('#5a4a3c'), 5, 0.74, 2.8); add(s, BOX(4.4, 0.7, 1.3), lam('#3a2e26'), 5, 0.36, 2.8);
    return { s, W: 10, D: 6, spots: [[3.6, 1.9, 0], [5, 1.9, 0], [6.4, 1.9, 0], [3.6, 3.8, 1], [5, 3.8, 1], [6.4, 3.8, 1], [2.2, 2.8, 3], [7.8, 2.8, 2]] }; })();
  SET.cabin = (() => { const s = new THREE.Scene(); setLights(s, '#050608', '#9aa0b8', '#e8eeff'); shell(s, 8, 5, tileTex('#3a3e48', '#363a44', '#2a2e36', 13), '#4a4e5a', '#2a2e36');
    add(s, new THREE.CircleGeometry(1.15, 28), lam('#22252e'), 4, 1.75, -0.47); add(s, new THREE.CircleGeometry(1.0, 28), new THREE.MeshBasicMaterial({ map: portT }), 4, 1.75, -0.45);
    const leds = []; [1.3, 6.7].forEach((x) => { add(s, BOX(1.8, 0.9, 0.7), lam('#2a2e38'), x, 0.45, 0.6); add(s, BOX(1.8, 0.05, 0.74), lam('#5a6070'), x, 0.92, 0.6); for (let i = 0; i < 6; i++) { const m = new THREE.MeshBasicMaterial({ color: '#40e080' }); add(s, BOX(0.12, 0.03, 0.08), m, x - 0.6 + i * 0.24, 0.96, 0.75); leds.push(m); } });
    scr(s, 1.3, 1.5, 0.32, 0.9, 0.5, trackT); scr(s, 6.7, 1.5, 0.32, 0.9, 0.5, waveT);
    const al = new THREE.PointLight('#ff3a4a', 0, 8, 1.4); al.position.set(4, 2.6, 2); s.add(al);
    return { s, W: 8, D: 5, spots: [[2.6, 2.2, 0], [3.6, 2.6, 0], [4.6, 2.6, 0], [5.6, 2.2, 0], [4, 3.6, 1]],
      upd: (t, v) => { drawPort(v || 'earth', t); al.intensity = v === 'sun' || v === 'tail' ? 3 + Math.sin(t * 5) * 2.5 : 0; leds.forEach((m, i) => m.color.set(Math.sin(t * 3 + i * 1.3) > 0.3 ? (v === 'sun' ? '#ff4a5a' : '#40e080') : '#1a2a20')); } }; })();
  const aptT = ctex(48, 20, () => {});
  const drawApt = (v, t) => { const g = aptT.userData.g, day = v === 'pad', gr = g.createLinearGradient(0, 0, 0, 20);
    if (day) { gr.addColorStop(0, '#4a7ab8'); gr.addColorStop(1, '#c8dcf0'); } else { gr.addColorStop(0, '#1a0410'); gr.addColorStop(0.6, '#6a1020'); gr.addColorStop(1, '#c0402e'); }
    g.fillStyle = gr; g.fillRect(0, 0, 48, 20);
    if (!day) for (let x = 0; x < 48; x++) { const a = 0.5 + 0.5 * Math.sin(x * 0.25 + t * 0.8); g.fillStyle = `rgba(255,80,96,${(0.2 + a * 0.45).toFixed(2)})`; g.fillRect(x, (3 + Math.sin(x * 0.18 + t * 0.6) * 2) | 0, 1, (3 + a * 4) | 0); }
    else { g.fillStyle = '#f4f0e8'; g.fillRect(30, 4, 1, 9); g.fillStyle = 'rgba(244,240,232,.5)'; g.fillRect(29, 9, 3, 5); }
    g.fillStyle = day ? '#5a6478' : '#140c16'; [[0, 12, 6], [6, 10, 5], [11, 13, 7], [18, 9, 4], [22, 11, 8], [32, 8, 5], [37, 12, 6], [43, 10, 5]].forEach(([x, y, w]) => g.fillRect(x, y, w, 20 - y));
    if (!day) { g.fillStyle = '#ffd27a'; for (let i = 0; i < 18; i++) g.fillRect((i * 29) % 48, 11 + ((i * 7) % 8), 1, 1); }
    aptT.needsUpdate = true; };
  SET.apartment = (() => { const s = new THREE.Scene(); setLights(s, '#0a080c', '#c4b4b0', '#ffe8d0'); shell(s, 8, 5, tileTex('#6a4a36', '#644432', '#4a3426', 15), '#7a6a5c', '#4a3426');
    add(s, BOX(3.36, 1.56, 0.08), lam('#2a2228'), 5.4, 1.8, -0.46); add(s, new THREE.PlaneGeometry(3.2, 1.4), new THREE.MeshBasicMaterial({ map: aptT }), 5.4, 1.8, -0.41); add(s, BOX(0.06, 1.4, 0.04), lam('#2a2228'), 5.4, 1.8, -0.39);
    add(s, BOX(1.6, 0.5, 0.5), lam('#3a2e2a'), 1.7, 0.25, 0.1); scr(s, 1.7, 1.05, 0.2, 1.1, 0.8, portT);
    add(s, BOX(2.4, 0.45, 0.8), lam('#7a3a3a'), 3.4, 0.22, 3.6); add(s, BOX(2.4, 0.5, 0.2), lam('#6a3030'), 3.4, 0.6, 3.95);
    const rug = add(s, new THREE.PlaneGeometry(3, 1.8), lam('#8a5a4a'), 3.6, 0.01, 2.4); rug.rotation.x = -Math.PI / 2;
    add(s, BOX(0.8, 0.5, 0.5), lam('#4a3a30'), 7.3, 0.25, 1.2); add(s, BOX(0.3, 0.03, 0.22), lam('#e8d8a0'), 7.2, 0.52, 1.2);
    const lp = new THREE.PointLight('#ffd8a0', 3, 5, 1.6); lp.position.set(1, 1.8, 2.6); s.add(lp);
    return { s, W: 8, D: 5, spots: [[5.0, 1.5, 1], [4.0, 1.7, 1], [2.6, 2.6, 3], [6.4, 2.6, 2]], upd: (t, v) => { drawApt(v, t); drawPort(v === 'pad' ? 'pad' : 'moon', t); } }; })();
  let curSet = null;
  const HGT = { lucas: 1.3, voss: 1.62, mateo: 1.6, evelyn: 1.42 };
  function applySet() {
    curSet = st.set && SET[st.set] ? SET[st.set] : null; if (!curSet) return;
    const C = curSet; C.actors = C.actors || {}; Object.values(C.actors).forEach((a) => (a.g.visible = false));
    const want = [...(C.host && st.variant !== 'nohost' ? [C.host[0]] : []), ...(st.cast || [])].filter((n, i, arr) => arr.indexOf(n) === i && FR[n.toLowerCase()] && !(C.skip || []).includes(n));
    let k = 0;
    want.forEach((n) => {
      let a = C.actors[n];
      if (!a) { const key = n.toLowerCase(); a = actor(FR[key], HGT[key] || 1.5); a.bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: BUB.talk, alphaTest: 0.5 })); a.bub.center.set(0.5, 0); a.bub.scale.set(0.34, 0.34, 1); a.bub.visible = false; a.g.add(a.bub); C.s.add(a.g); C.actors[n] = a; }
      const sp = C.host && C.host[0] === n ? C.host.slice(1) : C.spots[k++ % C.spots.length];
      a.g.visible = true; a.home = sp; a.x = a.tx = sp[0]; a.z = a.tz = sp[1]; a.dir = sp[2]; a.f = 0; a.g.position.set(sp[0], 0, sp[1]); showFrame(a);
    });
  }
  function camSet() {
    const C = curSet, asp = camera.aspect || 1.6, far = clamp(1.6 / asp, 1, 1.8) * (0.55 + C.W / 22);
    if (Math.abs(camera.fov - 38) > 0.01) { camera.fov = 38; camera.updateProjectionMatrix(); }
    camera.position.set(C.W / 2 + Math.sin(T * 0.15) * 0.5, 5.2 * far, C.D + 4.4 * far); camera.lookAt(C.W / 2, 0.9, C.D / 2 - 0.6);
  }
  function frameSet(dt) {
    const C = curSet;
    if ((drawT += dt) > 0.1) { drawT = 0; drawScreen(T); drawSky(T); drawWave(T); drawTrack(T); C.upd && C.upd(T, st.variant); }
    Object.entries(C.actors || {}).forEach(([n, a]) => { if (!a.g.visible) return; const on = st.speaker === n; a.bub.visible = on; if (on) a.bub.position.y = (HGT[n.toLowerCase()] || 1.5) + 0.1 + Math.abs(Math.sin(T * 5)) * 0.06; a.dir = on ? 0 : a.home[2]; showFrame(a); });
    if (prompt !== 'event') { prompt = 'event'; H.onPrompt && H.onPrompt('event'); }
    camSet(); renderer.render(C.s, camera);
  }

  // loop
  function frame(now) {
    raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt; if (!P) return;
    if (curSet) { frameSet(dt); return; }
    updPlayer(dt); ROLES.forEach((r) => { if (crew[r] !== P) updNPC(crew[r], dt); });
    Object.entries(markers).forEach(([id, m]) => { const hi = !!st.highlight[id]; m.position.y = m.userData.y + Math.sin(T * (hi ? 4 : 2) + m.userData.ph) * (hi ? 0.08 : 0.04); const s = hi ? 0.36 + Math.sin(T * 6) * 0.04 : 0.24; m.scale.set(s, s, 1); m.material.opacity = hi ? 1 : 0.55; });
    ROLES.forEach((r) => { const a = crew[r], tag = st.crew[r]; a.bub.visible = !!tag && !(a === P && tag !== 'need'); if (tag && BUB[tag]) a.bub.material.map = BUB[tag]; a.bub.position.y = 1.58 + (tag === 'need' ? Math.abs(Math.sin(T * 5)) * 0.08 : 0); });
    turn.rotation.y += dt * (st.phase === 'ops' ? 0.25 : 0.35);
    if (crafts.ops.visible) { crafts.ops.userData.gl.rotation.y += dt * 0.4; crafts.ops.userData.orb.rotation.y += dt * 1.1; }
    if (crafts.story.visible) crafts.story.userData.spin.rotation.z += dt * 0.8;
    ringMat.color.set(st.red || st.alert ? (Math.sin(T * 4) > 0 ? '#ff4a5a' : '#6a1a24') : st.phase === 'ops' ? '#9ac8ff' : '#7fd6a4');
    redL.intensity = 3.5 + Math.sin(T * 0.9) * 1.2;
    if ((drawT += dt) > 0.1) { drawT = 0; drawScreen(T); drawSky(T); drawWave(T); drawTrack(T); drawBudget(); boardLeds.forEach((m, i) => m.color.set(st.gates[i] || '#2a2834')); }
    const p = paused || P.moving || (P.path && P.path.length) ? null : nearStation(); if (p !== prompt) { prompt = p; H.onPrompt && H.onPrompt(p); }
    camUpdate(dt); renderer.render(sc, camera);
  }
  raf = requestAnimationFrame(frame);

  function set(n) {
    Object.assign(st, n); st.crew = st.crew || {}; st.highlight = st.highlight || {}; st.gates = st.gates || [];
    paused = !!st.paused; if (paused) { held.length = 0; run = false; }
    const want = crew[st.player] || crew.Kiran;
    if (want !== P) { if (P) { P.path = null; pending = null; } P = want; P.path = null; if (!started) { started = true; place(P, 6, 7, 1); camUpdate(0, true); } }
    showCraft(); applySet();
  }
  function destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); cv.remove(); }
  return { set, goTo, interact, destroy };
}
