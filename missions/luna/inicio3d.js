/* MAPS · fondos 3D para la pantalla de inicio (three.js r149, global THREE).
   MAPS3D.mount(canvas, 'mapa'|'polo'|'plano', {onLabels(list)}) → {stop()}
   Texturas procedurales: no usa imágenes. */
(function () {
  const TAU = Math.PI * 2;
  // ---- ruido 3D (valor) para texturas sin costura ----
  function hash(x, y, z) { let h = x * 374761393 + y * 668265263 + z * 2147483647; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf), w = s(zf), L = (a, b, t) => a + (b - a) * t;
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
    return L(L(L(c(0,0,0), c(1,0,0), u), L(c(0,1,0), c(1,1,0), u), v), L(L(c(0,0,1), c(1,0,1), u), L(c(0,1,1), c(1,1,1), u), v), w);
  }
  function fbm(x, y, z, o) { let a = 0, f = 1, amp = .5; for (let i = 0; i < (o || 5); i++) { a += vnoise(x * f, y * f, z * f) * amp; f *= 2.03; amp *= .5; } return a; }
  function sphereTex(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
    for (let j = 0; j < h; j++) { const lat = (j / h - .5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (let i = 0; i < w; i++) { const lon = i / w * TAU, x = cl * Math.cos(lon), z = cl * Math.sin(lon), k = (j * w + i) * 4, col = fn(x, sl, z, lat);
        d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = col[3] == null ? 255 : col[3]; } }
    g.putImageData(im, 0, 0); return c;
  }
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const cl01 = t => Math.max(0, Math.min(1, t));
  const CACHE = {};
  function tex(key, mk) { if (!CACHE[key]) CACHE[key] = mk(); const t = new THREE.CanvasTexture(CACHE[key]); t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; return t; }
  const earthC = () => sphereTex(768, 384, (x, y, z, lat) => {
    const n = fbm(x * 1.7 + 3, y * 1.7, z * 1.7, 5), ice = Math.abs(lat) > 1.3 + (n - .5) * .3;
    if (ice) return [232, 238, 245];
    if (n > .53) { const t = cl01((n - .53) * 6); return mix(mix([74, 112, 64], [142, 128, 86], t), [196, 182, 140], cl01((n - .66) * 6)); }
    const dpt = cl01((.53 - n) * 4); return mix([38, 110, 168], [10, 34, 78], dpt);
  });
  const cloudC = () => sphereTex(512, 256, (x, y, z) => { const n = fbm(x * 3 + 9, y * 3, z * 3, 5); const a = cl01((n - .56) * 3.5); return [255, 255, 255, a * 200]; });
  const moonC = () => {
    const c = sphereTex(1024, 512, (x, y, z) => { const n = fbm(x * 2.5, y * 2.5, z * 2.5, 6), f = fbm(x * 14, y * 14, z * 14, 3), m = fbm(x * .9 + 5, y * .9, z * .9, 3); const v = 118 + (n - .5) * 80 + (f - .5) * 40 - (m > .55 ? 34 : 0); return [v, v, v * 1.02]; });
    const g = c.getContext('2d'); let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 1500; i++) { const x = r() * c.width, y = c.height * (.08 + r() * .84), rad = Math.pow(r(), 3.2) * 15 + 1.5;
      const gr = g.createRadialGradient(x - rad * .2, y - rad * .2, rad * .1, x, y, rad);
      gr.addColorStop(0, 'rgba(50,50,54,.35)'); gr.addColorStop(.7, 'rgba(80,80,84,.22)'); gr.addColorStop(.9, 'rgba(200,200,205,.18)'); gr.addColorStop(1, 'rgba(200,200,205,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad, 0, 0, TAU); g.fill(); }
    return c;
  };
  const jupC = () => sphereTex(512, 256, (x, y, z, lat) => { const t = fbm(x * 2, y * 2, z * 2, 4), b = Math.sin(lat * 14 + t * 3.2) * .5 + .5;
    const P = [[226, 214, 190], [196, 152, 110], [238, 226, 206], [170, 110, 78]]; const k = b * 3, i = Math.floor(k); return mix(P[i], P[Math.min(3, i + 1)], k - i); });
  const ganC = () => sphereTex(256, 128, (x, y, z) => { const n = fbm(x * 3, y * 3, z * 3, 5); return mix([96, 88, 80], [190, 180, 168], n); });
  const lastC = () => sphereTex(512, 256, (x, y, z) => { const n = fbm(x * 2 + 11, y * 2, z * 2, 5); return n > .5 ? mix([70, 120, 90], [150, 140, 96], cl01((n - .5) * 4)) : mix([30, 90, 120], [12, 40, 70], cl01((.5 - n) * 4)); });

  function glow(r, color, pow, k) {
    const m = new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(color) }, p: { value: pow || 3 }, k: { value: k || .9 } }, transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform vec3 c;uniform float p;uniform float k;varying vec3 vN;void main(){float i=pow(k-dot(vN,vec3(0.,0.,1.)),p);gl_FragColor=vec4(c,1.)*i;}' });
    return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), m);
  }
  function stars(n, R, size, op) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, s = Math.sqrt(1 - u * u); p[i * 3] = R * s * Math.cos(a); p[i * 3 + 1] = R * u; p[i * 3 + 2] = R * s * Math.sin(a); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf0f4fa, size, sizeAttenuation: false, transparent: true, opacity: op, depthWrite: false, toneMapped: false }));
  }
  function spriteGlow(color, s) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.set(s, s, 1); return sp;
  }
  function planet(r, map, opt) { opt = opt || {}; const m = new THREE.MeshStandardMaterial({ map, roughness: opt.rough ?? .95, metalness: 0 }); if (opt.bump) { m.bumpMap = opt.bump; m.bumpScale = opt.bs || .04; }
    return new THREE.Mesh(new THREE.SphereGeometry(r, opt.seg || 64, (opt.seg || 64) / 2), m); }
  function dashTube(curve, r, color) {
    const m = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, rev: { value: 0 }, c: { value: new THREE.Color(color) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float t;uniform float rev;uniform vec3 c;varying vec2 vU;void main(){if(vU.x>rev)discard;float d=step(.45,fract(vU.x*60.-t));gl_FragColor=vec4(c,(.35+.65*d)*.9);}' });
    return new THREE.Mesh(new THREE.TubeGeometry(curve, 240, r, 6, false), m);
  }
  function lineLoop(pts, color, op, dashed) {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: .12, gapSize: .09, transparent: true, opacity: op }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });
    const l = new THREE.LineLoop(g, m); if (dashed) l.computeLineDistances(); return l;
  }
  const circle = (r, n) => Array.from({ length: n || 128 }, (_, i) => new THREE.Vector3(Math.cos(i / (n || 128) * TAU) * r, 0, Math.sin(i / (n || 128) * TAU) * r));

  function mount(canvas, kind, opts) {
    opts = opts || {};
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 16 / 9, .1, 600);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const host = canvas.parentElement;
    const onMove = e => { const r = host.getBoundingClientRect(); mouse.tx = ((e.clientX - r.left) / r.width - .5) * 2; mouse.ty = ((e.clientY - r.top) / r.height - .5) * 2; };
    host.addEventListener('pointermove', onMove);
    const B = ({ mapa: buildMapa, polo: buildPolo, plano: buildPlano })[kind](scene, cam, R);
    const fit = () => { const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(fit); ro.observe(canvas); fit();
    let vis = true; const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; }); io.observe(canvas);
    const v = new THREE.Vector3(); let raf = 0, t0 = performance.now(), last = 0;
    const loop = now => {
      raf = requestAnimationFrame(loop); if (!vis) return; if (now - last < 15) return; last = now;
      const t = reduce ? 4 : Math.max(0, (now - t0) / 1000);
      mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
      try { B.tick(t, mouse); R.render(scene, cam); } catch (err) { window.__m3dErr = String(err && err.stack || err).slice(0, 300); }
      if (opts.onLabels && B.labels) { const w = canvas.clientWidth, h = canvas.clientHeight;
        opts.onLabels(B.labels.map(L => { L.obj.getWorldPosition(v); if (L.off) v.add(L.off); v.project(cam); return { id: L.id, x: (v.x * .5 + .5) * w, y: (-v.y * .5 + .5) * h, on: v.z < 1 }; }), B.state ? B.state(t) : null); }
    };
    raf = requestAnimationFrame(loop);
    return { renderAt(t) { fit(); B.tick(t, mouse); R.render(scene, cam); }, stop() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); host.removeEventListener('pointermove', onMove); R.dispose(); } };
  }

  // ---------- A · mapa de campañas en 3D ----------
  const NOISE = 'float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}' +
    'float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}' +
    'float fbm(vec3 p,int n){float a=.5,s=0.;for(int i=0;i<7;i++){if(i>=n)break;s+=a*noise(p);p=p*2.03+vec3(1.7);a*=.5;}return s;}';
  const VERT = 'varying vec3 vO;varying vec3 vN;varying vec3 vW;void main(){vO=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
  const TAIL = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}';
  function earthMat(L) {
    return new THREE.ShaderMaterial({ uniforms: { L: { value: L.clone().normalize() }, ct: { value: 0 }, D: { value: new THREE.Vector3(0, 1, 0) }, au: { value: 0 }, SD: { value: new THREE.Vector3(0, 1, 0) }, sk: { value: 0 }, st: { value: 0 } }, vertexShader: VERT,
      fragmentShader: 'uniform vec3 L;uniform float ct;uniform vec3 D;uniform float au;uniform vec3 SD;uniform float sk;uniform float st;varying vec3 vO;varying vec3 vN;varying vec3 vW;' + NOISE +
        'void main(){vec3 p=normalize(vO),N=normalize(vN),V=normalize(cameraPosition-vW);' +
        'float h=fbm(p*2.1+vec3(3.1,0.,1.3),6)+.1*(fbm(p*11.,3)-.5);float land=smoothstep(.505,.52,h);float lat=abs(p.y);' +
        'vec3 oc=mix(vec3(.004,.02,.075),vec3(.02,.13,.24),smoothstep(.36,.505,h));' +
        'float veg=fbm(p*6.+5.,4);vec3 lc=mix(vec3(.035,.11,.03),vec3(.3,.23,.12),smoothstep(.42,.62,veg+(.4-lat)*.45));lc=mix(lc,vec3(.2,.18,.15),smoothstep(.6,.72,h));' +
        'float ice=smoothstep(.8,.87,lat+(h-.5)*.25);vec3 sf=mix(mix(oc,lc,land),vec3(.85,.9,.95),ice);' +
        'float c=cos(ct),sn=sin(ct);vec3 q=vec3(p.x*c-p.z*sn,p.y,p.x*sn+p.z*c);float cl=fbm(q*3.2+vec3(0.,ct*.5,0.)+1.4*fbm(q*2.3+7.,3),5);cl=smoothstep(.52,.78,cl);' +
        'if(sk>0.){vec3 su=normalize(cross(SD,vec3(0.,0.,1.))),sv=cross(SD,su);float sx=dot(N,su),sy=dot(N,sv),sr=length(vec2(sx,sy)),sa=atan(sy,sx);float ssp=.5+.5*sin(2.*sa+7.*log(sr+.015)-st*.5);float sto=smoothstep(.35,.85,ssp+.35*(fbm(N*16.+st*.02,3)-.5))*(1.-smoothstep(.05,.2,sr));sto=max(sto,(1.-smoothstep(.0,.06,sr))*.95)*smoothstep(.006,.02,sr)*step(0.,dot(N,SD))*sk;cl=max(cl,sto);}' +
        'float ndl=dot(N,L),df=max(ndl,0.),day=smoothstep(-.12,.28,ndl);' +
        'vec3 col=sf*(df*1.3+.012);float sp=pow(max(dot(reflect(-L,N),V),0.),180.)*(1.-land)*(1.-cl);col+=vec3(1.,.88,.7)*sp*1.6*day;' +
        'col=mix(col,vec3(.95,.97,1.)*(df*1.15+.02),cl*.9);' +
        'float city=smoothstep(.55,.9,noise(p*170.))*smoothstep(.45,.75,noise(p*38.))*smoothstep(.5,.62,fbm(p*9.+2.,3))*land*(1.-ice);col+=vec3(1.,.66,.28)*city*(1.-day)*(1.-cl)*2.2;' +
        'col+=vec3(1.,.42,.16)*cl*smoothstep(.0,.12,ndl)*(1.-smoothstep(.12,.3,ndl))*.5;' +
        'float ad=dot(N,D);float ar=exp(-pow((ad-.93)/.018,2.))*(.35+.65*noise(vec3(p.xz*26.,ct*40.)))+.07*exp(-pow((ad-.93)/.07,2.));col+=vec3(1.,.07,.14)*ar*au;' +
        'float fr=pow(1.-max(dot(N,V),0.),2.6);col+=vec3(.22,.48,1.)*fr*(day*1.1+.04);gl_FragColor=vec4(col,1.);' + TAIL });
  }
  function atmoMat(L, zmax, col) {
    return new THREE.ShaderMaterial({ uniforms: { L: { value: L.clone().normalize() }, zm: { value: zmax }, c: { value: new THREE.Color(col) }, g: { value: 1 }, lit: { value: 1 } }, vertexShader: VERT, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      fragmentShader: 'uniform vec3 L;uniform float zm;uniform float g;uniform float lit;uniform vec3 c;varying vec3 vO;varying vec3 vN;varying vec3 vW;void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vW);float z=clamp(-dot(N,V)/zm,0.,1.);float i=pow(z,2.4);float sun=mix(1.,smoothstep(-.35,.45,dot(N,L)),lit);vec3 col=mix(c,mix(c,vec3(.7,.86,1.),lit),i*.5)*i*(sun*1.1+.02)*g;gl_FragColor=vec4(col,1.);' + TAIL });
  }
  function jupMat(L) {
    return new THREE.ShaderMaterial({ uniforms: { L: { value: L.clone().normalize() }, t: { value: 0 } }, vertexShader: VERT,
      fragmentShader: 'uniform vec3 L;uniform float t;varying vec3 vO;varying vec3 vN;varying vec3 vW;' + NOISE +
        'void main(){vec3 p=normalize(vO),N=normalize(vN);float w=fbm(vec3(p.x*2.5+t,p.y*7.,p.z*2.5),5)-.5;float w2=fbm(vec3(p.x*9.,p.y*26.,p.z*9.)+3.,4)-.5;' +
        'float b=p.y*8.5+w*1.5+w2*.35;float k=.5+.5*sin(b*3.14159);float k2=.5+.5*sin(b*1.37+1.);' +
        'vec3 a=vec3(.6,.47,.33),d=vec3(.3,.15,.08),e=vec3(.72,.64,.52),f=vec3(.44,.25,.14);vec3 col=mix(mix(d,a,k),mix(f,e,k),k2);' +
        'vec2 sp=vec2(atan(p.z,p.x)-1.9,(p.y+.36)*2.6);float rs=1.-smoothstep(.0,.2,length(sp*vec2(1.,1.9))+w2*.06);col=mix(col,vec3(.5,.16,.07),rs*.85);' +
        'col*=1.-.35*smoothstep(.75,1.,abs(p.y));float ndl=dot(N,L);col=pow(col,vec3(1.25));col*=pow(max(ndl,0.),.9)*.85+.004;gl_FragColor=vec4(col,1.);' + TAIL });
  }
  function starField(n, R, a0, a1) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    const T = [[1, .96, .9], [.8, .88, 1], [1, .84, .68], [.7, .8, 1], [1, 1, 1]];
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, q = Math.sqrt(1 - u * u); p[i * 3] = R * q * Math.cos(a); p[i * 3 + 1] = R * u; p[i * 3 + 2] = R * q * Math.sin(a);
      const k = Math.pow(Math.random(), 6), c = T[Math.random() * T.length | 0], br = a0 + (a1 - a0) * k; col[i * 3] = c[0] * br; col[i * 3 + 1] = c[1] * br; col[i * 3 + 2] = c[2] * br; sz[i] = 1 + k * 3.2; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('sz', new THREE.BufferAttribute(sz, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, pr: { value: Math.min(2, devicePixelRatio || 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      vertexShader: 'attribute float sz;uniform float t;uniform float pr;varying vec3 vC;void main(){float tw=.75+.25*sin(t*(1.+sz)+position.x*.37);vC=color*tw;gl_PointSize=sz*pr;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);gl_FragColor=vec4(vC*a*a,1.);}' });
    return new THREE.Points(g, m);
  }
  function milky() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'), im = g.createImageData(512, 256), d = im.data;
    for (let j = 0; j < 256; j++) for (let i = 0; i < 512; i++) { const x = i / 512, y = j / 256, band = Math.exp(-Math.pow((y - .5 - (x - .5) * .12) / .16, 2)), n = fbm(x * 5, y * 5, 3.3, 5), dust = fbm(x * 9 + 4, y * 9, 1.1, 4);
      const v = Math.max(0, band * (n * 1.5 - .35)) * (1 - Math.max(0, (dust - .5) * 2.2)) * Math.sin(Math.PI * x) ; const k = (j * 512 + i) * 4; d[k] = v * 110; d[k + 1] = v * 135; d[k + 2] = v * 230; d[k + 3] = 255; }
    g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(520, 260), new THREE.MeshBasicMaterial({ map: t, blending: THREE.AdditiveBlending, transparent: true, opacity: .2, depthWrite: false, toneMapped: false })); return m;
  }
  function ringXY(r, color, op, dash, gap) { const pts = Array.from({ length: 160 }, (_, i) => new THREE.Vector3(Math.cos(i / 160 * TAU) * r, Math.sin(i / 160 * TAU) * r, 0)); const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = dash ? new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: gap, transparent: true, opacity: op, depthWrite: false, toneMapped: false }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, toneMapped: false }); const l = new THREE.LineLoop(g, m); if (dash) l.computeLineDistances(); return l; }
  function buildMapa(scene, cam, R) {
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
    scene.background = new THREE.Color(0x010206);
    const mw = milky(); mw.position.set(-60, 40, -260); mw.rotation.z = -.5; scene.add(mw);
    const st = starField(6000, 300, .28, 2.2); scene.add(st);
    const SUN = new THREE.Vector3(-6, 5, 4), ESUN = new THREE.Vector3(-2.2, 5, -4.6);
    scene.add(new THREE.AmbientLight(0x5a6a88, .05));
    const sun = new THREE.DirectionalLight(0xfff4e6, 2.6); sun.position.copy(SUN); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x3f6fb8, .35); fill.position.set(6, -6, 2); scene.add(fill);
    const earth = new THREE.Group(); earth.position.set(6.4, -6.4, -1.5); scene.add(earth);
    const eM = earthMat(ESUN), eb = new THREE.Mesh(new THREE.SphereGeometry(5, 128, 96), eM); eb.rotation.set(-.35, 0, .3); earth.add(eb);
    earth.add(new THREE.Mesh(new THREE.SphereGeometry(5.24, 96, 64), atmoMat(ESUN, .3, 0x2f7dff)));
    const jM = jupMat(SUN), jup = new THREE.Mesh(new THREE.SphereGeometry(7, 96, 64), jM); jup.position.set(17.5, 10.2, -16); jup.rotation.set(.1, 0, .16); scene.add(jup);
    const gan = planet(.24, tex('gan', ganC)); gan.position.set(4.0, 2.5, -2.8); scene.add(gan);
    const AD = new THREE.Vector3(.02, .8, .6).normalize(); eM.uniforms.D.value.copy(AD);
    const redA = new THREE.Mesh(new THREE.SphereGeometry(5.3, 96, 64), atmoMat(ESUN, .33, 0xff1f3d)); redA.material.uniforms.lit.value = 0; earth.add(redA);
    const last = new THREE.Object3D(); last.position.copy(earth.position).add(AD.clone().multiplyScalar(5.03)); scene.add(last);
    const lastGlow = spriteGlow('rgba(255,40,70,.9)', .55); lastGlow.position.copy(last.position); scene.add(lastGlow);
    const moonT = tex('moonHi', moonC); const moon = planet(1.0, moonT, { bump: moonT, bs: .035, seg: 96, rough: 1 }); moon.material.color.setScalar(1.25); moon.position.set(.9, -.1, .4); scene.add(moon);
    const sel = new THREE.Group(); sel.position.copy(moon.position); scene.add(sel);
    const r1 = ringXY(1.36, 0x90e1bd, .95, .1, .075), r2 = ringXY(1.52, 0x90e1bd, .22); sel.add(r1, r2);
    const halo = spriteGlow('rgba(144,225,189,.28)', 4.4); halo.material.opacity = .35; halo.position.copy(moon.position).add(new THREE.Vector3(0, 0, -1.2)); scene.add(halo);
    const mk = (obj, r, col) => { const g = new THREE.Group(); g.add(ringXY(r, col || 0xffc779, col ? .95 : .6, .05, .05)); scene.add(g); return { g, obj }; };
    const SDw = new THREE.Vector3(-2.1, 5.5, 2.5).normalize(); eM.uniforms.SD.value.copy(SDw); eM.uniforms.sk.value = 1;
    const ice = new THREE.Group(); ice.position.copy(earth.position).add(SDw.clone().multiplyScalar(5.5)); scene.add(ice);
    const alu = new THREE.MeshStandardMaterial({ color: 0xc9d1dc, metalness: .85, roughness: .3 }), cell = new THREE.MeshStandardMaterial({ color: 0x1a2f6e, metalness: .5, roughness: .3, emissive: 0x050c22 });
    const cb = new THREE.Group(); ice.add(cb);
    cb.add(new THREE.Mesh(new THREE.BoxGeometry(.07, .2, .07), alu));
    [.0355, -.0355].forEach(x => { const f = new THREE.Mesh(new THREE.BoxGeometry(.002, .18, .06), cell); f.position.x = x; cb.add(f); });
    [-1, 1].forEach(sg => { const w = new THREE.Mesh(new THREE.BoxGeometry(.2, .003, .17), cell); w.position.set(sg * .14, .07, 0); cb.add(w); });
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.002, .002, .12), alu); ant.position.set(0, -.15, 0); cb.add(ant);
    cb.scale.setScalar(1.25); cb.rotation.set(.6, .3, .9);
    const iceGlow = spriteGlow('rgba(213,175,255,.55)', .35); ice.add(iceGlow);
    const marks = [mk(last, .46, 0xff5a73), mk(gan, .44, 0x8ed5f3), mk(ice, .36, 0xd5afff)];
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(3.65, -2.65, .3), new THREE.Vector3(3.0, -1.5, .8), new THREE.Vector3(2.25, -.2, .5), new THREE.Vector3(2.3, 1.3, -.6), new THREE.Vector3(3.2, 2.2, -2), new THREE.Vector3(4.0, 2.5, -2.8)]);
    const pm = col => new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, rev: { value: 0 }, c: { value: new THREE.Color(col) }, w: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float t;uniform float rev;uniform float w;uniform vec3 c;varying vec2 vU;void main(){if(vU.x>rev)discard;float d=mix(1.,step(.4,fract(vU.x*150.)),w);float pu=exp(-pow((fract(vU.x-t)-.5)*9.,2.));float fade=smoothstep(0.,.03,vU.x)*smoothstep(0.,.05,rev-vU.x+.05);gl_FragColor=vec4(c*(.35+1.4*pu)*d*fade*mix(.16,1.,w),1.);}' });
    const path = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, .011, 8, false), pm(0xffd596)), pglow = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, .05, 8, false), pm(0xffb45a)); pglow.material.uniforms.w.value = 0; scene.add(pglow, path);
    const ship = spriteGlow('rgba(255,210,150,.95)', .42); scene.add(ship);
    const plume = spriteGlow('rgba(255,170,90,.8)', .45); plume.position.copy(curve.getPointAt(0)); scene.add(plume);
    return {
      labels: [{ id: 'luna', obj: moon, off: new THREE.Vector3(1.75, .1, 0) }, { id: 'last', obj: last, off: new THREE.Vector3(.62, .12, 0) }, { id: 'gany', obj: gan, off: new THREE.Vector3(.58, -.1, 0) }, { id: 'ice', obj: ice, off: new THREE.Vector3(.5, .32, 0) }],
      tick(t, m) {
        eb.rotation.y = 2.2 + t * .012; eM.uniforms.ct.value = t * .006; moon.rotation.y = 3.6 + t * .02; jup.rotation.y = 1.2 + t * .008; jM.uniforms.t.value = t * .004; gan.rotation.y = t * .06; cb.rotation.y = .3 + t * .25; eM.uniforms.st.value = t; { const pu = .5 + .5 * Math.sin(t * 1.3); eM.uniforms.au.value = .7 + .5 * pu; redA.material.uniforms.g.value = .1 + .12 * pu; lastGlow.material.opacity = .5 + .3 * pu; marks.forEach((k, i) => k.g.scale.setScalar(1 + .07 * (.5 + .5 * Math.sin(t * 1.3 + i * 1.7)))); }
        st.material.uniforms.t.value = t;
        sel.quaternion.copy(cam.quaternion); r1.rotation.z = t * .12; r2.scale.setScalar(1 + .03 * Math.sin(t * 1.6)); halo.material.opacity = .28 + .1 * Math.sin(t * 1.6);
        marks.forEach((k, i) => { k.g.position.copy(k.obj.position); k.g.quaternion.copy(cam.quaternion); k.g.rotation.z += 0; k.g.children[0].rotation.z = -t * .08 - i; });
        const rev = Math.min(1, t / 3); [path, pglow].forEach(p => { p.material.uniforms.t.value = t * .07; p.material.uniforms.rev.value = rev; });
        const k = (t * .07 + .5) % 1; ship.position.copy(curve.getPointAt(Math.min(k, rev))); ship.material.opacity = k < rev ? 1 : 0; plume.material.opacity = .35 + .15 * Math.sin(t * 5);
        cam.position.set(-3.2 + m.x * .6 + Math.sin(t * .05) * .25, .2 - m.y * .4, 13.5); cam.lookAt(1.3 + m.x * .15, .1, 0);
      }
    };
  }

  // ---------- B · polo sur de la Luna ----------
  function buildPolo(scene, cam) {
    scene.background = new THREE.Color(0x020308);
    scene.add(stars(2400, 300, 1.1, .75));
    scene.add(new THREE.AmbientLight(0x3a4458, .05));
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.8); sun.position.set(12, 1.2, -2); scene.add(sun);
    const moonT = tex('moonHi', moonC);
    const moon = planet(9, moonT, { bump: moonT, bs: .025, seg: 160 }); moon.position.set(2.4, -10.2, -2); moon.rotation.x = Math.PI / 2; scene.add(moon);
    const earth = new THREE.Group(); earth.position.set(-2.4, 3.1, -14); scene.add(earth);
    const eb = planet(.9, tex('earth', earthC), { rough: .8 }); earth.add(eb); earth.add(glow(.98, 0x6fb6ff, 3, .8));
    const eLight = new THREE.DirectionalLight(0xfff3e0, 1.4); eLight.position.set(10, 0, -12); eLight.target = earth; scene.add(eLight);
    const marks = []; const pole = new THREE.Vector3(0, 1, 0);
    [['A', -.26, .3], ['B', .03, .24], ['C', .3, .33]].forEach(([id, ax, az]) => {
      const n = pole.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -ax).applyAxisAngle(new THREE.Vector3(1, 0, 0), az).normalize();
      const g = new THREE.Group(); g.position.copy(moon.position).add(n.clone().multiplyScalar(9.02)); g.lookAt(moon.position.clone().add(n.clone().multiplyScalar(20)));
      const rg = new THREE.Mesh(new THREE.RingGeometry(.34, .38, 64), new THREE.MeshBasicMaterial({ color: id === 'B' ? 0xffc779 : 0x90e1bd, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); g.add(rg);
      scene.add(g); marks.push({ id, g, rg, n });
    });
    const lander = new THREE.Group(); scene.add(lander);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .14, 8), new THREE.MeshStandardMaterial({ color: 0xd9b46a, metalness: .7, roughness: .35 })); lander.add(body);
    [0, 1, 2, 3].forEach(i => { const lg = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .16), new THREE.MeshStandardMaterial({ color: 0x9aa4b2 })); const a = i / 4 * TAU; lg.position.set(Math.cos(a) * .12, -.09, Math.sin(a) * .12); lg.rotation.z = Math.cos(a) * .5; lg.rotation.x = -Math.sin(a) * .5; lander.add(lg); });
    const flame = spriteGlow('rgba(255,170,90,.9)', .55); flame.position.y = -.18; lander.add(flame);
    const lamp = new THREE.PointLight(0xffb070, 1.2, 3); lamp.position.y = -.25; lander.add(lamp);
    const target = marks[1].g.position.clone().add(marks[1].n.clone().multiplyScalar(.12));
    const desc = new THREE.CatmullRomCurve3([new THREE.Vector3(3.4, 3.4, 1.4), new THREE.Vector3(2.4, 1.6, .2), target.clone().add(new THREE.Vector3(.2, .9, .2)), target]);
    return {
      labels: marks.map(m => ({ id: m.id, obj: m.g, off: new THREE.Vector3(0, .5, 0) })).concat([{ id: 'lander', obj: lander, off: new THREE.Vector3(.35, .1, 0) }]),
      state: t => { const k = (t % 14) / 14; return { phase: k < .8 ? 'desc' : 'land', alt: Math.max(0, Math.round((1 - Math.min(1, k / .8)) * 1800)) }; },
      tick(t, m) {
        moon.rotation.z = t * .004; eb.rotation.y = t * .05;
        marks.forEach((mk, i) => { const s = 1 + .12 * Math.sin(t * 2 + i); mk.rg.scale.set(s, s, s); mk.rg.material.opacity = .55 + .3 * Math.sin(t * 2 + i); });
        const k = (t % 14) / 14, kk = Math.min(1, k / .8), e = 1 - Math.pow(1 - kk, 2.2); lander.position.copy(desc.getPointAt(e)); lander.lookAt(lander.position.clone().add(new THREE.Vector3(0, 0, 1)));
        const on = k < .8; flame.material.opacity = on ? .7 + .3 * Math.random() : Math.max(0, 1 - (k - .8) * 20); flame.scale.setScalar(on ? .45 + .15 * Math.random() : .3); lamp.intensity = on ? 1.2 + Math.random() * .4 : 0;
        lander.visible = k < .98;
        cam.position.set(-1.6 + m.x * .6, 1.2 - m.y * .4 + Math.sin(t * .08) * .1, 9.5); cam.lookAt(1.4 + m.x * .2, -.4, -2);
      }
    };
  }

  // ---------- C · plano de misión (líneas) ----------
  function buildPlano(scene, cam) {
    scene.background = new THREE.Color(0x050c18); scene.fog = new THREE.Fog(0x050c18, 14, 34);
    const grid = new THREE.GridHelper(60, 60, 0x15304c, 0x0b1a2c); grid.position.y = -1.2; scene.add(grid);
    scene.add(stars(1200, 300, 1, .45));
    const CY = 0x8ed5f3, GD = 0xffc779, MN = 0x90e1bd;
    const wire = (r, color, mer, par) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(r * .985, 32, 16), new THREE.MeshBasicMaterial({ color: 0x050c18 })));
      for (let i = 0; i < mer; i++) { const l = lineLoop(circle(r, 96).map(p => new THREE.Vector3(p.x, p.z, 0)), color, .55); l.rotation.y = i / mer * Math.PI; g.add(l); }
      for (let j = 1; j < par; j++) { const lat = (j / par - .5) * Math.PI, rr = Math.cos(lat) * r; const l = lineLoop(circle(rr, 96), color, .4); l.position.y = Math.sin(lat) * r; g.add(l); }
      return g; };
    const earth = wire(1.5, CY, 12, 9); scene.add(earth);
    const moonP = new THREE.Vector3(8.5, 0, -3.5); const moon = wire(.42, MN, 8, 6); moon.position.copy(moonP); scene.add(moon);
    const leo = lineLoop(circle(2.0), CY, .9, true); scene.add(leo);
    const llo = lineLoop(circle(.75), MN, .9, true); llo.position.copy(moonP); scene.add(llo);
    const a = new THREE.Vector3(-2.0, 0, 0), c = moonP.clone().add(new THREE.Vector3(-.75, 0, 0));
    const tr = new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0, 2.0), new THREE.Vector3(5, 0, 4.2), new THREE.Vector3(9.5, 0, .6), moonP.clone().add(new THREE.Vector3(0, 0, .75)));
    const trL = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tr.getPoints(160)), new THREE.LineDashedMaterial({ color: GD, dashSize: .2, gapSize: .12, transparent: true, opacity: .9 })); trL.computeLineDistances(); scene.add(trL);
    const ship = new THREE.Mesh(new THREE.OctahedronGeometry(.11), new THREE.MeshBasicMaterial({ color: GD })); scene.add(ship); const sg = spriteGlow('rgba(255,199,121,.8)', .7); ship.add(sg);
    const trailN = 40, trailP = new Float32Array(trailN * 3), trailG = new THREE.BufferGeometry(); trailG.setAttribute('position', new THREE.BufferAttribute(trailP, 3));
    const trail = new THREE.Line(trailG, new THREE.LineBasicMaterial({ color: GD, transparent: true, opacity: .5 })); scene.add(trail); const hist = [];
    const ticks = new THREE.Group(); scene.add(ticks);
    const tickAt = p => { const m = new THREE.Mesh(new THREE.RingGeometry(.14, .17, 32), new THREE.MeshBasicMaterial({ color: GD, side: THREE.DoubleSide, transparent: true, opacity: .9 })); m.rotation.x = -Math.PI / 2; m.position.copy(p); ticks.add(m); return m; };
    const tli = tickAt(new THREE.Vector3(0, 0, 2.0)), loi = tickAt(tr.getPointAt(1));
    const anchor = p => { const o = new THREE.Object3D(); o.position.copy(p); scene.add(o); return o; };
    const L1 = anchor(new THREE.Vector3(-1.6, 0, 3.0)), L2 = anchor(tr.getPointAt(.5)), L3 = anchor(moonP.clone().add(new THREE.Vector3(2.2, 0, -.9)));
    const P = { leo: 7, tr: 9, llo: 6 }, TOT = P.leo + P.tr + P.llo;
    const pos = t => { const k = t % TOT; if (k < P.leo) { const a = Math.PI / 2 + k / P.leo * TAU * 1.0; return { p: new THREE.Vector3(Math.cos(a) * 2, 0, Math.sin(a) * 2), ph: 'leo' }; }
      if (k < P.leo + P.tr) { const u = (k - P.leo) / P.tr, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; return { p: tr.getPointAt(e), ph: 'tr' }; }
      const u = (k - P.leo - P.tr) / P.llo, a2 = Math.PI / 2 + u * TAU; return { p: moonP.clone().add(new THREE.Vector3(Math.cos(a2) * .75, 0, Math.sin(a2) * .75)), ph: 'llo' }; };
    let cur = 'leo';
    return {
      labels: [{ id: 'leo', obj: L1 }, { id: 'tli', obj: L2 }, { id: 'llo', obj: L3 }, { id: 'tierra', obj: earth, off: new THREE.Vector3(0, -2.6, 0) }, { id: 'luna', obj: moon, off: new THREE.Vector3(0, -1.25, 0) }],
      state: t => ({ phase: cur, met: t }),
      tick(t, m) {
        earth.rotation.y = t * .1; moon.rotation.y = t * .06; leo.rotation.y = -t * .05;
        const s = pos(t); cur = s.ph; ship.position.copy(s.p); ship.rotation.y = t * 2;
        hist.unshift(s.p.clone()); if (hist.length > trailN) hist.pop(); for (let i = 0; i < trailN; i++) { const q = hist[Math.min(i, hist.length - 1)]; trailP[i * 3] = q.x; trailP[i * 3 + 1] = q.y; trailP[i * 3 + 2] = q.z; } trailG.attributes.position.needsUpdate = true;
        [tli, loi].forEach((r, i) => { const k = 1 + .25 * Math.sin(t * 3 + i); r.scale.set(k, k, k); });
        const ang = -.55 + Math.sin(t * .04) * .18 + m.x * .12;
        cam.position.set(.9 + Math.sin(ang) * 16, 7.6 - m.y * .6, Math.cos(ang) * 16 - 1); cam.lookAt(.9, -.2, -.8);
      }
    };
  }
  window.MAPS3D = { mount };
})();
