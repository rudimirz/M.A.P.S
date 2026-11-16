/* MAPS · integra el inicio 3D (1a · mapa de campañas) y pule la selección del objetivo de la misión.
   Requiere three.min.js e inicio3d.js. Si WebGL falla, se queda el fondo 2D de siempre. */
(function () {
  const LB = { luna: 'luna', solomon: 'last', atalaya: 'ice', ganimedes: 'gany' };
  const COL = { luna: ['#90e1bd', '144,225,189'], solomon: ['#ff8a9c', '255,90,115'], atalaya: ['#d5afff', '213,175,255'], ganimedes: ['#8ed5f3', '142,213,243'] };
  const VIEW = { es: 'Ver campaña', en: 'View campaign', pt: 'Ver campanha' };
  const st = document.createElement('style');
  st.textContent = `
.land canvas.m3d{position:absolute;inset:0;width:100%;height:100%;display:block}
.land .m3dv{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(2,4,9,.88) 0%,rgba(2,4,9,.5) 34%,rgba(2,4,9,0) 58%),linear-gradient(0deg,rgba(2,4,9,.75),rgba(2,4,9,0) 18%)}
.land .m3dl{position:absolute;inset:0;z-index:3;pointer-events:none}
.m3dl .clb{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;display:grid;gap:3px;padding:8px 14px 8px 12px;border-radius:10px;border:1px solid rgba(var(--rgb),.65);background:rgba(7,11,18,.78);box-shadow:0 8px 24px -10px rgba(var(--rgb),.6);color:var(--ink);font:inherit;text-align:left;transform:translate(-999px,0);transition:border-color .2s,background .2s,box-shadow .2s}
.m3dl .clb:hover,.m3dl .clb:focus-visible{border-color:var(--c);background:rgba(12,19,30,.95);box-shadow:0 0 0 3px rgba(var(--rgb),.22),0 10px 28px -8px rgba(var(--rgb),.8);outline:none}
.m3dl .clb>span{display:flex;gap:8px;align-items:baseline;white-space:nowrap}
.m3dl .clb .n{font:800 13px ui-monospace,Consolas,monospace;color:var(--c)}
.m3dl .clb .t{font:800 17px var(--heading)}
.m3dl .clb .a{display:flex;gap:6px;align-items:center;white-space:nowrap;font:800 11px var(--heading);letter-spacing:.12em;text-transform:uppercase;color:var(--c)}
.m3dl .clb .a i{width:0;height:0;border-left:7px solid var(--c);border-top:4.5px solid transparent;border-bottom:4.5px solid transparent}
.m3dl .clb.live{border-width:1.5px}
@media (max-width:900px){.m3dl .clb .a{display:none}.m3dl .clb{padding:6px 10px}}
.ccard.pick{animation:cpick 1.4s ease-out 2;outline:2px solid var(--dc,#90e1bd);outline-offset:3px}
@keyframes cpick{0%{box-shadow:0 0 0 0 rgba(144,225,189,.6)}100%{box-shadow:0 0 0 18px rgba(144,225,189,0)}}

.objsel.v2{gap:12px;padding:14px;border-radius:14px;border:1px solid #3a475a;background:linear-gradient(180deg,rgba(255,199,121,.06),rgba(255,199,121,0) 70%),#0d131d}
.objsel.v2 .ohd{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.objsel.v2 .ohd .eyebrow{color:var(--gold)}
.objsel.v2 .opts{gap:10px}
.objsel.v2 button{position:relative;gap:8px;padding:12px 12px 12px;border-radius:12px;border:1px solid var(--edge);background:#111823;transition:border-color .15s,background .15s,transform .15s}
.objsel.v2 button:hover{border-color:var(--gold);transform:translateY(-1px)}
.objsel.v2 button[aria-pressed="true"]{border:1px solid var(--gold);background:rgba(255,199,121,.1);box-shadow:inset 0 0 0 1px var(--gold),0 10px 26px -14px rgba(255,199,121,.7);padding:12px}
.objsel.v2 .otop{display:flex;justify-content:space-between;align-items:center;gap:8px}
.objsel.v2 .pips{display:flex;gap:3px}.objsel.v2 .pips i{width:14px;height:5px;border-radius:2px;background:#2a3546}.objsel.v2 .pips i.on{background:var(--gold)}
.objsel.v2 button b{font:800 1.05rem/1.15 var(--heading)}
.objsel.v2 .route{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px}
.objsel.v2 .route span{display:grid;gap:4px;min-width:0;font:700 .6rem var(--heading);letter-spacing:.02em;text-transform:uppercase;color:#5d6b80;line-height:1.1;overflow-wrap:anywhere}
.objsel.v2 .route span::before{content:"";height:4px;border-radius:2px;background:#222c3b}
.objsel.v2 .route span.on{color:var(--ink)}.objsel.v2 .route span.on::before{background:var(--mint)}
.objsel.v2 .route span.end::before{background:linear-gradient(90deg,var(--mint) 70%,var(--gold))}
.objsel.v2 .must{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:.7rem;color:var(--muted)}
.objsel.v2 .must em{font:800 .62rem ui-monospace,Consolas,monospace;letter-spacing:.04em;padding:1px 6px;border-radius:999px;border:1px solid var(--gold);color:var(--gold)}
.objsel.v2 .must em.d{border-color:#3a475a;color:var(--muted)}
.objsel.v2 .ock{position:absolute;right:10px;top:10px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#0b111a;font:900 12px var(--heading);opacity:0;transform:scale(.6);transition:.15s}
.objsel.v2 button[aria-pressed="true"] .ock{opacity:1;transform:none}
.objsel.v2 button[aria-pressed="true"] .pips{margin-right:26px}
.objsel.v2 .otip{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-radius:10px;background:rgba(255,199,121,.08);font-size:.82rem;line-height:1.35;color:var(--gold);text-wrap:pretty}
.objsel.v2 .otip b{font:800 .68rem var(--heading);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;padding-top:2px}
`;
  document.head.append(st);

  /* ---------- Inicio 3D ---------- */
  function enhance() {
    if(window.MAPS_CALMA?.on || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const vn = stage.querySelector('.vn.land'); if (!vn || vn.__m3d || !window.MAPS3D || !window.THREE) return;
    const old = vn.querySelector('canvas.full'); const cv = document.createElement('canvas'); cv.className = 'full m3d';
    vn.prepend(cv); let m;
    const lay = h('div', 'm3dl'), L = {};
    CAMP.forEach((c, i) => {
      const id = LB[c.id]; if (!id) return; const live = c.st === 'live', parts = L3(c.n).split(' · '), cc = COL[c.id] || COL.luna;
      const b = h('button', 'clb' + (live ? ' live' : '')); b.type = 'button'; b.style.setProperty('--c', cc[0]); b.style.setProperty('--rgb', cc[1]);
      b.append(h('span', null, '<b class="n">' + String(i + 1).padStart(2, '0') + '</b><b class="t">' + esc(parts[0]) + '</b>'),
        h('span', 'a', '<i></i>' + esc((live ? tm('play') : c.id === 'icewindow' ? tm('soon') : L3(VIEW)) + ' · ' + (parts[1] || L3(c.pl)))));
      b.addEventListener('pointerenter', () => { try { SND.play('blip', .12) } catch (_) {} });
      b.addEventListener('click', () => openCamp(c.id)); lay.append(b); L[id] = b;
    });
    try {
      m = MAPS3D.mount(cv, 'mapa', { onLabels: list => list.forEach(p => { const e = L[p.id]; if (e) e.style.transform = p.on ? 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(0,-50%)' : 'translate(-999px,0)'; }) });
    } catch (e) { console.warn('Inicio 3D no disponible:', e); cv.remove(); return; }
    vn.__m3d = m; if (old) old.hidden = true;
    cv.after(h('div', 'm3dv')); vn.append(lay);
    const restore = () => {
      clearInterval(iv);
      m.stop();
      if (!cv.isConnected) return;
      const shade = cv.nextElementSibling;
      cv.remove();
      if (old) old.hidden = false;
      shade?.remove();
      lay.remove();
      vn.__m3d = null;
    };
    const iv = setInterval(() => {
      if (!cv.isConnected || window.MAPS_CALMA?.on) restore();
    }, 800);
  }
  function openCamp(id) {
    const c = CAMP.find(x => x.id === id); if (!c) return; try { SND.play('select', .3) } catch (_) {}
    showSelect();
    const card = [...stage.querySelectorAll('.ccard')].find(x => { const t = x.querySelector('h3'); return t && t.textContent === L3(c.n) });
    if (!card) return;
    if (c.st === 'live') { card.click(); return; }
    card.classList.add('pick'); const sc = card.closest('.screen'); if (sc) sc.scrollTop = Math.max(0, card.offsetTop - 40);
    card.tabIndex = -1; card.focus({ preventScroll: true });
  }
  const _st = showTitle; showTitle = function () { _st.apply(this, arguments); try { enhance() } catch (e) { console.error(e) } };
  try { enhance() } catch (e) { console.error(e) }

  /* ---------- Selección del objetivo ---------- */
  const OX = {
    lv: { mapa: 1, hielo: 2, muestra: 3 },
    route: { mapa: 2, hielo: 3, muestra: 4 },
    steps: { es: ['Lanzar', 'Órbita', 'Suelo', 'Retorno'], en: ['Launch', 'Orbit', 'Surface', 'Return'], pt: ['Lançar', 'Órbita', 'Solo', 'Retorno'] },
    must: { es: 'Obligatorios', en: 'Mandatory', pt: 'Obrigatórios' },
    tip: { es: 'Consejo', en: 'Tip', pt: 'Dica' },
    lvl: { es: ['Corta', 'Media', 'Larga'], en: ['Short', 'Medium', 'Long'], pt: ['Curta', 'Média', 'Longa'] }
  };
  objSel = function () {
    const w = h('div', 'objsel v2'); w.setAttribute('role', 'radiogroup'); w.setAttribute('aria-label', L3(OBJT.head));
    const hd = h('div', 'ohd'); hd.append(h('span', 'eyebrow', esc(L3(OBJT.head))), h('small', 'muted', esc(L3(OBJT.sub)))); w.append(hd);
    const o = h('div', 'opts'), tip = h('div', 'otip');
    const draw = () => {
      o.querySelectorAll('button').forEach(b => { const on = b.dataset.k === S.obj; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-checked', String(on)); });
      const O = OBJ[S.obj] || OBJ.hielo; tip.innerHTML = '<b>' + esc(L3(OX.tip)) + '</b><span>' + esc(L3(O.tip)) + '</span>';
      const r = stage.querySelector('.card .reqs'); if (r) r.replaceWith(reqEl(false));
    };
    Object.keys(OBJ).forEach(k => {
      const O = OBJ[k], lv = OX.lv[k] || 2, n = OX.route[k] || 3, b = h('button'); b.type = 'button'; b.dataset.k = k; b.setAttribute('role', 'radio');
      const top = h('div', 'otop'); const pp = h('span', 'pips'); pp.title = L3(OX.lvl)[lv - 1]; for (let i = 0; i < 3; i++) pp.append(h('i', i < lv ? 'on' : null));
      top.append(h('em', null, esc(L3(O.g))), pp);
      const rt = h('div', 'route'); L3(OX.steps).forEach((s, i) => rt.append(h('span', i < n ? (i === n - 1 ? 'on end' : 'on') : null, esc(s))));
      const mu = h('div', 'must'); mu.append(h('span', null, esc(L3(OX.must)) + ':')); O.m.forEach(id => mu.append(h('em', null, id))); if ((O.d || []).length) { mu.append(h('span', null, ' · ' + esc(L3(OBJT.d)) + ':')); O.d.forEach(id => mu.append(h('em', 'd', id))); }
      b.append(h('i', 'ock', '✓'), top, h('b', null, esc(L3(O.t))), h('span', null, esc(L3(O.x))), rt, mu);
      b.addEventListener('click', () => { if (S.obj === k) return; S.obj = k; try { SND.play('select', .25) } catch (_) {} draw(); });
      o.append(b);
    });
    w.append(o, tip); setTimeout(draw, 0); return w;
  };
})();
