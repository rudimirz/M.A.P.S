// The Last Field — 2.5D engine (from the 0217 Overworld): low-poly world, billboard pixel sprites, grid movement,
// plus hooks for illustrated cinematics and the Chapter One analysis minigames.
export function createGame(THREE, o) {
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
    elena: { hair: '#5a4a48', hair2: '#a8a0a0', skin: '#c8906a', shirt: '#8a5a4a', shirt2: '#6a4438', tee: '#d8c8b0', pants: '#4a3a44', shoe: '#2a2020', eye: '#1a1014', blush: '#a8704c', bun: true },
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

  // ---------- scene scaffolding ----------
  const scenes = {};
  function newScene(name, x0, z0, W, D) {
    const S = { name, scene: new THREE.Scene(), x0, z0, W, D, block: new Set(), interact: {}, warps: {}, actors: [], winMats: [], lamps: [], update() {}, onEnter() {} };
    S.blocked = (x, z) => x < S.x0 || z < S.z0 || x > S.W || z > S.D || S.block.has(x + ',' + z) || (S.cblock && S.cblock[F.ch] && S.cblock[F.ch].has(x + ',' + z)) || S.actors.some((a) => a.solid && a.g.visible && a.x === x && a.z === z);
    S.groundH = () => 0;
    scenes[name] = S; return S;
  }
  const on = (S, tiles, fn) => tiles.forEach(([x, z]) => (S.interact[x + ',' + z] = fn));
  const blockRect = (S, x0, z0, x1, z1) => { for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) S.block.add(x + ',' + z); };

  // ---------- facades ----------
  function facade(cols, rows, wall, seed, lit) {
    const r = rng(seed), T = 16, onW = [], cool = [], kind = [];
    for (let i = 0; i < cols * rows; i++) { onW.push(r() < lit); cool.push(r() < 0.18); kind.push(r()); }
    const style = Math.floor(r() * 3), brick = r() < 0.4;
    const b = new THREE.Color(wall), hx = (c) => '#' + c.getHexString();
    const lt = hx(b.clone().offsetHSL(0, -0.02, 0.06)), lt2 = hx(b.clone().offsetHSL(0, -0.03, 0.12)), dk = hx(b.clone().offsetHSL(0, 0, -0.06)), dk2 = hx(b.clone().offsetHSL(0, 0, -0.12));
    const WR = (x, y) => style === 0 ? [x * T + 4, y * T + 4, 8, 8] : style === 1 ? [x * T + 2, y * T + 4, 12, 7] : [x * T + 5, y * T + 2, 6, 11];
    const shop = rows >= 4;
    const map = ctex(cols * T, rows * T, (g, w, h) => {
      g.fillStyle = wall; g.fillRect(0, 0, w, h);
      const rn = rng(seed + 1);
      if (brick) { g.fillStyle = dk; for (let y = 0; y < h; y += 3) { g.fillRect(0, y, w, 1); for (let x = (y / 3) % 2 ? 0 : 3; x < w; x += 6) g.fillRect(x, y, 1, 3); } }
      for (let i = 0; i < w * h / 12; i++) { g.fillStyle = rn() < 0.5 ? lt : dk; g.fillRect(rn() * w | 0, rn() * h | 0, 1, 1); }
      for (let y = 0; y < rows; y++) { g.fillStyle = lt2; g.fillRect(0, y * T, w, 1); g.fillStyle = dk2; g.fillRect(0, y * T + T - 2, w, 2); }
      g.fillStyle = lt2; g.fillRect(0, 0, w, 2); g.fillStyle = dk; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const k = kind[y * cols + x];
        if (shop && y === rows - 1) {
          g.fillStyle = dk2; g.fillRect(x * T, y * T + 3, T, T - 3);
          if (k < 0.3) { g.fillStyle = '#1a1620'; g.fillRect(x * T + 5, y * T + 5, 6, 11); g.fillStyle = lt; g.fillRect(x * T + 9, y * T + 10, 1, 1); }
          else { g.fillStyle = '#5c5a66'; g.fillRect(x * T + 1, y * T + 5, 14, 11); g.fillStyle = '#4a4854'; for (let yy = y * T + 6; yy < y * T + 16; yy += 2) g.fillRect(x * T + 1, yy, 14, 1); }
          continue;
        }
        const [a, bb, c, d] = WR(x, y);
        g.fillStyle = dk2; g.fillRect(a - 1, bb - 1, c + 2, d + 2);
        g.fillStyle = '#182034'; g.fillRect(a, bb, c, d);
        g.fillStyle = '#26324e'; g.fillRect(a, bb, c, 2);
        g.fillStyle = '#3c4a70'; for (let q = 0; q < Math.min(c, d) - 2; q++) g.fillRect(a + 1 + q, bb + d - 2 - q, 1, 1);
        if (c >= 8) { g.fillStyle = dk2; g.fillRect(a + (c >> 1), bb, 1, d); }
        g.fillStyle = lt2; g.fillRect(a - 2, bb + d + 1, c + 4, 1); g.fillStyle = dk2; g.fillRect(a - 2, bb + d + 2, c + 4, 1);
        if (k < 0.1 && y < rows - 1) { g.fillStyle = '#9a9aa6'; g.fillRect(a + c - 5, bb + d + 3, 6, 4); g.fillStyle = '#6a6a76'; g.fillRect(a + c - 5, bb + d + 6, 6, 1); g.fillRect(a + c - 4, bb + d + 4, 1, 1); g.fillRect(a + c - 2, bb + d + 4, 1, 1); }
      }
      const gr = g.createLinearGradient(0, h - T * 1.5, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = gr; g.fillRect(0, h - T * 1.5, w, T * 1.5);
    });
    const em = ctex(cols * T, rows * T, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x, k = kind[i];
        if (shop && y === rows - 1) continue;
        if (!onW[i]) continue;
        const [a, bb, c, d] = WR(x, y);
        g.fillStyle = cool[i] ? '#6a8cc8' : '#c89a3c'; g.fillRect(a, bb, c, d);
        g.fillStyle = cool[i] ? '#a8c8ff' : '#f4c860'; g.fillRect(a + 1, bb + 2, c - 2, d - 3);
        if (k > 0.55) { g.fillStyle = cool[i] ? '#4a6494' : '#8a6228'; g.fillRect(a, bb, k > 0.8 ? c : c >> 1, d); }
      }
    });
    return { map, em };
  }
  const WALLS = ['#2f2b45', '#3a3350', '#2b3a44', '#43354a', '#353a3a', '#3b2f3a', '#283246', '#3d3a52'];
  function building(S, x0, z0, x1, z1, h, color, seed, lit = 0.42, base = 0.15) {
    const w = x1 - x0 + 1, d = z1 - z0 + 1, rows = Math.max(1, Math.round(h / 0.9)), r = rng(seed + 3);
    const mk = (f) => lam('#ffffff', { map: f.map, emissive: 0xffffff, emissiveMap: f.em, emissiveIntensity: 0.85 });
    const mx = mk(facade(d, rows, color, seed, lit)), mz = mk(facade(w, rows, color, seed + 7, lit)), roof = lam(shadeHex(color, -0.07));
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    add(S.scene, BOX(w, h, d), [mx, mx, roof, roof, mz, mz], cx, base + h / 2, cz);
    add(S.scene, BOX(w + 0.16, 0.16, d + 0.16), lam(shadeHex(color, -0.12)), cx, base + h + 0.02, cz);
    if (w > 2 && d > 2 && r() < 0.75) add(S.scene, BOX(Math.min(2, w * 0.35), 0.55, Math.min(1.6, d * 0.35)), lam('#24222f'), cx + (r() - 0.5) * w * 0.4, base + h + 0.36, cz + (r() - 0.5) * d * 0.4);
    S.winMats.push(mx, mz); blockRect(S, x0, z0, x1, z1);
  }
  function fillLot(S, x0, z0, x1, z1, hmin, hmax, seed) {
    const r = rng(seed); let x = x0;
    while (x <= x1) {
      const w = Math.min(x1 - x + 1, 3 + Math.floor(r() * 5)); let z = z0;
      while (z <= z1) { const d = Math.min(z1 - z + 1, 4 + Math.floor(r() * 6)); building(S, x, z, x + w - 1, z + d - 1, hmin + r() * (hmax - hmin), WALLS[Math.floor(r() * WALLS.length)], seed * 31 + x * 7 + z * 13, 0.34); z += d; }
      x += w;
    }
  }

  // ---------- story state ----------
  const F = { sawSky: false, momAwake: false, alert: false, blackout: false, ch: 0, lab: 0, mateo: 0, foundMom: false, sawWorker: false, gen: 0, epi: 0, c3: 0 };
  const objective = () => {
    if (F.epi) return F.epi === 1 ? 'Study the spacecraft dataset on the main screen' : '';
    if (F.c3) return F.c3 >= 9 ? 'End of Chapter Three — the story continues in The Missions' : ({ 1: 'Sit down at the table with Naomi', 2: 'Talk to Mateo', 4: 'Talk to your mother by the window' })[F.c3] || '';
    if (F.gen) { if (F.gen === 1) return `Listen to the arguments in the hall (${TOPICS.filter((k) => G2.heard[k]).length} / 4)`; if (F.gen === 3) return 'Walk down the aisle to the stage'; return F.gen >= 9 ? 'End of Chapter Two — the story continues in The Missions' : ''; }
    if (F.ch >= 2) return 'End of Chapter One — the story continues in The Missions';
    if (F.lab) return !F.mateo ? "Check last night's data on the main screen" : F.mateo === 1 ? 'Look at the upstream solar-wind monitor (right desk)' : 'Open another dataset on the main screen';
    if (F.ch === 1) return !F.foundMom ? 'Find Mama in the water queue outside the shop' : !F.sawWorker ? 'Watch the dark intersection' : '';
    return !F.sawSky ? 'Look out of the bedroom window' : !F.momAwake ? 'Wake Mama — her room is to the east' : !F.alert ? 'Go to the living-room window' : !F.blackout ? 'The television switched on by itself' : 'Go back to bed when you are ready — morning will come';
  };

  // Minimap target for the current objective (scene + tile). The prologue apartment is a cinematic in this build.
  const objTarget = () => {
    if (F.epi) return F.epi === 1 ? { scene: 'lab', x: 5, z: 1 } : null;
    if (F.c3) return F.c3 === 1 ? { scene: 'lake', x: 4.5, z: 4 } : F.c3 === 2 ? { scene: 'lake', x: 2, z: 3 } : F.c3 === 4 ? { scene: 'flat', x: 6, z: 1 } : null;
    if (F.gen) { if (F.gen === 1) { const a = G2.talkers.find((q) => !G2.heard[TOPIC[q.key]]); return a ? { scene: 'geneva', x: a.x, z: a.z } : null; } return F.gen === 3 ? { scene: 'geneva', x: 6.5, z: 2 } : null; }
    if (F.ch >= 2) return null;
    if (F.lab) return { scene: 'lab', x: F.mateo === 1 ? 8.5 : 5, z: 1 };
    if (F.ch === 1) return !F.foundMom ? { scene: 'street', x: 22, z: 10 } : !F.sawWorker ? { scene: 'street', x: 14, z: 13 } : null;
    return null;
  };

  // ---------- APARTMENT ----------
  const city = (() => {
    const W = 96, H = 48, r = rng(77), bld = [], wins = []; let x = 0;
    while (x < W) { const w = 6 + Math.floor(r() * 10), h = 12 + Math.floor(r() * 24); bld.push({ x, w, h }); x += w + (r() < 0.3 ? 1 : 0); }
    bld.forEach((b) => { for (let yy = H - b.h + 3; yy < H - 2; yy += 3) for (let xx = b.x + 1; xx < b.x + b.w - 1; xx += 2) if (r() < 0.55) wins.push({ x: xx, y: yy, k: xx / W * 0.85 + r() * 0.15 }); });
    const tex = ctex(W, H, () => {});
    const draw = (dark, time) => {
      const g = tex.userData.g, gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#2a0612'); gr.addColorStop(0.55, '#7a1424'); gr.addColorStop(1, '#d8344a');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) { const cx = ((i * 14 + time * 1.5) % (W + 10)) - 5; for (let y = 1; y < 26; y++) { const xx = cx + Math.sin(y * 0.25 + i + time * 0.3) * 2; g.fillStyle = `rgba(255,${100 + i * 12},130,${0.22 * (1 - y / 28)})`; g.fillRect(xx | 0, y, 2, 1); } }
      g.fillStyle = '#16070e'; bld.forEach((b) => g.fillRect(b.x, H - b.h, b.w, b.h));
      g.fillStyle = '#f4c75a'; wins.forEach((w) => { if (w.k >= dark) g.fillRect(w.x, w.y, 1, 1); });
      tex.needsUpdate = true;
    };
    draw(0, 0); return { tex, draw };
  })();
  const DIG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
  const clockTex = ctex(24, 9, () => {});
  const drawClock = (txt, lit) => { const g = clockTex.userData.g; g.fillStyle = '#0a0808'; g.fillRect(0, 0, 24, 9); if (lit) { g.fillStyle = '#ff3344'; let x = 1; for (const ch of txt) { if (ch === ':') { g.fillRect(x, 3, 1, 1); g.fillRect(x, 5, 1, 1); x += 2; continue; } const b = DIG[ch]; for (let i = 0; i < 15; i++) if (b[i] === '1') g.fillRect(x + (i % 3), 2 + Math.floor(i / 3), 1, 1); x += 4; } } clockTex.needsUpdate = true; };
  drawClock('02:17', true);
  const tvTex = ctex(48, 28, () => {});
  let tvState = 'off';
  const drawTV = (time) => {
    const g = tvTex.userData.g;
    if (tvState === 'off' || tvState === 'black') { g.fillStyle = '#07070b'; g.fillRect(0, 0, 48, 28); g.fillStyle = '#16161f'; g.fillRect(4, 3, 10, 1); }
    else if (tvState === 'static') { for (let y = 0; y < 28; y++) for (let x = 0; x < 48; x += 2) { const v = Math.random() * 200 | 0; g.fillStyle = `rgb(${v},${v},${v + 10})`; g.fillRect(x, y, 2, 1); } }
    else { const gr = g.createLinearGradient(0, 0, 0, 28); gr.addColorStop(0, '#3a0816'); gr.addColorStop(1, '#c8344a'); g.fillStyle = gr; g.fillRect(0, 0, 48, 28);
      for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,140,150,0.35)'; g.fillRect(((i * 11 + time * 4) % 52 | 0) - 2, 2, 2, 10); }
      g.fillStyle = '#12060a'; g.fillRect(0, 15, 9, 13); g.fillRect(10, 12, 7, 16); g.fillRect(19, 16, 10, 12); g.fillRect(31, 10, 6, 18); g.fillRect(39, 14, 9, 14);
      g.fillStyle = '#e8e4ea'; g.fillRect(0, 21, 48, 5); g.fillStyle = '#c42034'; g.fillRect(0, 21, 14, 5); g.fillStyle = '#ffffff'; g.fillRect(2, 23, 10, 1); g.fillStyle = '#20202a'; g.fillRect(16, 23, 24, 1);
      if (Math.random() < 0.06) { g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(0, Math.random() * 28 | 0, 48, 1); } }
    tvTex.needsUpdate = true;
  };
  drawTV(0);

  const apt = newScene('apt', 0, 1, 16, 7);
  (function buildApt() {
    const S = apt, sc = S.scene;
    sc.background = new THREE.Color('#06040a');
    S.title = 'Apartment 1804'; S.sub = 'Eighteenth floor · 02:17';
    const amb = new THREE.AmbientLight('#4a3a64', 1.5); sc.add(amb);
    sc.add(new THREE.HemisphereLight('#ff4a5a', '#120a1a', 0.9));
    const dl = new THREE.DirectionalLight('#7c80c8', 0.7); dl.position.set(4, 8, 10); sc.add(dl);
    const winLight = new THREE.PointLight('#ff3044', 9, 7, 1.6); winLight.position.set(7, 1.6, 1.2); sc.add(winLight);
    const lucasLight = new THREE.PointLight('#ff3044', 1.2, 5, 1.6); lucasLight.position.set(2, 1.6, 1.2); sc.add(lucasLight);
    const momLight = new THREE.PointLight('#ff3044', 3.5, 5, 1.6); momLight.position.set(14, 1.6, 1.2); sc.add(momLight);
    const lampLight = new THREE.PointLight('#ffb870', 6, 5, 1.6); lampLight.position.set(6, 1.6, 4); sc.add(lampLight);
    // floor
    const floorTex = ctex(17 * 16, 9 * 16, (g, w, h) => { const r = rng(5); for (let y = 0; y < h; y += 4) { let x = -Math.floor(r() * 24); while (x < w) { const L = 18 + Math.floor(r() * 22); g.fillStyle = ['#5a4436', '#634b3b', '#4f3c30', '#574132'][Math.floor(r() * 4)]; g.fillRect(x, y, L, 4); g.fillStyle = '#3a2c22'; g.fillRect(x, y + 3, L, 1); g.fillRect(x + L - 1, y, 1, 4); x += L; } } });
    const fl = add(sc, new THREE.PlaneGeometry(17, 9), lam('#ffffff', { map: floorTex }), 8, 0, 4); fl.rotation.x = -Math.PI / 2;
    const wallTex = ctex(16, 32, (g) => { g.fillStyle = '#3e3554'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#383050'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); g.fillStyle = '#231d31'; g.fillRect(0, 29, 16, 3); });
    const wt = (rx, ry) => { const t = wallTex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
    const cap = lam('#1b1626');
    const wall = (w, h, d, x, y, z, rx) => { const m = lam('#ffffff', { map: wt(rx, 1) }); return add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
    wall(19, 2.8, 1, 8, 1.4, 0, 19);
    wall(1, 2.8, 9, -1, 1.4, 4, 9); wall(1, 2.8, 9, 17, 1.4, 4, 9);
    wall(0.4, 2.8, 5, 5, 1.4, 3, 5); wall(0.4, 2.8, 5, 12, 1.4, 3, 5);
    const lowWall = lam('#2b2540');
    add(sc, BOX(10, 0.45, 0.5), lowWall, 3.5, 0.22, 8.3); add(sc, BOX(8.5, 0.45, 0.5), lowWall, 13.25, 0.22, 8.3);
    add(sc, BOX(0.12, 0.6, 0.5), lam('#4a3a2e'), 8.44, 0.3, 8.3); add(sc, BOX(0.12, 0.6, 0.5), lam('#4a3a2e'), 9.56, 0.3, 8.3);
    const mat = add(sc, new THREE.PlaneGeometry(1, 0.7), lam('#8a3a3e'), 9, 0.012, 7.6); mat.rotation.x = -Math.PI / 2;
    for (let x = 0; x <= 16; x++) { if (x !== 9) S.block.add(x + ',8'); if (x === 5 || x === 12) for (let z = 1; z <= 5; z++) S.block.add(x + ',' + z); }
    S.warps['9,8'] = { scene: 'street', x: 6, z: 10, dir: 0, need: 0 };
    // windows
    const winMat = new THREE.MeshBasicMaterial({ map: city.tex });
    const frameMat = lam('#20182a');
    const windowAt = (x, w, h, y) => { add(sc, BOX(w + 0.16, h + 0.16, 0.06), frameMat, x, y, 0.52); add(sc, new THREE.PlaneGeometry(w, h), winMat, x, y, 0.56); add(sc, BOX(w + 0.3, 0.08, 0.16), frameMat, x, y - h / 2 - 0.08, 0.6); };
    windowAt(2, 1.4, 1.1, 1.45); windowAt(7, 2.6, 1.3, 1.5); windowAt(14, 1.2, 1.0, 1.45);
    const curtain = add(sc, new THREE.PlaneGeometry(1.6, 1.3), lam('#36548a'), 2, 1.45, 0.6);
    const curtainR = add(sc, new THREE.PlaneGeometry(0.3, 1.3), lam('#36548a'), 2.85, 1.45, 0.6); curtainR.visible = false;
    const glow = (x, w, k) => { const m = add(sc, new THREE.PlaneGeometry(w, 2.2), addMat('#ff2a40', rectGlowTex, k), x, 0.015, 1.6); m.rotation.x = -Math.PI / 2; return m; };
    const gL = glow(2, 1.8, 0.12), gV = glow(7, 3.2, 0.55), gM = glow(14, 1.6, 0.45);
    // Lucas room
    const bed = (x, blanket) => { add(sc, BOX(1.9, 0.34, 2.9), lam('#5a4636'), x, 0.17, 2); add(sc, BOX(1.8, 0.16, 2.8), lam('#cfc6dc'), x, 0.42, 2); add(sc, BOX(1.84, 0.14, 1.9), lam(blanket), x, 0.54, 2.45); add(sc, BOX(1.2, 0.14, 0.5), lam('#ece6f2'), x, 0.56, 0.95); add(sc, BOX(1.95, 0.7, 0.12), lam('#4a3a2c'), x, 0.35, 0.56); };
    bed(0.5, '#3d5a8a'); blockRect(S, 0, 1, 1, 3);
    const rocket = new THREE.Group(); rocket.position.set(0.7, 2.05, 2.2); sc.add(rocket);
    add(rocket, new THREE.CylinderGeometry(0.07, 0.07, 0.42, 8), lam('#e8e8f0'), 0, 0, 0);
    add(rocket, new THREE.ConeGeometry(0.07, 0.18, 8), lam('#d0303c'), 0, 0.3, 0);
    add(rocket, BOX(0.24, 0.1, 0.02), lam('#d0303c'), 0, -0.18, 0); add(rocket, BOX(0.02, 0.1, 0.24), lam('#d0303c'), 0, -0.18, 0);
    add(sc, new THREE.CylinderGeometry(0.005, 0.005, 0.5, 3), lam('#888'), 0.7, 2.55, 2.2);
    add(sc, BOX(1.9, 1.7, 0.6), lam('#4a3a2e'), 3.5, 0.85, 0.85);
    const bookCols = ['#c8404a', '#e0b050', '#4a8ac0', '#6ab07a', '#d8d0c0', '#8a5ab0'];
    for (let s = 0; s < 3; s++) { let bx = 2.66; const r = rng(s + 9); while (bx < 4.3) { const bw = 0.08 + r() * 0.07, bh = 0.3 + r() * 0.12; add(sc, BOX(bw, bh, 0.05), lam(bookCols[Math.floor(r() * 6)]), bx + bw / 2, 0.22 + s * 0.52 + bh / 2, 1.16); bx += bw + 0.015; } }
    blockRect(S, 3, 1, 4, 1);
    const rug = add(sc, new THREE.PlaneGeometry(2.6, 1.8), lam('#2f4f6a'), 2.6, 0.01, 5); rug.rotation.x = -Math.PI / 2;
    // living room
    add(sc, BOX(1.9, 0.5, 0.6), lam('#2a2430'), 10.5, 0.25, 0.85);
    add(sc, BOX(1.7, 0.95, 0.08), lam('#0c0c12'), 10.5, 1.3, 0.6);
    const tvScreen = add(sc, new THREE.PlaneGeometry(1.56, 0.84), new THREE.MeshBasicMaterial({ map: tvTex }), 10.5, 1.3, 0.645);
    const tvLight = new THREE.PointLight('#ff6070', 0, 4, 1.6); tvLight.position.set(10.5, 1.2, 1.4); sc.add(tvLight);
    blockRect(S, 10, 1, 11, 1);
    add(sc, BOX(0.7, 0.28, 0.06), lam('#0a0808'), 9, 2.05, 0.53); add(sc, new THREE.PlaneGeometry(0.6, 0.22), new THREE.MeshBasicMaterial({ map: clockTex }), 9, 2.05, 0.565);
    add(sc, BOX(2.8, 0.4, 0.8), lam('#4a5f86'), 10, 0.2, 4.1); add(sc, BOX(2.8, 0.55, 0.24), lam('#3e5176'), 10, 0.6, 4.42); add(sc, BOX(0.24, 0.5, 0.8), lam('#3e5176'), 8.68, 0.4, 4.1); add(sc, BOX(0.24, 0.5, 0.8), lam('#3e5176'), 11.32, 0.4, 4.1);
    blockRect(S, 9, 4, 11, 4);
    const rug2 = add(sc, new THREE.PlaneGeometry(3.6, 2.2), lam('#5a2f3a'), 9.5, 0.01, 2.6); rug2.rotation.x = -Math.PI / 2;
    add(sc, new THREE.CylinderGeometry(0.03, 0.05, 1.4, 6), lam('#2a2430'), 6, 0.7, 4);
    const shadeMat = lam('#6a5040', { emissive: 0xffb070, emissiveIntensity: 1 });
    add(sc, new THREE.CylinderGeometry(0.16, 0.26, 0.3, 10, 1, true), shadeMat, 6, 1.5, 4);
    const lampPool = add(sc, new THREE.PlaneGeometry(2.6, 2.6), addMat('#ffb060', radialTex, 0.45), 6, 0.016, 4); lampPool.rotation.x = -Math.PI / 2;
    S.block.add('6,4');
    // mom room
    bed(15.5, '#7a3a4a'); blockRect(S, 15, 1, 16, 3);
    add(sc, BOX(0.8, 0.55, 0.6), lam('#4a3a2e'), 13, 0.27, 0.9); S.block.add('13,1');
    const phone = add(sc, new THREE.PlaneGeometry(0.16, 0.26), new THREE.MeshBasicMaterial({ color: '#1a1a24' }), 13, 0.56, 0.95); phone.rotation.x = -Math.PI / 2;
    const momSleep = add(sc, new THREE.PlaneGeometry(0.9, 1.35), new THREE.MeshBasicMaterial({ map: FR.mariana[0][0], alphaTest: 0.5, color: '#d8b0b8' }), 15.5, 0.52, 1.75); momSleep.rotation.x = -Math.PI / 2;
    const momBlanket = add(sc, BOX(1.86, 0.18, 1.6), lam('#7a3a4a'), 15.5, 0.6, 2.55);
    const mom = actor(FR.mariana, 1.62); mom.g.visible = false; sc.add(mom.g); S.actors.push(mom); S.mom = mom;

    // ---- interactions ----
    on(S, [[2, 0]], async () => {
      if (!F.sawSky) {
        await say(null, 'He climbed down, walked toward the window, and pulled the curtain aside.');
        for (let i = 1; i <= 8; i++) { curtain.scale.x = 1 - i / 8 * 0.82; curtain.position.x = 2 - (i / 8) * 0.66; await wait(30); }
        curtainR.visible = true; gL.material.opacity = 0.55; lucasLight.intensity = 6;
        await say(null, 'The entire city appeared to be burning.');
        await say(null, 'The apartment towers across the street were outlined against a dark red sky. The clouds glowed from beneath.');
        await say(null, 'High above them, enormous structures of light slowly changed shape — curtains pulled across the heavens by an invisible hand.');
        F.sawSky = true;
      } else await say(null, F.blackout ? 'Above the dark city, the crimson sky continued to glow.' : 'The clouds glowed from beneath.');
    });
    const shelf = async () => say(null, 'A dull red glow cast unfamiliar shadows across his books and the model rocket that hung above his bed.');
    on(S, [[3, 1], [4, 1]], shelf);
    on(S, [[0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3]], async () => (F.blackout && F.ch === 0 ? goChapter1() : shelf()));
    on(S, [[9, 0]], async () => say(null, F.blackout ? 'The clock is dark.' : F.alert ? 'The clock reads 02:31.' : 'The clock reads 02:17.'));
    on(S, [[14, 0]], async () => say(null, 'Even here, the red light reached the ceiling.'));
    on(S, [[13, 1], [13, 0]], async () => say(null, F.alert ? 'The emergency notification is still on the screen.' : 'Mama\'s phone, charging in the dark.'));
    on(S, [[9, 4], [10, 4], [11, 4]], async () => say(null, 'The sofa. Nobody is sitting on it.'));
    on(S, [[6, 4]], async () => say(null, F.blackout ? 'The lamp is dead.' : 'A reading lamp, left on low.'));
    on(S, [[15, 1], [16, 1], [15, 2], [16, 2], [15, 3], [16, 3]], async () => {
      if (F.momAwake) return say(null, 'The bed is empty.');
      if (!F.sawSky) return say(null, 'Mama is asleep.');
      await say('Lucas', 'Mama, wake up!');
      await say(null, 'Mariana Almeida opened her eyes.');
      await say('Mariana', 'What happened?'); await say('Lucas', 'The sky.'); await say('Mariana', 'What about it?'); await say('Lucas', 'It\'s red.');
      await say(null, 'She sat up, confused.'); await say('Mariana', 'What?'); await say('Lucas', 'The whole sky is red!');
      await fadeTo(1, 0.35);
      momSleep.visible = false; momBlanket.scale.z = 0.7; momBlanket.position.z = 2.8;
      place(mom, 7, 1, 1, S); mom.g.visible = true; F.momAwake = true;
      place(P, 7, 3, 1, S); camUpdate(0, true);
      await fadeTo(0, 0.4);
      await say(null, 'Mariana followed him into the living room.');
    });
    const livingWindow = async () => {
      if (!F.momAwake) return say(null, 'In neighbouring apartments, lights were turning on. People emerged onto balconies, pointing their phones upward.');
      if (F.blackout) return say(null, 'Above it, the crimson sky continued to glow.');
      if (F.alert) return say(null, 'Mariana kept glancing from the window to the television.');
      await say(null, 'She expected to see a fire in a neighbouring building. Instead, she found herself standing motionless before the window.');
      await say(null, 'In neighbouring apartments, lights were turning on. Somewhere below, a car alarm began to sound.');
      await say(null, 'Lucas pressed his palm against the glass.');
      await say('Lucas', 'Is the Sun coming up?');
      mom.dir = 3; await say(null, 'Mariana looked at the clock.');
      await say('Mariana', 'Not for another few hours.'); await say('Lucas', 'Then why is it bright?');
      mom.dir = 1; await say(null, 'She had no answer.');
      await wait(350);
      for (let i = 0; i < 6; i++) { mom.g.position.x = 7 + (i % 2 ? 0.04 : -0.04); await wait(50); } mom.g.position.x = 7;
      await say(null, 'Her phone vibrated.');
      await showAlert({ title: 'Emergency alert', body: 'Remain calm. Expect possible disruptions to electrical and communications services.', src: 'Defesa Civil · São Paulo' });
      tvState = 'static'; tvLight.intensity = 3; await wait(600); tvState = 'news'; tvLight.intensity = 4;
      mom.dir = 3;
      await say(null, 'After a brief interruption in power, the television switched on by itself.');
      F.alert = true;
    };
    on(S, [[6, 0], [7, 0], [8, 0]], livingWindow);
    mom.onTalk = async () => {
      if (!F.alert) return livingWindow();
      if (!F.blackout) return say(null, 'Mariana was staring at the emergency broadcast.');
      await say('Mariana', 'No, sweetheart.');
      await say(null, 'And for the first time in her life, Mariana did not know whether she was telling her son the truth.');
    };
    const tv = async () => {
      if (!F.alert) return say(null, 'The television is off.');
      if (F.blackout) return say(null, 'The screen is black.');
      await say('Reporter', 'We are receiving reports of unusual atmospheric lights from several countries.');
      await say('Reporter', 'Researchers believe the displays may be associated with significant geomagnetic activity, although the full extent of the event remains unclear.');
      await say(null, 'The reporter paused, listening to someone through her earpiece.');
      await say('Reporter', 'We are now hearing that satellite-navigation services are experiencing serious disturbances.');
      await say('Reporter', 'Authorities are asking people not to rely exclusively on automated navigation systems.');
      tvState = 'static'; await wait(250); tvState = 'black'; tvLight.intensity = 0;
      await say(null, 'The television screen went black.');
      await say(null, 'For a moment, the apartment was silent.');
      lampLight.intensity = 0; shadeMat.emissiveIntensity = 0; lampPool.visible = false; drawClock('', false); amb.intensity = 0.9;
      await wait(500);
      await say(null, 'Then every light went out.');
      await fadeTo(0.85, 0.18);
      const spot = [[0, 1], [3, 0], [2, 0], [1, 0]].map(([dx, dz]) => [P.x + dx, P.z + dz]).find(([x, z]) => !S.blocked(x, z));
      if (spot) { place(mom, spot[0], spot[1], 0, S); mom.dir = spot[0] === P.x ? (spot[1] > P.z ? 1 : 0) : (spot[0] > P.x ? 2 : 3); }
      await fadeTo(0, 0.3);
      await say(null, 'Mariana instinctively pulled Lucas close.');
      S.ripple = 0.001; await wait(2300);
      await say(null, 'Outside, thousands of windows darkened in succession. The city below became a landscape of shadows.');
      F.blackout = true;
      await say('Lucas', 'Mama, are we going to die?');
      await say(null, 'She held him tighter.');
      await say('Mariana', 'No, sweetheart.');
      await say(null, 'But she could not stop looking at the sky.');
    };
    on(S, [[10, 1], [11, 1], [10, 0], [11, 0]], tv);

    let acc = 0;
    S.update = (dt, t) => {
      acc += dt;
      if (S.ripple) S.ripple = Math.min(1.1, S.ripple + dt * 0.5);
      if (acc > 0.1) { acc = 0; city.draw(S.ripple || (F.blackout ? 1.1 : 0), t); if (tvState !== 'off') drawTV(t); }
      if (tvState === 'news') tvLight.intensity = 3.5 + Math.sin(t * 13) * 0.6 + (Math.random() < 0.05 ? -2 : 0);
      phone.material.color.set(F.alert && !F.momAwake ? '#1a1a24' : F.alert && Math.sin(t * 6) > 0 && !F.blackout ? '#9ab8ff' : '#1a1a24');
      rocket.rotation.y += dt * 0.25; rocket.rotation.z = Math.sin(t * 0.8) * 0.05;
      const tint = (a) => { const dw = Math.hypot(a.g.position.x - 7, a.g.position.z - 1.5), dl2 = Math.hypot(a.g.position.x - 6, a.g.position.z - 4); const red = clamp(1 - dw / 4, 0, 1) * 0.25, warm = lampLight.intensity > 0 ? clamp(1 - dl2 / 2.2, 0, 1) * 0.2 : 0; a.sp.material.color.setRGB(0.74 + red + warm, 0.56 + warm * 0.8, 0.64 + warm * 0.3); };
      tint(P); if (mom.g.visible) tint(mom);
    };
    S.camBase = { h: 7.4, d: 6.4, yaw: 0, fov: 36, ty: 0.7 };
    S.camZone = (x) => x <= 4 ? { ...S.camBase, yaw: 0.16, h: 7.0 } : x >= 13 ? { ...S.camBase, yaw: -0.16, h: 7.0 } : S.camBase;
    S.camTarget = (x, z) => ({ x: clamp(x, 2.6, 13.4), z: clamp(z, 3.4, 4.8) });
  })();

  // ---------- STREET ----------
  const street = newScene('street', 0, 0, 29, 25);
  (function buildStreet() {
    const S = street, sc = S.scene;
    S.title = 'Rua Aurora'; S.sub = 'São Paulo · 02:19';
    sc.background = new THREE.Color('#0b0610');
    sc.fog = new THREE.Fog('#3a0d1c', 24, 70);
    const amb = new THREE.AmbientLight('#3c3c66', 1.5); sc.add(amb);
    const hemi = new THREE.HemisphereLight('#ff5a6a', '#141028', 0.9); sc.add(hemi);
    const dl = new THREE.DirectionalLight('#9aa8ff', 1.0); dl.position.set(-6, 12, 10); sc.add(dl);
    const isRoad = (x, z) => (x >= 13 && x <= 16) || (z >= 12 && z <= 15);
    S.groundH = (x, z) => (isRoad(Math.round(x), Math.round(z)) ? 0 : 0.15);
    const EX0 = -24, EX1 = 54, EZ0 = -40, EZ1 = 36, PX = 16;
    const gw = EX1 - EX0 + 1, gd = EZ1 - EZ0 + 1;
    const gTex = ctex(gw * PX, gd * PX, (g, w, h) => {
      const r = rng(11); g.fillStyle = '#2a2938'; g.fillRect(0, 0, w, h);
      const AS = ['#323144', '#24232f', '#2e2d3e', '#1f1e29'];
      for (let i = 0; i < w * h / 7; i++) { g.fillStyle = AS[Math.floor(r() * 4)]; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
      for (let i = 0; i < 14; i++) { const ox = r() * w | 0, oz = r() * h | 0, R = 10 + r() * 22 | 0; g.fillStyle = 'rgba(14,12,20,0.22)'; g.fillRect(ox, oz, R * 2, R); }
      g.fillStyle = '#1a1922'; for (let i = 0; i < 60; i++) { let cx = r() * w, cz = r() * h; for (let k = 0; k < 10; k++) { g.fillRect(cx | 0, cz | 0, 1, 1); cx += r() * 2 - 0.6; cz += r() * 2 - 1; } }
      const px = (x) => (x - (EX0 - 0.5)) * PX, pz = (z) => (z - (EZ0 - 0.5)) * PX;
      g.fillStyle = '#18171f'; g.fillRect(px(12.5), 0, 2, h); g.fillRect(px(16.5) - 2, 0, 2, h); g.fillRect(0, pz(11.5), w, 2); g.fillRect(0, pz(15.5) - 2, w, 2);
      const manhole = (x, z) => { const cx = px(x), cz = pz(z); g.fillStyle = '#1a1922'; g.fillRect(cx - 5, cz - 4, 10, 8); g.fillRect(cx - 4, cz - 5, 8, 10); g.fillStyle = '#3a3948'; g.fillRect(cx - 4, cz - 3, 8, 6); g.fillRect(cx - 3, cz - 4, 6, 8); g.fillStyle = '#26252f'; for (let k = -3; k <= 3; k += 2) g.fillRect(cx - 3, cz + k, 6, 1); };
      manhole(13.6, 4.2); manhole(15.4, 21.3); manhole(23.2, 12.6); manhole(4.4, 14.4);
      g.fillStyle = '#b8a650';
      for (let z = EZ0; z < EZ1; z += 2) if (z < 9 || z > 17) g.fillRect(px(14.5) - 1 | 0, pz(z), 2, PX);
      for (let x = EX0; x < EX1; x += 2) if (x < 10 || x > 19) g.fillRect(px(x), pz(13.5) - 1 | 0, PX, 2);
      g.fillStyle = '#c9c6d4';
      for (let x = 12.6; x < 16.5; x += 0.6) { g.fillRect(px(x) | 0, pz(9.7) | 0, 5, PX * 1.6 | 0); g.fillRect(px(x) | 0, pz(16.7) | 0, 5, PX * 1.6 | 0); }
      for (let z = 11.6; z < 15.5; z += 0.6) { g.fillRect(px(10.7) | 0, pz(z) | 0, PX * 1.6 | 0, 5); g.fillRect(px(17.7) | 0, pz(z) | 0, PX * 1.6 | 0, 5); }
      g.fillStyle = 'rgba(30,28,40,0.5)'; for (let i = 0; i < 400; i++) { const x = px(10.5) + r() * PX * 9, z = pz(9.5) + r() * PX * 9; g.fillRect(x | 0, z | 0, 2, 1); }
      g.fillStyle = '#d8d4e0'; g.fillRect(px(12.6) | 0, pz(9.45) | 0, PX * 1.9 | 0, 2); g.fillRect(px(14.6) | 0, pz(18.35) | 0, PX * 1.9 | 0, 2);
    });
    const gp = add(sc, new THREE.PlaneGeometry(gw, gd), lam('#ffffff', { map: gTex }), (EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2); gp.rotation.x = -Math.PI / 2;
    const paver = ctex(16, 16, (g) => { const r = rng(21); const tones = ['#5a5a72', '#54546a', '#60607a', '#4e4e64'];
      [[0, 0, 8, 8], [8, 0, 8, 8], [0, 8, 5, 8], [5, 8, 6, 8], [11, 8, 5, 8]].forEach(([x, y, w, h], i) => { g.fillStyle = tones[i % 4]; g.fillRect(x, y, w, h); g.fillStyle = '#6c6c86'; g.fillRect(x, y, w - 1, 1); g.fillRect(x, y, 1, h - 1); g.fillStyle = '#3e3e52'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x + w - 1, y, 1, h); });
      for (let i = 0; i < 18; i++) { g.fillStyle = r() < 0.5 ? '#686882' : '#46465a'; g.fillRect(1 + r() * 14 | 0, 1 + r() * 14 | 0, 1, 1); } });
    const curb = lam('#80809a');
    const slab = (x0, z0, x1, z1) => { const w = x1 - x0, d = z1 - z0, t = paver.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w, d); t.needsUpdate = true; const top = lam('#ffffff', { map: t }); add(sc, BOX(w, 0.15, d), [curb, curb, top, curb, curb, curb], (x0 + x1) / 2, 0.075, (z0 + z1) / 2); };
    slab(EX0 - 0.5, EZ0 - 0.5, 12.5, 11.5); slab(16.5, EZ0 - 0.5, EX1 + 0.5, 11.5); slab(EX0 - 0.5, 15.5, 12.5, EZ1 + 0.5); slab(16.5, 15.5, EX1 + 0.5, EZ1 + 0.5);
    const grass = add(sc, new THREE.PlaneGeometry(11, 8), lam('#24382f'), 24, 0.155, 21.5); grass.rotation.x = -Math.PI / 2;
    // aurora backdrop
    const aur = ctex(256, 128, (g, w, h) => { const r = rng(3), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e040b'); gr.addColorStop(0.45, '#3d0a1b'); gr.addColorStop(0.82, '#8e1c2e'); gr.addColorStop(1, '#c43440'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) { const x0 = r() * w, ww = 2 + (i % 3), cg = 70 + (r() * 70 | 0); for (let y = 8; y < 96; y++) { const x = x0 + Math.sin(y * 0.05 + i) * 9; const a = Math.sin((y - 8) / 88 * Math.PI) * 0.3; g.fillStyle = `rgba(255,${cg},${100 + (i % 4) * 12},${a})`; g.fillRect(x | 0, y, ww, 1); g.fillRect((x | 0) - w, y, ww, 1); } } });
    aur.wrapS = THREE.RepeatWrapping;
    const skyMesh = add(sc, new THREE.PlaneGeometry(300, 120), new THREE.MeshBasicMaterial({ map: aur, fog: false }), 15, 52, -70);
    // buildings
    building(S, 3, 2, 10, 9, 15.5, '#3a3550', 101, 0.4);
    building(S, -6, 2, 2, 9, 9, '#2e3b45', 102, 0.45);
    building(S, 19, 2, 24, 9, 10.5, '#43354a', 103, 0.45);
    building(S, 25, 2, 30, 9, 6.5, '#3b4038', 104, 0.5);
    fillLot(S, -24, -40, 10, 1, 8, 19, 7); fillLot(S, 19, -40, 54, 1, 8, 19, 8);
    fillLot(S, -24, 2, -7, 9, 6, 12, 9); fillLot(S, 31, 2, 54, 9, 5, 11, 10);
    fillLot(S, -24, 18, -1, 36, 1.4, 3.2, 12); fillLot(S, 0, 26, 10, 36, 1.4, 3, 13);
    fillLot(S, 30, 18, 54, 36, 1.4, 3.2, 14); fillLot(S, 19, 26, 29, 36, 1.4, 3, 15);
    // apartment door
    add(sc, BOX(1.1, 1.5, 0.12), lam('#120e18'), 6, 0.9, 9.52);
    add(sc, BOX(1.4, 0.1, 0.6), lam('#5a5070'), 6, 1.72, 9.75);
    const doorGlow = add(sc, new THREE.PlaneGeometry(0.9, 1.3), new THREE.MeshBasicMaterial({ color: '#c89a50' }), 6, 0.85, 9.59);
    S.warps['6,9'] = { scene: 'apt', x: 9, z: 7, dir: 1, need: 1 };
    // shop with awning
    const aw = add(sc, BOX(6.2, 0.08, 1), lam('#2f6a52'), 21.5, 1.62, 10.0); aw.rotation.x = 0.32;
    const shopGlow = add(sc, BOX(5.2, 0.9, 0.04), lam('#1a1a20', { emissive: 0xf0c070, emissiveIntensity: 0.8 }), 21.5, 0.75, 9.53);
    // balconies with neighbours
    const balc = (x, y, frames, z = 9.5) => { add(sc, BOX(1.3, 0.08, 0.55), lam('#2a2636'), x, y, z + 0.28); add(sc, BOX(1.3, 0.34, 0.04), lam('#1c1a26'), x, y + 0.2, z + 0.54); const a = actor(frames, 1.25); a.g.position.set(x, y + 0.04, z + 0.2); a.sp.material.map = frames[0][0]; a.g.children[1].visible = false; sc.add(a.g); const ph = add(sc, new THREE.PlaneGeometry(0.12, 0.16), new THREE.MeshBasicMaterial({ color: '#cfe4ff' }), x + 0.22, y + 0.95, z + 0.42); return { a, ph }; };
    const bal = [balc(20.5, 3.3, FR.nb3), balc(23, 6.0, FR.nb1), balc(5, 4.8, FR.nb2), balc(8.4, 7.6, FR.nb3)];
    // lamps
    const poleMat = lam('#1d2440'), poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.7, 6);
    const coneGeo = new THREE.ConeGeometry(1.05, 2.6, 20, 1, true), poolGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const lamp = (x, z, dx, dz, solid = true) => {
      add(sc, poleGeo, poleMat, x, 0.15 + 1.35, z);
      add(sc, BOX(dx ? 0.95 : 0.07, 0.07, dz ? 0.95 : 0.07), poleMat, x + dx * 0.45, 2.85, z + dz * 0.45);
      const hx = x + dx * 0.9, hz = z + dz * 0.9, headMat = lam('#30303a', { emissive: 0xffe08a, emissiveIntensity: 1 });
      add(sc, BOX(0.4, 0.12, 0.4), headMat, hx, 2.8, hz);
      const cone = add(sc, coneGeo, addMat('#ffcf6a', coneTex, 0.32, THREE.DoubleSide), hx, 2.74 - 1.3, hz);
      const pool = add(sc, poolGeo, addMat('#ffd27a', radialTex, 0.85), hx, 0.17, hz); pool.rotation.x = -Math.PI / 2;
      S.lamps.push({ headMat, cone, pool, x: hx, z: hz }); if (solid) S.block.add(x + ',' + z);
    };
    [[12, 3, 1, 0], [12, 8, 1, 0], [17, 3, -1, 0], [17, 8, -1, 0], [3, 11, 0, 1], [8, 11, 0, 1], [21, 11, 0, 1], [27, 11, 0, 1], [3, 16, 0, -1], [8, 16, 0, -1], [22, 16, 0, -1], [27, 16, 0, -1], [12, 20, 1, 0], [12, 24, 1, 0], [17, 20, -1, 0], [17, 24, -1, 0]].forEach((l) => lamp(...l));
    [[12, -3, 1, 0], [17, -3, -1, 0], [12, -9, 1, 0], [17, -9, -1, 0], [12, -15, 1, 0], [17, -15, -1, 0], [-3, 11, 0, 1], [33, 11, 0, 1], [-3, 16, 0, -1], [33, 16, 0, -1], [12, 29, 1, 0], [17, 29, -1, 0]].forEach((l) => lamp(...l, false));
    // traffic lights
    const tls = [];
    [[12, 11], [17, 11], [12, 16], [17, 16]].forEach(([x, z]) => {
      add(sc, new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), poleMat, x, 1.35, z);
      add(sc, BOX(0.26, 0.66, 0.2), lam('#14141c'), x, 2.6, z);
      const ms = ['#ff3040', '#ffb020', '#40e080'].map((c, i) => { const m = new THREE.MeshBasicMaterial({ color: c }); add(sc, BOX(0.13, 0.13, 0.04), m, x, 2.8 - i * 0.2, z + 0.11); return m; });
      tls.push(ms); S.block.add(x + ',' + z);
    });
    on(S, [[12, 11], [17, 11], [12, 16], [17, 16]], async () => say(null, F.blackout ? 'Dark traffic lights over an empty intersection.' : 'The signals kept cycling for a street with no traffic.'));
    // cars
    const car = (x0, z, color, alarm) => {
      const cx = x0 + 0.5, g = new THREE.Group(); g.position.set(cx, 0, z); sc.add(g);
      add(g, BOX(1.9, 0.42, 0.92), lam(color), 0, 0.33, 0); add(g, BOX(1.05, 0.36, 0.82), lam('#1a2030'), -0.1, 0.72, 0); add(g, BOX(1.0, 0.06, 0.84), lam(color), -0.1, 0.92, 0);
      [[-0.6, 0.47], [0.6, 0.47], [-0.6, -0.47], [0.6, -0.47]].forEach(([wx, wz]) => add(g, BOX(0.34, 0.3, 0.1), lam('#0c0c10'), wx, 0.15, wz));
      const hz = [], hm = new THREE.MeshBasicMaterial({ color: '#ffb040' });
      [[0.96, 0.3], [0.96, -0.3], [-0.96, 0.3], [-0.96, -0.3]].forEach(([lx, lz]) => hz.push(add(g, BOX(0.04, 0.1, 0.18), alarm ? hm : new THREE.MeshBasicMaterial({ color: lx > 0 ? '#3a3a30' : '#401018' }), lx, 0.42, lz)));
      blockRect(S, x0, z, x0 + 1, z); return { hm, alarm };
    };
    car(20, 12, '#6a2a3a', false); const alarmCar = car(25, 15, '#d8d4dc', true); car(13, 6, '#2a4a6a', false);
    on(S, [[25, 15], [26, 15]], async () => { if (F.ch >= 1) return say(null, 'The car alarm had finally gone quiet.'); await say('SFX', 'WEE-OOO · WEE-OOO · WEE-OOO'); await say(null, 'Somewhere below, a car alarm began to sound.'); });
    on(S, [[13, 6], [14, 6]], async () => say(null, F.blackout ? 'Its dashboard screen reads: GPS SIGNAL LOST.' : 'A parked car. Its navigation screen glows faintly.'));
    // plaza + park
    const tree = (x, z) => { add(sc, new THREE.CylinderGeometry(0.08, 0.11, 0.8, 6), lam('#3a2a22'), x, 0.55, z); add(sc, new THREE.IcosahedronGeometry(0.62, 0), lam('#24443a', { flatShading: true }), x, 1.3, z); add(sc, new THREE.IcosahedronGeometry(0.44, 0), lam('#2c5446', { flatShading: true }), x + 0.1, 1.8, z - 0.05); S.block.add(x + ',' + z); };
    [[1, 19], [1, 23], [4, 25], [9, 25], [20, 19], [24, 19], [28, 19], [20, 23], [28, 23], [24, 24]].forEach(([x, z]) => tree(x, z));
    const bench = (x, z) => { add(sc, BOX(1.8, 0.1, 0.45), lam('#5a3e2e'), x + 0.5, 0.52, z); add(sc, BOX(1.8, 0.35, 0.08), lam('#5a3e2e'), x + 0.5, 0.78, z - 0.2); blockRect(S, x, z, x + 1, z); };
    bench(3, 21); bench(25, 21);
    building(S, 6, 19, 8, 20, 1.6, '#2f4a44', 120, 0.0);
    add(sc, BOX(3.4, 0.08, 0.7), lam('#c04040'), 7, 1.86, 20.75).rotation.x = 0.25;
    on(S, [[6, 20], [7, 20], [8, 20], [6, 19], [7, 19], [8, 19]], async () => say(null, 'A newsstand, shuttered for the night. Tomorrow\'s papers are still bundled outside.'));
    on(S, [[3, 21], [4, 21], [25, 21], [26, 21]], async () => {
      if (F.ch < 1) return say(null, 'A bench. The red light makes the wood look wet.');
      if (P.x > 10) return say(null, 'A bench, still damp from the night.');
      await say(null, 'A radio on the bench was turned up loud.');
      await say('Radio', 'In London, a hospital postponed non-emergency operations after a prolonged interruption to its external power supply.');
      await say('Radio', 'In Mumbai, freight terminals reported navigation and scheduling failures.');
      await say('Radio', 'In Johannesburg, operators isolated vulnerable parts of the power network to protect expensive transformers from damage.');
    });
    // NPCs
    const npc = (frames, x, z, dir, talk) => { const a = actor(frames, 1.6); place(a, x, z, dir, S); a.home = dir; a.onTalk = talk; sc.add(a.g); S.actors.push(a); return a; };
    npc(FR.nb1, 20, 10, 1, async () => { if (F.blackout) { await say('Neighbour', 'Even the street lights are gone. Look at the towers…'); return say(null, 'Thousands of windows were dark. Only the sky still had light.'); } await say('Neighbour', 'Are you seeing this? It started down south, like a fire.'); await say(null, 'He turned back, holding his phone up at the sky.'); });
    npc(FR.nb2, 9, 22, 2, async () => { await say('Old man', 'Fifty years in this city. Never seen it like this.'); await say(null, F.blackout ? 'The city, normally alive with traffic and electric light, had become a landscape of shadows.' : 'It looked like the reflection of a distant fire.'); });
    npc(FR.nb3, 23, 17, 1, async () => { await say('Woman', 'My maps won\'t load. The phone says no signal from the satellites.'); });

    S.actors.forEach((a) => (a.chap = 0));
    const ch1Objs = [], cb = (S.cblock = { 1: new Set() });
    const keep = (o) => { ch1Objs.push(o); o.visible = false; return o; };
    const dayTex = ctex(256, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7c90b8'); gr.addColorStop(0.5, '#b8a8bc'); gr.addColorStop(0.82, '#eec4a4'); gr.addColorStop(1, '#ffdcae'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = rng(8); for (let i = 0; i < 16; i++) { const cx = r() * w, cy = 16 + r() * 64, L = 18 + r() * 44; g.fillStyle = 'rgba(255,238,228,0.6)'; g.fillRect(cx | 0, cy | 0, L | 0, 2); g.fillStyle = 'rgba(190,160,186,0.5)'; g.fillRect((cx + 4) | 0, (cy + 2) | 0, (L - 8) | 0, 1); } });
    const pal = keep(new THREE.Group()); sc.add(pal); pal.position.set(20, 0.15, 10);
    add(pal, BOX(0.9, 0.12, 0.8), lam('#8a6a44'), 0, 0.06, 0);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) add(pal, BOX(0.26, 0.28, 0.36), lam(k ? '#7ab4e0' : '#5a96cc'), -0.3 + i * 0.3, 0.27 + k * 0.29, -0.18 + j * 0.38);
    cb[1].add('20,10');
    on(S, [[20, 10]], async () => say(null, 'A pallet of bottled water. The queue stretched past the shop.'));
    keep(add(sc, BOX(0.3, 0.18, 0.12), lam('#3a3a44'), 3.6, 0.66, 21));
    const carCh1 = (x0, z, color) => { const g = new THREE.Group(); g.position.set(x0 + 0.5, 0, z); keep(g); sc.add(g); add(g, BOX(1.9, 0.42, 0.92), lam(color), 0, 0.33, 0); add(g, BOX(1.05, 0.36, 0.82), lam('#2a3040'), -0.1, 0.72, 0); add(g, BOX(1.0, 0.06, 0.84), lam(color), -0.1, 0.92, 0); [[-0.6, 0.47], [0.6, 0.47], [-0.6, -0.47], [0.6, -0.47]].forEach(([wx, wz]) => add(g, BOX(0.34, 0.3, 0.1), lam('#0c0c10'), wx, 0.15, wz)); cb[1].add(x0 + ',' + z); cb[1].add(x0 + 1 + ',' + z); };
    carCh1(9, 13, '#d0b040'); carCh1(6, 13, '#8a8a98'); carCh1(18, 14, '#4a6a5a');
    const n1 = (frames, x, z, dir, talk) => { const a = npc(frames, x, z, dir, talk); a.chap = 1; return a; };
    const worker = n1(FR.worker, 14, 13, 2, async () => {
      await say('SFX', 'FWEEET! FWEEET!');
      await emote(P, '!');
      await say(null, 'Lucas watched emergency workers directing traffic at an intersection with dark traffic lights.');
      await emote(worker, '!', 0.6);
      await talk('Lucas', 'Worker', async () => { await say('Worker', 'Stay on the sidewalk, kid.', { Worker: 'serious', Lucas: 'surprised' }); });
      F.sawWorker = true; if (F.foundMom && !F.lab) await goLab();
    });
    const mari = n1(FR.mariana, 22, 10, 1, async () => {
      if (!F.foundMom) {
        await say(null, 'In São Paulo, Mariana Almeida spent the morning standing in a queue for bottled water.');
        await emote(mari, '!', 0.6);
        await talk('Lucas', 'Mariana', async () => { await say('Mariana', 'You can watch from the corner. Don\'t cross.', { Mariana: 'worried', Lucas: 'happy' }); });
        F.foundMom = true;
      }
      else await say('Mariana', 'Stay where I can see you.', 'worried');
      if (F.sawWorker && !F.lab) await goLab();
    });
    n1(FR.nb1, 21, 10, 1, async () => say(null, 'Someone ahead in the queue was reading the news aloud. Reports came from Argentina, South Africa, Australia, Brazil, and parts of Asia.'));
    n1(FR.nb3, 23, 10, 1, async () => { await say('Woman', 'Half of these videos can\'t be real.'); await say(null, 'Some images were genuine auroras; others were misidentified clouds, artificial lights, or fabricated recordings spreading through social media.'); });
    n1(FR.nb2, 24, 10, 1, async () => { await say('Old man', 'My sister across town never lost power.'); await say(null, 'The effect was not uniform. Some regions remained almost completely unaffected. Others experienced serious disruptions.'); });
    let tl = 0;
    S.onEnter = () => {
      const lit = !F.blackout;
      S.lamps.forEach((l) => { l.cone.visible = l.pool.visible = lit; l.headMat.emissiveIntensity = lit ? 1 : 0; });
      S.winMats.forEach((m) => (m.emissiveIntensity = lit ? 1 : 0));
      shopGlow.material.emissiveIntensity = lit ? 0.8 : 0; doorGlow.material.color.set(lit ? '#c89a50' : '#1a1014');
      amb.intensity = lit ? 1.5 : 1.0; hemi.intensity = lit ? 0.9 : 1.5; hemi.color.set(lit ? '#ff5a6a' : '#ff3048');
      S.sub = lit ? 'São Paulo · 02:19' : 'São Paulo · 02:44 · blackout';
      const day = F.ch >= 1;
      skyMesh.material.map = day ? dayTex : aur; skyMesh.material.needsUpdate = true;
      sc.background.set(day ? '#c9b4b8' : '#0b0610'); sc.fog.color.set(day ? '#cdb6b4' : '#3a0d1c'); sc.fog.near = day ? 30 : 24; sc.fog.far = day ? 90 : 70;
      if (day) { amb.color.set('#c8cce4'); amb.intensity = 2.5; hemi.color.set('#ffe6d0'); hemi.groundColor.set('#5a5468'); hemi.intensity = 1.5; dl.color.set('#ffe6c0'); dl.intensity = 2.4; dl.position.set(14, 10, 12); S.sub = 'São Paulo · the morning after'; }
      S.actors.forEach((a) => (a.g.visible = (a.chap || 0) === (day ? 1 : 0)));
      ch1Objs.forEach((o) => (o.visible = day));
      S.warps['6,9'].lock = day ? 'Mama said to stay close.' : null;
    };
    S.update = (dt, t) => {
      aur.offset.x = (t * 0.004) % 1;
      tl += dt; const ph = Math.floor(tl / 3) % 3;
      tls.forEach((ms, i) => ms.forEach((m, k) => m.color.set(F.blackout ? '#1c1c22' : ((ph + i) % 3 === k ? ['#ff3040', '#ffb020', '#40e080'][k] : '#26262e'))));
      alarmCar.hm.color.set(F.ch < 1 && Math.sin(t * 9) > 0 ? '#ffb040' : '#3a2810');
      if (!F.blackout) { const L = S.lamps[1], fl = Math.random() < 0.08 ? 0.2 : 1; L.headMat.emissiveIntensity = fl; L.cone.material.opacity = 0.32 * fl; L.pool.material.opacity = 0.85 * fl; }
      bal.forEach((b, i) => (b.ph.visible = F.ch < 1 && Math.sin(t * 0.7 + i * 2) > -0.6));
      const tint = (a) => { const px = a.g.position.x, pz = a.g.position.z; let warm = 0; if (!F.blackout) S.lamps.forEach((l) => { const d = Math.hypot(px - l.x, pz - l.z); if (d < 1.5) warm = Math.max(warm, 1 - d / 1.5); }); warm = Math.round(warm * 3) / 3; a.sp.material.color.setRGB(F.blackout ? 0.78 : 0.66 + warm * 0.34, F.blackout ? 0.5 : 0.62 + warm * 0.32, F.blackout ? 0.56 : 0.78 + warm * 0.05); };
      if (F.ch >= 1) { P.sp.material.color.setRGB(1, 0.95, 0.92); S.actors.forEach((a) => a.sp.material.color.setRGB(1, 0.95, 0.92)); if (!busy) worker.dir = Math.floor(t / 1.1) % 2 ? 2 : 3; return; }
      tint(P); S.actors.forEach(tint);
    };
    S.camBase = { h: 8.4, d: 8.8, yaw: 0, fov: 30, ty: 0.5 };
    S.camZone = (x, z) => {
      if (x >= 13 && x <= 16 && z <= 11) return { h: 3.2, d: 7.6, yaw: 0, fov: 44, ty: 2.1 };
      if (x >= 13 && x <= 16 && z <= 15) return { h: 6.2, d: 9.4, yaw: -0.5, fov: 34, ty: 0.8 };
      if (z <= 11 && x <= 10) return { h: 6.2, d: 7.4, yaw: 0.4, fov: 32, ty: 1.1 };
      if (z >= 17 && x <= 12) return { h: 10, d: 7.6, yaw: 0.18, fov: 30, ty: 0.4 };
      if (z >= 17 && x >= 17) return { h: 10, d: 7.6, yaw: -0.18, fov: 30, ty: 0.4 };
      return S.camBase;
    };
    S.camTarget = (x, z) => ({ x: clamp(x, -1, 30), z: clamp(z, 0, 24) });
  })();

  // ---------- LAB (Chapter One) ----------
  const labDigits = (tex, txt) => { const g = tex.userData.g; g.fillStyle = '#0a0808'; g.fillRect(0, 0, 24, 9); g.fillStyle = '#ff3344'; let x = 1; for (const ch of txt) { if (ch === ':') { g.fillRect(x, 3, 1, 1); g.fillRect(x, 5, 1, 1); x += 2; continue; } const b = DIG[ch]; for (let i = 0; i < 15; i++) if (b[i] === '1') g.fillRect(x + (i % 3), 2 + Math.floor(i / 3), 1, 1); x += 4; } tex.needsUpdate = true; };
  const lab = newScene('lab', 0, 1, 10, 6);
  (function buildLab() {
    const S = lab, sc = S.scene;
    S.title = 'Plasma Physics Lab'; S.sub = 'São Paulo · 10:41';
    sc.background = new THREE.Color('#0c0b12');
    sc.add(new THREE.AmbientLight('#a8aec8', 1.5));
    sc.add(new THREE.HemisphereLight('#fff4e8', '#3a3448', 0.8));
    const dl = new THREE.DirectionalLight('#fff0d8', 1.1); dl.position.set(3, 8, 8); sc.add(dl);
    const sun = new THREE.PointLight('#ffe8c8', 6, 6, 1.6); sun.position.set(8.5, 1.8, 1.2); sc.add(sun);
    const scr = new THREE.PointLight('#7ab8ff', 2.5, 3.5, 1.6); scr.position.set(5, 1.2, 1.6); sc.add(scr);
    const fT = ctex(12 * 16, 8 * 16, (g, w, h) => { const r = rng(31); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.fillStyle = ((x + y) / 16) % 2 ? '#8a8e8c' : '#7c807e'; g.fillRect(x, y, 16, 16); g.fillStyle = '#6a6e6c'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16); g.fillStyle = '#969a98'; g.fillRect(x, y, 15, 1); }
      for (let i = 0; i < 600; i++) { g.fillStyle = r() < 0.5 ? '#727674' : '#9a9e9c'; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); } for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(40,40,50,0.2)'; g.fillRect(r() * w | 0, r() * h | 0, 6 + r() * 10 | 0, 1); } });
    const fl = add(sc, new THREE.PlaneGeometry(12, 8), lam('#ffffff', { map: fT }), 5, 0, 3.5); fl.rotation.x = -Math.PI / 2;
    const wT = ctex(16, 32, (g) => { g.fillStyle = '#a7aab4'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#b4b7c0'; g.fillRect(0, 0, 16, 1); g.fillStyle = '#9a9da8'; g.fillRect(0, 20, 16, 1); g.fillStyle = '#7c7f8c'; g.fillRect(0, 21, 16, 11); g.fillStyle = '#70737e'; for (let x = 0; x < 16; x += 8) g.fillRect(x, 21, 1, 11); g.fillStyle = '#4e505a'; g.fillRect(0, 30, 16, 2); });
    const wm = (rx) => { const t = wT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); t.needsUpdate = true; return lam('#ffffff', { map: t }); };
    const cap = lam('#2a2834');
    const wall = (w, h, d, x, y, z, rx) => { const m = wm(rx); add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
    wall(14, 2.8, 1, 5, 1.4, 0, 14); wall(1, 2.8, 8, -1.5, 1.4, 3.5, 8); wall(1, 2.8, 8, 11.5, 1.4, 3.5, 8);
    const low = lam('#4a4c58');
    add(sc, BOX(5.5, 0.45, 0.4), low, 1.75, 0.22, 7.2); add(sc, BOX(5.5, 0.45, 0.4), low, 8.25, 0.22, 7.2);
    add(sc, BOX(0.1, 0.7, 0.4), lam('#2a2834'), 4.5, 0.35, 7.2); add(sc, BOX(0.1, 0.7, 0.4), lam('#2a2834'), 5.5, 0.35, 7.2);
    const skyT = ctex(40, 24, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9cb6d8'); gr.addColorStop(1, '#e8d8c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#b8bccc'; [[0, 12, 6], [7, 8, 5], [13, 14, 8], [22, 6, 6], [29, 11, 5], [35, 9, 5]].forEach(([x, y, bw]) => g.fillRect(x, y, bw, h - y)); g.fillStyle = '#9a9eb0'; for (let i = 0; i < 30; i++) g.fillRect((i * 7) % 40, 14 + (i * 5) % 9, 1, 1); });
    add(sc, BOX(1.9, 1.1, 0.06), lam('#3a3c48'), 8.5, 1.75, 0.52); add(sc, new THREE.PlaneGeometry(1.76, 0.96), new THREE.MeshBasicMaterial({ map: skyT }), 8.5, 1.75, 0.56);
    add(sc, BOX(0.04, 0.96, 0.04), lam('#3a3c48'), 8.5, 1.75, 0.58); add(sc, BOX(2.1, 0.08, 0.18), lam('#3a3c48'), 8.5, 1.17, 0.6);
    const pool = add(sc, new THREE.PlaneGeometry(2.2, 2.4), addMat('#fff0d0', rectGlowTex, 0.35), 8.5, 0.012, 1.8); pool.rotation.x = -Math.PI / 2;
    const desk = (x0, x1, top) => { const w = x1 - x0 + 1, cx = (x0 + x1) / 2; add(sc, BOX(w - 0.1, 0.06, 0.86), lam(top), cx, 0.76, 0.95); [[x0 - 0.4, 0.6], [x1 + 0.4, 0.6], [x0 - 0.4, 1.3], [x1 + 0.4, 1.3]].forEach(([lx, lz]) => add(sc, BOX(0.06, 0.74, 0.06), lam('#3a3a44'), lx, 0.37, lz)); add(sc, BOX(w - 0.2, 0.5, 0.04), lam('#5a5a64'), cx, 0.45, 0.56); blockRect(S, x0, 1, x1, 1); };
    desk(3, 7, '#7a7a84'); desk(8, 9, '#7a7a84'); desk(0, 1, '#6a5a4a');
    const graphTex = ctex(64, 40, () => {}), upTex = ctex(48, 32, () => {});
    const codeTex = ctex(48, 32, (g, w, h) => { g.fillStyle = '#0e1420'; g.fillRect(0, 0, w, h); const r = rng(4); for (let y = 2; y < h - 1; y += 3) { let x = 2 + (r() * 3 | 0) * 2; const n = 1 + (r() * 4 | 0); for (let k = 0; k < n; k++) { const L = 3 + (r() * 9 | 0); g.fillStyle = ['#7ab8ff', '#e8d080', '#a0e0a0', '#c8c8d8', '#ff9a7a'][r() * 5 | 0]; g.fillRect(x, y, L, 1); x += L + 2; if (x > w - 4) break; } } });
    const monitor = (x, tex, w = 0.8, h = 0.52) => { add(sc, BOX(0.08, 0.24, 0.08), lam('#22222a'), x, 0.9, 0.8); add(sc, BOX(w + 0.08, h + 0.08, 0.05), lam('#16161c'), x, 1.04 + h / 2, 0.78); return add(sc, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), x, 1.04 + h / 2, 0.81); };
    monitor(4.05, codeTex); monitor(5, graphTex, 0.92, 0.58); monitor(5.95, codeTex); monitor(8.55, upTex, 0.62, 0.42);
    const peak = (i) => [[12, 1, 3.5], [30, 0.85, 4.5], [47, 0.75, 5]].reduce((a, [c, k, wd]) => a + k * Math.exp(-((i - c) ** 2) / (2 * wd * wd)), 0) + Math.sin(i * 1.7) * 0.025;
    const drawGraph = (prog, t) => { const g = graphTex.userData.g, m = S.gmode; g.fillStyle = '#0b1120'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#18223a'; for (let x = 4; x < 64; x += 10) g.fillRect(x, 2, 1, 34); for (let y = 6; y < 36; y += 8) g.fillRect(4, y, 58, 1); g.fillStyle = '#6a7a9a'; g.fillRect(3, 36, 59, 1); g.fillRect(3, 2, 1, 35);
      const N = Math.floor(58 * prog);
      if (m === 2) { g.fillStyle = '#3e8a5a'; for (let i = 0; i < 58; i++) { g.fillRect(4 + i, (33 - 22 * peak(i + 3)) | 0, 1, 1); g.fillRect(4 + i, (34 - 20 * peak(i - 2)) | 0, 1, 1); } }
      g.fillStyle = '#ffa04a'; for (let i = 0; i < 58; i++) g.fillRect(4 + i, (33 - 26 * peak(i)) | 0, 1, 2);
      if (m >= 1) { g.fillStyle = '#5ad0ff'; for (let i = 0; i < N; i++) { const v = i < 18 ? peak(i) : peak(i) * Math.max(0.12, 1 - (i - 18) / 26); g.fillRect(4 + i, (33 - 26 * v) | 0, 1, 1); } }
      if (Math.sin(t * 6) > 0) { g.fillStyle = '#e8f0ff'; g.fillRect(4 + Math.min(N, 57), 3, 1, 3); }
      graphTex.needsUpdate = true; };
    const drawUp = (t) => { const g = upTex.userData.g; g.fillStyle = '#14110a'; g.fillRect(0, 0, 48, 32); g.fillStyle = '#2a2414'; for (let y = 6; y < 30; y += 8) g.fillRect(2, y, 44, 1); g.fillStyle = '#ffd250'; for (let x = 0; x < 44; x++) { const k = x + t * 6; const v = Math.sin(k * 0.21) * 3 + Math.sin(k * 0.07) * 4 + (Math.sin(k * 0.9) > 0.9 ? 5 : 0); g.fillRect(2 + x, (17 - v) | 0, 1, 1); } g.fillRect(2, 2, 2, 2); upTex.needsUpdate = true; };
    const clk = ctex(24, 9, () => {}); labDigits(clk, '10:41');
    add(sc, BOX(1.1, 0.44, 0.06), lam('#0a0808'), 5, 2.3, 0.53); add(sc, new THREE.PlaneGeometry(1.0, 0.375), new THREE.MeshBasicMaterial({ map: clk }), 5, 2.3, 0.565);
    const noteT = ctex(14, 10, (g) => { g.fillStyle = '#f2ead0'; g.fillRect(0, 0, 14, 10); g.fillStyle = '#2a3a6a'; [[2, 2, 9], [2, 4, 10], [2, 6, 8], [2, 8, 5]].forEach(([x, y, l]) => g.fillRect(x, y, l, 1)); });
    const note = add(sc, new THREE.PlaneGeometry(0.36, 0.26), lam('#ffffff', { map: noteT }), 7.25, 1.72, 0.52); note.rotation.z = 0.07;
    const wbT = ctex(36, 20, (g) => { g.fillStyle = '#eceef2'; g.fillRect(0, 0, 36, 20); g.fillStyle = '#2a50a0'; for (let a = 0; a < 6.28; a += 0.25) g.fillRect((9 + Math.cos(a) * 3) | 0, (10 + Math.sin(a) * 3) | 0, 1, 1); g.fillStyle = '#c03040'; for (const k of [5, 8]) for (let a = -2.6; a < 2.6; a += 0.12) g.fillRect((9 + Math.cos(a) * k * 1.3) | 0, (10 + Math.sin(a) * k * 0.8) | 0, 1, 1); g.fillStyle = '#2a2a34'; [[22, 4, 10], [22, 7, 8], [22, 10, 11], [22, 13, 6], [22, 16, 9]].forEach(([x, y, l]) => g.fillRect(x, y, l, 1)); });
    add(sc, BOX(1.9, 1.06, 0.05), lam('#8a8c96'), 0.5, 1.75, 0.52); add(sc, new THREE.PlaneGeometry(1.8, 0.98), lam('#ffffff', { map: wbT }), 0.5, 1.75, 0.555);
    add(sc, BOX(0.5, 0.34, 0.4), lam('#3a3a44'), 0.2, 0.96, 0.9); add(sc, new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshBasicMaterial({ color: '#3aff9a' }), 0.12, 0.98, 1.105);
    const greenPCB = lam('#2a6a3a'); [[0.8, 0.8, 1.05, 0.3], [1.15, 0.8, 0.85, -0.4], [6.9, 0.8, 1.15, 0.2]].forEach(([x, y, z, r]) => add(sc, BOX(0.26, 0.02, 0.18), greenPCB, x, y, z).rotation.y = r);
    const cup = (x, z, top = '#5a3a24') => { add(sc, new THREE.CylinderGeometry(0.05, 0.045, 0.11, 8), lam('#ecebe6'), x, 0.85, z); add(sc, new THREE.CircleGeometry(0.044, 8), lam(top), x, 0.906, z).rotation.x = -Math.PI / 2; };
    cup(3.7, 0.9); cup(7.5, 1.1); cup(1.4, 1.15); cup(0.55, 1.2);
    const newCup = new THREE.Group(); sc.add(newCup); newCup.visible = false;
    add(newCup, new THREE.CylinderGeometry(0.05, 0.045, 0.12, 8), lam('#e8e2d4'), 5.75, 0.85, 1.2); add(newCup, new THREE.CylinderGeometry(0.052, 0.052, 0.03, 8), lam('#3a2a20'), 5.75, 0.92, 1.2);
    add(sc, BOX(0.26, 0.06, 0.14), lam('#d8a040'), 3.3, 0.82, 1.05); add(sc, BOX(0.1, 0.02, 0.1), lam('#c89a5a'), 3.5, 0.8, 1.2);
    const paper = lam('#ecebe4'), r = rng(55);
    for (let i = 0; i < 16; i++) { const onDesk = i < 8; const x = onDesk ? 3 + r() * 6.6 : -0.6 + r() * 11; const z = onDesk ? 0.75 + r() * 0.5 : 1.8 + r() * 4.8; const p = add(sc, new THREE.PlaneGeometry(0.2, 0.28), paper, x, onDesk ? 0.795 : 0.01 + i * 0.0005, z); p.rotation.x = -Math.PI / 2; p.rotation.z = r() * 3; }
    const pile = (x, z, n) => { for (let i = 0; i < n; i++) add(sc, BOX(0.42, 0.09, 0.32), paper, x + (r() - 0.5) * 0.06, 0.05 + i * 0.09, z + (r() - 0.5) * 0.06).rotation.y = (r() - 0.5) * 0.3; S.block.add(x + ',' + z); };
    pile(0, 5, 6); pile(10, 4, 4);
    add(sc, BOX(0.8, 2.0, 0.8), lam('#2a2c36'), 10, 1.0, 1); S.block.add('10,1');
    const leds = []; for (let i = 0; i < 9; i++) { const m = new THREE.MeshBasicMaterial({ color: '#40e080' }); add(sc, BOX(0.05, 0.05, 0.02), m, 9.75 + (i % 3) * 0.12, 1.7 - Math.floor(i / 3) * 0.35, 1.41); leds.push(m); }
    const mateo = actor(FR.mateo, 1.66); mateo.g.visible = false; sc.add(mateo.g); S.actors.push(mateo);
    const closeUp = () => { S.camOverride = { h: 1.7, d: 2.8, yaw: 0.95, fov: 38, ty: 1.25 }; S.targetOverride = { x: 4.9, z: 1.0 }; };
    const wide = () => { S.camOverride = null; S.targetOverride = null; };
    const faceEach = () => { P.dir = mateo.x > P.x ? 3 : mateo.x < P.x ? 2 : mateo.z > P.z ? 0 : 1; mateo.dir = OPP[P.dir]; };
    on(S, [[3, 1]], async () => say(null, 'A half-eaten packet of biscuits lay beside his keyboard.'));
    on(S, [[7, 1]], async () => { await say(null, 'On one wall, a handwritten note read:'); await say('Note', 'A beautiful theory is still wrong if nature disagrees with it.'); await say(null, 'Kiran had written it after his first major research paper was rejected. He considered it one of the most important sentences in the room.'); });
    on(S, [[0, 1], [1, 1]], async () => say(null, 'Small circuit boards lay among coffee cups.'));
    on(S, [[0, 5], [10, 4]], async () => say(null, 'Scientific papers covered nearly every surface.'));
    on(S, [[10, 1]], async () => say(null, 'Old scientific instruments, humming quietly.'));
    on(S, [[4, 1], [5, 1], [6, 1]], async () => {
      if (F.epi) { if (F.epi !== 1) return; F.epi = 2; await epiMeet(); closeUp(); await mgEpi(); wide(); await epiEnd(); return; }
      if (F.ch >= 2) return say(null, 'The gap between the curves was still there.');
      if (!F.mateo) {
        closeUp();
        await mgPattern();
        wide(); labDigits(clk, '10:42'); S.sub = 'São Paulo · 10:42'; await wait(700);
        const tx = P.x + 1, path = [[5, 6], [5, 5], [5, 4], [5, 3]]; for (let x = 6; x <= tx; x++) path.push([x, 3]); path.push([tx, 2]);
        place(mateo, 5, 7, 1, S); mateo.g.visible = true; await walkActor(mateo, path); faceEach();
        await emote(P, '!');
        await say(null, 'At 10:42, his friend Mateo Reyes arrived at the laboratory carrying two coffees and a bag of electronic components.');
        await emote(mateo, '…', 0.9);
        await talk('Kiran', 'Mateo', async () => {
          await say(null, 'He looked around the laboratory.', { Mateo: 'confused', Kiran: 'tired' });
          await say('Mateo', 'Did you go home?', 'worried'); await say('Kiran', 'No.', 'tired'); await say('Mateo', 'Did you eat?', 'serious');
          P.dir = 1; await say(null, 'Kiran pointed toward the biscuits.', { Kiran: 'neutral' }); faceEach();
          await say('Mateo', 'Those are from yesterday.', 'sarcastic'); await say('Kiran', 'Still food.', 'playful');
          newCup.visible = true; await say(null, 'Mateo placed a coffee beside him.', { Mateo: 'neutral' });
          await say('Mateo', 'I saw the sky.', 'worried');
          await say(null, 'Kiran turned the screen.', { Kiran: 'curious' }); await say('Kiran', 'Look at this.', 'curious');
          await say(null, 'Mateo sighed.', { Mateo: 'frustrated' }); await say('Mateo', "I was hoping we'd have at least one conversation before you showed me a graph.", 'smirk'); await say('Kiran', 'Look at the graph.', 'determined');
        });
        closeUp();
        await mgDiagnose();
        wide(); mateo.dir = 3;
        await say(null, 'Mateo pointed toward a smaller panel containing measurements from the upstream solar-wind monitor.');
        await say('Mateo', "Then maybe you're measuring the wrong input.", 'thinking');
        F.mateo = 1; return;
      }
      if (F.mateo === 1) return say('Mateo', 'Then maybe you\'re measuring the wrong input.', 'thinking');
      closeUp(); S.gmode = 2; S.gprog = 0;
      await say(null, 'Kiran opened another dataset. Mateo continued drinking his coffee.');
      await wait(1400);
      await say(null, 'After several minutes, Kiran leaned back.');
      wide(); faceEach();
      await talk('Kiran', 'Mateo', async () => {
        await say('Kiran', 'Still doesn\'t explain it.', { Kiran: 'disappointed', Mateo: 'neutral' }); await say('Mateo', 'Good.', 'happy'); await say('Kiran', 'Good?', 'annoyed'); await say('Mateo', 'It means we\'re getting somewhere.', 'proud');
        await say(null, 'Kiran stared at him.', { Kiran: 'serious' }); await say('Kiran', 'You have a very strange definition of progress.', 'sarcastic');
        await say(null, 'Mateo grinned.', { Mateo: 'grin' }); await say('Mateo', 'So do you.', 'laughing');
      });
      await wait(500); await fadeTo(1, 0.9);
      await cinematic('ch1_close');
      F.ch = 2;
      await chapterCard('End of Chapter One', 'The First Seventy-Two Hours', 2.8);
      await goChapter2();
    });
    on(S, [[8, 1], [9, 1]], async () => {
      if (F.mateo !== 1) return say(null, 'A smaller panel containing measurements from the upstream solar-wind monitor.');
      await talk('Kiran', 'Mateo', async () => {
        await say('Kiran', 'We have the solar wind.', { Kiran: 'neutral', Mateo: 'thinking' }); await say('Mateo', 'At one location.', 'thinking'); await say('Kiran', 'Yes.', 'confident');
        await say('Mateo', 'And you\'ve assumed that\'s enough to represent the conditions reaching the entire system?', 'sarcastic');
      });
      await mgFront();
      F.mateo = 2;
    });
    mateo.onTalk = async () => { if (F.ch >= 2) return say('Mateo', 'So do you.'); if (F.mateo === 1) return say('Mateo', 'Then maybe you\'re measuring the wrong input.'); return say(null, 'Mateo continued drinking his coffee.'); };
    S.gmode = 0; S.gprog = 1;
    let acc = 0;
    S.update = (dt, t) => {
      acc += dt; if (S.gprog < 1) S.gprog = Math.min(1, S.gprog + dt * 0.35);
      if (acc > 0.08) { acc = 0; drawGraph(S.gprog, t); drawUp(t); }
      leds.forEach((m, i) => m.color.set(Math.sin(t * 3 + i * 1.7) > 0.2 ? (i % 3 ? '#40e080' : '#ffb040') : '#1a2a20'));
      P.sp.material.color.setRGB(0.98, 0.96, 0.95); mateo.sp.material.color.setRGB(0.98, 0.96, 0.95);
    };
    S.camBase = { h: 6.2, d: 5.8, yaw: 0, fov: 38, ty: 0.8 };
    S.camZone = (x) => (x <= 1 ? { ...S.camBase, yaw: 0.2 } : x >= 8 ? { ...S.camBase, yaw: -0.2 } : S.camBase);
    S.camTarget = (x, z) => ({ x: clamp(x, 2.5, 7.5), z: clamp(z, 3, 4) });
  })();
  // ---------- GENEVA (Chapter Two) ----------
  const geneva = newScene('geneva', 0, 1, 13, 13);
  const TOPICS = ['models', 'senior', 'back', 'front'], TOPIC = { mA: 'models', mB: 'models', senior: 'senior', back: 'back', gov: 'front', geo: 'front' };
  const G2 = { heard: {}, amb: 0.8, clap: 0, clapT: 0, talkers: [], crowd: [], mercer: null, voss: null, screen: 'models', turn: false };
  let noiseBuf = null;
  function clap(v) {
    if (!sounds) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
      if (!noiseBuf) { const n = Math.floor(actx.sampleRate * 0.05); noiseBuf = actx.createBuffer(1, n, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4); }
      const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(); s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 1800; f.Q.value = 1.2; g.gain.value = v;
      s.connect(f); f.connect(g); g.connect(actx.destination); s.start();
    } catch (err) {}
  }
  FR.mercer = charFrames({ hair: '#e6e2da', hair2: '#b8b4ac', skin: '#e2b294', shirt: '#7a6a54', shirt2: '#5a4c3c', tee: '#d8d0c0', pants: '#3a3430', shoe: '#2a2018', eye: '#1a1420', glasses: '#3a3a44', lens: '#c8d0e0' });
  FR.voss = charFrames({ hair: '#d0ced4', hair2: '#9a98a2', skin: '#dcae8e', shirt: '#1c1a24', shirt2: '#100e16', tee: '#ece8f0', print: '#8a1a2a', print2: '#b02a3a', pants: '#16141c', shoe: '#0c0a10', eye: '#1a1420' });
  (function buildGeneva() {
    const S = geneva, sc = S.scene, dr = rng(77), pick = (a) => a[(dr() * a.length) | 0];
    S.title = 'Geneva Conference Centre'; S.sub = 'International scientific emergency';
    sc.background = new THREE.Color('#06050a');
    sc.add(new THREE.AmbientLight('#8c8eb4', 1.1));
    sc.add(new THREE.HemisphereLight('#ffe8d8', '#1a1828', 0.5));
    const kl = new THREE.DirectionalLight('#ffe6d0', 0.65); kl.position.set(2, 9, 12); sc.add(kl);
    const stL = new THREE.PointLight('#ffe2c0', 8, 9, 1.4); stL.position.set(6.5, 3.8, 3); sc.add(stL);
    const eL = new THREE.PointLight('#6ab8ff', 4, 6, 1.6); eL.position.set(6.5, 2.6, 1.8); sc.add(eL);
    S.groundH = (x, z) => (z <= 2 && x >= 1 && x <= 12 ? 0.3 : 0);
    const fT = ctex(14 * 16, 13 * 16, (g, w, h) => { const r = rng(21);
      g.fillStyle = '#261c30'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < w; x += 8) { g.fillStyle = '#2c2238'; g.fillRect(x, y, 2, 2); }
      for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? '#211828' : '#30263c'; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
      g.fillStyle = '#5a2430'; g.fillRect(96, 0, 32, h); g.fillStyle = '#c8a050'; g.fillRect(97, 0, 1, h); g.fillRect(126, 0, 1, h);
      g.fillStyle = '#4a1e28'; for (let y = 0; y < h; y += 6) g.fillRect(102, y, 20, 1); });
    const fl = add(sc, new THREE.PlaneGeometry(14, 13), lam('#ffffff', { map: fT }), 6.5, 0, 7); fl.rotation.x = -Math.PI / 2;
    add(sc, BOX(12, 0.3, 2.1), lam('#3a2826'), 6.5, 0.15, 1.45); add(sc, BOX(12, 0.04, 0.06), lam('#c8a050'), 6.5, 0.31, 2.5);
    add(sc, BOX(2.2, 0.15, 0.5), lam('#4a3430'), 6.5, 0.075, 2.75);
    [0, 13].forEach((x) => { S.block.add(x + ',1'); S.block.add(x + ',2'); });
    const wT = ctex(16, 64, (g) => { g.fillStyle = '#1e1c2c'; g.fillRect(0, 0, 16, 64); g.fillStyle = '#26243a'; g.fillRect(0, 0, 16, 1); g.fillStyle = '#18162a'; for (let y = 8; y < 64; y += 8) g.fillRect(0, y, 16, 1); g.fillStyle = '#2a2840'; g.fillRect(7, 0, 1, 64); });
    const wm = (rx) => { const t = wT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); t.needsUpdate = true; return lam('#ffffff', { map: t }); };
    const cap = lam('#141220'), wall = (w, h, d, x, y, z, rx) => { const m = wm(rx); add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
    wall(16, 5.2, 0.5, 6.5, 2.6, 0.15, 16); wall(0.5, 5.2, 14.5, -1.05, 2.6, 7.2, 14); wall(0.5, 5.2, 14.5, 14.05, 2.6, 7.2, 14);
    add(sc, BOX(15, 0.5, 0.3), lam('#2a2836'), 6.5, 0.25, 13.9);
    // stage screens: solar wind (left), the modellers' simulations (right)
    const swT = ctex(64, 36, () => {}), mdT = ctex(64, 36, () => {});
    const scr = (x, tex) => { add(sc, BOX(3.3, 1.95, 0.08), lam('#0c0a12'), x, 2.75, 0.44); add(sc, new THREE.PlaneGeometry(3.15, 1.8), new THREE.MeshBasicMaterial({ map: tex }), x, 2.75, 0.49); };
    scr(2.4, swT); scr(10.6, mdT);
    const banT = ctex(256, 12, (g) => { g.fillStyle = '#100e18'; g.fillRect(0, 0, 256, 12); g.fillStyle = '#c8a050'; g.font = 'bold 8px monospace'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('INTERNATIONAL SCIENTIFIC EMERGENCY · GENEVA', 128, 6.5); });
    add(sc, new THREE.PlaneGeometry(7.4, 0.35), new THREE.MeshBasicMaterial({ map: banT }), 6.5, 4.5, 0.42);
    // the luminous model of Earth
    const earthG = new THREE.Group(); earthG.position.set(6.5, 2.45, 1.3); sc.add(earthG);
    const eT = ctex(64, 32, (g) => { g.fillStyle = '#143e78'; g.fillRect(0, 0, 64, 32); const r = rng(9); g.fillStyle = '#2f7a52'; for (let i = 0; i < 16; i++) g.fillRect(r() * 60 | 0, 5 + r() * 22 | 0, 3 + r() * 9 | 0, 2 + r() * 5 | 0); g.fillStyle = '#e8f0ff'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 30, 64, 2); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 10; i++) g.fillRect(r() * 60 | 0, r() * 30 | 0, 6, 1); });
    const globe = add(earthG, new THREE.SphereGeometry(0.42, 18, 12), new THREE.MeshBasicMaterial({ map: eT }), 0, 0, 0);
    const halo = add(earthG, new THREE.SphereGeometry(0.48, 16, 10), new THREE.MeshBasicMaterial({ color: '#ff4a5a', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }), 0, 0, 0);
    const fieldMat = new THREE.LineBasicMaterial({ color: '#6ad8ff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    for (let k = 0; k < 8; k++) { const ph = (k / 8) * Math.PI * 2; for (const Ls of [1.7, 2.5, 3.6]) { const lm = Math.acos(Math.sqrt(1 / Ls)), pts = []; for (let i = 0; i <= 40; i++) { const la = -lm + (2 * lm * i) / 40, r = Ls * Math.cos(la) ** 2 * 0.42; let x = r * Math.cos(la) * Math.cos(ph); const y = r * Math.sin(la), z = r * Math.cos(la) * Math.sin(ph); x *= x > 0 ? 1 + 0.25 * Ls : 0.82; pts.push(new THREE.Vector3(x, y, z)); } earthG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fieldMat)); } }
    const wN = 40, wPos = new Float32Array(wN * 3), wr = rng(3); for (let i = 0; i < wN; i++) { wPos[i * 3] = -3 + wr() * 2.4; wPos[i * 3 + 1] = (wr() - 0.5) * 1.6; wPos[i * 3 + 2] = (wr() - 0.5) * 0.8; }
    const wGeo = new THREE.BufferGeometry(); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
    earthG.add(new THREE.Points(wGeo, new THREE.PointsMaterial({ color: '#ffc27a', size: 0.05, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));
    // podium (speaker stands behind it at 8,1)
    add(sc, BOX(0.62, 0.95, 0.42), lam('#4a3a36'), 8, 0.775, 2.05); add(sc, BOX(0.66, 0.05, 0.46), lam('#c8a050'), 8, 1.27, 2.05); S.block.add('8,2');
    add(sc, new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), lam('#22222a'), 7.9, 1.42, 1.95);
    // remote delegates on the side walls
    const faceT = (seed) => ctex(48, 24, (g) => { const r = rng(seed); for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { const x = i * 12, y = j * 12; g.fillStyle = ['#1a2a3a', '#2a1a2a', '#1a2a24', '#2a2418'][(i + j * 2 + seed) % 4]; g.fillRect(x, y, 12, 12); g.fillStyle = '#0a0a10'; g.fillRect(x, y, 12, 1); g.fillRect(x, y, 1, 12);
      g.fillStyle = ['#3a3a48', '#5a2a34', '#2a3a4a', '#c8c8d4'][(r() * 4) | 0]; g.fillRect(x + 3, y + 8, 7, 4); g.fillStyle = ['#ecc6a6', '#c08860', '#7a4a32', '#e0b090', '#a06a48'][(r() * 5) | 0]; g.fillRect(x + 4, y + 3, 4, 5); g.fillStyle = ['#1c1418', '#5a4030', '#c8c4c0', '#2a1a14'][(r() * 4) | 0]; g.fillRect(x + 4, y + 2, 4, 2); } });
    [[-0.79, 4.5, Math.PI / 2, 5], [-0.79, 9, Math.PI / 2, 6], [13.79, 4.5, -Math.PI / 2, 7], [13.79, 9, -Math.PI / 2, 8]].forEach(([x, z, ry, sd]) => { add(sc, BOX(0.06, 1.5, 2.9), lam('#0c0a12'), x, 2.4, z); const m = add(sc, new THREE.PlaneGeometry(2.8, 1.4), new THREE.MeshBasicMaterial({ map: faceT(sd) }), x + (ry > 0 ? 0.04 : -0.04), 2.4, z); m.rotation.y = ry; });
    // delegate rows
    const deskM = lam('#3a3040'), topM = lam('#5a4c5a'), glow = new THREE.MeshBasicMaterial({ color: '#8ab8ff' });
    [5, 7, 9, 11].forEach((rz) => [[3, 1, 5], [10, 8, 12]].forEach(([cx, x0, x1]) => { add(sc, BOX(4.9, 0.6, 0.32), deskM, cx, 0.3, rz - 0.42); add(sc, BOX(4.9, 0.04, 0.38), topM, cx, 0.62, rz - 0.42); for (let x = x0; x <= x1; x++) { S.block.add(x + ',' + rz); if ((x + rz) % 3 === 0) add(sc, BOX(0.22, 0.02, 0.14), glow, x, 0.65, rz - 0.42); } }));
    const HAIR = ['#1c1418', '#3a2a22', '#5a4030', '#8a8890', '#c8c4c0', '#2a1a14', '#6a4a2a', '#a07040', '#14100e'];
    const SKIN = ['#ecc6a6', '#d6a07a', '#c08860', '#a06a48', '#7a4a32', '#e0b090', '#b07a58', '#8a5a3c'];
    const SUIT = [['#2a2c3a', '#1e2030'], ['#3a3a44', '#2a2a34'], ['#4a3a30', '#3a2c24'], ['#2a3a4a', '#1e2a38'], ['#5a2a34', '#401e26'], ['#c8c8d4', '#a0a0b0'], ['#3c5a48', '#2c4436'], ['#b08a48', '#8a6a34'], ['#6a5a7a', '#4e4260']];
    const DVAR = Array.from({ length: 12 }, () => { const s = pick(SUIT); return charFrames({ hair: pick(HAIR), skin: pick(SKIN), shirt: s[0], shirt2: s[1], tee: dr() < 0.55 ? (dr() < 0.7 ? '#e8e4ec' : '#c8d8e8') : undefined, pants: '#24222c', shoe: '#16141a', eye: '#1a1420', long: dr() < 0.3, bun: dr() < 0.15, curls: dr() < 0.2, glasses: dr() < 0.3 ? '#1a1a20' : undefined, lens: '#a8b4cc' }); });
    const KEYD = { '3,7': 'mA', '4,7': 'mB', '9,9': 'senior', '11,11': 'back', '2,5': 'gov', '3,5': 'geo', '8,5': 'voss' };
    let i = 0;
    [5, 7, 9, 11].forEach((rz) => { for (let x = 1; x <= 12; x++) { if (x === 6 || x === 7) continue; i++; const id = KEYD[x + ',' + rz]; if (!id && dr() < 0.16) continue;
      const a = actor(id === 'voss' ? FR.voss : DVAR[(i * 7 + rz) % DVAR.length], id === 'voss' ? 1.62 : 1.36 + dr() * 0.16); a.home = 1; a.key = id || null;
      sc.add(a.g); S.actors.push(a); place(a, x, rz, 1, S);
      if (id === 'voss') G2.voss = a; else if (id) G2.talkers.push(a); else G2.crowd.push(a); } });
    const M = actor(FR.mercer, 1.5); M.home = 0; sc.add(M.g); S.actors.push(M); place(M, 8, 1, 0, S); G2.mercer = M;
    M.onTalk = async () => { if (F.gen === 1) return say(null, 'He looked exhausted.'); };
    // overheard arguments
    const T = (id) => G2.talkers.find((a) => a.key === id);
    const look = async (a, b) => { S.camOverride = { h: 4.6, d: 6.2, yaw: 0, fov: 30, ty: 0.9 }; S.targetOverride = { x: (a.x + (b || a).x) / 2, z: a.z + 0.6 }; await wait(380); };
    const heard = async (k) => { G2.heard[k] = true; S.camOverride = null; S.targetOverride = null; hooks.onObjective && hooks.onObjective(objective()); if (TOPICS.every((q) => G2.heard[q])) await mercerScene(); };
    const TALK = {
      models: async () => { const a = T('mA'), b = T('mB'); await look(a, b); a.dir = 3; b.dir = 2; await emote(a, '!', 0.5, true);
        await say('Delegate', 'Your upstream conditions are not properly constrained!'); await emote(b, '!', 0.4, true);
        await say('Modeller', "And your reconstruction assumes a plasma distribution we haven't measured!"); await say('Delegate', 'Then we need those measurements!'); await say('Modeller', "We don't have a spacecraft in the right region!");
        a.dir = b.dir = 1; await heard('models'); },
      senior: async () => { const a = T('senior'); await look(a); await emote(a, '!', 0.5, true); await say(null, 'A senior scientist rose.');
        await say('Senior scientist', "Colleagues, we need to establish whether we're dealing with a new physical phenomenon or a failure of our observational coverage."); await heard('senior'); },
      back: async () => { const a = T('back'); await look(a); await say(null, 'Another voice answered from the back.'); await emote(a, '!', 0.4, true);
        await say('Delegate', "While we're debating terminology, our governments are asking whether the next event will destroy major parts of the electrical grid!");
        G2.crowd.slice(0, 10).forEach((q, n) => wait(n * 90).then(() => emote(q, '!', 0.6, true))); await say(null, 'The room erupted again.'); await heard('back'); },
      front: async () => { const a = T('gov'), b = T('geo'); await look(a, b); a.dir = 3; b.dir = 2; await emote(a, '?', 0.5, true);
        await say(null, "Near the front, a government representative asked whether Earth's magnetic field was collapsing. A geophysicist responded sharply."); await emote(b, '!', 0.4, true);
        await say('Geophysicist', 'No. We have no evidence that the geodynamo is failing. Please stop confusing the internal planetary magnetic field with the external magnetospheric response.');
        await say(null, 'The correction was scientifically important. It did little to calm the room.'); a.dir = b.dir = 1; await heard('front'); },
    };
    G2.talkers.forEach((a) => (a.onTalk = async () => { if (F.gen !== 1) return; const k = TOPIC[a.key]; if (G2.heard[k]) return emote(a, '…', 0.6, true); await TALK[k](); }));
    // screens
    const drawSW = (t) => { const g = swT.userData.g; g.fillStyle = '#0a0f1c'; g.fillRect(0, 0, 64, 36); g.fillStyle = '#16203a'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 1, 36); for (let y = 4; y < 36; y += 8) g.fillRect(0, y, 64, 1);
      for (let k = 0; k < 2; k++) for (let x = 0; x < 64; x++) { const s = x + t * 9, v = k ? Math.sin(s * 0.11) * 4 + Math.sin(s * 0.37) * 2 : Math.sin(s * 0.07) * 5 + (Math.sin(s * 0.9) > 0.92 ? 4 : 0); g.fillStyle = k ? '#5ad0ff' : '#ffc27a'; g.fillRect(x, ((k ? 26 : 12) - v) | 0, 1, 1); }
      swT.needsUpdate = true; };
    const pk = (i) => [[10, 1, 2.5], [26, 0.85, 3], [42, 0.75, 3.4]].reduce((a, [c, k, w]) => a + k * Math.exp(-((i - c) ** 2) / (2 * w * w)), 0);
    const drawMD = (t) => { const g = mdT.userData.g; g.fillStyle = '#0b1120'; g.fillRect(0, 0, 64, 36); g.fillStyle = '#18223a'; for (let x = 4; x < 64; x += 10) g.fillRect(x, 1, 1, 32); g.fillStyle = '#6a7a9a'; g.fillRect(3, 33, 60, 1);
      for (let i = 0; i < 58; i++) { g.fillStyle = '#ffa04a'; g.fillRect(4 + i, (32 - 24 * pk(i)) | 0, 1, 2); }
      if (G2.screen === 'kiran') { for (let i = 0; i < 58; i++) { const v = i < 14 ? pk(i) : pk(i) * Math.max(0.15, 1 - (i - 14) / 24), a = (32 - 24 * pk(i)) | 0, b = (32 - 24 * v) | 0; if (i > 14 && b - a > 2) { g.fillStyle = '#5a1a2a'; g.fillRect(4 + i, a + 2, 1, b - a - 2); } g.fillStyle = '#5ad0ff'; g.fillRect(4 + i, b, 1, 1); } }
      else { const ph = Math.floor(t / 4) % 2; for (let i = 0; i < 58; i++) { const v = i < 12 ? pk(i) : ph ? pk(i) * 0.4 + 0.25 * Math.exp(-((i - 30) ** 2) / 60) : pk(i + 6) * 0.9; g.fillStyle = ph ? '#c08aff' : '#5ad0ff'; g.fillRect(4 + i, (32 - 24 * v) | 0, 1, 1); } }
      mdT.needsUpdate = true; };
    let acc = 0;
    S.update = (dt, t) => {
      acc += dt; if (acc > 0.08) { acc = 0; drawSW(t); drawMD(t); }
      globe.rotation.y += dt * 0.25; fieldMat.opacity = 0.55 + 0.3 * Math.sin(t * 1.6); halo.material.opacity = 0.12 + 0.08 * Math.sin(t * 0.9);
      for (let k = 0; k < wN; k++) { wPos[k * 3] += dt * (0.9 + (k % 5) * 0.12); if (wPos[k * 3] > -0.62 - 0.25 * Math.abs(wPos[k * 3 + 1])) wPos[k * 3] = -3 + (k % 7) * 0.05; } wGeo.attributes.position.needsUpdate = true;
      if (F.gen === 1 && !busy && (G2.amb -= dt) <= 0) {
        G2.amb = 0.8 + Math.random() * 0.9; const pool = G2.talkers.filter((a) => !G2.heard[TOPIC[a.key]]);
        const a = pool.length && Math.random() < 0.6 ? pool[(Math.random() * pool.length) | 0] : G2.crowd[(Math.random() * G2.crowd.length) | 0];
        if (a) emote(a, pool.includes(a) ? '…' : '!', 0.7, true);
        const b = G2.crowd[(Math.random() * G2.crowd.length) | 0]; if (b) b.dir = [1, 1, 2, 3][(Math.random() * 4) | 0];
      }
      if (G2.turn) G2.crowd.concat(G2.talkers).forEach((a) => { a.dir = P.z > a.z ? 0 : 1; });
      if (G2.clap > 0) { G2.clap -= dt; G2.clapT -= dt; if (G2.clapT <= 0) { G2.clapT = 0.02 + Math.random() * 0.05; clap(0.012 + 0.05 * Math.min(1, G2.clap / 2)); } if (Math.random() < dt * 5) { const a = G2.crowd[(Math.random() * G2.crowd.length) | 0]; if (a) emote(a, '!', 0.5, true); } }
      if (F.gen === 3 && !busy && !dlg && !P.moving && P.z <= 2) { F.gen = 4; runScript(present); }
    };
    S.camBase = { h: 9.2, d: 8.6, yaw: 0, fov: 38, ty: 0.6 };
    S.camZone = (x, z) => (z <= 3 ? { h: 6.4, d: 7.4, yaw: 0, fov: 38, ty: 1.0 } : S.camBase);
    S.camTarget = (x, z) => ({ x: clamp(x, 4.5, 8.5), z: clamp(z - 1.2, 2.5, 10) });
  })();
  async function goChapter2() {
    held.length = 0; await fadeTo(1, 0.6);
    P.frames = FR.kiran; P.sp.scale.set(1.0, 1.5); P.sp.material.color.setRGB(1, 1, 1);
    Object.assign(F, { ch: 3, lab: 0, gen: 1 }); G2.heard = {};
    await chapterCard('Chapter Two', 'The Room Without Answers');
    const S = geneva; setScene('geneva'); place(P, 6, 13, 1);
    S.camOverride = { h: 8.5, d: 6.5, yaw: 0, fov: 42, ty: 0.6 }; S.targetOverride = { x: 6.5, z: 7 }; camUpdate(0, true);
    await fadeTo(0, 1.2);
    await say(null, 'The Geneva conference hall was designed for three thousand people. By the time the emergency summit began, every seat was occupied.');
    await say(null, 'Scientists from more than eighty countries filled the room. Some had travelled on emergency flights. Others joined through remote connections displayed on enormous screens.');
    await say(null, 'Representatives of space agencies, electrical-grid operators, satellite companies, international organizations, and government research offices were present.');
    S.camOverride = { h: 2.6, d: 6.2, yaw: 0, fov: 34, ty: 1.9 }; S.targetOverride = { x: 6.5, z: 2.2 };
    await say(null, 'At the centre of the stage hung a three-dimensional model of Earth. Its magnetic field was represented by luminous curves extending into space. Solar-wind measurements moved across a display beside it.');
    await say(null, 'At first, the meeting was orderly. A senior solar physicist presented observations of the Sun during the days preceding the first disturbance. A magnetospheric physicist described the evidence for strong solar-wind coupling and enhanced current systems. Another researcher presented observations of energetic particles in the radiation belts.');
    S.targetOverride = { x: 9.4, z: 2.2 };
    await say(null, 'Then a modeller showed a simulation. His forecast diverged from reality after the first major intensification. A second modeller showed a different simulation. It failed in a different way.');
    S.camOverride = null; S.targetOverride = null;
    await say(null, 'By the fourth presentation, people had begun interrupting one another.');
    banner(active);
  }
  async function mercerScene() {
    const S = geneva, M = G2.mercer; F.gen = 2; held.length = 0; G2.talkers.forEach((a) => (a.onTalk = null)); M.onTalk = null;
    hooks.onObjective && hooks.onObjective('');
    await say(null, 'The meeting continued for six hours. Several competing explanations were presented. None could account for all the observations.');
    await fadeTo(1, 0.5); place(P, 6, 13, 1); S.camOverride = { h: 2.4, d: 5.2, yaw: 0, fov: 30, ty: 1.5 }; S.targetOverride = { x: 8, z: 1.6 }; camUpdate(0, true); await fadeTo(0, 0.6);
    await say(null, 'Eventually, the chairman stood. He was an elderly atmospheric physicist named Professor Elias Mercer, respected for decades of research and known for his ability to remain calm even during hostile debates. He looked exhausted.', { Mercer: 'tired' });
    await say('Mercer', 'Before we conclude, I would like to ask a question of everyone here.', 'tired');
    await say(null, 'The hall became quiet.');
    await say('Mercer', 'What observation, if we could obtain it, would most directly distinguish between our competing explanations?', 'serious');
    S.camOverride = { h: 6.5, d: 8.5, yaw: 0, fov: 36, ty: 0.9 }; S.targetOverride = { x: 6.5, z: 6.5 };
    await say(null, 'Nobody spoke. Several scientists looked at their notes.');
    const hand = G2.crowd[7] || G2.crowd[0]; if (hand) emote(hand, '?', 1.2, true);
    await say(null, 'One began to raise a hand, then lowered it. Mercer waited. The silence lengthened.');
    S.camOverride = { h: 2.6, d: 4.6, yaw: 0, fov: 30, ty: 1.1 }; S.targetOverride = { x: 6, z: 12.2 };
    await wait(600); await emote(P, '!');
    await say(null, 'At the back of the hall, a young man in crooked glasses stood up.');
    await say('Kiran', 'I have an answer.', 'determined');
    G2.turn = true; await say(null, 'Several people turned. Mercer adjusted his microphone.');
    await say('Mercer', 'Please identify yourself.', 'curious');
    await say('Kiran', 'Dr. Kiran Rao. Plasma physics, São Paulo.', 'confident');
    await say('Mercer', 'And your answer?', 'curious');
    await say(null, 'Kiran looked toward the enormous model of Earth.');
    await say('Kiran', 'I have the answers to what we need to do next, and the actions we have to take before this becomes a catastrophe.', 'determined');
    await say(null, 'A few people murmured. A senior researcher frowned.');
    await say('Researcher', 'You seem remarkably confident for someone who has not explained the phenomenon.');
    await say(null, 'Kiran nodded.'); await say('Kiran', "You're right. I haven't explained it.", 'serious');
    S.camOverride = null; S.targetOverride = null;
    await say(null, 'He began walking down the aisle.');
    await say('Kiran', 'And neither has anyone else.', 'confident');
    F.gen = 3;
  }
  async function present() {
    const S = geneva, M = G2.mercer, V = G2.voss; held.length = 0; hooks.onObjective && hooks.onObjective('');
    await fadeTo(1, 0.35); place(P, 8, 1, 0, S); place(M, 10, 1, 2, S); G2.turn = false; G2.crowd.concat(G2.talkers).forEach((a) => (a.dir = 1));
    S.camOverride = { h: 2.6, d: 5.6, yaw: 0, fov: 32, ty: 1.6 }; S.targetOverride = { x: 7.8, z: 1.8 }; camUpdate(0, true); await fadeTo(0, 0.5);
    await say(null, 'Kiran reached the stage. Mercer stepped aside. Kiran placed his computer on the podium and projected a figure. It showed a set of ground-based magnetic observations.');
    G2.screen = 'kiran'; S.targetOverride = { x: 9.4, z: 1.8 };
    await say('Kiran', 'This is the first event. These are the repeated intensifications. These are the times at which our models begin diverging from the observations.', 'serious');
    S.targetOverride = { x: 7.8, z: 1.8 };
    await say(null, 'He displayed the upstream solar-wind measurements.');
    await say('Kiran', "We know energy enters the magnetosphere through interactions between the solar wind and Earth's magnetic field. Magnetic reconnection, plasma transport, and current systems are not mysteries to us. What we don't know is why the response during these events seems to contain an additional persistent component.", 'thinking');
    await say(null, 'A scientist interrupted.'); await say('Scientist', 'Are you proposing a new energy source?'); await say('Kiran', 'No.', 'confident');
    await say(null, 'Kiran enlarged the graph.');
    await say('Kiran', 'That would be a terrible first assumption. I am proposing that our understanding of how energy is stored, transported, and released may be incomplete under these conditions.', 'determined');
    await mgRegions();
    await talk('Kiran', 'Mercer', async () => {
      await say(null, 'Professor Mercer leaned forward.', { Mercer: 'curious', Kiran: 'serious' });
      await say('Mercer', "You're proposing a coordinated multi-spacecraft mission.", 'curious');
      await say('Kiran', 'Several missions. Designed as one experiment.', 'confident');
      await say('Mercer', 'And how much time do you believe we have?', 'serious');
      await say(null, 'Kiran hesitated. That question frightened him more than anything else.', { Kiran: 'worried' });
      await say('Kiran', "I don't know. But I know that doing nothing guarantees we learn nothing.", 'determined');
    });
    S.camOverride = { h: 5.5, d: 8, yaw: 0, fov: 38, ty: 1 }; S.targetOverride = { x: 6.5, z: 5 };
    await say(null, 'For a moment, there was silence. Then someone began clapping. Others joined.');
    G2.clap = 7;
    await say(null, 'The applause grew, although not everyone was convinced. Some scientists considered the proposal ambitious and premature. Others recognized that the observational gaps were real, regardless of the ultimate explanation.');
    S.camOverride = { h: 2.6, d: 5.6, yaw: 0, fov: 32, ty: 1.6 }; S.targetOverride = { x: 8.6, z: 1.8 };
    await walkActor(M, [[9, 1]]); M.dir = 2; P.dir = 3;
    await say(null, 'Mercer approached Kiran.');
    await talk('Kiran', 'Mercer', async () => {
      await say('Mercer', 'Doctor Rao, your proposal has one obvious difficulty.', 'serious');
      await say('Kiran', 'Only one?', 'playful');
      await say(null, 'Mercer smiled faintly.', { Mercer: 'happy' });
      await say('Mercer', 'Spacecraft require money.', 'happy');
    });
    S.camOverride = { h: 3.2, d: 6.2, yaw: 0, fov: 32, ty: 1.2 }; S.targetOverride = { x: 8.2, z: 3.6 };
    await emote(V, '!', 0.6, true);
    await say(null, 'Before Kiran could answer, another man rose from the front row. He was tall, silver-haired, and dressed in an immaculate dark suit. The conference cameras turned toward him.');
    await say(null, 'Professor Mercer recognized him immediately.'); await say('Mercer', 'Mr. Voss.', 'surprised');
    await say(null, 'Adrian Voss, executive chairman of Aegis Horizon, smiled warmly.', { Voss: 'happy' });
    await say('Voss', 'Professor, forgive the interruption. I believe this young scientist has given us something very valuable.', 'polite');
    await say(null, 'Kiran watched him carefully. Voss continued.', { Kiran: 'serious' });
    await say('Voss', 'A plan.', 'confident');
    V.dir = 0; await say(null, 'He turned toward the assembled delegates.');
    await say('Voss', 'For the past three days, the world has looked to institutions like this one for reassurance. Our hospitals need power. Our satellites need protection. Our citizens need answers. We cannot afford to wait until every scientific disagreement has been resolved.', 'persuasive');
    await say(null, "Aegis Horizon operated some of the world's largest private spacecraft networks, commercial launch services, ground stations, emergency communications infrastructure, and power-protection systems. Its emergency assistance had already helped several cities recover. Many regarded Voss as a visionary.");
    await say('Voss', 'I therefore propose that Aegis Horizon provide technical support for an international scientific mission program. We will make spacecraft engineering resources available. We will assist with launch planning. And we will help this community obtain the measurements it desperately needs.', 'confident');
    G2.clap = 8; await say(null, 'Applause erupted. Kiran looked surprised.', { Kiran: 'surprised' });
    walkActor(M, [[10, 1]]); S.camOverride = { h: 4.4, d: 7.2, yaw: 0, fov: 32, ty: 1.2 }; S.targetOverride = { x: 8.6, z: 2.2 };
    await walkActor(V, [[8, 4], [8, 3], [9, 3], [9, 2], [9, 1]]); V.dir = 2; P.dir = 3; M.dir = 2;
    await say(null, 'Voss stepped toward him and extended his hand.');
    await talk('Kiran', 'Voss', async () => {
      await say('Voss', 'Doctor Rao, perhaps we should talk.', 'happy');
      await say(null, 'Kiran shook it.', { Kiran: 'neutral' });
      await say(null, "Behind Voss's smile, there was nothing obviously sinister. That was what made him dangerous.");
      await say(null, 'He did not appear to be a man who wanted the world to suffer. He appeared to be the only man wealthy enough to help it.');
    });
    S.camOverride = { h: 6.5, d: 9, yaw: 0, fov: 40, ty: 1 }; S.targetOverride = { x: 6.5, z: 5 }; G2.clap = 4;
    await say(null, 'And at that moment, almost everyone in the hall believed him.');
    await wait(700); await fadeTo(1, 1.0);
    S.camOverride = null; S.targetOverride = null; F.gen = 9;
    await chapterCard('End of Chapter Two', 'The Room Without Answers', 2.8);
    await goChapter3();
  }
  // Chapter Two presentation: where to measure. Index order = left to right on the schematic (game/ch1-ui.js draws it).
  const RG = [
    { id: 'sun', msg: 'Telescopes already watch the Sun. The models fail after the solar wind arrives.' },
    { id: 'l1', clue: 0 },
    { id: 'shock', msg: 'One boundary alone cannot tell the explanations apart.' },
    { id: 'core', core: true },
    { id: 'leo', clue: 1 },
    { id: 'tail', clue: 2 },
  ];
  async function mgRegions() {
    mgOpen('regions', { axis: 'list', n: RG.length, idx: 0, placed: [], tried: null, stage: 'place', title: 'Three observing regions',
      hint: 'Each open question from the hall needs its own vantage point. Place a probe where it can be measured.' });
    while (MG.placed.length < 3) {
      const i = await mgInput(() => ['pick', RG.findIndex((r, k) => r.clue != null && !MG.placed.includes(k))]);
      const r = RG[i];
      if (MG.placed.includes(i)) { mgSet({ msg: 'A probe is already there.' }); continue; }
      if (r.clue == null) { blip(220, 150, 0.16, 0.04, 'sawtooth'); mgSet({ tried: i, msg: r.msg || '' }); if (r.core) await say('Geophysicist', 'No. We have no evidence that the geodynamo is failing.'); continue; }
      blip(660, 990); mgSet({ placed: [...MG.placed, i], tried: null, msg: '' });
    }
    blip(520, 1040, 0.18);
    mgSet({ stage: 'done', axis: null, title: 'One experiment', hint: 'The driving, the response near Earth and the distant tail — measured at the same time.' });
    await say(null, "He displayed three observing regions: one surrounding Earth in low orbit, one sunward near Sun–Earth L1, and one deep within Earth's magnetotail extending toward lunar distances.");
    await say('Kiran', "We're attempting to solve a coupled, time-dependent system using observations that are separated in space and incomplete in time. We need simultaneous measurements of the external driving, the response near Earth, and the behaviour of the distant magnetotail.", 'determined');
    mgClose();
  }
  // ---------- CHAPTER THREE — Four People and an Impossible Plan (lake room, then Elena's flat) ----------
  const C3 = { items: null };
  const INST = [
    { n: 'Magnetometer + boom', m: 3, p: 1.5, c: 0.9, key: true }, { n: 'Particle detector', m: 3, p: 3, c: 1.1, key: true }, { n: 'Plasma analyzer', m: 2, p: 2.5, c: 0.8, key: true },
    { n: 'Wave receiver', m: 1.5, p: 1.2, c: 0.5 }, { n: 'E-field probes', m: 2.5, p: 2, c: 0.7 }, { n: 'Auroral imager', m: 4, p: 6, c: 1.6 },
    { n: 'UV spectrograph', m: 5, p: 7, c: 2.1 }, { n: 'Mass spectrometer', m: 3.5, p: 5, c: 1.4 }, { n: 'Dosimeter', m: 0.8, p: 0.6, c: 0.2 },
    { n: 'Langmuir probe', m: 0.6, p: 0.8, c: 0.2 }, { n: 'X-ray imager', m: 6, p: 8, c: 2.6 }, { n: 'HD camera', m: 2.5, p: 4, c: 0.9 },
  ];
  const LIM = { m: 9, p: 9, c: 3.4 };
  const trimTot = (items) => items.reduce((a, it) => (it.on ? { m: a.m + it.m, p: a.p + it.p, c: a.c + it.c } : a), { m: 0, p: 0, c: 0 });
  const lakeRoom = newScene('lake', 0, 1, 10, 7), flat = newScene('flat', 0, 1, 8, 6);
  (function buildLake() {
    const S = lakeRoom, sc = S.scene;
    S.title = 'Conference room · Lake Geneva'; S.sub = 'International Magnetospheric Response Program';
    sc.background = new THREE.Color('#0c0b12');
    sc.add(new THREE.AmbientLight('#b8bcd8', 1.45)); sc.add(new THREE.HemisphereLight('#fff4e8', '#3a3448', 0.75));
    const dl = new THREE.DirectionalLight('#fff0d8', 1.0); dl.position.set(3, 8, 8); sc.add(dl);
    const sun = new THREE.PointLight('#ffe8c8', 5, 7, 1.5); sun.position.set(5, 2, 1.2); sc.add(sun);
    const fT = ctex(12 * 16, 9 * 16, (g, w, h) => { const r = rng(41); g.fillStyle = '#4a4e62'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) { g.fillStyle = '#525670'; g.fillRect(x, y, 1, 1); } for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? '#44485c' : '#585c74'; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); } });
    const fl = add(sc, new THREE.PlaneGeometry(12, 9), lam('#ffffff', { map: fT }), 5, 0, 4); fl.rotation.x = -Math.PI / 2;
    const wT = ctex(16, 32, (g) => { g.fillStyle = '#c8c4bc'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#d4d0c8'; g.fillRect(0, 0, 16, 1); g.fillStyle = '#8a7a68'; g.fillRect(0, 21, 16, 11); g.fillStyle = '#7a6a58'; for (let x = 0; x < 16; x += 8) g.fillRect(x, 21, 1, 11); g.fillStyle = '#4e4238'; g.fillRect(0, 30, 16, 2); });
    const wm = (rx) => { const t = wT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); t.needsUpdate = true; return lam('#ffffff', { map: t }); };
    const cap = lam('#2a2834'), wall = (w, h, d, x, y, z, rx) => { const m = wm(rx); add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
    wall(14, 2.8, 1, 5, 1.4, 0, 14); wall(1, 2.8, 9, -1.5, 1.4, 4, 9); wall(1, 2.8, 9, 11.5, 1.4, 4, 9);
    add(sc, BOX(4.6, 0.45, 0.4), lam('#4a4c58'), 1.7, 0.22, 8.2); add(sc, BOX(4.6, 0.45, 0.4), lam('#4a4c58'), 8.3, 0.22, 8.2);
    const lakeT = ctex(96, 24, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, 12); gr.addColorStop(0, '#8eaed4'); gr.addColorStop(1, '#e6d8cc'); g.fillStyle = gr; g.fillRect(0, 0, w, 12);
      g.fillStyle = '#7a86a8'; for (let x = 0; x < w; x++) { const y = 9 - Math.abs(Math.sin(x * 0.11) * 3 + Math.sin(x * 0.29) * 1.5); g.fillRect(x, y | 0, 1, 13 - (y | 0)); }
      g.fillStyle = '#f2f2f8'; [[18, 6], [19, 5], [44, 5], [45, 6], [70, 6]].forEach(([x, y]) => g.fillRect(x, y, 2, 1));
      g.fillStyle = '#4a6a9a'; g.fillRect(0, 12, w, 9); g.fillStyle = '#6a8ab8'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % w, 13 + (i * 7) % 7, 3, 1);
      g.fillStyle = '#eef4ff'; g.fillRect(60, 4, 1, 9); g.fillRect(59, 5, 3, 1);
      g.fillStyle = '#5a5248'; g.fillRect(0, 21, w, 3); g.fillStyle = '#3a4a32'; for (let x = 0; x < w; x += 5) g.fillRect(x, 20, 3, 2); });
    add(sc, BOX(8.8, 1.55, 0.06), lam('#3a3c48'), 5, 1.75, 0.52); add(sc, new THREE.PlaneGeometry(8.6, 1.4), new THREE.MeshBasicMaterial({ map: lakeT }), 5, 1.75, 0.56);
    for (let i = 1; i < 6; i++) add(sc, BOX(0.05, 1.4, 0.05), lam('#3a3c48'), 0.7 + i * 1.43, 1.75, 0.59);
    const pool = add(sc, new THREE.PlaneGeometry(8, 2.6), addMat('#fff0d0', rectGlowTex, 0.3), 5, 0.012, 1.8); pool.rotation.x = -Math.PI / 2;
    add(sc, BOX(4.3, 0.07, 1.9), lam('#7a5a44'), 4.5, 0.76, 3.5); [[2.5, 2.7], [6.5, 2.7], [2.5, 4.3], [6.5, 4.3]].forEach(([x, z]) => add(sc, BOX(0.08, 0.74, 0.08), lam('#3a3a44'), x, 0.37, z)); blockRect(S, 3, 3, 6, 4);
    const chair = lam('#2a2c3a'); [3, 4, 5, 6].forEach((x) => [[2.75, 2.58], [4.25, 4.42]].forEach(([zs, zb]) => { add(sc, BOX(0.42, 0.06, 0.38), chair, x, 0.46, zs); add(sc, BOX(0.42, 0.5, 0.05), chair, x, 0.72, zb); }));
    add(sc, BOX(0.5, 0.03, 0.34), lam('#2a2a32'), 4.1, 0.81, 3.1); add(sc, BOX(0.5, 0.32, 0.02), lam('#1a1a22'), 4.1, 0.97, 2.94);
    const folder = add(sc, BOX(0.38, 0.09, 0.3), lam('#e8dcc0'), 6.2, 0.84, 3.4); folder.visible = false;
    const parts = new THREE.Group(); sc.add(parts); parts.visible = false;
    add(parts, new THREE.CylinderGeometry(0.16, 0.16, 0.09, 12), lam('#a8acb8'), 3.0, 0.85, 3.3); add(parts, new THREE.CylinderGeometry(0.05, 0.05, 0.11, 8), lam('#3a3a44'), 3.0, 0.86, 3.3);
    [[3.35, 3.7, 0.3], [3.6, 3.15, -0.4]].forEach(([x, z, r]) => (add(parts, BOX(0.24, 0.02, 0.16), lam('#2a6a3a'), x, 0.8, z).rotation.y = r));
    add(parts, BOX(0.4, 0.02, 0.26), lam('#2a3a7a'), 3.1, 0.8, 3.85); add(parts, BOX(0.28, 0.03, 0.2), lam('#c84a3a'), 3.75, 0.81, 3.9); add(parts, BOX(0.18, 0.012, 0.012), lam('#e8c040'), 3.75, 0.83, 3.75);
    add(parts, BOX(0.46, 0.22, 0.2), lam('#5a4a3a'), 2.75, 0.9, 3.75);
    const budT = ctex(48, 32, () => {});
    const drawBud = () => { const g = budT.userData.g, items = (MG && MG.kind === 'trim' ? MG.items : C3.items) || INST.map((x) => ({ ...x, on: true })), t = trimTot(items);
      g.fillStyle = '#0e1018'; g.fillRect(0, 0, 48, 32); [[t.m, LIM.m, 36], [t.p, LIM.p, 44], [t.c, LIM.c, 14]].forEach(([v, l, mx], i) => { const y = 4 + i * 9; g.fillStyle = '#1a1e2e'; g.fillRect(3, y, 42, 5); g.fillStyle = v <= l + 1e-9 ? '#7fd6a4' : '#ff6b6b'; g.fillRect(3, y, Math.max(1, Math.round(42 * Math.min(1, v / mx))), 5); g.fillStyle = '#ffd27a'; g.fillRect(3 + Math.round(42 * l / mx), y - 1, 1, 7); });
      budT.needsUpdate = true; };
    add(sc, BOX(0.06, 1.0, 1.5), lam('#14141a'), 10.96, 1.65, 3.5); const sp = add(sc, new THREE.PlaneGeometry(1.4, 0.92), new THREE.MeshBasicMaterial({ map: budT }), 10.92, 1.65, 3.5); sp.rotation.y = -Math.PI / 2;
    [[0, 7], [10, 1]].forEach(([x, z]) => { add(sc, new THREE.CylinderGeometry(0.2, 0.15, 0.36, 8), lam('#5a4a3a'), x, 0.18, z); add(sc, new THREE.IcosahedronGeometry(0.34, 0), lam('#3a6a4a'), x, 0.62, z); S.block.add(x + ',' + z); });
    const mk = (k, h) => { const a = actor(FR[k], h); a.g.visible = false; sc.add(a.g); S.actors.push(a); return a; };
    C3.naomi = mk('naomi', 1.56); C3.mateo = mk('mateo', 1.66); C3.leila = mk('leila', 1.58); C3.folder = folder; C3.parts = parts;
    const tbl = []; for (let x = 3; x <= 6; x++) for (let z = 3; z <= 4; z++) tbl.push([x, z]);
    on(S, tbl, async () => { if (F.c3 === 1) { F.c3 = 11; await c3Review(); } else if (F.c3 === 2) await c3Mateo(); else if (F.c3 === 3) return say(null, 'They called it Sentinel.'); });
    on(S, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => [x, 0]), async () => say(null, 'A conference room overlooking Lake Geneva.'));
    C3.naomi.onTalk = async () => { if (F.c3 === 1) return say('Naomi', 'Sit down.', 'serious'); if (F.c3 === 2) return say(null, 'Naomi watched him empty it.'); };
    C3.mateo.onTalk = async () => { if (F.c3 === 2) await c3Mateo(); };
    let acc = 0;
    S.update = (dt) => { acc += dt; if (acc > 0.15) { acc = 0; drawBud(); } };
    S.camBase = { h: 6.4, d: 6.6, yaw: 0, fov: 38, ty: 0.8 }; S.camZone = () => S.camBase; S.camTarget = (x, z) => ({ x: clamp(x, 3, 7), z: clamp(z, 3, 4.6) });
  })();
  (function buildFlat() {
    const S = flat, sc = S.scene;
    S.title = 'Elena Reyes’s apartment'; S.sub = 'That evening';
    sc.background = new THREE.Color('#0a080c');
    sc.add(new THREE.AmbientLight('#c0a8a0', 1.2)); sc.add(new THREE.HemisphereLight('#ffe0c8', '#2a1e24', 0.6));
    const lampL = new THREE.PointLight('#ffc890', 6, 6, 1.5); lampL.position.set(2.2, 2.2, 2.6); sc.add(lampL);
    const redL = new THREE.PointLight('#ff5a5a', 2.5, 5, 1.6); redL.position.set(6, 1.8, 0.9); sc.add(redL);
    const fT = ctex(10 * 16, 8 * 16, (g, w, h) => { const r = rng(17); for (let y = 0; y < h; y += 8) { const off = (y / 8) % 2 ? 20 : 0; for (let x = -off; x < w; x += 40) { g.fillStyle = ['#7a5a40', '#80603f', '#74563c'][((x + y) / 8 | 0) % 3]; g.fillRect(x, y, 40, 8); g.fillStyle = '#5a402c'; g.fillRect(x, y + 7, 40, 1); g.fillRect(x, y, 1, 8); } } for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? '#6a4c34' : '#8a6a4a'; g.fillRect(r() * w | 0, r() * h | 0, 2, 1); } });
    const fl = add(sc, new THREE.PlaneGeometry(10, 8), lam('#ffffff', { map: fT }), 4, 0, 3.5); fl.rotation.x = -Math.PI / 2;
    const rug = add(sc, new THREE.PlaneGeometry(3, 2), lam('#8a3a3a'), 3.5, 0.01, 3.5); rug.rotation.x = -Math.PI / 2;
    const wT = ctex(16, 32, (g) => { g.fillStyle = '#c8a888'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#b89878'; for (let y = 2; y < 21; y += 4) for (let x = (y / 2) % 4; x < 16; x += 4) g.fillRect(x, y, 1, 1); g.fillStyle = '#6a4a3a'; g.fillRect(0, 21, 16, 11); g.fillStyle = '#4a3428'; g.fillRect(0, 30, 16, 2); });
    const wm = (rx) => { const t = wT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, 1); t.needsUpdate = true; return lam('#ffffff', { map: t }); };
    const cap = lam('#2a2024'), wall = (w, h, d, x, y, z, rx) => { const m = wm(rx); add(sc, BOX(w, h, d), [m, m, cap, cap, m, m], x, y, z); };
    wall(12, 2.8, 1, 4, 1.4, 0, 12); wall(1, 2.8, 8, -1.5, 1.4, 3.5, 8); wall(1, 2.8, 8, 9.5, 1.4, 3.5, 8);
    const duskT = ctex(32, 18, () => {});
    const drawDusk = (t) => { const g = duskT.userData.g, gr = g.createLinearGradient(0, 0, 0, 18); gr.addColorStop(0, '#1a0a1c'); gr.addColorStop(0.6, '#5a1428'); gr.addColorStop(1, '#a03a34'); g.fillStyle = gr; g.fillRect(0, 0, 32, 18);
      for (let x = 0; x < 32; x++) { const a = 0.5 + 0.5 * Math.sin(x * 0.4 + t * 0.6); g.fillStyle = `rgba(255,90,110,${(0.12 + a * 0.3).toFixed(2)})`; g.fillRect(x, 2, 1, 2 + (a * 5 | 0)); }
      g.fillStyle = '#120a10'; [[0, 12, 5], [5, 10, 4], [10, 13, 6], [17, 9, 4], [22, 11, 5], [28, 12, 4]].forEach(([x, y, w]) => g.fillRect(x, y, w, 18 - y));
      g.fillStyle = '#ffd27a'; [[2, 14], [7, 12], [12, 15], [19, 11], [24, 13], [29, 15]].forEach(([x, y]) => g.fillRect(x, y, 1, 1)); duskT.needsUpdate = true; };
    add(sc, BOX(2.4, 1.5, 0.06), lam('#5a3a2a'), 6, 1.75, 0.52); add(sc, new THREE.PlaneGeometry(2.2, 1.32), new THREE.MeshBasicMaterial({ map: duskT }), 6, 1.75, 0.56); add(sc, BOX(0.05, 1.32, 0.05), new THREE.MeshBasicMaterial({ color: '#1a0e0c' }), 6, 1.75, 0.59); add(sc, BOX(2.5, 0.08, 0.2), lam('#5a3a2a'), 6, 1.06, 0.62);
    add(sc, BOX(0.9, 0.42, 0.8), lam('#7a4a3a'), 6.9, 0.21, 1.25); add(sc, BOX(0.9, 0.6, 0.18), lam('#6a3e30'), 6.9, 0.7, 0.88); S.block.add('7,1');
    const pRed = lam('#c84a3a'), pBlue = lam('#3a5a8a'), pGold = lam('#c8a050');
    [[1.0, 1.75, pGold, 0.38, 0.3], [1.7, 1.55, pBlue, 0.3, 0.38], [2.4, 1.8, pRed, 0.34, 0.26], [3.1, 1.6, pGold, 0.28, 0.34]].forEach(([x, y, m, w, h]) => { add(sc, BOX(w, h, 0.03), m, x, y, 0.52); add(sc, BOX(w - 0.08, h - 0.08, 0.01), lam('#e8d8c0'), x, y, 0.54); });
    add(sc, BOX(0.4, 2.2, 2.6), lam('#5a4030'), -0.75, 1.1, 3); for (let k = 0; k < 4; k++) add(sc, BOX(0.42, 0.04, 2.6), lam('#3a2a20'), -0.74, 0.3 + k * 0.6, 3);
    add(sc, BOX(0.3, 0.22, 0.42), lam('#8a6a4a'), -0.68, 0.45, 2.2); add(sc, new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10), lam('#d8d0c0'), -0.52, 0.46, 2.2).rotation.z = Math.PI / 2;
    add(sc, new THREE.CylinderGeometry(0.14, 0.14, 0.06, 12), lam('#c8a050'), -0.66, 1.08, 3.1).rotation.z = Math.PI / 2; add(sc, BOX(0.22, 0.3, 0.2), lam('#a8acb8'), -0.66, 1.1, 3.8); add(sc, BOX(0.1, 0.1, 0.1), lam('#3aff9a'), -0.6, 1.3, 3.8);
    add(sc, BOX(0.24, 0.16, 0.5), lam('#4a5a6a'), -0.66, 1.68, 2.6); for (let i = 0; i < 3; i++) add(sc, new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), lam('#a8acb8'), -0.6, 1.74, 2.4 + i * 0.18);
    blockRect(S, 0, 2, 0, 4);
    add(sc, BOX(0.9, 0.5, 0.7), lam('#6a4a34'), 3, 0.25, 3); add(sc, BOX(0.96, 0.04, 0.76), lam('#8a6a4a'), 3, 0.52, 3); S.block.add('3,3');
    [[2.85, 2.9], [2.95, 3.05], [3.05, 2.85]].forEach(([x, z]) => add(sc, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), lam('#e8e4dc'), x, 0.6, z)); add(sc, BOX(0.26, 0.01, 0.18), lam('#f4f0e8'), 3.25, 0.545, 3.15);
    [[0, 1], [8, 1], [8, 5], [0, 6]].forEach(([x, z], i) => { add(sc, new THREE.CylinderGeometry(0.18, 0.14, 0.32, 8), lam('#8a5a3a'), x, 0.16, z); add(sc, new THREE.IcosahedronGeometry(0.28 + (i % 2) * 0.08, 0), lam(i % 2 ? '#4a7a4a' : '#3a6a3a'), x, 0.56 + (i % 2) * 0.1, z); S.block.add(x + ',' + z); });
    add(sc, new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), lam('#3a2a20'), 2.2, 0.75, 1.0); add(sc, new THREE.CylinderGeometry(0.16, 0.24, 0.24, 10), lam('#e8c890'), 2.2, 1.6, 1.0); S.block.add('2,1');
    const pool = add(sc, new THREE.PlaneGeometry(3, 3), addMat('#ffc890', radialTex, 0.28), 2.4, 0.012, 1.8); pool.rotation.x = -Math.PI / 2;
    C3.elena = actor(FR.elena, 1.44); C3.elena.home = 0; sc.add(C3.elena.g); S.actors.push(C3.elena); place(C3.elena, 6, 1, 0, S);
    on(S, [[1, 0], [2, 0], [3, 0]], async () => say(null, 'She was sixty-four and receiving treatment for a progressive illness.'));
    on(S, [[0, 2], [0, 3], [0, 4]], async () => say(null, 'Mechanical objects he had repaired throughout childhood.'));
    on(S, [[3, 3]], async () => say(null, 'The recommended specialist care was costly, and the waiting process had become more complicated as hospitals struggled with disruptions to supplies and communications.'));
    on(S, [[5, 0], [6, 0]], async () => say(null, 'The darkening sky.'));
    C3.elena.onTalk = async () => { if (F.c3 === 4) { F.c3 = 5; await c3Elena(); } };
    let acc = 0;
    S.update = (dt, t) => { acc += dt; if (acc > 0.12) { acc = 0; drawDusk(t); } };
    S.camBase = { h: 5.4, d: 5.8, yaw: 0, fov: 38, ty: 0.8 }; S.camZone = () => S.camBase; S.camTarget = (x, z) => ({ x: clamp(x, 2.6, 5.4), z: clamp(z, 2.6, 3.6) });
  })();
  async function goChapter3() {
    const S = lakeRoom, K = C3.naomi; held.length = 0; await fadeTo(1, 0.6);
    P.frames = FR.kiran; P.sp.scale.set(1.0, 1.5); P.sp.material.color.setRGB(1, 1, 1);
    Object.assign(F, { ch: 3, lab: 0, gen: 0, c3: 0 });
    await chapterCard('Chapter Three', 'Four People and an Impossible Plan');
    setScene('lake'); place(P, 5, 1, 1); camUpdate(0, true);
    await fadeTo(0, 1.0);
    await say(null, 'Naomi Chen first met Kiran Rao in a conference room overlooking Lake Geneva.');
    place(K, 5, 7, 1, S); K.g.visible = true;
    await say(null, 'She was forty years old, had directed three major robotic space missions, and possessed the unusual talent of identifying the weakest part of a technical proposal within minutes of reading it.');
    P.dir = 0; await walkActor(K, [[5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [6, 2]]); K.dir = 2; P.dir = 3; K.home = 2;
    await say(null, "She entered carrying a folder nearly as thick as Kiran's laptop.");
    await talk('Kiran', 'Naomi', async () => {
      await say('Naomi', 'Dr. Rao?', { Naomi: 'neutral', Kiran: 'neutral' }); await say('Kiran', 'Yes.', 'neutral');
      await say('Naomi', "I'm Naomi Chen. I've been appointed interim director of the International Magnetospheric Response Program.", 'confident');
      await say('Kiran', "That's a very long name.", 'playful'); await say('Naomi', "We'll find a shorter one.", 'smirk');
      C3.folder.visible = true; await say(null, 'She placed the folder on the table.');
      await say('Naomi', "I've read your proposal.", 'serious'); await say('Kiran', 'And?', 'curious');
      await say('Naomi', 'It contains some excellent science and almost no credible implementation plan.', 'serious');
      await say(null, 'Kiran blinked.', { Kiran: 'surprised' }); await say('Kiran', 'Thank you?', 'confused'); await say('Naomi', "You're welcome. Sit down.", 'smirk');
    });
    F.c3 = 1; banner(active);
  }
  async function c3Review() {
    const S = lakeRoom; held.length = 0; hooks.onObjective && hooks.onObjective('');
    await fadeTo(1, 0.35); place(P, 4, 5, 1, S); camUpdate(0, true); await fadeTo(0, 0.45);
    await say(null, 'Within an hour, Naomi had dismantled his original spacecraft concept.');
    mgOpen('trim', { axis: null, items: INST.map((x) => ({ ...x, on: true })), stage: 'review', circle: false, title: "Kiran's original concept", hint: 'One spacecraft, every instrument he wanted.' });
    await say(null, 'He wanted twelve scientific instruments, near-continuous coverage of several regions, exceptionally high measurement cadence, and a mission schedule ambitious even without an ongoing emergency.');
    await say(null, 'The launch mass exceeded the capability of the vehicle he had tentatively selected. His power budget did not account for all simultaneous instrument loads. His communications plan assumed continuous transmission from locations lacking access to ground stations.');
    mgSet({ circle: true }); blip(300, 200, 0.2, 0.04, 'triangle');
    await say(null, 'Naomi circled a number on the screen.');
    mgClose();
    await talk('Kiran', 'Naomi', async () => {
      await say('Naomi', 'Your scientific payload alone costs more than the funding I\'ve been authorized to request.', { Naomi: 'serious', Kiran: 'neutral' });
      await say(null, 'Kiran leaned forward.', { Kiran: 'determined' }); await say('Kiran', 'Then we need more funding.', 'determined');
      await say('Naomi', 'Every other research program on Earth is saying that.', 'stern'); await say('Kiran', 'But this is important.', 'urgent');
      await say('Naomi', 'So are hospitals, electrical transformers, water systems, and emergency communications.', 'serious');
      await say(null, 'Kiran fell silent. Naomi studied him for a moment.', { Kiran: 'disappointed', Naomi: 'thinking' });
      await say('Naomi', "I'm not telling you to abandon your research. I'm telling you that if you want to save the world, your mission has to survive a budget review.", 'gentle');
      await say(null, 'Kiran thought of one person.', { Kiran: 'thinking' }); await say('Kiran', 'I know an engineer.', 'confident');
      await say(null, 'Naomi smiled.', { Naomi: 'happy' }); await say('Naomi', "I was hoping you'd say that.", 'happy');
    });
    await fadeTo(1, 0.7);
    const M = C3.mateo; place(M, 2, 3, 3, S); M.g.visible = true; M.home = 3; C3.parts.visible = true; place(P, 4, 2, 2, S); camUpdate(0, true);
    await fadeTo(0, 0.8);
    await say(null, 'Mateo Reyes arrived two days later. He brought a notebook, an old mechanical pencil, and a bag containing discarded spacecraft components collected from previous projects.');
    F.c3 = 2; hooks.onObjective && hooks.onObjective(objective());
  }
  async function c3Mateo() {
    const S = lakeRoom; F.c3 = 12; hooks.onObjective && hooks.onObjective('');
    await talk('Naomi', 'Mateo', async () => {
      await say(null, 'Naomi watched him empty it.', { Naomi: 'curious', Mateo: 'neutral' }); await say('Naomi', 'What is all this?', 'curious'); await say('Mateo', 'Examples.', 'neutral');
      await say('Naomi', 'Of what?', 'skeptical'); await say('Mateo', 'Things people throw away because they think something newer is automatically better.', 'smirk');
      await say(null, 'Mateo picked up a reaction wheel assembly.', { Mateo: 'thinking' });
      await say('Mateo', "This is a perfectly good design. Not this particular unit, obviously. This one's bearing is damaged. But the architecture works.", 'proud');
    });
    await say(null, 'Kiran smiled.', { Kiran: 'happy' }); await say('Kiran', "That's why I called him.", 'happy');
    await say(null, 'Within minutes, Mateo asked questions Kiran had not considered.');
    await say(null, 'Why twelve instruments? Could two complementary measurements distinguish the hypotheses? Could a modular spacecraft bus reduce development time? Could the magnetometer be placed on a deployable boom to reduce contamination from onboard currents? Could two modest satellites outperform one expensive observatory for the primary measurement objective?');
    await talk('Kiran', 'Mateo', async () => {
      await say(null, 'Kiran objected.', { Kiran: 'annoyed', Mateo: 'neutral' }); await say('Kiran', "Two satellites won't measure the entire magnetosphere.", 'annoyed');
      await say('Mateo', 'Neither will one expensive satellite.', 'smirk'); await say('Kiran', 'It would have better instruments.', 'defiant');
      await say('Mateo', 'Better at what? What measurement would make you change your scientific conclusion?', 'serious');
    });
    await say(null, 'Kiran stopped and began removing instruments from his design.', { Kiran: 'realization' });
    await mgTrim();
    await fadeTo(1, 0.7);
    const L = C3.leila; place(P, 4, 2, 0, S); place(L, 5, 7, 1, S); L.g.visible = true; camUpdate(0, true);
    await fadeTo(0, 0.7);
    await say(null, 'That afternoon, Commander Leila Haddad joined them.');
    await walkActor(L, [[5, 6], [5, 5]]); L.dir = 1; L.home = 1;
    await say(null, 'Leila had flown experimental orbital vehicles and commanded a crewed mission to a lunar orbital research facility. She was known for discipline and her refusal to accept vague answers during mission reviews.');
    await say(null, 'She listened to the proposal without interrupting. Then she asked,');
    await talk('Kiran', 'Leila', async () => {
      await say('Leila', 'Where do you want the satellites to be when the next event happens?', { Leila: 'serious', Kiran: 'neutral' });
      await say(null, 'Kiran displayed an orbit.'); await say('Leila', 'Why that orbit?', 'skeptical'); await say('Kiran', 'It provides global coverage.', 'confident');
      await say('Leila', 'No orbit provides continuous global coverage from two low-altitude satellites.', 'stern'); await say('Kiran', 'I meant useful coverage.', 'confused'); await say('Leila', 'Then define useful.', 'serious');
    });
    await emote(C3.mateo, '…', 0.7); await say(null, 'Kiran looked toward Mateo, who smiled.'); await say('Mateo', "Don't look at me. I like her.", 'grin');
    await talk('Kiran', 'Leila', async () => {
      await say('Leila', 'If you need magnetic-field measurements at different latitudes, a high-inclination orbit may be useful. But you also need to understand local time, instrument sampling, spacecraft separation, orbital precession, radiation exposure, and ground-station access. The orbit is part of your experiment, not merely where you park the satellite.', { Leila: 'commanding', Kiran: 'thinking' });
    });
    await say(null, 'Kiran sat down. Naomi folded her arms.', { Naomi: 'confident' }); await say('Naomi', 'Now we have a team.', 'confident');
    S.camOverride = { h: 4.6, d: 6.4, yaw: 0, fov: 34, ty: 1.0 }; S.targetOverride = { x: 4.5, z: 3.6 };
    await say(null, 'Over the following week, the four became almost inseparable. Kiran wanted measurements. Mateo wanted realistic requirements. Leila wanted operational margins. Naomi wanted all of it completed without bankrupting the program.');
    await say(null, 'Despite their disagreements, a practical mission emerged. They called it Sentinel. For the first time since the crimson sky appeared, Kiran felt something stronger than fear: anticipation.', { Kiran: 'hopeful' });
    await fadeTo(1, 0.9); S.camOverride = null; S.targetOverride = null;
    P.frames = FR.mateo; P.sp.scale.set(1.1, 1.66);
    setScene('flat'); place(P, 2, 6, 1); camUpdate(0, true);
    await fadeTo(0, 0.9);
    await say(null, 'That evening Mateo visited his mother. Elena Reyes lived in a small apartment filled with plants, old photographs, and mechanical objects he had repaired throughout childhood.');
    F.c3 = 4; banner(active);
  }
  async function mgTrim() {
    mgOpen('trim', { axis: 'list', n: INST.length, idx: 0, items: INST.map((x) => ({ ...x, on: true })), stage: 'trim', circle: false, title: 'Survive the budget review',
      hint: 'Make it fit one modest satellite. Keep what would change your conclusion.' });
    for (;;) {
      const i = await mgInput(() => ['pick', MG.items.findIndex((it) => it.on && !it.key)]);
      const it = MG.items[i];
      if (it.on && it.key) { blip(300, 420, 0.12, 0.04, 'triangle'); mgSet({ msg: `Would losing the ${it.n.toLowerCase()} change the conclusion? Yes — it stays.` }); continue; }
      blip(it.on ? 520 : 700, it.on ? 360 : 900, 0.07);
      const items = MG.items.map((x, k) => (k === i ? { ...x, on: !x.on } : x)), t = trimTot(items);
      mgSet({ items, msg: '' }); C3.items = items;
      if (t.m <= LIM.m + 1e-9 && t.p <= LIM.p + 1e-9 && t.c <= LIM.c + 1e-9) break;
    }
    blip(520, 1040, 0.18);
    mgSet({ stage: 'done', axis: null, title: 'It fits', hint: 'Magnetic field, energetic particles and plasma: the measurements that can tell the explanations apart.' });
    await wait(2200); mgClose();
  }
  async function c3Elena() {
    const E2 = C3.elena; hooks.onObjective && hooks.onObjective('');
    await say(null, 'Mateo found her knitting beside the window.');
    await talk('Mateo', 'Elena', async () => {
      await say('Elena', 'You look tired.', { Elena: 'gentle', Mateo: 'neutral' }); await say('Mateo', "You look like you're about to tell me to eat something.", 'smirk');
      await say('Elena', 'Have you eaten?', 'stern'); await say('Mateo', 'Yes.', 'neutral'); await say('Elena', 'When?', 'skeptical');
      await say(null, 'Mateo hesitated. Elena smiled.', { Mateo: 'guilty', Elena: 'happy' }); await say('Elena', "That's what I thought.", 'happy');
      await say(null, 'She placed her knitting aside.'); await say('Elena', 'I saw your friend on television.', 'neutral'); await say('Mateo', 'Kiran?', 'curious');
      await say('Elena', 'The one with the glasses and the hair that looks like it lost a fight.', 'playful'); await say('Mateo', "That's him.", 'grin');
      await say('Elena', 'He was talking about saving the world.', 'neutral'); await say('Mateo', "He's always talking about something impossible.", 'smirk'); await say('Elena', 'And you?', 'curious');
      await say('Mateo', "I'm trying to make sure his impossible ideas fit inside a spacecraft.", 'happy');
      await say(null, 'Elena laughed, then began coughing. Mateo reached for her water.', { Elena: 'unwell', Mateo: 'worried' });
      await say(null, 'When she recovered, she noticed his expression.'); await say('Elena', "Don't look at me like that.", 'gentle'); await say('Mateo', 'Like what?', 'worried');
      await say('Elena', "Like you're trying to solve me.", 'sad');
      await say(null, 'Mateo stared at the floor.', { Mateo: 'sad' }); await say('Mateo', 'The doctors called.', 'sad'); await say('Elena', 'I know.', 'sad');
      await say('Mateo', "They've recommended another treatment.", 'worried'); await say('Elena', 'I know that too.', 'sad'); await say('Mateo', "It's expensive.", 'desperate');
      await say(null, 'She reached for his hand.'); await say('Elena', "Mateo, you've already done more than enough.", 'gentle');
      await say('Mateo', 'No.', 'angry'); await say(null, 'He answered sharply. Then softened.', { Mateo: 'emotional' });
      await say('Mateo', "When I was little, you worked two jobs so I could study engineering. You bought me books you couldn't afford. You let me fill this apartment with broken machines.", 'emotional');
      await say('Elena', 'And half of them exploded.', 'playful'); await say('Mateo', 'Only one exploded.', 'smirk'); await say('Elena', 'Three.', 'happy'); await say('Mateo', 'Two and a half.', 'grin');
      await say(null, 'She laughed again. Mateo held her hand.', { Elena: 'laughing' }); await say('Mateo', "I'm going to find a way.", 'determined');
      await say(null, 'Elena looked toward the darkening sky.', { Elena: 'sad' });
      await say('Elena', "Just promise me something. Don't forget the rest of your life while you're trying to save mine.", 'gentle');
    });
    E2.dir = 1; await say(null, 'He promised. At the time, he believed he could keep that promise.');
    await wait(500); await fadeTo(1, 1.0);
    F.c3 = 9;
    await chapterCard('End of Chapter Three', 'Next — Chapter Four: Project Sentinel', 4.2);
    if (hooks.onChapterEnd) { hooks.onChapterEnd(3); return; }
    await fadeTo(0, 0.8);
  }
  // ---------- EPILOGUE — The Last Field (Lucas, years later, in Kiran's lab) ----------
  FR.lucasAdult = charFrames({ ...PAL.lucas, shirt: '#3a4a6a', shirt2: '#2a3650', sleeve: false, print: undefined, print2: undefined, blush: undefined, tee: '#d8d0c8', pants: '#2a2c3a', shoe: '#3a3030' });
  FR.supervisor = charFrames({ hair: '#3a2a22', hair2: '#6a5a50', skin: '#a06a48', shirt: '#6a5a7a', shirt2: '#4e4260', tee: '#e8e4ec', pants: '#2a2a34', shoe: '#1e1a20', eye: '#1a1420', glasses: '#1a1a20', lens: '#a8b4cc', long: true });
  let EPI_SUP = null;
  async function goEpilogue() {
    held.length = 0; await fadeTo(1, 0.6);
    Object.assign(F, { ch: 4, gen: 0, lab: 1, epi: 1, mateo: 3, c3: 0 });
    await chapterCard('Epilogue', 'The Last Field');
    lab.actors.forEach((a) => (a.g.visible = false));
    if (!EPI_SUP) { EPI_SUP = actor(FR.supervisor, 1.55); EPI_SUP.g.visible = false; lab.scene.add(EPI_SUP.g); lab.actors.push(EPI_SUP); }
    P.frames = FR.lucasAdult; P.sp.scale.set(1.0, 1.5); P.sp.material.color.setRGB(1, 1, 1);
    lab.title = 'The Observatory'; lab.sub = 'Several years later'; lab.gmode = 0; lab.gprog = 1;
    setScene('lab'); place(P, 5, 3, 1); lab.camOverride = { h: 7.5, d: 8, yaw: 0, fov: 40, ty: 0.8 }; lab.targetOverride = { x: 5, z: 3 }; camUpdate(0, true);
    await fadeTo(0, 1.2);
    await say(null, 'Several years later, a new generation of satellites monitored the solar wind, the magnetosphere, and the relationships between plasma processes across space. The data were open. Universities and research institutions around the world contributed measurements and models.');
    await say(null, "Researchers still disagreed about the rarity of its onset, its long-term stability, and the precise plasma coupling. Breakpoint demonstrated one successful intervention under particular conditions, not universal control of Earth's magnetic environment.");
    await say(null, 'The world learned to live with uncertainty without surrendering to helplessness.');
    lab.camOverride = null; lab.targetOverride = null;
    await say(null, 'One evening Lucas Almeida, now a university physics student, worked in the observatory where Kiran first detected the anomaly. He studied a spacecraft dataset.');
    banner(active);
  }
  async function epiMeet() {
    hooks.onObjective && hooks.onObjective('');
    const sup = EPI_SUP, tx = P.x; place(sup, tx, 6, 1, lab); sup.g.visible = true;
    await walkActor(sup, [[tx, 5], [tx, 4], [tx, 3]]); P.dir = 0; sup.dir = 1;
    await say(null, 'His supervisor approached.'); await say('Supervisor', 'Find anything interesting?');
    await say(null, 'Lucas smiled.'); await say('Lucas Almeida', 'Not yet.'); P.dir = 1;
  }
  async function mgEpi() {
    DS = 1;
    mgOpen('epi', { axis: 'x', step: 1 / 180, cursor: 0.12, marks: [], stage: 'epi', modelProg: 0, gap: false, spans: false, title: 'A spacecraft dataset', hint: 'Quiet conditions. Mark anything that does not belong. Not everything that stands out is the sky.' });
    let art = false;
    for (let k = 0; k < 2; k++) {
      const c = 126 + k * 3;
      for (let miss = 0; ; ) { const t = (await mgInput(() => ['set', c / 180])) * 180; if (Math.abs(t - c) <= 6) { blip(660, 990); mgSet({ marks: [c], msg: '' }); break; }
        if (Math.abs(t - 62) <= 4) { blip(440, 440, 0.08); mgSet({ msg: k ? 'Nothing here on the independent instrument. That spike belonged to the first recorder.' : art ? 'Already set aside: the recorder’s timestamp jump.' : 'One sample wide, sharper than any plasma can change: the recorder’s timestamp jumped. An instrumental effect. Set aside — keep looking.' }); art = true; continue; }
        miss++; blip(220, 150, 0.16, 0.04, 'sawtooth'); mgSet({ msg: miss > 1 ? 'Ordinary fluctuation. Look for the one shape that repeats nowhere else.' : 'Ordinary fluctuation.' }); }
      if (!k) { await say(null, 'A small unexpected variation appeared. Probably an instrumental effect, a familiar plasma process, or noise.'); await say(null, 'Lucas enlarged it, checked timestamps, and opened another dataset.'); DS = 2; mgSet({ marks: [], cursor: 0.12, title: 'Another dataset', hint: 'An independent instrument, the same hours. What survives here is not the instrument.' }); }
    }
    blip(520, 1040, 0.18); await say(null, 'The variation appeared there too.'); mgClose(); DS = 0;
  }
  async function epiEnd() {
    P.dir = 0; await say('Supervisor', 'Something wrong?');
    await say(null, "Lucas remembered the crimson sky, his mother's frightened face, the astronauts, and the scientists who taught humanity to understand an invisible danger.");
    await say(null, 'He smiled.'); await say('Lucas Almeida', "I don't know. But I think we should find out.");
    await fadeTo(1, 1.4);
    await say(null, "Outside, the night sky remained dark and peaceful. Far beyond the atmosphere, Earth's magnetosphere continued its immense, invisible motion. Somewhere in the universe, another mystery was waiting.");
    await chapterCard('The End', 'Humanity was never saved by the strength of its shield alone, but by the people determined to understand what lay beyond it.', 7);
    F.epi = 3; if (hooks.onEpilogueEnd) hooks.onEpilogueEnd();
  }
  function walkActor(a, steps) { return new Promise((r) => { a.walk = steps.slice(); a.walkDone = r; }); }
  async function chapterCard(num, title, hold = 3.2) { hooks.onChapter && hooks.onChapter({ num, title }); await wait(hold * 1000); hooks.onChapter && hooks.onChapter(null); }
  async function goChapter1() {
    held.length = 0; await fadeTo(1, 0.7);
    Object.assign(F, { sawSky: true, momAwake: true, alert: true, blackout: true, ch: 1 });
    await chapterCard('Chapter One', 'The First Seventy-Two Hours');
    await cinematic('ch1_open');
    setScene('street'); place(P, 6, 10, 0); camUpdate(0, true);
    await fadeTo(0, 0.9); banner(active);
    await wait(700); await showHelp('street');
  }
  async function goLab() {
    await say(null, 'And in a small laboratory, Kiran Rao began discovering that the previous night\'s disturbance contained an even stranger feature.');
    held.length = 0; await fadeTo(1, 0.5);
    P.frames = FR.kiran; P.sp.scale.set(1.0, 1.5);
    F.lab = 1; setScene('lab'); place(P, 5, 2, 1); camUpdate(0, true);
    await fadeTo(0, 0.6); banner(active);
    await wait(600); await showHelp('lab');
  }

  // ---------- cinematics (the stills player lives in the page; data in game/cinematic.js) ----------
  let cine = false;
  async function cinematic(id) {
    held.length = 0; cine = true; hooks.onMusic && hooks.onMusic('prologue');
    hooks.onBanner && hooks.onBanner(null); hooks.onObjective && hooks.onObjective('');
    try { if (hooks.onCinematic) await hooks.onCinematic(id); } catch (e) { console.error(e); }
    cine = false;
  }

  // ---------- UI blips ----------
  let actx = null;
  function blip(f0, f1, d = 0.1, v = 0.05, type = 'square') {
    if (!sounds) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime, osc = actx.createOscillator(), g = actx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(f1, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g); g.connect(actx.destination); osc.start(t); osc.stop(t + d + 0.02);
    } catch (e) {}
  }

  // ---------- Chapter One analysis minigames ----------
  // Schematic data, not real measurements. Chart times are minutes after 02:00.
  const PEAKS = [{ t: 17, a: 1, w: 4.5 }, { t: 65, a: 0.84, w: 5.5 }, { t: 114, a: 0.72, w: 6.5 }];
  const gauss = (t, c, a, w) => a * Math.exp(-((t - c) ** 2) / (2 * w * w));
  let DS = 0;
  const epiObs = (t, k) => 0.3 + 0.05 * Math.sin(t * 0.21 + k) + 0.03 * Math.sin(t * 0.9 + k * 2) + 0.02 * Math.sin(t * 2.3 + k) + gauss(t, 125 + k * 3, 0.17, 2.2) - gauss(t, 130 + k * 3, 0.09, 1.8) + (k === 1 ? gauss(t, 62, 0.24, 0.7) : 0);
  const obs = (t) => (DS ? epiObs(t, DS) : obs0(t));
  const obs0 = (t) => 0.06 + PEAKS.reduce((acc, p) => acc + gauss(t, p.t, p.a, p.w), 0) + 0.2 * clamp((t - 21) / 8, 0, 1) * clamp((178 - t) / 14, 0, 1)
    + gauss(t, 40, 0.09, 1.8) + gauss(t, 92, 0.08, 1.6) + gauss(t, 141, 0.07, 1.6) + 0.03 * Math.sin(t * 0.9) + 0.02 * Math.sin(t * 2.3 + 1);
  const model = (t) => 0.06 + gauss(t, 17, 0.97, 4.8) + (t > 22 ? 0.05 * Math.exp(-(t - 22) / 25) : 0) + gauss(t, 66, 0.36, 7) + gauss(t, 116, 0.15, 8);
  const FRONT = ['calm', 'calm', 'moderate', 'intense', 'intense', 'moderate', 'calm', 'moderate', 'intense', 'calm'];
  const READ = { calm: { bz: '+2', v: 380 }, moderate: { bz: '−6', v: 520 }, intense: { bz: '−15', v: 640 } };
  const HYP = [['Sensor problem?', 'Checked.'], ['Timing error?', 'Checked.'], ['Bad input?', 'Checked.'], ['Computer problem?', 'Three independent codes.']];
  let MG = null, mgT = 0;
  const mgEmit = () => hooks.onMinigame && hooks.onMinigame(MG ? { ...MG, waiter: null, auto: null } : null);
  const mgOpen = (kind, st) => { MG = { kind, cursor: 0.5, idx: 0, n: 1, msg: '', listening: false, ...st }; mgEmit(); };
  const mgSet = (p) => { if (MG) { Object.assign(MG, p); mgEmit(); } };
  const mgClose = () => { MG = null; mgEmit(); };
  const mgInput = (auto) => new Promise((r) => { MG.waiter = r; MG.auto = auto; MG.listening = true; mgT = 0; mgEmit(); });
  function mgAct(a, v) {
    if (!MG || dlg) return;
    if (a === 'set') { if (MG.axis && MG.axis !== 'list' && Number.isFinite(v)) { MG.cursor = clamp(v, 0, 1); mgEmit(); } return; }
    if (a === 'move') { if (MG.axis === 'list') MG.idx = (MG.idx + (v > 0 ? 1 : -1) + MG.n) % MG.n; else if (MG.axis) MG.cursor = clamp(MG.cursor + v * (MG.step || 0.01), 0, 1); mgEmit(); return; }
    if (a === 'hover') { if (MG.axis === 'list' && MG.idx !== v) { MG.idx = v; mgEmit(); } return; }
    if (!MG.listening) return;
    if (a === 'pick') { if (MG.axis !== 'list') return; MG.idx = v; }
    else if (a !== 'ok') return;
    const r = MG.waiter; MG.waiter = null; MG.listening = false; mgEmit();
    if (r) r(MG.axis === 'list' ? MG.idx : MG.cursor);
  }
  function mgKey(d) {
    if (!MG) return;
    const horiz = d >= 2, v = d === 0 || d === 3 ? 1 : -1;
    if (MG.axis === 'list' || (MG.axis === 'x') === horiz) mgAct('move', v * (run && MG.axis !== 'list' ? 5 : 1));
  }
  async function mgPattern() {
    mgOpen('pattern', { axis: 'x', step: 1 / 180, cursor: 0.08, marks: [], stage: 'find', modelProg: 0, gap: false, spans: false,
      title: 'Find the intensifications', hint: "Last night's ground-magnetometer record. Mark every major intensification on the orange curve." });
    let miss = 0;
    while (MG.marks.length < 3) {
      const t = (await mgInput(() => ['set', PEAKS.find((p) => !MG.marks.includes(p.t)).t / 180])) * 180;
      const p = PEAKS.find((q) => Math.abs(q.t - t) <= 7);
      if (p && !MG.marks.includes(p.t)) { blip(660, 990); mgSet({ marks: [...MG.marks, p.t].sort((a, b) => a - b), msg: '' }); }
      else if (p) mgSet({ msg: 'Already marked.' });
      else { miss++; blip(220, 150, 0.16, 0.04, 'sawtooth'); mgSet({ msg: miss > 1 ? 'Normal fluctuation. Look for the three tallest surges.' : 'Normal fluctuation, not an intensification.' }); }
    }
    blip(520, 1040, 0.18);
    mgSet({ stage: 'found', spans: true, title: 'Pattern found', hint: '' });
    await say(null, 'The first intensification had been followed by another after an interval of approximately forty-eight minutes. A third followed.', { Kiran: 'excited' });
    await say(null, 'The pattern was not perfectly periodic. Its amplitude, duration, and spatial distribution changed, but a recognizable sequence appeared across independent datasets.');
    await say(null, 'Kiran knew that a mysterious-looking period was not proof of new physics.');
    mgSet({ stage: 'run', axis: 'list', n: 1, idx: 0, title: 'Run the global simulation', hint: 'Compare the model with what was observed.' });
    await mgInput(() => ['pick', 0]);
    lab.gmode = 1; lab.gprog = 0;
    mgSet({ stage: 'model', axis: null, title: 'Model vs observation', hint: '' });
    for (let k = 1; k <= 36; k++) { mgSet({ modelProg: k / 36 }); await wait(70); }
    await say(null, 'Yet when he ran the global simulations again, something was wrong.', { Kiran: 'shocked' });
    mgSet({ gap: true }); blip(180, 120, 0.3, 0.05, 'sawtooth');
    await say(null, 'The models reproduced some early behaviour. They failed at the repeated intensifications. And their errors grew with every successive disturbance.');
    mgClose();
  }
  async function mgDiagnose() {
    mgOpen('diagnose', { axis: null, n: 4, idx: 0, checked: [], stage: 'look', modelProg: 1, gap: true, marks: PEAKS.map((p) => p.t), title: 'Model vs observation', hint: '' });
    await say(null, 'One curve represented the modelled magnetospheric response. Another represented the observations. The gap between them was enormous.');
    mgSet({ stage: 'pick', axis: 'list', title: 'Rule it out', hint: 'What could explain the gap? Check each possibility with Mateo.' });
    while (MG.checked.length < 4) {
      const i = await mgInput(() => ['pick', [0, 1, 2, 3].find((k) => !MG.checked.includes(k))]);
      if (MG.checked.includes(i)) { mgSet({ msg: 'Already checked.' }); continue; }
      mgSet({ msg: '' });
      await say('Mateo', HYP[i][0], 'thinking'); await say('Kiran', HYP[i][1], 'confident');
      blip(520, 780, 0.08);
      const checked = [...MG.checked, i];
      mgSet({ checked, idx: Math.max(0, [0, 1, 2, 3].findIndex((k) => !checked.includes(k))) });
    }
    mgSet({ stage: 'think', axis: null, title: 'Nothing obvious left', hint: 'Every obvious explanation has been ruled out.' });
    await say(null, 'Mateo leaned closer.'); await say('Mateo', 'Then what is it?', 'worried');
    await say(null, 'Kiran smiled without humour.'); await say('Kiran', "That's what I'd like to know.", 'sarcastic');
    await say('Mateo', 'What does the system do before the second peak?', 'thinking');
    mgSet({ stage: 'window', axis: 'x', step: 1 / 180, cursor: 0.1, title: 'Before the second peak', hint: 'Mark the stretch just before the second intensification.' });
    for (;;) {
      const t = (await mgInput(() => ['set', 44 / 180])) * 180;
      if (t >= 26 && t <= 60) { blip(660, 990); mgSet({ band: [26, 60], msg: '', hint: 'Model: recovering. Observation: still elevated.' }); break; }
      blip(220, 150, 0.16, 0.04, 'sawtooth');
      mgSet({ msg: t < 26 ? 'Too early. Look after the first peak, before the second.' : 'Too late. Look before the second peak.' });
    }
    await say('Kiran', 'It should be recovering.', 'thinking'); await say('Mateo', "But it isn't.", 'surprised'); await say('Kiran', 'No.', 'realization');
    mgClose();
  }
  async function mgFront() {
    mgOpen('front', { axis: 'y', step: 0.025, cursor: 0.15, reads: [], stage: 'scan', title: 'One location',
      hint: 'The upstream monitor samples the solar wind at a single point. Move it along its orbit and take readings.' });
    for (;;) {
      const y = await mgInput(() => { const used = MG.reads.map((r) => r.cell), c = [1, 4, 7, 2].find((k) => !used.includes(k)); return ['set', (c + 0.5) / 10]; });
      const cell = clamp(Math.floor(y * 10), 0, 9);
      if (MG.reads.some((r) => r.cell === cell)) { mgSet({ msg: 'Already sampled here. Move the monitor.' }); continue; }
      blip(880, 880, 0.06);
      const reads = [...MG.reads, { cell, kind: FRONT[cell] }], kinds = new Set(reads.map((r) => r.kind)).size;
      mgSet({ reads, msg: reads.length >= 3 && kinds < 2 ? 'These look alike. Sample another part of the front.' : '' });
      if (reads.length >= 3 && kinds >= 2) break;
    }
    blip(520, 1040, 0.18);
    mgSet({ stage: 'done', axis: null, hint: 'Same front, different conditions. Earth receives all of it; the monitor sees one point.' });
    await say(null, 'Kiran stopped. It was a fair question.', { Kiran: 'realization' });
    await say(null, 'The solar wind contained spatial structures, and spacecraft measurements were inevitably limited. A single upstream monitor could not measure every variation across the entire front approaching Earth.');
    mgClose();
  }

  // ---------- player / movement ----------
  const P = actor(FR.lucas, 1.32); P.solid = false;
  let active = null;
  function place(a, x, z, dir, S = active) { a.x = a.tx = x; a.z = a.tz = z; a.dir = dir; a.moving = false; a.p = 0; a.f = 0; a.g.position.set(x, S.groundH(x, z), z); showFrame(a); }
  const SCORE = { apt: 'street', street: 'street', lab: 'lab', geneva: 'geneva', lake: 'geneva', flat: 'street' };
  function setScene(name) { active = scenes[name]; active.scene.add(P.g); active.onEnter(); if (started && hooks.onMusic) hooks.onMusic(name === 'lab' && F.epi ? 'epilogue' : SCORE[name]); }
  const held = []; let run = false, turnT = 0, busy = false, started = false, dlg = null, alertCard = null;
  function curDir() { return held.length ? held[held.length - 1] : -1; }
  function tryStep() {
    const d = curDir(); if (d < 0 || busy || dlg || alertCard || helpCard) return false;
    P.dir = d; const nx = P.x + DV[d][0], nz = P.z + DV[d][1];
    const w = active.warps[nx + ',' + nz]; if (w && w.need === d) { if (w.lock) { held.length = 0; runScript(() => say(null, w.lock)); } else warp(w); return false; }
    if (active.blocked(nx, nz)) return false;
    P.tx = nx; P.tz = nz; P.moving = true; return true;
  }
  function updatePlayer(dt) {
    if (P.moving) {
      P.p += dt * (run ? 7.2 : 4.1);
      if (P.p >= 1) { P.x = P.tx; P.z = P.tz; P.moving = false; P.parity ^= 1; const rem = P.p - 1; P.p = 0; if (demo) steer(); if (tryStep()) P.p = rem; }
    } else if (!busy && !dlg) { if (turnT > 0) turnT -= dt; else tryStep(); }
    const k = P.moving ? P.p : 0, x = lerp(P.x, P.tx, k), z = lerp(P.z, P.tz, k);
    P.g.position.set(x, lerp(active.groundH(P.x, P.z), active.groundH(P.tx, P.tz), k), z);
    P.f = P.moving ? (P.p < 0.5 ? (P.parity ? 1 : 3) : 0) : 0; showFrame(P);
    active.actors.forEach((a) => {
      if (a.walk && a.walk.length) {
        if (!a.moving) { const [nx, nz] = a.walk[0]; a.dir = nx > a.x ? 3 : nx < a.x ? 2 : nz > a.z ? 0 : 1; a.tx = nx; a.tz = nz; a.moving = true; a.p = 0; }
        a.p += dt * 3.4;
        if (a.p >= 1) { a.x = a.tx; a.z = a.tz; a.moving = false; a.p = 0; a.parity ^= 1; a.walk.shift(); if (!a.walk.length && a.walkDone) { const r = a.walkDone; a.walkDone = null; r(); } }
        const k = a.moving ? a.p : 0; a.g.position.set(lerp(a.x, a.tx, k), lerp(active.groundH(a.x, a.z), active.groundH(a.tx, a.tz), k), lerp(a.z, a.tz, k));
        a.f = a.moving ? (a.p < 0.5 ? (a.parity ? 1 : 3) : 0) : 0;
      } else a.f = 0;
      showFrame(a);
    });
  }

  // ---------- camera ----------
  const cam = { x: 0, z: 0, h: 8, d: 9, yaw: 0, fov: 30, ty: 0.5 }; let camRate = 2.6;
  function camUpdate(dt, snap) {
    const S = active, px = P.g.position.x, pz = P.g.position.z, zp = S.camOverride || (dynamicCam ? S.camZone(Math.round(px), Math.round(pz)) : S.camBase), tg = S.targetOverride || S.camTarget(px, pz);
    const k = snap ? 1 : 1 - Math.exp(-dt * camRate), kt = snap ? 1 : 1 - Math.exp(-dt * 7);
    cam.x = lerp(cam.x, tg.x, kt); cam.z = lerp(cam.z, tg.z, kt);
    ['h', 'd', 'yaw', 'fov', 'ty'].forEach((key) => (cam[key] = lerp(cam[key], zp[key], k)));
    const y0 = P.g.position.y;
    camera.position.set(cam.x + Math.sin(cam.yaw) * cam.d, y0 + cam.h, cam.z + Math.cos(cam.yaw) * cam.d);
    camera.lookAt(cam.x, y0 + cam.ty, cam.z);
    if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
  }

  // ---------- dialog / fades / scripts ----------
  const emitDlg = () => hooks.onDialog && hooks.onDialog({ who: dlg.who, mood: dlg.mood, text: dlg.text.slice(0, Math.floor(dlg.shown)), done: dlg.shown >= dlg.text.length });
  const DEMO_KEEP = ['At 02:17', 'appeared to be burning', 'Mama, wake up', 'What happened', 'The sky.', 'What about it', "It's red", 'whole sky is red', 'Is the Sun', 'Not for another', 'why is it bright', 'had no answer', 'switched on by itself', 'Are you seeing', 'WEE-OOO', 'receiving reports', 'screen went black', 'every light went out', 'thousands of windows', 'are we going to die', 'No, sweetheart', 'could not stop looking'];
  // mood: a string for the speaker's expression, or { Name: mood } to set anyone's (used on narration lines too).
  function say(who, text, mood) { if (demo && demoFilter && !DEMO_KEEP.some((k) => text.includes(k))) return Promise.resolve(); return new Promise((res) => { dlg = { who, text, mood, shown: 0, res, last: -1, hold: 0 }; emitDlg(); }); }
  // Conversation scene: the page cuts to two facing portraits (L faces right, R faces left) while fn's lines play.
  // The camera first pushes in on the pair, then the page dissolves to the portraits; on the way out it restores the shot.
  async function talk(L, R, fn) {
    held.length = 0;
    const S = active, prev = { co: S.camOverride, to: S.targetOverride };
    const find = (n) => { const f = FR[n.toLowerCase()]; if (P.frames === f) return P; return S.actors.find((a) => a.frames === f && a.g.visible); };
    const a = find(L), b = find(R);
    if (a && b) {
      camRate = 5.5;
      S.camOverride = { h: 2.3, d: 4.0, yaw: cam.yaw, fov: 24, ty: 1.0 };
      S.targetOverride = { x: (a.g.position.x + b.g.position.x) / 2, z: (a.g.position.z + b.g.position.z) / 2 };
      await wait(450);
    }
    hooks.onTalk && hooks.onTalk({ L, R, scene: S.name }); await wait(420);
    try { await fn(); } finally { hooks.onTalk && hooks.onTalk(null); S.camOverride = prev.co; S.targetOverride = prev.to; }
    await wait(320); camRate = 2.6;
  }
  // Emote bubble over an actor's head in the world (! ? …).
  const EMO = {}, emotes = [];
  const emoTex = (k) => EMO[k] || (EMO[k] = ctex(14, 13, (g) => {
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, D = '#120e18', Wh = '#fbf6ee';
    R(1, 0, 12, 1, D); R(0, 1, 1, 8, D); R(13, 1, 1, 8, D); R(1, 9, 12, 1, D); R(1, 1, 12, 8, Wh);
    R(5, 9, 4, 1, Wh); R(6, 10, 2, 1, Wh); R(4, 9, 1, 1, D); R(9, 9, 1, 1, D); R(5, 10, 1, 1, D); R(8, 10, 1, 1, D); R(6, 11, 2, 1, D);
    if (k === '!') { R(6, 2, 2, 4, '#d23040'); R(6, 7, 2, 1, '#d23040'); }
    else if (k === '?') { const c = '#3a5ad0'; R(5, 2, 4, 1, c); R(9, 3, 1, 1, c); R(8, 4, 1, 1, c); R(6, 5, 2, 1, c); R(6, 7, 2, 1, c); }
    else { R(3, 4, 2, 2, '#5a5262'); R(6, 4, 2, 2, '#5a5262'); R(9, 4, 2, 2, '#5a5262'); }
  }));
  function emote(a, k = '!', hold = 0.85, quiet = false) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoTex(k), depthTest: false, depthWrite: false, transparent: true }));
    s.center.set(0.5, 0); s.renderOrder = 999; s.scale.set(0.001, 0.001, 1); a.g.add(s);
    emotes.push({ s, a, t: 0, hold, y: a.sp.scale.y + 0.1 });
    if (quiet) {} else if (k === '!') blip(880, 1320, 0.09, 0.05); else if (k === '?') blip(520, 700, 0.12, 0.04, 'triangle');
    return wait(hold * 1000);
  }
  function updEmotes(dt) {
    for (let i = emotes.length - 1; i >= 0; i--) {
      const e = emotes[i]; e.t += dt;
      const k = e.t < 0.12 ? (e.t / 0.12) * 1.25 : e.t < 0.2 ? 1.25 - ((e.t - 0.12) / 0.08) * 0.25 : e.t > e.hold ? Math.max(0, 1 - (e.t - e.hold) / 0.12) : 1;
      e.s.scale.set(0.52 * k, 0.48 * k, 1); e.s.position.y = e.y + (e.t < 0.2 ? 0.06 * Math.sin((e.t / 0.2) * Math.PI) : 0);
      if (e.t > e.hold + 0.12) { e.a.g.remove(e.s); e.s.material.dispose(); emotes.splice(i, 1); }
    }
  }
  // How-to-play card: shown when a new playable character takes over, and on H.
  let helpCard = null;
  function showHelp(kind) { held.length = 0; return new Promise((res) => { helpCard = { res, t: simT }; hooks.onHelp && hooks.onHelp({ kind, objective: objective() }); }); }
  function openHelp() { if (started && !busy && !dlg && !alertCard && !MG && !cine && !helpCard) runScript(() => showHelp(F.lab || F.gen || F.c3 ? 'lab' : 'street')); }
  function showAlert(a) { return new Promise((res) => { alertCard = { ...a, res, t: simT }; hooks.onAlert && hooks.onAlert(a); }); }
  let fadeV = 0;
  let fadeTw = null;
  function fadeTo(v, dur) { return new Promise((res) => { fadeTw = { s: fadeV, v, t0: simT, dur, res }; }); }
  async function runScript(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } busy = false; hooks.onObjective && hooks.onObjective(objective()); }
  let bannerTok = 0;
  function banner(S) { const tok = ++bannerTok; hooks.onBanner && hooks.onBanner({ title: S.title, sub: S.sub }); wait(2800).then(() => { if (tok === bannerTok) hooks.onBanner && hooks.onBanner(null); }); }
  async function warp(w) {
    busy = true; held.length = 0; hooks.onBanner && hooks.onBanner(null);
    await fadeTo(1, 0.28);
    setScene(w.scene); place(P, w.x, w.z, w.dir); camUpdate(0, true);
    cam.h += 4.5; cam.d += 5; cam.yaw += w.scene === 'street' ? 0.8 : -0.5; cam.fov += 8;
    await fadeTo(0, 0.5); banner(active); busy = false;
  }
  function pressA() {
    if (!started) { if (!o.titleMenu) start(); return; }
    if (cine) { hooks.onCineA && hooks.onCineA(); return; }
    if (helpCard) { if (simT - helpCard.t < 0.4) return; const r = helpCard.res; helpCard = null; hooks.onHelp && hooks.onHelp(null); r(); return; }
    if (alertCard) { if (simT - alertCard.t < 0.4) return; const r = alertCard.res; alertCard = null; hooks.onAlert && hooks.onAlert(null); r(); return; }
    if (dlg) { if (dlg.shown < dlg.text.length) { dlg.shown = dlg.text.length; emitDlg(); } else { const r = dlg.res; dlg = null; hooks.onDialog && hooks.onDialog(null); r(); } return; }
    if (MG && MG.listening) { mgAct('ok'); return; }
    if (busy || P.moving) return;
    const nx = P.x + DV[P.dir][0], nz = P.z + DV[P.dir][1];
    const a = active.actors.find((q) => q.g.visible && q.onTalk && q.x === nx && q.z === nz);
    if (a) { const home = a.home; a.dir = OPP[P.dir]; runScript(async () => { await a.onTalk(); if (home !== undefined) a.dir = home; }); return; }
    const fn = active.interact[nx + ',' + nz]; if (fn) runScript(fn);
  }
  function start(ch = 0) {
    if (started) return; started = true; hooks.onStarted && hooks.onStarted();
    fadeV = 1; if (fadeEl) fadeEl.style.opacity = 1;
    runScript(async () => {
      if (ch === 2) { await goChapter2(); return; }
      if (ch === 3) { await goChapter3(); return; }
      if (ch === 0) { await chapterCard('Prologue', 'The Night the Sky Turned Red', 2.6); await cinematic('prologue'); }
      await goChapter1();
    });
  }
  function press(d) { if (MG && MG.axis && !dlg) { mgKey(d); return; } if (held.includes(d)) return; held.push(d); if (!P.moving && P.dir !== d && !busy && !dlg) { P.dir = d; turnT = 0.09; } }
  function release(d) { const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); }
  const KEYS = { ArrowDown: 0, s: 0, S: 0, ArrowUp: 1, w: 1, W: 1, ArrowLeft: 2, a: 2, A: 2, ArrowRight: 3, d: 3, D: 3 };
  const offKeys = (e) => !!(e.target && ((/INPUT|TEXTAREA/.test(e.target.tagName)) || (e.target.closest && e.target.closest('[data-keys-off]'))));
  // Every input goes through inp(): applied at once when playing alone; in co-op (lockstep) it goes to the host, which
  // tells every screen on which tick to apply it.
  let netRoute = null;
  function epilogueGo() { if (!started) { started = true; hooks.onStarted && hooks.onStarted(); } fadeV = 1; if (fadeEl) fadeEl.style.opacity = 1; runScript(goEpilogue); }
  function applyInput(ev) {
    if (!ev) return;
    switch (ev.k) {
      case 'press': press(ev.d | 0); break;
      case 'release': release(ev.d | 0); break;
      case 'A': pressA(); break;
      case 'mg': mgAct(ev.a, ev.v); break;
      case 'help': openHelp(); break;
      case 'run': run = !!ev.v; break;
      case 'relAll': held.length = 0; run = false; break;
      case 'skip': if (cine) hooks.onCineSkip && hooks.onCineSkip(); break;
      case 'cineA': if (cine) hooks.onCineA && hooks.onCineA(); break;
      case 'start': start(ev.ch | 0); break;
      case 'epilogue': epilogueGo(); break;
      default: break;
    }
  }
  const inp = (ev) => (netRoute ? netRoute(ev) : applyInput(ev));
  const kd = (e) => { if (offKeys(e)) return; if (e.key in KEYS) { if (!(netRoute && e.repeat && !(MG && MG.axis && !dlg))) inp({ k: 'press', d: KEYS[e.key] }); e.preventDefault(); } else if (e.key === 'Escape' && cine) { inp({ k: 'skip' }); } else if (['z', 'Z', 'e', 'E', 'Enter', ' '].includes(e.key)) { if (!e.repeat) inp({ k: 'A' }); e.preventDefault(); } else if ((e.key === 'h' || e.key === 'H') && !e.repeat) { inp({ k: 'help' }); } else if (['Shift', 'x', 'X'].includes(e.key)) { if (!(netRoute && e.repeat)) inp({ k: 'run', v: true }); } };
  const ku = (e) => { if (offKeys(e)) return; if (e.key in KEYS) inp({ k: 'release', d: KEYS[e.key] }); else if (['Shift', 'x', 'X'].includes(e.key)) inp({ k: 'run', v: false }); };
  const blur = () => { if (netRoute) netRoute({ k: 'relAll' }); else { held.length = 0; run = false; } };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', blur);

  // ---------- loop ----------
  setScene('apt'); place(P, 1, 4, 3); camUpdate(0, true);
  // ---------- demo autopilot ----------
  let demo = false, demoFilter = true, manual = false, route = [], ri = 0, actT = 0, actScene = null;
  function bfs(S, sx, sz, tx, tz) {
    const K = (x, z) => x + ',' + z, prev = new Map([[K(sx, sz), null]]), q = [[sx, sz]];
    while (q.length) { const [x, z] = q.shift(); if (x === tx && z === tz) break; for (let d = 0; d < 4; d++) { const nx = x + DV[d][0], nz = z + DV[d][1], k = K(nx, nz); if (prev.has(k) || S.blocked(nx, nz)) continue; prev.set(k, [x, z, d]); q.push([nx, nz]); } }
    let cur = prev.get(K(tx, tz)), first = -1; if (cur === undefined) return -1;
    while (cur) { first = cur[2]; cur = prev.get(K(cur[0], cur[1])); } return first;
  }
  function steer() {
    const A = route[ri]; if (!A || !A.go) return;
    if (P.x === A.go[0] && P.z === A.go[1]) { held.length = 0; return; }
    const d = bfs(active, P.x, P.z, A.go[0], A.go[1]); held.length = 0; if (d >= 0) held.push(d);
  }
  function autopilot(dt) {
    if (cine) return;
    if (MG && MG.listening && !dlg) { mgT += dt; if (mgT > 0.5 && MG.auto) { mgT = 0; const r = MG.auto(); if (r) { mgAct(r[0], r[1]); if (r[0] === 'set') mgAct('ok'); } } return; }
    if (dlg) { if (dlg.shown >= dlg.text.length) { dlg.hold += dt; if (dlg.hold > 0.9 + dlg.text.length * 0.032) pressA(); } return; }
    if (alertCard) { if (simT - alertCard.t > 3.2) pressA(); return; }
    if (helpCard) { if (simT - helpCard.t > 1.2) pressA(); return; }
    const A = route[ri]; if (!A) return;
    if (A.start) { if (!started) start(A.ch || 0); ri++; actT = 0; return; }
    if (busy || P.moving) return;
    actT += dt;
    if (A.go) { if (P.x === A.go[0] && P.z === A.go[1]) { held.length = 0; ri++; actT = 0; } else steer(); return; }
    if ('run' in A) { run = A.run; ri++; return; }
    if ('face' in A) { P.dir = A.face; ri++; actT = 0; return; }
    if (A.a) { if (actT > 0.25) { pressA(); ri++; actT = 0; } return; }
    if (A.wait) { if (actT > A.wait) { ri++; actT = 0; } return; }
    if ('step' in A) { if (!actScene) actScene = active; if (active !== actScene) { held.length = 0; actScene = null; ri++; actT = 0; } else { held.length = 0; held.push(A.step); } }
  }
  const DEMO_ROUTE = [
    { wait: 1.2 }, { start: 1 },
    { go: [2, 1] }, { face: 1 }, { a: 1 },
    { go: [14, 2] }, { face: 3 }, { a: 1 },
    { go: [6, 1] }, { face: 1 }, { a: 1 },
    { go: [9, 7] }, { step: 0 }, { wait: 0.6 },
    { go: [11, 10] }, { go: [14, 10] }, { go: [14, 3] }, { wait: 1.4 }, { go: [14, 13] }, { wait: 0.6 },
    { go: [20, 11] }, { face: 1 }, { a: 1 },
    { go: [25, 14] }, { face: 0 }, { a: 1 },
    { run: true }, { go: [6, 10] }, { run: false }, { step: 1 }, { wait: 0.4 },
    { go: [10, 2] }, { face: 1 }, { a: 1 }, { wait: 2.5 },
  ];
  const DEMO_CH1 = [
    { wait: 1 }, { start: 1, ch: 1 },
    { go: [22, 11] }, { face: 1 }, { a: 1 },
    { go: [14, 12] }, { face: 0 }, { a: 1 },
    { go: [5, 2] }, { face: 1 }, { a: 1 },
    { go: [8, 2] }, { face: 1 }, { a: 1 },
    { go: [5, 2] }, { face: 1 }, { a: 1 }, { wait: 2 },
  ];

  // ---------- loop ----------
  let raf = 0, last = performance.now(), t = 0;
  function tick(dt) {
    simT += dt; t += dt;
    for (let i = timers.length - 1; i >= 0; i--) if (timers[i].t <= simT) { const r = timers[i].r; timers.splice(i, 1); r(); }
    if (fadeTw) { const k = Math.min(1, (simT - fadeTw.t0) / fadeTw.dur); fadeV = fadeTw.s + (fadeTw.v - fadeTw.s) * k; if (fadeEl) fadeEl.style.opacity = fadeV; if (k >= 1) { const r = fadeTw.res; fadeTw = null; r(); } }
    if (demo) autopilot(dt);
    updatePlayer(dt); active.update(dt, t); updEmotes(dt);
    if (dlg && dlg.shown < dlg.text.length) { dlg.shown = Math.min(dlg.text.length, dlg.shown + dt * 52); if (Math.floor(dlg.shown) !== dlg.last) { dlg.last = Math.floor(dlg.shown); emitDlg(); } }
    camUpdate(dt, false); updPrompt();
  }
  // "E · Talk" / "E · Look" tag over whatever the player is facing.
  const promptEl = o.promptEl, PL = { en: ['Talk', 'Look'], es: ['Hablar', 'Mirar'], pt: ['Falar', 'Olhar'] }, _pv = new THREE.Vector3(); let promptKey = '';
  function updPrompt() {
    if (!promptEl) return;
    let tgt = null, kind = 0;
    if (started && !busy && !dlg && !alertCard && !helpCard && !MG && !cine && !P.moving && !demo) {
      const nx = P.x + DV[P.dir][0], nz = P.z + DV[P.dir][1];
      const a = active.actors.find((q) => q.g.visible && q.onTalk && q.x === nx && q.z === nz);
      if (a) tgt = [a.g.position.x, a.g.position.y + a.sp.scale.y + 0.12, a.g.position.z];
      else if (active.interact[nx + ',' + nz]) { tgt = [nx, active.groundH(nx, nz) + 1.15, nz]; kind = 1; }
    }
    if (!tgt) { if (promptKey) { promptEl.style.display = 'none'; promptKey = ''; } return; }
    _pv.set(tgt[0], tgt[1], tgt[2]).project(camera);
    promptEl.style.left = (((_pv.x + 1) / 2) * container.clientWidth).toFixed(1) + 'px';
    promptEl.style.top = (((1 - _pv.y) / 2) * container.clientHeight).toFixed(1) + 'px';
    const lbl = (PL[window.__tcsLang] || PL.en)[kind];
    if (promptKey !== lbl) { promptEl.style.display = 'flex'; const sp = promptEl.querySelector('[data-label]'); if (sp) sp.textContent = lbl; promptKey = lbl; }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (manual) return;
    tick(dt); renderer.render(active.scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    start: (ch) => inp({ k: 'start', ch: ch | 0 }), pressA: () => inp({ k: 'A' }), press: (d) => inp({ k: 'press', d }), release: (d) => inp({ k: 'release', d }), help: () => inp({ k: 'help' }),
    cineA: () => inp({ k: 'cineA' }), cineSkip: () => inp({ k: 'skip' }),
    mg: (a, v) => inp({ k: 'mg', a, v }),
    // co-op lockstep: the coop controller owns the clock (fixed 1/60 s ticks) and the input order.
    applyInput, tick1: () => tick(1 / 60), render: () => renderer.render(active.scene, camera),
    lockstep: (fn) => { netRoute = fn || null; manual = !!fn; if (fn) { const d = simT; timers.forEach((x) => (x.t -= d)); if (fadeTw) fadeTw.t0 -= d; simT = 0; t = 0; held.length = 0; run = false; } },
    control: () => ({ started, cine, card: !!(helpCard || alertCard), who: dlg ? dlg.who : null, mg: MG ? MG.kind : null, avatar: Object.keys(FR).find((k) => FR[k] === P.frames) || '' }),
    data: { PEAKS, obs, model, FRONT, READ }, setSounds: (v) => (sounds = !!v),
    mapInfo: () => {
      const S = active; if (!S) return null;
      const tg = objTarget(), away = !!tg && tg.scene !== S.name;
      const warps = Object.keys(S.warps).map((k) => { const [x, z] = k.split(',').map(Number), w = S.warps[k]; return { x, z, lock: !!w.lock, lead: away && !w.lock && w.scene === tg.scene }; });
      return {
        key: S.name + ':' + F.ch, title: S.title || '', x0: S.x0, z0: S.z0, W: S.W, D: S.D, block: S.block, cblock: S.cblock ? S.cblock[F.ch] : null, warps,
        actors: S.actors.filter((a) => a.g.visible).map((a) => ({ x: a.g.position.x, z: a.g.position.z, talk: !!a.onTalk })),
        px: P.g.position.x, pz: P.g.position.z, dir: P.dir, who: P.frames === FR.kiran ? 'kiran' : 'lucas', target: tg && !away ? tg : null,
      };
    },
    demo: (opts = {}) => { demo = true; route = opts.route === 'prologue' ? DEMO_ROUTE : DEMO_CH1; demoFilter = route === DEMO_ROUTE; ri = 0; actT = 0; manual = !!opts.manual; },
    peek: () => ({ text: dlg ? dlg.text : '', done: !!dlg && dlg.shown >= dlg.text.length, alert: !!alertCard, scene: active.name, ri, x: P.x, z: P.z, moving: P.moving }),
    runUntil: (fn, max = 60) => { const pk = () => ({ text: dlg ? dlg.text : '', done: !!dlg && dlg.shown >= dlg.text.length, alert: !!alertCard, scene: active.name, ri, x: P.x, z: P.z, moving: P.moving }); let n = 0; while (n < max * 60 && !fn(pk())) { tick(1 / 60); n++; } renderer.render(active.scene, camera); return { ...pk(), sec: n / 60 }; },
    runUntilAsync: async (fn, max = 60) => { const pk = () => ({ text: dlg ? dlg.text : '', done: !!dlg && dlg.shown >= dlg.text.length, alert: !!alertCard, scene: active.name, ri, x: P.x, z: P.z, moving: P.moving }); let n = 0; while (n < max * 60 && !fn(pk())) { tick(1 / 60); n++; for (let k = 0; k < 6; k++) await null; } renderer.render(active.scene, camera); window.__last = { ...pk(), sec: n / 60 }; return window.__last; },
    step: (sec) => { const n = Math.max(1, Math.round(sec * 60)); for (let i = 0; i < n; i++) tick(1 / 60); renderer.render(active.scene, camera); return { ri, done: ri >= route.length, simT }; },
    setRun: (v) => inp({ k: 'run', v: !!v }),
    epilogue: () => inp({ k: 'epilogue' }),
    jump: (x, z, dir = 1) => { if (!busy) { place(P, x, z, dir); camUpdate(0, true); } },
    setPixelScale: (n) => { pixelScale = clamp(n || 3, 1, 6); resize(); },
    setDynamicCam: (v) => (dynamicCam = v),
    destroy: () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur); renderer.dispose(); cv.remove(); },
  };
}
