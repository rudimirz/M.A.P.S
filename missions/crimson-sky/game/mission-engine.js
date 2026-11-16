// The Last Field — Mission Lab engine: co-op mission design, operations, legacy and endings.
// Pure and deterministic (no DOM, no network, no Math.random). Runs in the browser and under `node --test`.
// Hardware, budgets and mission numbers are FICTIONAL 2064 GAME VALUES from the co-op dev pack
// (data/illustrative_*.json, 03_MISSIONS_AND_SIMULATION_RULES.md) — not NASA specifications.
// Physics helpers are EDUCATIONAL APPROXIMATIONS. Echo Node and the pulses are FICTIONAL 2064 STORY PHYSICS.

export const RE = 6378, MU = 398600, G0 = 9.80665, C_KMS = 299792;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const period = (h) => 2 * Math.PI * Math.sqrt((RE + h) ** 3 / MU) / 60; // minutes, circular orbit
export const eclipse0 = (h) => period(h) * Math.asin(RE / (RE + h)) / Math.PI; // minutes, beta = 0 cylinder shadow
export const deltaV = (m0, mf, isp) => (m0 > mf && mf > 0 && isp > 0 ? isp * G0 * Math.log(m0 / mf) : 0);
export const mbPerDay = (kbps) => kbps * 1000 * 86400 / 8 / 1e6; // decimal MB
export const downMB = (kbps, minutes, eff = 1) => kbps * 1000 * minutes * 60 * eff / 8 / 1e6;
export function orbitPower({ arrayW, loadW, txW = 0, txMinPerOrbit = 0, periodMin, eclipseMin, batteryWh, ec = 0.95, ed = 0.95 }) {
  const sun = periodMin - eclipseMin;
  const surplus = Math.max(0, arrayW - loadW) * sun / 60 * ec;
  const drain = loadW * eclipseMin / 60 / ed + Math.max(0, loadW - arrayW) * sun / 60 / ed + txW * txMinPerOrbit / 60 / ed;
  const net = surplus - drain;
  return { surplus, drain, net, dod: drain / batteryWh, orbitsToEmpty: net < 0 ? batteryWh / -net : Infinity };
}
export const money = (m) => (Math.abs(m) >= 1000 ? '$' + (m / 1000).toFixed(2) + 'B' : '$' + (Math.abs(m) < 30 ? m.toFixed(2) : m.toFixed(0)) + 'M');
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const sgn = (x, d = 1) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d);

export const ROLES = ['Kiran', 'Mateo', 'Leila', 'Naomi'];
export const ROLE_INFO = {
  Kiran: { job: 'Science', color: '#9ae0c0', artifact: 'Science requirements', does: 'Objectives, instruments, cadence, analysis' },
  Mateo: { job: 'Engineering', color: '#ffd27a', artifact: 'Engineering configuration', does: 'Hardware, power, data, reliability' },
  Leila: { job: 'Flight & safety', color: '#9ac8ff', artifact: 'Trajectory plan', does: 'Orbit, launch, propellant, crew safety' },
  Naomi: { job: 'Director', color: '#ffb0c8', artifact: 'Program plan', does: 'Budget, ground stations, reviews, go/no-go' },
};

const sel = (m, c) => { const o = {}; for (const d of m.decisions) o[d.id] = d.options.find((x) => x.id === c[d.id]) || d.options.find((x) => x.id === d.def); return o; };
const G = (k, label, status, text) => ({ k, label, status, text });
const Mx = (k, label, value, sub, pct, status) => ({ k, label, value, sub, pct: clamp(pct), status });
const st = (bad, warn) => (bad ? 'fail' : warn ? 'check' : 'pass');
function finish(r) {
  const s = {
    science: Math.round(30 * clamp(r.sci)),
    engineering: Math.round(25 * r.margins.reduce((a, b) => a + clamp(b), 0) / r.margins.length),
    safety: Math.round(20 * clamp(r.safe)), reliability: Math.round(15 * clamp(r.rel)),
    budget: Math.round(10 * clamp((r.avail - r.cost) / (0.08 * r.avail))),
  };
  r.red = r.gates.filter((g) => g.status === 'fail').length;
  s.total = Math.max(0, s.science + s.engineering + s.safety + s.reliability + s.budget - 15 * r.red);
  r.score = s; return r;
}
const RES = (total, reserve) => ({ id: 'n_res', role: 'Naomi', label: 'Contingency reserve', help: `${money(reserve)} of ${money(total)} is protected for surprises.`, def: 'protect', options: [
  { id: 'protect', label: 'Protect the reserve', sub: 'Spend only what is left after the reserve' },
  { id: 'draw', label: 'Allow spending the reserve', sub: 'More money now; less trust, more risk later' }] });

// ---------------------------------------------------------------- Sentinel (Ch. 3–4)
const SENTINEL = {
  id: 'sentinel', name: 'Project Sentinel', chapters: 'Chapter 4', total: 18.0, reserve: 1.6, bench: ['m_arr', 'm_bat', 'm_proc', 'm_com', 'm_rec', 'm_pd'], workbench: ['m_arr', 'm_bat', 'm_proc', 'm_com', 'm_rec', 'm_pd', 'k_obj', 'k_time', 'k_cad', 'l_lv', 'l_orb'],
  question: 'Can two small satellites near Earth confirm the repeating intensifications and time-tag them?',
  brief: ['Geneva funds a first, fast mission: two ~45 kg satellites in near-polar orbit, launching on day 59.',
    'The concept review left you a baseline design. It does not fly yet — look at the red gates and fix them together.'],
  decisions: [
    { id: 'k_obj', role: 'Kiran', label: 'Science objectives', help: 'Each objective needs its instrument on both satellites.', def: 'all', options: [
      { id: 'all', label: 'S1 + S2 + S3', sub: 'Magnetic timing, energetic particles, ionospheric plasma', inst: ['mag', 'pd', 'iono'] },
      { id: 's12', label: 'S1 + S2', sub: 'Drop the plasma probe (−2 kg, −4 W, −4 kbps each)', inst: ['mag', 'pd'] },
      { id: 's1', label: 'S1 only', sub: 'Magnetometer only', inst: ['mag'] }] },
    { id: 'k_cad', role: 'Kiran', label: 'Observation cadence', help: 'How much of the time the instruments run at full rate.', def: 'full', options: [
      { id: 'full', label: 'Continuous high rate', sub: 'Everything at full rate', p: 1, d: 1, s: 1 },
      { id: 'event', label: 'Event buffering', sub: '1 kbps background + 30 % high-rate bursts', p: 0.8, d: 0.3, bg: 1, s: 0.92 },
      { id: 'low', label: 'Low duty cycle', sub: 'Instruments on 25 % of the time', p: 0.6, d: 0.25, s: 0.6 }] },
    { id: 'k_time', role: 'Kiran', label: 'Timestamp accuracy', help: 'Comparing two satellites needs a shared clock.', def: '1s', options: [
      { id: '1s', label: 'Onboard clock · ~1 s', sub: 'No extra hardware', kg: 0, W: 0, c: 0, t: 0.6 },
      { id: 'gps', label: 'GPS-disciplined · ~1 ms', sub: '+0.2 kg, +1 W, +$0.05M each', kg: 0.2, W: 1, c: 0.05, t: 1 }] },
    { id: 'm_arr', role: 'Mateo', label: 'Solar array', help: 'Power while in sunlight. Nothing in Earth’s shadow.', def: 'sa45', options: [
      { id: 'sa45', label: 'Body-mounted · 45 W', sub: '4 kg · $0.30M each', kg: 4, W: 45, c: 0.30 },
      { id: 'sa70', label: 'Deployable · 70 W', sub: '5 kg · $0.45M each', kg: 5, W: 70, c: 0.45 },
      { id: 'sa90', label: 'Large deployable · 90 W', sub: '7 kg · $0.60M each · +1 W attitude load', kg: 7, W: 90, c: 0.60, dW: 1 }] },
    { id: 'm_bat', role: 'Mateo', label: 'Battery', help: 'Carries the satellite through each eclipse.', def: 'b80', options: [
      { id: 'b80', label: '80 Wh usable', sub: '6 kg · $0.20M each', kg: 6, Wh: 80, c: 0.20 },
      { id: 'b150', label: '150 Wh usable', sub: '8 kg · $0.32M each', kg: 8, Wh: 150, c: 0.32 }] },
    { id: 'm_proc', role: 'Mateo', label: 'Flight computer', help: 'Runs everything. A single fault can end a mission.', def: 'aegis', options: [
      { id: 'aegis', label: 'Aegis AX-7 · single string', sub: '2 kg · 8 W · $0.25M each', kg: 2, W: 8, c: 0.25 },
      { id: 'red', label: 'Redundant + watchdog', sub: '2.5 kg · 10 W · $0.40M each', kg: 2.5, W: 10, c: 0.40 }] },
    { id: 'm_com', role: 'Mateo', label: 'Radio', help: 'Sends data down during ground-station passes.', def: 's512', options: [
      { id: 's512', label: 'S-band · 512 kbps', sub: '4 kg · 4 W idle, 14 W transmitting · $0.25M', kg: 4, idle: 4, tx: 14, kbps: 512, c: 0.25 },
      { id: 'x2m', label: 'X-band · 2 Mbps', sub: '5 kg · 4 W idle, 22 W transmitting · $0.45M', kg: 5, idle: 4, tx: 22, kbps: 2000, c: 0.45 }] },
    { id: 'm_rec', role: 'Mateo', label: 'Data recorder', help: 'Holds data between passes.', def: 'r256', options: [
      { id: 'r256', label: '256 MB', sub: 'Included', kg: 0, MB: 256, c: 0 },
      { id: 'r1g', label: '1 GB', sub: '+0.5 kg · +$0.05M each', kg: 0.5, MB: 1000, c: 0.05 }] },
    { id: 'm_pd', role: 'Mateo', label: 'Particle detector', help: 'Only installed if Kiran keeps objective S2.', def: 'pd', options: [
      { id: 'pd', label: 'Standard', sub: '3 kg · 5 W · 2 kbps · $0.40M', kg: 3, W: 5, k: 2, c: 0.40, q: 1 },
      { id: 'pdx', label: 'High resolution', sub: '5 kg · 9 W · 9 kbps · $0.55M', kg: 5, W: 9, k: 9, c: 0.55, q: 1.15 }] },
    { id: 'l_orb', role: 'Leila', label: 'Orbit', help: 'Sets eclipse length, latitude coverage and ground-station passes.', def: 'p82', options: [
      { id: 'p82', label: '580 km · 82° near-polar', sub: 'Covers the auroral zones', h: 580, inc: 82, cov: 1, passes: { uni: 1, coop: 3, aegis: 6 } },
      { id: 'sso', label: 'Dawn–dusk sun-synchronous · 580 km', sub: 'Short eclipses; fixed local time · +$0.4M launch', h: 580, inc: 97.7, cov: 0.8, ef: 0.25, lc: 0.4, passes: { uni: 1, coop: 3, aegis: 6 } },
      { id: 'm55', label: '700 km · 55°', sub: 'Misses the polar regions', h: 700, inc: 55, cov: 0.5, passes: { uni: 2, coop: 3, aegis: 4 } },
      { id: 'e0', label: '550 km · equatorial', sub: 'Easy launch, wrong latitudes', h: 550, inc: 0, cov: 0.05, passes: { uni: 0, coop: 1, aegis: 0 } }] },
    { id: 'l_plane', role: 'Leila', label: 'Constellation', help: 'Where the two satellites fly relative to each other.', def: 'same', options: [
      { id: 'same', label: 'One plane, 180° apart', sub: 'One rideshare', c: 0, s: 1 },
      { id: 'split', label: 'Two planes', sub: 'Second rideshare +$0.8M; separates space from time better', c: 0.8, s: 1.15 }] },
    { id: 'l_lv', role: 'Leila', label: 'Launch', help: 'Each slot has a mass limit per satellite (3 kg margin is protected).', def: 'rs45', options: [
      { id: 'rs45', label: 'Rideshare slots ≤ 45 kg', sub: '$3.0M for both', lim: 45, c: 3.0 },
      { id: 'rs60', label: 'Larger slots ≤ 60 kg', sub: '$4.2M for both', lim: 60, c: 4.2 }] },
    { id: 'n_gs', role: 'Naomi', label: 'Ground stations', help: 'Data only comes down during passes over a station.', def: 'coop', options: [
      { id: 'uni', label: 'University station · São Paulo', sub: '8-min passes · $0.8M', min: 8, c: 0.8 },
      { id: 'coop', label: 'Cooperative network', sub: '10-min passes, incl. one high-latitude site · $1.8M', min: 10, c: 1.8 },
      { id: 'aegis', label: 'Aegis polar network', sub: '10-min passes, many sites · $2.6M · Aegis gains leverage', min: 10, c: 2.6 }] },
    { id: 'n_test', role: 'Naomi', label: 'Qualification tests', help: 'Tests cost money; skipping them costs reliability.', def: 'full', options: [
      { id: 'minimal', label: 'Minimal', sub: 'Vibration only · $0.5M', c: 0.5 },
      { id: 'basic', label: 'Basic', sub: '+ thermal vacuum · $1.0M', c: 1.0 },
      { id: 'full', label: 'Full', sub: '+ fault injection, radiation · $1.5M', c: 1.5 }] },
    RES(18.0, 1.6),
  ],
  evaluate(c, L, mods = {}) {
    const o = sel(this, c), inst = o.k_obj.inst, cad = o.k_cad;
    const I = { mag: { kg: 3, W: 3, k: 1, c: 0.40 }, pd: o.m_pd, iono: { kg: 2, W: 4, k: 4, c: 0.40 } };
    let iKg = 0, iW = 0, iK = 0, iC = 0; for (const k of inst) { iKg += I[k].kg; iW += I[k].W; iK += I[k].k; iC += I[k].c; }
    const kg = 18 + o.m_arr.kg + o.m_bat.kg + o.m_proc.kg + o.m_com.kg + o.m_rec.kg + o.k_time.kg + iKg, alloc = kg + 3, lim = o.l_lv.lim;
    const orb = o.l_orb, T = period(orb.h), E = eclipse0(orb.h) * (orb.ef ?? 1), perDay = 1440 / T;
    const passes = orb.passes[o.n_gs.id] + (mods.passes || 0), passMin = passes * o.n_gs.min;
    const load = 9 + o.m_proc.W + o.m_com.idle + o.k_time.W + iW * cad.p + (o.m_arr.dW || 0);
    const pw = orbitPower({ arrayW: o.m_arr.W, loadW: load, txW: o.m_com.tx, txMinPerOrbit: passMin / perDay, periodMin: T, eclipseMin: E, batteryWh: o.m_bat.Wh });
    const rate = iK * cad.d + (cad.bg || 0), gen = mbPerDay(rate), down = passes * downMB(o.m_com.kbps, o.n_gs.min, 0.8), backlog = gen - down;
    const fill = backlog > 0 ? o.m_rec.MB / backlog : Infinity;
    const perSat = 0.80 + o.m_arr.c + o.m_bat.c + o.m_proc.c + o.m_com.c + o.m_rec.c + o.k_time.c + iC;
    const cost = 4.1 + 2 * perSat + o.l_lv.c + (orb.lc || 0) + o.l_plane.c + o.n_gs.c + o.n_test.c + (mods.cost || 0);
    const avail = 18.0 - (o.n_res.id === 'protect' ? 1.6 : 0);
    const ret = passes === 0 ? 0 : backlog <= 0 ? 1 : fill >= 60 ? 0.95 : fill >= 7 ? 0.8 : down / gen;
    const objW = { mag: 0.4 * o.k_time.t, pd: 0.3 * o.m_pd.q, iono: 0.3 };
    const sci = inst.reduce((s, k) => s + objW[k], 0) * orb.cov * cad.s * o.l_plane.s * ret * (mods.sci ?? 1) * (pw.net < 0 ? 0.6 : 1);
    const days = (pw.orbitsToEmpty * T / 60).toFixed(0);
    const gates = [
      G('mass', 'Mass', st(alloc > lim + 1e-9, alloc > lim - 1), alloc > lim + 1e-9 ? `Each satellite is ${f1(alloc - lim)} kg over the ${lim} kg slot (incl. the protected 3 kg margin).` : `${f1(lim - alloc)} kg spare per satellite.`),
      G('power', 'Power', st(pw.net < 0, pw.dod > 0.4), pw.net < 0 ? `The battery loses ${f1(-pw.net)} Wh every orbit — empty after ~${pw.orbitsToEmpty.toFixed(0)} orbits (${days} h).` : pw.dod > 0.4 ? `Positive, but each eclipse drains ${Math.round(pw.dod * 100)} % of the battery (aim ≤ 40 %).` : `Recharges ${f1(pw.net)} Wh more than it uses each orbit.`),
      G('data', 'Data', st(passes === 0 || fill < 7, backlog > 0), passes === 0 ? 'This orbit never passes over the chosen stations: no data can come down.' : fill < 7 ? `Backlog grows ${f1(backlog)} MB/day; the recorder fills in ${fill.toFixed(1)} days.` : backlog > 0 ? `Backlog ${f1(backlog)} MB/day; recorder full in ${fill.toFixed(0)} days.` : 'Every day’s data comes down the same day.'),
      G('budget', 'Budget', st(cost > avail + 1e-9, avail - cost < 0.3), cost > avail + 1e-9 ? `${money(cost - avail)} over what you can spend.` : `${money(avail - cost)} left${o.n_res.id === 'protect' ? ' + $1.60M protected reserve' : ''}.`),
      G('qual', 'Qualification', st(false, o.n_test.id === 'minimal' || o.m_proc.id === 'aegis'), o.n_test.id === 'minimal' ? 'Minimal tests: faults may only show up in orbit.' : o.m_proc.id === 'aegis' ? 'Single-string flight computer from one supplier.' : 'Tested and redundant.'),
      G('cov', 'Coverage', st(false, orb.cov < 0.6), orb.cov < 0.6 ? 'This orbit misses the high latitudes where the intensifications are strongest.' : 'Covers the auroral zones.'),
    ];
    const metrics = [
      Mx('mass', 'Mass / satellite', `${f1(alloc)} / ${lim} kg`, `${f1(kg)} kg hardware + 3 kg margin`, alloc / lim, gates[0].status),
      Mx('power', 'Energy per orbit', `${sgn(pw.net)} Wh`, `Load ${f1(load)} W · array ${o.m_arr.W} W · eclipse ${E.toFixed(0)} of ${T.toFixed(1)} min`, 0.5 + pw.net / 40, gates[1].status),
      Mx('data', 'Data per day', `${f1(gen)} MB → ${f1(down)} MB down`, `${passes} passes/day × ${o.n_gs.min} min at ${o.m_com.kbps} kbps, 80 % goodput`, gen ? down / gen : 1, gates[2].status),
      Mx('budget', 'Budget', `${money(cost)} / ${money(avail)}`, `Total $18.00M, reserve $1.60M`, cost / avail, gates[3].status),
      Mx('sci', 'Expected science', `${Math.round(clamp(sci) * 100)} %`, `Coverage ${Math.round(orb.cov * 100)} % · data returned ${Math.round(ret * 100)} %`, sci, sci > 0.6 ? 'pass' : 'check'),
    ];
    return finish({ o, gates, metrics, sci, cost, avail, pw, gen, down, backlog, fill, passes, T, E,
      num: { mass: [alloc, 'kg'], power: [pw.net, 'Wh/orbit'], data: [down - gen, 'MB/day margin'], cost: [cost, '$'], sci: [sci * 100, '% science'] },
      rel: (o.m_proc.id === 'red' ? 0.4 : 0.15) + ({ full: 0.4, basic: 0.25, minimal: 0.05 })[o.n_test.id] + (pw.dod <= 0.3 ? 0.2 : pw.dod <= 0.4 ? 0.12 : 0.05),
      safe: (o.n_res.id === 'protect' ? 0.5 : 0.2) + (pw.net >= 0 && pw.dod <= 0.4 ? 0.3 : 0.1) + (o.n_test.id !== 'minimal' ? 0.2 : 0),
      margins: [clamp((lim - alloc) / 3 + 0.5), clamp(pw.net / 20), clamp(backlog <= 0 ? 1 : fill / 60), clamp((avail - cost) / 1)] });
  },
  events: [
    { id: 'proc', chapter: 'Ch. 4 · three weeks before launch', title: 'The processor', owner: 'Mateo',
      talk: (S) => S.choices.m_proc === 'aegis'
        ? [['Mateo', 'Aegis just pulled the AX-7. Supply problems, they say. Three weeks before launch.', 'frustrated'], ['Kiran', 'Then we fly something we can test.', 'determined']]
        : [['Mateo', 'Aegis pulled the AX-7 from three other missions this morning.', 'thinking'], ['Kiran', 'Good thing we don’t depend on it.', 'sarcastic']],
      game: { kind: 'faults', title: 'Fault-injection lab', doing: 'rebuilding and testing the flight computer',
        hint: 'The AX-7 is gone. Fit a replacement architecture on the avionics board — boards, backup, watchdog, memory and power protection — then inject the faults Sentinel will meet in orbit. Re-run as often as you like; sign off only what recovers.',
        params: (S) => { const r = evaluate(S); const T = r.T || 96, avgW = (r.pw ? r.pw.net : 0) / (T / 60); return { kgA: Math.round((r.o.l_lv.lim - r.num.mass[0] + (r.o.m_proc.kg || 2)) * 10) / 10, wA: Math.round((r.o.m_proc.W + clamp(avgW * 0.5, 0, 6)) * 10) / 10 }; },
        result: (S, g) => g === 'good' ? { d: { risk: -6 }, text: 'Every injected fault recovers on the first runs. The test log goes into the launch review.' }
          : g === 'ok' ? { d: { risk: -2 }, text: 'The architecture recovers from every fault, with some cycles lost along the way.' }
          : { d: { risk: 6 }, text: 'Signed off with failing tests. Leila writes it into the flight rules.' } },
      text: (S) => S.choices.m_proc === 'aegis' ? 'The single-string processor you chose will not arrive. The redundant board fits, but it draws 2 W more per satellite and must be qualified before flight.' : 'Your redundant board is already qualified. Aegis offers its AX-7 boards to you as cheap spares.',
      options: (S) => S.choices.m_proc === 'aegis' ? [
        { id: 'swap_test', label: 'Swap to the redundant board and run fault-injection tests', ai: true, effect: (S) => ({ set: { m_proc: 'red' }, d: { cost: 0.3 + (S.choices.n_test === 'full' ? 0 : 0.2) }, text: 'The new boards pass upset-reset, memory and failover tests. Launch stays on day 59.' }) },
        { id: 'swap_fast', label: 'Swap and skip the tests to keep the date', effect: () => ({ set: { m_proc: 'red' }, d: { cost: 0.5, trust: -6, bond: -4 }, text: 'Leila refuses to fly untested flight hardware. The tests run overnight anyway — the shortcut cost trust.' }) }]
        : [
        { id: 'decline', label: 'Keep the qualified board', ai: true, effect: () => ({ text: 'Nothing changes. Your board is already qualified.' }) },
        { id: 'spares', label: 'Buy discounted AX-7 spares from Aegis', effect: () => ({ d: { cost: -0.05, aegis: 8 }, text: 'Aegis sells the spares cheaply — and now knows your schedule.' }) }] },
    { id: 'ascent', chapter: 'Ch. 4 · day 59', title: 'Ascent', owner: 'Leila', talk: () => [],
      text: (S, r) => `Rideshare to ${r.o.l_orb.label}. Each Sentinel weighs ${f1(r.num.mass[0])} kg in its slot.`,
      game: { kind: 'ascent', title: 'Fly the ascent', doing: 'flying the ascent',
        hint: 'Guidance flies the pitch program; wind shear pushes it off. Trim with ▲/▼ (or W/S) to stay inside the corridor, throttle down through max-Q (T), separate the stages on cue (Space), then trim the orbit with the upper stage before releasing both Sentinels.',
        params: (S) => { const r = evaluate(S); return { h: r.o.l_orb.h, inc: r.o.l_orb.inc, kg: r.num.mass[0], orbit: r.o.l_orb.label }; },
        result: (S, g, v) => g === 'good' ? { d: { sci: 1.03 }, text: `Both Sentinels released ${Math.round(v)} m/s from the target orbit, with propellant to spare.` }
          : g === 'ok' ? { text: `Released ${Math.round(v)} m/s off target — inside the rideshare tolerance.` }
          : { d: { sci: 0.94, risk: 3 }, text: `Released ${Math.round(v)} m/s off target. The orbit is slightly elliptical: coverage and pass times drift from the plan.` } },
      options: () => [{ id: 'release', label: 'Release both Sentinels', ai: true, effect: () => ({ text: 'Both Sentinels separate from the upper stage.' }) }] },
    { id: 'launch', chapter: 'Ch. 4 · day 59', title: 'Launch and commissioning', owner: 'Kiran',
      talk: () => [['Leila', 'Both spacecraft separated. Booms deploying.', 'commanding'], ['Naomi', 'Then let’s see if they were worth it.', 'serious']],
      text: (S, r) => r.pw.net < 0 ? `Sentinel B drops into safe mode in its first eclipse: the battery loses ${f1(-r.pw.net)} Wh per orbit. Science runs only part-time.` : 'Both satellites are healthy. The magnetometer booms are out. Before science starts, the instruments need calibrating.',
      options: () => [
        { id: 'full_cal', label: 'Full calibration (two weeks, incl. spacecraft magnetic contamination)', ai: true, effect: () => ({ d: { sci: 1.08 }, text: 'Clean baselines. Every field reading has a known offset.' }) },
        { id: 'quick_cal', label: 'Quick calibration (start science in two days)', effect: () => ({ d: { sci: 0.9 }, text: 'Science starts early, but some field readings are flagged: the spacecraft’s own magnetism was never measured.' }) }],
      timed: { role: 'Leila', title: 'Phase the satellites', seconds: 60, reward: 'Better timing between the two satellites (science +4 %)', q: 'Two satellites share a 580 km orbit, 180° apart. How far behind is satellite B?',
        choices: ['About 48 minutes', 'About 96 minutes', 'About 12 hours'], answer: 0, win: { sci: 1.04 }, winText: 'Half of a 96-minute orbit: 48 minutes. Phasing confirmed.' } },
    { id: 'campaign', chapter: 'Ch. 4 · the next recurrence', title: 'The pattern returns', owner: 'Naomi',
      talk: () => [['Kiran', 'Forty-eight minutes apart. Again.', 'excited'], ['Naomi', 'Will we get the data down in time?', 'thinking']],
      game: { kind: 'downlink', title: 'Bring the event home', doing: 'scheduling the ground passes',
        hint: 'Six hours of operations in one minute. The recurrence will fill the recorder. Book passes on the timeline, settle contested antennas, decide whether to pay Aegis, and get the event packets to Kiran before they are overwritten.',
        params: (S) => { const o = evaluate(S).o; return { h: o.l_orb.h, inc: o.l_orb.inc, net: o.n_gs.id, kbps: o.m_com.kbps, recMB: o.m_rec.MB, buffering: o.k_cad.id === 'event' }; },
        // v packs both results: event fraction in % (v mod 1000) and extra spend in $10k units (v div 1000).
        result: (S, g, v) => { const frac = (v % 1000) / 100, spent = Math.floor(v / 1000) / 100, d = { sci: g === 'good' ? 1.04 : g === 'ok' ? 1 : 0.88 }; if (spent > 0) d.cost = spent;
          return { d, flags: { rxSentinel: frac }, text: `${Math.round(frac * 100)} % of the event packets verified on the ground${spent > 0 ? ` · ${money(spent)} on priority contacts` : ''}.` }; } },
      text: (S, r) => r.backlog > 0 ? `The recorder is filling ${f1(r.backlog)} MB/day faster than the stations empty it (full in ${r.fill === Infinity ? '—' : r.fill.toFixed(0)} days). The event records may be overwritten.` : 'Downlink keeps up with the data. The event records will come down the same day.',
      options: (S, r) => [
        { id: 'book', label: 'Book extra passes for the event (+$0.10M)', ai: r.backlog > 0, effect: () => ({ d: { cost: 0.1 }, mods: { passes: 1 }, text: r.backlog > 0 ? 'Extra passes empty the recorder during the event. Nothing is lost.' : 'The extra passes weren’t needed.' }) },
        { id: 'none', label: 'Rely on the normal schedule', ai: r.backlog <= 0, effect: () => (r.backlog > 0 && r.fill < 30 ? { d: { sci: 0.75 }, text: 'Part of the event is overwritten before it reaches the ground.' } : { text: 'The normal schedule is enough.' }) }],
      timed: { role: 'Kiran', title: 'Set the burst window', seconds: 90, reward: 'Capture the third peak at full rate (science +5 %)', q: 'Peaks repeat every ~48 minutes. The first was at 02:17. When should the burst buffer catch the third?',
        choices: ['03:53', '02:65', '04:41'], answer: 0, win: { sci: 1.05 }, winText: '02:17 + 2 × 48 min = 03:53. Third peak captured at full rate.' } },
    { id: 'findings', chapter: 'Ch. 4 · Geneva', title: 'What Sentinel found', owner: 'Kiran',
      talk: () => [['Kiran', 'It repeats. But from down here we can’t see where it starts.', 'thinking'], ['Naomi', 'Then say exactly that.', 'serious']],
      game: { kind: 'peaks', title: 'Read the Sentinel data', doing: 'analysing the Sentinel data',
        hint: 'Only what reached the ground is here. Align Sentinel B’s clock with A (drag the lower trace), mark the three intensifications, flag anything the spacecraft made itself, then put each piece of evidence on the hypothesis it decides.',
        params: (S) => ({ rx: S.legacy.flags.rxSentinel ?? 1, magBody: !!(S.act && S.act.craft && S.act.craft.magBody), gps: S.choices.k_time === 'gps' }),
        result: (S, g) => g === 'good' ? { d: { evidence: 4 }, text: 'Three intensifications about 48 minutes apart on both satellites, with the spacecraft’s own noise set aside. The model cannot reproduce the spacing.' }
          : g === 'ok' ? { d: { evidence: 2 }, text: 'The recurrence is there, but parts of the case are thin.' }
          : { d: { trust: -2 }, text: 'The analysis mixes spacecraft noise with sky. Reviewers will ask hard questions.' } },
      text: () => 'Two satellites and the ground stations agree: the intensifications recur. Measurements near Earth cannot show what drives them. How do you report it?',
      options: () => [
        { id: 'careful', label: 'Report what was measured, with uncertainties', ai: true, effect: () => ({ d: { trust: 4 }, text: 'Reviewers trust the result. The next step is upstream: Helios.' }) },
        { id: 'bold', label: 'Announce that you have found the cause', effect: () => ({ d: { trust: -8, risk: 4 }, text: 'Reviewers point out that near-Earth data cannot show a cause. The claim costs credibility.' }) }] },
  ],
  outcome(r) {
    const o = r.o;
    return { evidence: Math.round(r.score.science * 0.8), trust: o.n_res.id === 'protect' && r.cost <= r.avail ? 4 : -6,
      risk: o.n_test.id === 'minimal' ? 10 : o.n_test.id === 'basic' ? 3 : 0, aegis: o.n_gs.id === 'aegis' ? 10 : 0 };
  },
};

// ---------------------------------------------------------------- Helios (Ch. 5–6)
const HI = { mag: { kg: 13, W: 9, k: 2, c: 3 }, plasma: { kg: 29, W: 22, k: 12, c: 7 }, part: { kg: 25, W: 16, k: 8, c: 6 }, img: { kg: 60, W: 45, k: 40, c: 12 } };
const HELIOS = {
  id: 'helios', name: 'Project Helios', chapters: 'Chapters 5–6', total: 110, reserve: 6, bench: ['h_prop', 'h_ant', 'h_arr', 'h_rec'], workbench: ['h_prop', 'h_ant', 'h_arr', 'h_rec', 'h_obs', 'h_pkg', 'h_lv', 'h_orb', 'h_years'],
  question: 'Is the pattern just an unmeasured change in the incoming solar wind?',
  brief: ['A spacecraft at the Sun–Earth L1 region, ~1.5 million km sunward, sees the solar wind about an hour before it reaches Earth.',
    'Nothing can park exactly at L1. Helios must orbit around it and spend propellant to stay there.'],
  decisions: [
    { id: 'h_obs', role: 'Kiran', label: 'Payload', help: 'Flow speed (plasma) is needed to work out the travel time to Earth.', def: 'core', options: [
      { id: 'core', label: 'Magnetometer + plasma + particles', sub: '67 kg · 47 W · 22 kbps · $16M', inst: ['mag', 'plasma', 'part'] },
      { id: 'img', label: 'Core + compact solar telescope', sub: '+60 kg · +45 W · +40 kbps · +$12M', inst: ['mag', 'plasma', 'part', 'img'] },
      { id: 'noplasma', label: 'Magnetometer + particles', sub: 'Drop the plasma analyzer (−29 kg, −$7M)', inst: ['mag', 'part'] }] },
    { id: 'h_cad', role: 'Kiran', label: 'Data mode', help: '', def: 'high', options: [
      { id: 'high', label: 'High rate', sub: 'Full resolution all the time', d: 1, s: 1 },
      { id: 'adaptive', label: 'Adaptive', sub: 'Routine rate + bursts on shocks', d: 0.4, s: 0.95 },
      { id: 'routine', label: 'Routine', sub: '30 % of the rate', d: 0.3, s: 0.78 }] },
    { id: 'h_prop', role: 'Mateo', label: 'Propulsion', help: 'Higher Isp gives more Δv from the same propellant.', def: 'mono', options: [
      { id: 'mono', label: 'Monopropellant · Isp 220 s', sub: '20 kg dry · $8M', kg: 20, isp: 220, c: 8 },
      { id: 'bi', label: 'Bipropellant · Isp 300 s', sub: '35 kg dry · $12M', kg: 35, isp: 300, c: 12 }] },
    { id: 'h_ant', role: 'Mateo', label: 'High-gain antenna', help: '', def: 'hga1', options: [
      { id: 'hga1', label: '1.0 m dish · 64 kbps', sub: '8 kg · 30 W transmitting · $4M', kg: 8, tx: 30, kbps: 64, c: 4 },
      { id: 'hga2', label: '1.5 m dish · 256 kbps', sub: '14 kg · 45 W transmitting · $6M', kg: 14, tx: 45, kbps: 256, c: 6 }] },
    { id: 'h_arr', role: 'Mateo', label: 'Solar array', help: 'Always in sunlight at L1, but it degrades ~2.5 %/year.', def: 'a600', options: [
      { id: 'a450', label: '450 W', sub: '−8 kg · −$2M', dkg: -8, W: 450, c: -2 },
      { id: 'a600', label: '600 W', sub: 'Baseline', dkg: 0, W: 600, c: 0 },
      { id: 'a900', label: '900 W', sub: '+12 kg · +$3M', dkg: 12, W: 900, c: 3 }] },
    { id: 'h_rec', role: 'Mateo', label: 'Recorder', help: '', def: 'r4', options: [
      { id: 'r4', label: '4 GB', sub: 'Included', kg: 0, MB: 4000, c: 0 },
      { id: 'r16', label: '16 GB', sub: '+1 kg · +$0.5M', kg: 1, MB: 16000, c: 0.5 }] },
    { id: 'h_orb', role: 'Leila', label: 'Operational orbit', help: 'Insertion and yearly stationkeeping Δv (game values).', def: 'halo', options: [
      { id: 'halo', label: 'Large halo orbit', sub: 'Insertion 250 m/s · 6 m/s per year', ins: 250, sk: 6, s: 1 },
      { id: 'liss', label: 'Small Lissajous orbit', sub: 'Insertion 350 m/s · 8 m/s per year · closer to the Sun–Earth line', ins: 350, sk: 8, s: 1.08 },
      { id: 'point', label: 'Park exactly at L1', sub: 'No orbit, no stationkeeping', bad: true, s: 0 }] },
    { id: 'h_pkg', role: 'Leila', label: 'Propellant load', help: 'Δv = Isp · g₀ · ln(wet / dry).', def: 'p100', options: [
      { id: 'p60', label: '60 kg', sub: '', kg: 60 }, { id: 'p100', label: '100 kg', sub: '', kg: 100 }, { id: 'p140', label: '140 kg', sub: '', kg: 140 }] },
    { id: 'h_years', role: 'Leila', label: 'Mission length', help: '', def: 'y2', options: [
      { id: 'y2', label: '2 years', sub: '', y: 2 }, { id: 'y5', label: '5 years', sub: 'More events observed · +$4M operations', y: 5 }] },
    { id: 'h_lv', role: 'Leila', label: 'Launch vehicle', help: 'Mass it can send towards L1.', def: 'ml', options: [
      { id: 'ml', label: 'Medium · 500 kg to L1', sub: '$15M', lim: 500, c: 15 },
      { id: 'ml2', label: 'Medium-plus · 700 kg to L1', sub: '$22M', lim: 700, c: 22 }] },
    { id: 'h_gs', role: 'Naomi', label: 'Deep-space antennas', help: 'Contact hours per day with a large dish.', def: 'coop', options: [
      { id: 'aegis', label: 'Aegis deep-space network', sub: '20 h/day · $14M · Aegis gains leverage', h: 20, c: 14 },
      { id: 'mixed', label: 'Mixed agencies + Aegis', sub: '14 h/day · $10M', h: 14, c: 10 },
      { id: 'coop', label: 'University & agency cooperation', sub: '8 h/day · $7M', h: 8, c: 7 }] },
    { id: 'h_rev', role: 'Naomi', label: 'Independent science review', help: '', def: 'none', options: [
      { id: 'none', label: 'No external review', sub: '', c: 0 }, { id: 'indep', label: 'Independent review panel', sub: '+$1M · reviewers trust the result', c: 1 }] },
    RES(110, 6),
  ],
  evaluate(c, L, mods = {}) {
    const o = sel(this, c), inst = o.h_obs.inst;
    let iKg = 0, iW = 0, iK = 0, iC = 0; for (const k of inst) { iKg += HI[k].kg; iW += HI[k].W; iK += HI[k].k; iC += HI[k].c; }
    const dry = 255 + iKg + o.h_prop.kg + o.h_ant.kg + o.h_arr.dkg + o.h_rec.kg, wet = dry + o.h_pkg.kg, lim = o.h_lv.lim, y = o.h_years.y;
    const orb = o.h_orb, req = orb.bad ? 0 : 50 + orb.ins + orb.sk * y + 10 + (mods.dvUsed || 0), dv = deltaV(wet, dry, o.h_prop.isp);
    const load = 250 + iW + o.h_ant.tx, eol = o.h_arr.W * (1 - 0.025 * y);
    const gen = mbPerDay(iK * o.h_cad.d), hours = o.h_gs.h + (mods.hours || 0), down = o.h_ant.kbps * 1000 * hours * 3600 * 0.85 / 8 / 1e6;
    const backlog = gen - down, fill = backlog > 0 ? o.h_rec.MB / backlog : Infinity;
    const cost = 54 + iC + o.h_prop.c + o.h_ant.c + o.h_arr.c + o.h_rec.c + o.h_lv.c + o.h_gs.c + (y === 5 ? 4 : 0) + o.h_rev.c + (mods.cost || 0);
    const avail = 110 - (o.n_res.id === 'protect' ? 6 : 0), lagOk = inst.includes('plasma');
    const ret = backlog <= 0 ? 1 : fill >= 60 ? 0.95 : fill >= 14 ? 0.85 : down / gen;
    let sci = (inst.includes('mag') ? 0.35 : 0) + (lagOk ? 0.4 : 0) + (inst.includes('part') ? 0.25 : 0);
    if (!lagOk) sci *= 0.6;
    sci *= (inst.includes('img') ? 1.08 : 1) * orb.s * (y === 5 ? 1.08 : 1) * o.h_cad.s * ret * (o.h_cad.id === 'adaptive' && o.h_rec.id === 'r4' ? 0.92 : 1) * (mods.sci ?? 1);
    const dvOk = !orb.bad && dv >= req;
    const gates = [
      G('orbit', 'Orbit', st(orb.bad, false), orb.bad ? 'L1 is an unstable balance point — nothing can park exactly there. Choose a halo or Lissajous orbit.' : `${orb.id === 'halo' ? 'Halo' : 'Lissajous'} orbit around L1; radio light time ≈ ${(1.5e6 / C_KMS).toFixed(1)} s each way.`),
      G('mass', 'Launch mass', st(wet > lim, wet > lim - 15), wet > lim ? `${Math.round(wet - lim)} kg over what the launcher can send to L1.` : `${Math.round(lim - wet)} kg launch margin.`),
      G('dv', 'Δv', st(!dvOk, dv < req * 1.1), orb.bad ? 'No valid orbit to budget.' : `${Math.round(dv)} m/s available vs ${Math.round(req)} m/s needed (transfer corrections, insertion, ${y} yr stationkeeping, disposal).`),
      G('power', 'Power (end of life)', st(eol < load, eol < load * 1.1), `${Math.round(eol)} W after ${y} years vs ${Math.round(load)} W load.`),
      G('data', 'Data', st(fill < 14, backlog > 0), backlog > 0 ? `Backlog ${f1(backlog)} MB/day; recorder full in ${fill.toFixed(0)} days.` : 'The antennas keep up with the data.'),
      G('budget', 'Budget', st(cost > avail + 1e-9, avail - cost < 2), cost > avail + 1e-9 ? `${money(cost - avail)} over what you can spend.` : `${money(avail - cost)} left.`),
      G('lag', 'Travel-time alignment', st(false, !lagOk), lagOk ? 'Flow speed is measured, so the travel time to Earth can be computed.' : 'No flow-speed measurement: the solar wind’s travel time to Earth can only be guessed.'),
    ];
    const metrics = [
      Mx('mass', 'Launch mass', `${Math.round(wet)} / ${lim} kg`, `${Math.round(dry)} kg dry + ${o.h_pkg.kg} kg propellant`, wet / lim, gates[1].status),
      Mx('dv', 'Δv', `${Math.round(dv)} / ${Math.round(req)} m/s`, `Isp ${o.h_prop.isp} s · ln(${Math.round(wet)}/${Math.round(dry)})`, req ? dv / req / 1.5 : 0, gates[2].status),
      Mx('power', 'Power at end of life', `${Math.round(eol)} / ${Math.round(load)} W`, `Array degrades 2.5 %/yr`, load / eol, gates[3].status),
      Mx('data', 'Data per day', `${f1(gen)} MB → ${f1(down)} MB down`, `${hours} h/day at ${o.h_ant.kbps} kbps, 85 % goodput`, gen ? down / gen : 1, gates[4].status),
      Mx('budget', 'Budget', `${money(cost)} / ${money(avail)}`, 'Total $110M, reserve $6M', cost / avail, gates[5].status),
      Mx('sci', 'Expected science', `${Math.round(clamp(sci) * 100)} %`, lagOk ? 'Upstream B, V, n, T' : 'No flow speed', sci, sci > 0.6 ? 'pass' : 'check'),
    ];
    return finish({ o, gates, metrics, sci, cost, avail, dv, req, wet, dry, lagOk, backlog, fill,
      num: { mass: [wet, 'kg'], dv: [dv - req, 'm/s margin'], data: [down - gen, 'MB/day margin'], cost: [cost, '$'], sci: [sci * 100, '% science'] },
      rel: 0.35 + (o.h_rec.id === 'r16' ? 0.15 : 0) + (o.h_prop.id === 'bi' ? 0.1 : 0.05) + (o.h_rev.id === 'indep' ? 0.2 : 0) + (eol >= load * 1.2 ? 0.2 : 0.05),
      safe: (o.n_res.id === 'protect' ? 0.5 : 0.2) + (dvOk && dv >= req * 1.2 ? 0.3 : 0.1) + (wet <= lim - 15 ? 0.2 : 0.05),
      margins: [clamp((lim - wet) / 50), req ? clamp((dv - req) / req) : 0, clamp((eol - load) / load / 0.3), clamp(backlog <= 0 ? 1 : fill / 120), clamp((avail - cost) / 8)] });
  },
  events: [
    { id: 'antenna', chapter: 'Ch. 5', title: 'Adrian Voss makes an offer', owner: 'Naomi',
      game: { kind: 'downlink', title: 'Helios’s first shock', doing: 'scheduling the deep-space dishes',
        hint: 'One day of Helios operations in a minute. A shock front will cross the spacecraft. Book the dishes that can see it, settle shared antennas, decide whether Aegis’s priority time is worth its price — and get the shock packets home before the recorder overwrites them.',
        params: (S) => { const o = evaluate(S).o; return { deep: true, craft: 'Helios', net: o.h_gs.id, kbps: o.h_ant.kbps, recMB: o.h_rec.MB, buffering: o.h_cad.id === 'adaptive' }; },
        result: (S, g, v) => { const frac = (v % 1000) / 100, spent = Math.floor(v / 1000) / 100, d = g === 'bad' ? { sci: 0.94 } : {}; if (spent > 0) { d.cost = spent; d.aegis = 3; }
          return { d, mods: g === 'good' ? { hours: 2 } : {}, text: `${Math.round(frac * 100)} % of the shock packets verified on the ground${spent > 0 ? ` · ${money(spent)} paid to Aegis` : ''}.${g === 'good' ? ' The university offers a weekend shift: +2 h/day.' : ''}` }; } },
      talk: () => [['Voss', 'Our network never sleeps, Dr. Chen. Universities do.', 'persuasive'], ['Naomi', 'Universities also publish their prices.', 'skeptical']],
      text: (S) => S.choices.h_gs === 'aegis' ? 'You already chose Aegis’s antennas. Voss wants a long-term data-sharing clause in return.' : 'Aegis offers round-the-clock deep-space contact — for $14M and a seat in your data reviews.',
      options: (S) => [
        { id: 'accept', label: S.choices.h_gs === 'aegis' ? 'Sign the data-sharing clause' : 'Accept the Aegis network', effect: () => ({ set: { h_gs: 'aegis' }, d: { aegis: 15 }, text: 'Helios gets 20 hours of contact a day. Aegis gets a view into everything you find.' }) },
        { id: 'public', label: 'Publish the quote and ask agencies for shared time', ai: true, effect: () => ({ d: { trust: 6, aegis: -5 }, flags: { vossSnub: true }, text: 'Two agencies offer antenna time. Voss smiles, and remembers.' }) },
        { id: 'keep', label: 'Keep the current plan quietly', effect: () => ({ text: 'Nothing changes.' }) }] },
    { id: 'transfer', chapter: 'Ch. 6 · cruise', title: 'The first correction burn', owner: 'Leila',
      talk: () => [['Leila', 'Tracking says we’re slightly off. I can fix it now, or wait for a cleaner solution.', 'thinking']],
      text: (S, r) => `Δv margin before the burn: ${Math.round(r.dv - r.req)} m/s. Correcting now costs ~5 m/s; waiting costs ~25 m/s because the error grows.`,
      game: { kind: 'burn', title: 'Plan the correction burn', doing: 'planning the correction burn',
        hint: 'Tracking shows Helios drifting off its transfer. Drop a manoeuvre node ahead of the spacecraft and drag the burn arrow onto the tracking solution. Early burns are cheap but uncertain; wait and tracking improves, but the error grows.',
        params: (S) => { const r = evaluate(S); return { isp: r.o.h_prop.isp, wet: r.wet, margin: Math.round(r.dv - r.req) }; },
        result: (S, g, v) => ({ mods: { dvUsed: Math.round(v) }, d: g === 'bad' ? { risk: 6 } : {}, text: g === 'good' ? `Corrected with ${f1(v)} m/s. Helios stays on its path.` : g === 'ok' ? `Corrected with ${f1(v)} m/s — more than an early burn, still inside the margin.` : `${f1(v)} m/s spent, including an emergency trim. The stationkeeping margin is thinner.` }) },
      options: (S, r) => S.ops.game ? [{ id: 'logged', label: 'Log the burn and continue the cruise', ai: true, effect: () => ({ text: 'Helios cruises on toward L1.' }) }] : [
        { id: 'early', label: 'Correct now (~5 m/s)', ai: true, effect: () => ({ mods: { dvUsed: 5 }, text: 'Small burn, small cost. Helios stays on its path.' }) },
        { id: 'late', label: 'Wait for better tracking (~25 m/s)', effect: () => (r.dv - r.req < 25 ? { mods: { dvUsed: 25 }, d: { risk: 10, sci: 0.85 }, text: 'The late burn eats the stationkeeping margin. Helios will have to end its mission early.' } : { mods: { dvUsed: 25 }, text: 'The margin absorbs it.' }) }],
      timed: { role: 'Leila', title: 'Light-time check', seconds: 60, reward: 'Better command planning (risk −3)', q: 'Helios is 1.5 million km away. How long does a command take to arrive?',
        choices: ['≈ 5 s', '≈ 0.5 s', '≈ 8 min'], answer: 0, win: { risk: -3 }, winText: '1.5 million km ÷ 300 000 km/s ≈ 5 s.' } },
    { id: 'lag', chapter: 'Ch. 6 · first data', title: 'How long does the wind take?', owner: 'Kiran',
      talk: () => [['Kiran', 'If I line up the wrong hour, I’ll see a correlation that isn’t there.', 'thinking']],
      text: () => 'To compare Helios with Sentinel, its data must be shifted by the solar wind’s travel time to Earth. At 450 km/s that is about 56 minutes — but the speed changes.',
      game: { kind: 'lag', title: 'Line up the solar wind', doing: 'aligning Helios with Earth',
        hint: 'Upper trace: Helios at L1. Lower: the response near Earth. Drag the upper trace until the features line up — the wind speeds up halfway through, so each half needs its own delay. Then click the peaks near Earth that nothing upstream explains.',
        params: (S) => ({ lagOk: evaluate(S).lagOk }),
        result: (S, g, v) => g === 'good' ? { d: { evidence: 4 }, text: `Both streams aligned. ${Math.round(v)} recurring peaks near Earth have no upstream cause.` }
          : g === 'ok' ? { d: { evidence: 2 }, text: `A partial alignment. ${Math.round(v)} unexplained peaks marked.` } : { text: 'The alignment never settled; the comparison stays ambiguous.' } },
      options: (S, r) => [
        { id: 'velocity', label: 'Shift by the measured flow speed, sample by sample', ai: r.lagOk, disabled: !r.lagOk, why: r.lagOk ? '' : 'Needs the plasma analyzer', effect: () => ({ d: { sci: 1.1 }, text: 'The early energy input lines up with Earth’s response. The recurring peaks do not.' }) },
        { id: 'fixed', label: 'Shift everything by a fixed 60 minutes', ai: !r.lagOk, effect: () => ({ d: { sci: 0.85 }, text: 'A rough fit. Fast and slow streams smear together.' }) },
        { id: 'none', label: 'Compare at the same timestamps', effect: () => ({ d: { sci: 0.6 }, text: 'The comparison is misleading: Earth’s response always appears to come first.' }) }] },
    { id: 'proposal', chapter: 'Ch. 6 · Geneva', title: 'The next mission', owner: 'Naomi',
      talk: () => [['Naomi', 'The solar wind doesn’t explain the peaks. Do we ask for the Moon now?', 'thinking'], ['Kiran', 'The tail. We have to look in the tail.', 'determined']],
      text: () => 'Upstream data explain the early energy, not the recurrence. The answer may be in the magnetotail, near the Moon.',
      options: (S) => [
        { id: 'review', label: 'Have the result reviewed first, then propose Selene', ai: true, effect: () => ({ d: { trust: 3, evidence: 2 }, text: 'An outside panel confirms the analysis. Selene is approved on firmer ground.' }) },
        { id: 'now', label: 'Propose Selene immediately', effect: () => (S.legacy.evidence >= 35 ? { d: { trust: 4 }, text: 'The evidence is strong enough. Selene is approved quickly.' } : { d: { trust: -6 }, text: 'The board finds the case thin, but approves Selene with conditions.' }) }] },
  ],
  outcome(r) { const o = r.o; return { evidence: Math.round(r.score.science * 0.7), trust: (o.n_res.id === 'protect' && r.cost <= r.avail ? 3 : -6) + (o.h_rev.id === 'indep' ? 4 : 0), aegis: o.h_gs.id === 'aegis' ? 10 : o.h_gs.id === 'mixed' ? 4 : 0 }; },
};

// ---------------------------------------------------------------- Selene (Ch. 7–8)
const SELENE = {
  id: 'selene', name: 'Project Selene', chapters: 'Chapters 7–8', total: 420, reserve: 40, bench: ['s_rec', 's_port', 's_iso'], workbench: ['s_rec', 's_port', 's_iso', 's_probes', 's_clock', 's_lv', 's_xfer'],
  question: 'Is the repeating energy release in the magnetotail — and is it moving, or growing in place?',
  brief: ['An orbiter and probes in the lunar region. Only several points at once can tell a moving structure from one that grows in place.',
    'The Moon is inside Earth’s magnetotail for only a few days around each full Moon.'],
  decisions: [
    { id: 's_probes', role: 'Kiran', label: 'Number of probes', help: 'Separating space from time needs several points.', def: 'p3', options: [
      { id: 'p3', label: 'Three probes', sub: '150 kg · $60M', n: 3, s: 1 }, { id: 'p2', label: 'Two probes', sub: '100 kg · $40M', n: 2, s: 0.65 }, { id: 'p1', label: 'One probe', sub: '50 kg · $20M — can’t separate space from time', n: 1, s: 0.35 }] },
    { id: 's_clock', role: 'Kiran', label: 'Clock synchronisation', help: '', def: 'onboard', options: [
      { id: 'onboard', label: 'Independent clocks (±50 ms)', sub: '', c: 0, kg: 0, s: 0.8 }, { id: 'xlink', label: 'Cross-link sync (±1 ms)', sub: '+1 kg per probe · +$4M', c: 4, kg: 1, s: 1 }] },
    { id: 's_campaign', role: 'Kiran', label: 'Observing campaigns', help: '', def: 'one', options: [
      { id: 'one', label: 'One campaign', sub: '', c: 0, s: 0.8 }, { id: 'two', label: 'Two campaigns', sub: '+$6M operations', c: 6, s: 1 }] },
    { id: 's_rec', role: 'Mateo', label: 'Orbiter recorder', help: '', def: 'r32', options: [
      { id: 'r32', label: '32 GB', sub: 'Included', kg: 0, c: 0, keep: 0.7 }, { id: 'r128', label: '128 GB', sub: '+4 kg · +$2M', kg: 4, c: 2, keep: 1 }] },
    { id: 's_port', role: 'Mateo', label: 'Secondary service interface', help: 'A second data port a crew could plug into one day.', def: 'none', options: [
      { id: 'none', label: 'No', sub: '', kg: 0, c: 0 }, { id: 'service', label: 'Yes', sub: '+5 kg · +$3M', kg: 5, c: 3 }] },
    { id: 's_iso', role: 'Mateo', label: 'Transmitter thermal isolation', help: '', def: 'none', options: [
      { id: 'none', label: 'Standard mounting', sub: '', kg: 0, c: 0 }, { id: 'iso', label: 'Isolated mounting', sub: '+3 kg · +$2M · protects the recorder if the radio fails', kg: 3, c: 2 }] },
    { id: 's_xfer', role: 'Leila', label: 'Transfer to the Moon', help: '', def: 'direct', options: [
      { id: 'direct', label: 'Direct transfer (5 days)', sub: '250 kg propellant', prop: 250, c: 0 }, { id: 'blt', label: 'Ballistic lunar transfer (4 months)', sub: '170 kg propellant · science starts later', prop: 170, c: 0 }] },
    { id: 's_orbit', role: 'Leila', label: 'Lunar orbit', help: '', def: 'ellip', options: [
      { id: 'ellip', label: 'High elliptical', sub: 'Long tail dwell; longer contact gaps', s: 1, cf: 0.8 }, { id: 'low', label: 'Low circular · 100 km', sub: 'Shorter tail dwell', s: 0.8, cf: 1 }] },
    { id: 's_sep', role: 'Leila', label: 'Probe separation', help: '', def: 'medium', options: [
      { id: 'tight', label: '500 km', sub: 'Good timing, poor spatial view', s: 0.8 }, { id: 'medium', label: '3 000 km', sub: 'Balanced', s: 1 }, { id: 'wide', label: '10 000 km', sub: 'Hard to keep in contact', s: 0.75 }] },
    { id: 's_window', role: 'Leila', label: 'Campaign window', help: '', def: 'full', options: [
      { id: 'full', label: 'Around full Moon', sub: 'Moon inside the magnetotail', s: 1 }, { id: 'new', label: 'Around new Moon', sub: 'Moon in the solar wind', s: 0.15 }] },
    { id: 's_lv', role: 'Leila', label: 'Launch vehicle', help: 'Mass to trans-lunar injection.', def: 'heavy', options: [
      { id: 'heavy', label: 'Heavy · 1 200 kg', sub: '$73M', lim: 1200, c: 73 }, { id: 'medium', label: 'Medium · 950 kg', sub: '$55M', lim: 950, c: 55 }] },
    { id: 's_gs', role: 'Naomi', label: 'Deep-space contacts', help: '', def: 'aegis', options: [
      { id: 'aegis', label: 'Aegis network', sub: '3 h/day · $25M', h: 3, c: 25, aegis: true }, { id: 'mixed', label: 'Mixed', sub: '1.5 h/day · $22M', h: 1.5, c: 22 }, { id: 'coop', label: 'Agency cooperation', sub: '2 × 20 min/day · $18M', h: 0.67, c: 18 }] },
    { id: 's_rev', role: 'Naomi', label: 'Independent science review', help: '', def: 'none', options: [
      { id: 'none', label: 'No external review', sub: '', c: 0 }, { id: 'indep', label: 'Independent review panel', sub: '+$1M', c: 1 }] },
    RES(420, 40),
  ],
  evaluate(c, L, mods = {}) {
    const o = sel(this, c), n = o.s_probes.n, snub = L.flags && L.flags.vossSnub;
    const stack = 600 + o.s_rec.kg + o.s_port.kg + o.s_iso.kg + o.s_xfer.prop + n * (50 + o.s_clock.kg), lim = o.s_lv.lim;
    const gsC = o.s_gs.c + (o.s_gs.id === 'aegis' && snub ? 5 : 0);
    const cost = 222 + 20 * n + o.s_lv.c + gsC + o.s_clock.c + o.s_campaign.c + o.s_rec.c + o.s_port.c + o.s_iso.c + o.s_rev.c + (mods.cost || 0);
    const avail = 420 - (o.n_res.id === 'protect' ? 40 : 0);
    const gen = mbPerDay(10) + 2 * 1800 * (15 * n + 30) * 1000 / 8 / 1e6, down = 337.5 * o.s_gs.h * o.s_orbit.cf, backlog = gen - down;
    const ret = backlog <= 0 ? 1 : 0.85;
    const sci = o.s_probes.s * o.s_sep.s * o.s_clock.s * o.s_window.s * o.s_orbit.s * o.s_campaign.s * ret * (mods.sci ?? 1);
    const gates = [
      G('mass', 'Launch mass', st(stack > lim, stack > lim - 20), stack > lim ? `${stack - lim} kg over trans-lunar capacity.` : `${lim - stack} kg margin.`),
      G('budget', 'Budget', st(cost > avail + 1e-9, avail - cost < 4), cost > avail + 1e-9 ? `${money(cost - avail)} over what you can spend.` : `${money(avail - cost)} left.`),
      G('data', 'Data', st(false, backlog > 0), backlog > 0 ? `Contacts return ${f1(down)} of ${f1(gen)} MB/day; events will queue.` : 'Contacts keep up with background and event data.'),
      G('window', 'Campaign window', st(false, o.s_window.id === 'new'), o.s_window.id === 'new' ? 'Around new Moon the Moon is in the solar wind, outside the tail.' : 'Timed for the magnetotail crossing.'),
      G('geometry', 'Probe geometry', st(false, n < 3 || o.s_sep.id === 'wide'), n < 3 ? `${n} probe${n > 1 ? 's' : ''}: a moving structure can’t be told from one growing in place.` : o.s_sep.id === 'wide' ? 'Wide spacing strains contacts and propellant.' : 'Three points, balanced spacing.'),
      G('access', 'Serviceability', st(false, o.s_port.id !== 'service'), o.s_port.id !== 'service' ? 'One data path only: if the radio fails, nothing can reach the recorder.' : 'A second data port exists if the radio fails.'),
    ];
    const metrics = [
      Mx('mass', 'Launch mass', `${stack} / ${lim} kg`, `Orbiter + ${o.s_xfer.prop} kg propellant + ${n} probe${n > 1 ? 's' : ''}`, stack / lim, gates[0].status),
      Mx('data', 'Data per day', `${f1(gen)} MB → ${f1(down)} MB down`, `1 Mbps, 75 % goodput · light time ≈ 1.3 s`, down / gen, gates[2].status),
      Mx('budget', 'Budget', `${money(cost)} / ${money(avail)}`, 'Total $420M, reserve $40M', cost / avail, gates[1].status),
      Mx('sci', 'Expected science', `${Math.round(clamp(sci) * 100)} %`, `${n} probe${n > 1 ? 's' : ''} · ${o.s_window.id === 'full' ? 'tail window' : 'solar wind'}`, sci, sci > 0.6 ? 'pass' : 'check'),
    ];
    return finish({ o, gates, metrics, sci, cost, avail, stack,
      num: { mass: [stack, 'kg'], cost: [cost, '$'], sci: [sci * 100, '% science'] },
      rel: 0.2 + (o.s_port.id === 'service' ? 0.3 : 0) + (o.s_iso.id === 'iso' ? 0.3 : 0) + (o.s_rec.id === 'r128' ? 0.2 : 0),
      safe: (o.n_res.id === 'protect' ? 0.5 : 0.2) + (o.s_sep.id !== 'wide' ? 0.25 : 0.1) + (stack <= lim - 20 ? 0.25 : 0.1),
      margins: [clamp((lim - stack) / 80), clamp((avail - cost) / 20), backlog <= 0 ? 1 : 0.5] });
  },
  events: [
    { id: 'deploy', chapter: 'Ch. 7', title: 'Releasing the probes', owner: 'Leila', talk: () => [],
      text: (S, r) => `Selene is in lunar orbit, inside the magnetotail. ${r.o.s_probes.n} probe${r.o.s_probes.n > 1 ? 's' : ''} wait for their separation burns.`,
      game: { kind: 'probes', title: 'Release the probes', doing: 'positioning the probes',
        hint: 'Drag each probe to its station within the separation Δv. The plasma sheet is where the model predicts — until it isn’t. Several points across it tell a moving structure from one growing in place.',
        params: (S) => { const o = evaluate(S).o; return { n: o.s_probes.n, sep: { tight: 500, medium: 3000, wide: 10000 }[o.s_sep.id] || 3000 }; },
        result: (S, g) => g === 'good' ? { d: { sci: 1.06 }, text: 'Even on the edge, the spread catches the sheet from above, inside and below.' } : g === 'ok' ? { text: 'Some of the probes catch the sheet’s edge.' } : { d: { sci: 0.9 }, text: 'The probes cluster where the sheet was supposed to be. It wasn’t there.' } },
      options: () => [{ id: 'run', label: 'Run the first campaign', ai: true, effect: () => ({ text: 'Six days of data in the magnetotail.' }) }] },
    { id: 'camp1', chapter: 'Ch. 7', title: 'The first campaign', owner: 'Naomi',
      talk: () => [['Leila', 'The plasma sheet sat lower than predicted. We skimmed its edge.', 'annoyed'], ['Kiran', 'It’s not a bug. The tail moves.', 'thinking']],
      text: (S) => `The probes sampled the edge of the plasma sheet, not its centre. ${S.choices.s_window === 'new' ? 'Worse: the campaign was timed for new Moon, when the Moon is outside the tail. ' : ''}${S.choices.s_campaign === 'two' ? 'A second campaign is already funded.' : 'Only one campaign was funded.'}`,
      options: (S) => S.choices.s_campaign === 'two' ? [{ id: 'proceed', label: 'Re-target for the second campaign', ai: true, effect: () => ({ text: 'Leila moves the probes for next month’s crossing.' }) }] : [
        { id: 'fund', label: 'Fund a second campaign (+$6M)', ai: true, effect: () => ({ set: { s_campaign: 'two' }, text: 'A second campaign is approved for next month.' }) },
        { id: 'accept', label: 'Accept the first campaign’s data', effect: () => ({ text: 'Selene continues with what it has.' }) }],
      timed: { role: 'Kiran', title: 'Where is the tail?', seconds: 90, reward: 'Better targeting (science +5 %)', q: 'For about how long each month is the Moon inside Earth’s magnetotail?',
        choices: ['About 6 days, around full Moon', 'About 15 days, around new Moon', 'Always'], answer: 0, win: { sci: 1.05 }, winText: 'Around full Moon, for roughly six days.' } },
    { id: 'eighteen', chapter: 'Ch. 8', title: 'Eighteen minutes', owner: 'Kiran', label: 'FICTIONAL 2064 STORY PHYSICS',
      game: { kind: 'eighteen', title: 'Find the eighteen minutes', doing: 'searching the Selene data',
        hint: 'Four hours of Selene magnetometer data. Somewhere the repeating signature stops while the plasma keeps moving. Drag across that interval, then mark it. Watch the data-quality strip: a gap in the data is not a gap in the physics.',
        result: (S, g) => g === 'good' ? { d: { evidence: 4 }, text: 'Kiran marks it to the minute: valid data, the background still moving, the repeating signature simply gone. Eighteen minutes.' }
          : g === 'ok' ? { d: { evidence: 1 }, text: 'Kiran brackets it roughly. The interruption is real; the edges will need a second look.' }
          : g === 'glitch' ? { d: { evidence: -2 }, text: 'That was a telemetry dropout: no data at all, not a change in the plasma. Kiran finds the real interval only after a wasted night.' }
          : { d: { evidence: -1 }, text: 'Kiran misses it on the first pass. Mateo points at the quiet stretch.' } },
      talk: () => [['Kiran', 'It stopped. The pattern just… stopped. For eighteen minutes.', 'shocked'], ['Mateo', 'Everything else is still moving.', 'surprised']],
      text: () => 'The repeating signature vanished for eighteen minutes, then came back. The rest of the magnetotail kept changing as usual.',
      options: () => [
        { id: 'verify', label: 'Verify first: time-tags, housekeeping, Sentinel and Helios', ai: true, effect: () => ({ d: { evidence: 8, trust: 4 }, text: 'Clocks, instruments and independent spacecraft all agree. It was real.' }) },
        { id: 'announce', label: 'Announce it tonight', effect: () => ({ d: { evidence: 3, trust: -10, risk: 6 }, text: 'The announcement outruns the checks. Reviewers are unconvinced.' }) },
        { id: 'dismiss', label: 'Log it as an instrument glitch', effect: () => ({ flags: { missed18: true }, text: 'The interval is filed away. Nobody looks at it again — for now.' }) }] },
    { id: 'fault', chapter: 'Ch. 8', title: 'The transmitter', owner: 'Mateo',
      talk: () => [['Mateo', 'High-rate transmitter is gone. Low-rate still answers.', 'worried']],
      text: (S) => `A thermal fault isolated Selene’s high-rate transmitter. Housekeeping still works; the campaign data are trapped on the recorder.${S.choices.s_iso === 'iso' ? ' The isolated mounting kept the heat away from the recorder.' : ''}`,
      options: (S) => [
        { id: 'safe', label: 'Safe the recorder and switch to low-rate housekeeping', ai: true, effect: () => ({ flags: { preserved: S.choices.s_iso === 'iso' ? 1 : 0.85 }, text: 'The stored data are protected. Someone will have to fetch them.' }) },
        { id: 'cycle', label: 'Power-cycle the radio and hope', effect: () => (S.choices.s_iso === 'iso' ? { flags: { preserved: 1 }, d: { risk: 2 }, text: 'Nothing comes back, but nothing is lost.' } : { flags: { preserved: 0.55 }, d: { risk: 5 }, text: 'The power surge corrupts part of the recorder.' }) }],
      timed: { role: 'Mateo', title: 'Read the last housekeeping frame', seconds: 90, reward: 'Protect more of the stored data', q: 'Low-rate telemetry still works. Which statement is true?',
        choices: ['Data stored before the fault may still be intact', 'All of Selene’s data are lost', 'The probes have stopped working'], answer: 0, win: {}, flags: { trappedBonus: 0.1 }, winText: 'The recorder index is intact. Mateo marks which blocks to protect.' } },
    { id: 'blame', chapter: 'Ch. 8 · that night', title: 'Mateo', owner: 'Kiran',
      talk: () => [['Mateo', 'I signed off on that transmitter. This is on me.', 'guilty']],
      text: () => 'Mateo hasn’t left the lab. What does Kiran say?',
      options: () => [
        { id: 'support', label: '“We all signed it. And the data are still there.”', ai: true, effect: () => ({ d: { bond: 10 }, text: 'Mateo nods. He goes home, for once.' }) },
        { id: 'blame', label: '“You should have caught it.”', effect: () => ({ d: { bond: -15 }, text: 'He doesn’t answer.' }) },
        { id: 'silence', label: 'Say nothing', effect: () => ({ d: { bond: -5 }, text: 'The silence stays in the room.' }) }] },
  ],
  outcome(r, S) {
    const o = r.o, f = S.legacy.flags;
    return { evidence: Math.round(r.score.science * 0.6), trust: (o.n_res.id === 'protect' && r.cost <= r.avail ? 3 : -6) + (o.s_rev.id === 'indep' ? 4 : 0) - (o.s_xfer.id === 'blt' ? 2 : 0),
      aegis: o.s_gs.id === 'aegis' ? 8 : 0,
      flags: { servicePort: o.s_port.id === 'service', trapped: Math.round(clamp(((f.preserved ?? 0.85) + (f.trappedBonus || 0)) * o.s_rec.keep) * 100) / 100 } };
  },
};

// ---------------------------------------------------------------- Interlude: The House of the Enemy (Ch. 9–17)
const SIGNS = 'Leila refuses. Naomi refuses. Then Voss turns to Mateo and places a separate document in front of him: Elena’s treatment, guaranteed. “Mateo, don’t,” Kiran says. “Where do I sign?” Mateo signs. “I’m sorry.”';
const AEGIS = {
  id: 'aegis', name: 'The House of the Enemy', chapters: 'Chapters 9–17', story: true,
  question: 'Mateo goes to work for Aegis. The others go on without him.',
  brief: ['Elena Reyes is ill. Aegis offers Mateo a contract that pays for her care, and he signs it — that does not change.',
    'While Mateo is inside Aegis, the others cannot see what he sees. His choices there are his alone until he comes back.'],
  decisions: [],
  evaluate() { return { gates: [], metrics: [], score: null }; },
  events: [
    { id: 'elena', chapter: 'Ch. 9', title: 'The hospital', owner: 'Mateo',
      talk: () => [['Elena', 'You look more tired than I do, mijo.', 'gentle'], ['Mateo', 'The bills came again.', 'worried']],
      text: () => 'The treatment Elena needs costs more than Mateo earns in a year. Does he tell Kiran?',
      options: () => [
        { id: 'tell', label: 'Tell Kiran the truth about the bills', ai: true, effect: () => ({ d: { bond: 6 }, text: 'Kiran listens. There is nothing he can pay — but now he knows.' }) },
        { id: 'hide', label: 'Keep it to himself', effect: () => ({ d: { bond: -6 }, text: 'Mateo carries it alone.' }) }] },
    { id: 'offer', chapter: 'Ch. 10', title: 'The offer', owner: 'Kiran',
      talk: () => [['Voss', 'I want to give you everything you’ve been asking for.', 'happy'], ['Kiran', 'No. You want to own everything we’ve discovered.', 'angry'],
        ['Voss', 'Doctor Rao, you’re an exceptional scientist. But you have very little experience of how the world works.', 'sarcastic']],
      text: () => 'Aegis headquarters, eighty-second floor. Voss places four contracts on the table: Aegis acquires the program, the independent missions end, and Aegis decides what may be published. What does Kiran do with his?',
      options: () => [
        { id: 'refuse', label: '“Then I’ll learn.” Push the contract away', ai: true, effect: () => ({ d: { trust: 3 }, text: 'Kiran pushes the contract away. ' + SIGNS }) },
        { id: 'narrow', label: 'Refuse the acquisition, but negotiate Aegis launch support for the Selene recovery', effect: () => ({ d: { aegis: 10, evidence: 3 }, text: 'Voss agrees to a narrow contract at once. He looks pleased anyway. ' + SIGNS }) }] },
    { id: 'promise', chapter: 'Ch. 11', title: 'The broken promise', owner: 'Kiran',
      talk: () => [['Kiran', 'Tell me you didn’t just sell our research to him.', 'angry'], ['Mateo', 'I signed my own contract. I didn’t sign yours.', 'defiant'],
        ['Mateo', 'My mother needs treatment.', 'desperate'], ['Kiran', 'We could have found another way.', 'sad'], ['Mateo', 'Tell me how.', 'frustrated'],
        ['Mateo', 'Not everything is a scientific problem you can solve by refusing to sleep! You get to go home and think about magnetic fields. I go home and wonder whether my mother is going to live long enough to see another year.', 'angry'],
        ['Kiran', 'You were supposed to be with us.', 'betrayed'], ['Mateo', 'I know.', 'guilty'], ['Kiran', 'You promised.', 'sad'], ['Mateo', 'I know.', 'ashamed'],
        ['Leila', 'Do you understand what you’ve done to the mission?', 'angry'],
        ['Naomi', 'We will revoke your access to confidential systems. All engineering interfaces and design records will undergo review. You will not represent the mission.', 'angry'],
        ['Mateo', 'I understand.', 'ashamed']],
      text: () => 'The corridor outside Voss’s office. The elevator doors are open. Mateo tries to speak.',
      options: () => [
        { id: 'go', label: '“Go.”', ai: true, effect: () => ({ d: { bond: -10 }, text: 'The elevator doors close. That night Kiran opens a design containing Mateo’s notes. In the corner: “If you’re trying to save the world, at least remember to make the spacecraft serviceable.” For the first time in months, he goes home before midnight.' }) },
        { id: 'back', label: '“Take care of her. Then come back.”', effect: () => ({ d: { bond: 8 }, text: 'Mateo can’t answer. The doors close between them.' }) },
        { id: 'him', label: '“You’re working for him now.”', effect: () => ({ d: { bond: -18 }, text: 'Mateo doesn’t argue. The doors close.' }) }] },
    { id: 'house', chapter: 'Ch. 12', title: 'The enemy’s house', owner: 'Mateo', private: 'Mateo',
      talk: () => [['Voss', 'Well?', 'polite'], ['Mateo', 'It’s impressive.', 'conflicted'],
        ['Voss', 'Most engineers spend their lives trying to build extraordinary things with inadequate resources. I prefer to remove the limitations.', 'confident'],
        ['Mateo', 'Limitations are part of engineering.', 'defiant'], ['Voss', 'Some are unnecessary.', 'smirk'], ['Voss', 'Imagine what your friend could accomplish here.', 'manipulative'],
        ['Voss', 'Do you miss them?', 'sympathy'], ['Mateo', 'Of course.', 'sad'],
        ['Voss', 'Our next-generation space-weather network. We have excellent sensors and spacecraft, but our forecasts are limited by the models interpreting the data.', 'confident'],
        ['Mateo', 'You need more independent observations.', 'thinking'], ['Voss', 'Among other things.', 'smirk']],
      text: () => 'Clean rooms, vacuum chambers, integration halls, a budget that seems almost limitless. Voss wants Mateo on the new monitoring network. What does Mateo ask for?',
      options: () => [
        { id: 'history', label: '“Then I’ll need to understand your existing systems. The historical data too.”', ai: true, effect: () => ({ d: { evidence: 3 }, flags: { askedHistory: true }, text: 'Voss agrees to arrange access through the research division.' }) },
        { id: 'network', label: 'Just build the network', effect: () => ({ d: { aegis: 6 }, text: 'The work is excellent. All of it belongs to Aegis.' }) }] },
    { id: 'ashamed', chapter: 'Ch. 12 · the following week', title: 'Make it right', owner: 'Mateo',
      talk: () => [['Elena', 'Did you do something you’re ashamed of?', 'worried'], ['Elena', 'Then make it right.', 'serious'], ['Mateo', 'It’s complicated.', 'ashamed'], ['Elena', 'Most important things are.', 'gentle']],
      text: () => 'Elena’s treatment has begun. Mateo visits every evening. She is slowly getting better — and she has noticed his silence.',
      options: () => [
        { id: 'archive', label: 'After she sleeps, go back to the Aegis scientific division', ai: true, effect: () => ({ d: { bond: 4 }, text: 'Somewhere in its vast archives, he suspects, is information he needs to understand.' }) },
        { id: 'stay', label: 'Stay with her tonight', effect: () => ({ text: 'He stays until morning. The archive can wait one more night.' }) }] },
    { id: 'three', chapter: 'Ch. 14', title: 'Three people left', owner: 'Kiran',
      talk: () => [['Leila', 'How confident are you?', 'thinking'], ['Kiran', 'Not confident enough.', 'sad'], ['Leila', 'Then stop treating the worst case as certain.', 'stern'],
        ['Kiran', 'What if it’s right?', 'confused'], ['Leila', 'Then we prepare. And if we can’t stop it, we reduce the consequences.', 'determined'],
        ['Kiran', 'I miss him.', 'sad'], ['Leila', 'So do I.', 'worried']],
      text: () => 'Without Mateo, changing hardware is slower: replacement engineers need time to reconstruct why every compromise was made. Kiran works through the nights on a nonlinear model of the Cascade — two states under similar driving, with hysteresis. Leila finds him asleep at his desk. A crewed mission, she insists, cannot be justified only because the story demands one: it has to pass independent risk review.',
      options: () => [
        { id: 'prepare', label: 'Prepare: put the crewed option through independent risk review', ai: true, effect: () => ({ d: { trust: 4, risk: -3 }, text: 'Life support, radiation protection, navigation, propulsion reserves, emergency return, meaningful crew tasks — all reviewable. At the funding hearing Voss shows photographs of hospitals protected by Aegis. “Humanity needs reliable protection today, not promises about discoveries tomorrow.” The committee defers funding. Kiran closes a photo of Mateo beside Aegis executives and returns to his work.' }) },
        { id: 'worst', label: 'Take the worst case to the funding hearing as the reason to fly', effect: () => ({ d: { trust: -8 }, text: 'The committee hears certainty where there is none. Voss answers with photographs of hospitals protected by Aegis: “Humanity needs reliable protection today, not promises about discoveries tomorrow.” Funding is deferred, and the program’s credibility takes the hit.' }) }] },
    { id: 'archive', chapter: 'Ch. 13, 15', title: 'The archive', owner: 'Mateo', private: 'Mateo',
      talk: () => [['Mateo', 'Dr. Park… these are your observations. From years ago.', 'surprised'], ['Evelyn', 'Do your friends know what you’re doing?'], ['Mateo', 'No.', 'guilty'], ['Evelyn', 'Why not?'],
        ['Mateo', 'Because Voss knows how to pressure people. If Kiran knew, he’d come after him before we had proof. He might destroy the investigation trying to protect me.', 'serious'],
        ['Evelyn', 'And if you found nothing?'], ['Mateo', 'I would still have betrayed my friends.', 'guilty']],
      text: () => 'Dr. Evelyn Park shows Mateo an Aegis archive: old, time-tagged observations of an interruption like the eighteen minutes. Through legitimate research and compliance procedures they go through the corporate records, separating scientific evidence from allegations.',
      game: { kind: 'sort', title: 'Evidence or allegation', doing: 'sorting the Aegis records with Evelyn',
        hint: 'Nine records before the shift change. File each one: evidence (original, authenticated, checkable), allegation (a claim without provenance), or set aside (confidential and irrelevant: protect it).',
        params: () => ({ bins: [{ id: 'ev', label: 'Evidence', sub: 'Original, authenticated, checkable' }, { id: 'al', label: 'Allegation', sub: 'A claim without provenance' }, { id: 'pr', label: 'Set aside', sub: 'Confidential and irrelevant' }],
          cards: [{ t: 'Raw probe telemetry, 2059: time-tagged frames from three Aegis probes, checksums intact.', bin: 'ev' },
            { t: 'Executive directive, signed and authenticated by compliance: exclusive control of predictive data “to preserve commercial differentiation”.', bin: 'ev' },
            { t: 'Board-approved financial projection: premium-forecast revenue grows with prolonged emergency dependence.', bin: 'ev' },
            { t: 'Authenticated memo proposing a review of supplier contracts linked to independent monitoring.', bin: 'ev' },
            { t: 'Anonymous note: “Voss caused the Cascade.” No source, no data.', bin: 'al' },
            { t: 'A forwarded screenshot of an email. No headers, no original, no sender.', bin: 'al' },
            { t: 'A forum post claiming Aegis satellites make the sky red.', bin: 'al' },
            { t: 'Employee medical records, filed by mistake with a payroll export.', bin: 'pr' },
            { t: 'A cafeteria supplier contract.', bin: 'pr' }] }),
        result: (S, g) => g === 'good' ? { d: { evidence: 6 }, text: 'A clean file: authenticated telemetry and directives, the allegations left out, private records protected. An independent team confirms the essential evidence.' }
          : g === 'ok' ? { d: { evidence: 3 }, text: 'Most of the file holds. Evelyn sends the doubtful pages back for authentication.' }
          : { d: { evidence: -2 }, text: 'Allegations have slipped into the file. Evelyn pulls them out. “If we publish unauthenticated records, Voss will call them fabricated.”' } },
      options: () => [
        { id: 'proper', label: 'Ask Evelyn for read-only copies with full provenance', ai: true, effect: () => ({ d: { evidence: 10 }, text: 'Slow, documented, and impossible to dismiss later.' }) },
        { id: 'grab', label: 'Copy everything at night', effect: () => ({ d: { evidence: 14, risk: 10 }, flags: { grabbed: true }, text: 'He gets more — but nobody can prove where it came from.' }) },
        { id: 'leave', label: 'Leave it alone', effect: () => ({ flags: { silent: true }, text: 'Mateo keeps his job, and his silence.' }) }] },
    { id: 'owned', chapter: 'Ch. 16', title: 'The man who thought he owned the future', owner: 'Mateo', private: 'Mateo', when: (S) => !S.legacy.flags.silent,
      talk: () => [['Voss', 'Remarkable, isn’t it? How quickly civilization changes when the lights go out.', 'confident'], ['Voss', 'You’ve been talking to Dr. Park.', 'suspicious'],
        ['Mateo', 'People need a chance to understand what’s happening.', 'serious'], ['Voss', 'Which people?', 'sarcastic'],
        ['Mateo', 'You could have shared the observations. You could have supported the missions.', 'angry'], ['Voss', 'And given away the information that makes our services valuable?', 'cold'],
        ['Mateo', 'People have been hurt because of decisions in this building.', 'angry'],
        ['Voss', 'People have been saved because of decisions here. Your mother is alive because this company provided what your friends could not. Remember that before deciding who the villains are.', 'threatening'],
        ['Mateo', 'My mother taught me to repair broken things.', 'determined'], ['Voss', 'And?', 'cold']],
      text: () => 'Late at night Voss summons Mateo. The city below is dark — a disturbance has forced protective power-grid operations — but Aegis’s buildings stay lit.',
      options: () => [{ id: 'broken', label: '“You taught me why some people prefer them broken.”', ai: true, effect: () => ({ text: 'He leaves. Voss orders his research access revoked. By then the authenticated evidence has already reached independent investigators and scientific reviewers. Voss has not been defeated, but he has lost control of a vital truth.' }) }] },
    { id: 'reunion', chapter: 'Ch. 17', title: 'Reunion', owner: 'Naomi',
      talk: (S) => S.legacy.bond >= 50 ? [['Mateo', 'I brought everything. All of it.', 'emotional'], ['Kiran', 'You came back.', 'relief']] : [['Mateo', 'I brought what I could.', 'guilty'], ['Kiran', '…Thank you.', 'sad']],
      text: (S) => (S.legacy.bond >= 50 ? 'Mateo hands over everything he found at Aegis.' : S.legacy.bond < 30 ? 'Mateo keeps part of what he found to himself. Trust between him and Kiran is thin.' : 'Mateo shares most of what he found.') + ' Naomi must decide how to treat evidence from inside Aegis.',
      enter: (S) => ({ d: { evidence: S.legacy.bond >= 50 ? 5 : S.legacy.bond < 30 ? -4 : 0 } }),
      options: (S) => [
        { id: 'review', label: 'Have the Aegis evidence independently reviewed', ai: true, effect: () => (S.legacy.flags.grabbed ? { d: { evidence: -7, trust: 5 }, text: 'Reviewers discard the files without provenance. What remains is solid.' } : { d: { trust: 5 }, text: 'Reviewers confirm the provenance.' }) },
        { id: 'trust', label: 'Use it as it is', effect: () => (S.legacy.flags.grabbed ? { d: { trust: -8, risk: 5 }, text: 'Critics call the evidence stolen.' } : { text: 'The evidence stands.' }) }] },
  ],
  outcome() { return {}; },
};

// ---------------------------------------------------------------- Bridge / Breakpoint (Ch. 18–29)
const BRIDGE = {
  id: 'bridge', name: 'Bridge · Breakpoint', chapters: 'Chapters 18–30', total: 5780, reserve: 820, bench: ['b_ls', 'b_shelter', 'b_tools'], workbench: ['b_ls', 'b_shelter', 'b_tools'],
  question: 'Three people to the Moon: repair Selene, recover its data, test the Echo Node — and come home.',
  brief: ['Crew: Kiran, Mateo and Leila. Naomi directs from Earth. The vehicle is an existing crew spacecraft, adapted.',
    'Everything you did on the earlier missions arrives here: evidence, trust, risk, the people.'],
  decisions: [
    { id: 'b_pulses', role: 'Kiran', label: 'Pulse charges', help: 'FICTIONAL 2064 STORY PHYSICS. One attempt may not be enough.', def: 'p2', options: [
      { id: 'p1', label: 'One charge', sub: '1 200 kg · $330M', n: 1, c: 330 }, { id: 'p2', label: 'Two charges', sub: '1 600 kg · $420M', n: 2, c: 420 }, { id: 'p3', label: 'Three charges', sub: '2 000 kg · $510M', n: 3, c: 510 }] },
    { id: 'b_review', role: 'Kiran', label: 'Independent reviewers', help: '', def: 'indep', options: [
      { id: 'indep', label: 'Outside scientists review every step', sub: 'Included', c: 0 }, { id: 'none', label: 'Team review only', sub: '−$10M', c: -10 }] },
    { id: 'b_ls', role: 'Mateo', label: 'Life support', help: '', def: 'dual', options: [
      { id: 'dual', label: 'Dual redundant', sub: 'Included', c: 0 }, { id: 'single', label: 'Single string', sub: '−$90M', c: -90 }] },
    { id: 'b_shelter', role: 'Mateo', label: 'Radiation shelter', help: 'Reduces dose in a solar storm; never to zero.', def: 'water', options: [
      { id: 'water', label: 'Water-wall shelter', sub: '600 kg · included', kg: 600, c: 0, dose: 20 }, { id: 'bay', label: 'Improvised in the storage bay', sub: '0 kg · −$40M', kg: 0, c: -40, dose: 55 }] },
    { id: 'b_tools', role: 'Mateo', label: 'EVA tools', help: 'Pressure gloves make fine work slow.', def: 'glove', options: [
      { id: 'glove', label: 'Glove-compatible tool kit', sub: '80 kg · included', kg: 80, c: 0 }, { id: 'std', label: 'Standard tools', sub: '−$15M', kg: 0, c: -15 }] },
    { id: 'b_traj', role: 'Leila', label: 'Trajectory', help: '', def: 'free', options: [
      { id: 'free', label: 'Free-return', sub: 'Swings home if the engine fails · +150 kg consumables', kg: 150, safe: 0.2 }, { id: 'fast', label: 'Direct fast transfer', sub: 'Shorter, no passive abort', kg: 0, safe: 0.05 }] },
    { id: 'b_resv', role: 'Leila', label: 'Return propellant reserve', help: 'Margin above what the planned return needs.', def: 'r15', options: [
      { id: 'r15', label: '15 %', sub: '1 200 kg', p: 0.15 }, { id: 'r10', label: '10 %', sub: '800 kg', p: 0.10 }, { id: 'r5', label: '5 %', sub: '400 kg', p: 0.05 }] },
    { id: 'b_lv', role: 'Leila', label: 'Launch vehicle', help: 'Mass to trans-lunar injection.', def: 'sh', options: [
      { id: 'sh', label: 'Super-heavy · 25 000 kg', sub: '$950M', lim: 25000, c: 950 }, { id: 'shp', label: 'Upgraded · 27 000 kg', sub: '$1 150M', lim: 27000, c: 1150 }] },
    { id: 'b_ops', role: 'Naomi', label: 'Ground operations', help: '', def: 'full', options: [
      { id: 'full', label: 'Full 24/7 mission control', sub: '$180M', c: 180 }, { id: 'lean', label: 'Lean staffing', sub: '$120M', c: 120 }] },
    RES(5780, 820),
  ],
  evaluate(c, L, mods = {}) {
    const o = sel(this, c), lev = (L.aegis || 0) >= 25 ? 100 : 0, cut = (L.trust ?? 50) < 35 ? 400 : 0;
    const kg = 11000 + 1500 + o.b_traj.kg + 700 + o.b_tools.kg + o.b_shelter.kg + 800 + 400 * o.b_pulses.n + 8000 + 8000 * o.b_resv.p, lim = o.b_lv.lim;
    const cost = 1500 + 700 + o.b_shelter.c + 380 + o.b_tools.c + o.b_pulses.c + o.b_lv.c + lev + 180 + 350 + o.b_ops.c + 300 + o.b_review.c + o.b_ls.c + (mods.cost || 0);
    const avail = 5780 - cut - (o.n_res.id === 'protect' ? 820 : 0);
    const ev = L.evidence ?? 0, sci = clamp(ev / 80) * (o.b_pulses.n >= 2 ? 1 : 0.5) * (o.b_review.id === 'indep' ? 1 : 0.9);
    const gates = [
      G('ls', 'Life support', st(o.b_ls.id === 'single', false), o.b_ls.id === 'single' ? 'A crewed vehicle cannot fly with single-string life support.' : 'Dual redundant.'),
      G('reserve', 'Return reserve', st(o.b_resv.p < 0.1, o.b_resv.p < 0.15), o.b_resv.p < 0.1 ? 'No abort margin: the crew could not come home from a bad burn.' : o.b_resv.p < 0.15 ? 'Minimum margin: one correction burn on the way home.' : 'Comfortable return margin.'),
      G('mass', 'Launch mass', st(kg > lim, kg > lim - 300), kg > lim ? `${Math.round(kg - lim)} kg over trans-lunar capacity.` : `${Math.round(lim - kg)} kg margin.`),
      G('budget', 'Budget', st(cost > avail + 1e-9, avail - cost < 40), (cost > avail + 1e-9 ? `${money(cost - avail)} over what you can spend.` : `${money(avail - cost)} left.`) + (cut ? ' The board cut $400M (low trust).' : '') + (lev ? ' Aegis charges +$100M for launch services (leverage).' : '')),
      G('shelter', 'Radiation', st(false, o.b_shelter.id === 'bay'), o.b_shelter.id === 'bay' ? 'Improvised shelter: much higher dose in a storm.' : 'Water-wall shelter.'),
      G('pulses', 'Pulse plan', st(false, o.b_pulses.n < 2), o.b_pulses.n < 2 ? 'Only one charge: no second attempt.' : `${o.b_pulses.n} charges.`),
      G('evidence', 'Evidence', st(false, ev < 55), ev < 55 ? `Evidence ${ev}/100: the target will be uncertain.` : `Evidence ${ev}/100.`),
    ];
    const metrics = [
      Mx('mass', 'Launch mass', `${Math.round(kg).toLocaleString('en-US')} / ${lim.toLocaleString('en-US')} kg`, `Return reserve ${Math.round(o.b_resv.p * 100)} %`, kg / lim, gates[2].status),
      Mx('budget', 'Budget', `${money(cost)} / ${money(avail)}`, 'Total $5.78B, reserve $820M', cost / avail, gates[3].status),
      Mx('dose', 'Storm dose (est.)', `${o.b_shelter.dose} units`, 'Crew limit 50 (game units)', o.b_shelter.dose / 50, o.b_shelter.dose > 50 ? 'check' : 'pass'),
      Mx('sci', 'Evidence carried in', `${ev} / 100`, `Trust ${L.trust} · risk ${L.risk}`, ev / 100, ev >= 55 ? 'pass' : 'check'),
    ];
    return finish({ o, gates, metrics, sci, cost, avail, kg,
      num: { mass: [kg, 'kg'], cost: [cost, '$'] },
      rel: (o.b_ls.id === 'dual' ? 0.4 : 0) + (o.b_tools.id === 'glove' ? 0.3 : 0.1) + (o.b_review.id === 'indep' ? 0.15 : 0) + (o.b_ops.id === 'full' ? 0.15 : 0.05),
      safe: (o.b_resv.p >= 0.15 ? 0.5 : o.b_resv.p >= 0.1 ? 0.3 : 0) + (o.b_shelter.id === 'water' ? 0.3 : 0.1) + o.b_traj.safe,
      margins: [clamp((lim - kg) / 1000), clamp((avail - cost) / 200), clamp(o.b_resv.p / 0.15)] });
  },
  events: [
    { id: 'review', chapter: 'Ch. 18', title: 'The last chance', owner: 'Kiran',
      talk: () => [['Senior scientist', 'You’re suggesting we can deliberately alter the global magnetosphere?'],
        ['Kiran', 'Not directly. We hypothesize that a localized feedback process sustains the Cascade. Near a critical transition, a carefully timed perturbation might interrupt it.', 'thinking'],
        ['Senior scientist', 'A convenient assumption.']],
      text: () => 'Naomi has called an emergency mission review. Kiran has explained the two states and Selene’s eighteen-minute interruption. The primary objective is to recover the missing measurements; any intervention needs independent review and predefined limits. How does Kiran answer?',
      options: () => [
        { id: 'honest', label: '“It would be if we claimed it was proven. We don’t. We have observations, a model, and substantial uncertainty.”', ai: true, effect: () => ({ d: { trust: 6 }, text: 'For nine hours, Kiran, Mateo, Leila and Naomi answer questions. The chairman asks its name. “Bridge,” Naomi answers. “Why?” “Every mission we’ve flown has given us one piece of the answer,” Kiran says. “This one connects them.” The project receives conditional approval.' }) },
        { id: 'sure', label: '“The model is sound. The pulse will work.”', effect: () => ({ d: { trust: -8, risk: 4 }, text: 'The board approves — and writes down every word. If the pulse fails, those words will be read back.' }) }] },
    { id: 'layout', chapter: 'Ch. 19', title: 'Every kilogram', owner: 'Leila',
      talk: () => [['Mateo', 'No.', 'serious'], ['Kiran', 'You haven’t even asked what it measures.', 'annoyed'], ['Mateo', 'I’ve asked the mass budget.', 'smirk'], ['Kiran', 'What did it say?', 'sarcastic'], ['Mateo', 'No.', 'grin'],
        ['Leila', 'Absolutely not. The return reserve is not your instrument budget.', 'stern'],
        ['Leila', 'Too long.', 'stern'], ['Mateo', 'It’s within the requirement.', 'defiant'], ['Leila', 'Then improve the requirement.', 'commanding']],
      text: () => 'Kiran wanted one more probe; the mass budget said no. Now Mateo’s first storage layout puts the radiation shelter thirty seconds further away. It meets the requirement.',
      options: () => [
        { id: 'improve', label: 'Rework the layout together', ai: true, effect: () => ({ flags: { fastShelter: true }, text: 'After two hours they settle on a design lighter than Leila’s proposal and safer than Mateo’s. (Storm dose −20 %.)' }) },
        { id: 'keep', label: 'Keep it: it’s within the requirement', effect: () => ({ text: 'The layout stands. Thirty seconds is thirty seconds — until it isn’t.' }) }] },
    { id: 'gloves', chapter: 'Ch. 19 · months later', title: 'Building the impossible', owner: 'Mateo',
      talk: () => [['Mateo', 'It sounds like something a villain puts on a spaceship.', 'sarcastic'], ['Kiran', 'Would you prefer Localized Plasma Perturbation Experiment?', 'sarcastic'], ['Mateo', 'Yes.', 'grin'],
        ['Kiran', 'Nobody will remember that.', 'playful'], ['Mateo', 'That’s because it’s an honest name.', 'laughing'],
        ['Leila', 'Understanding isn’t the same as performing when you’re exhausted, frightened, and wearing a pressure suit.', 'stern']],
      text: (S) => 'Vibration tests, thermal vacuum, fault simulations, crew training. Kiran calls the payload a Plasma Phase Disruptor. In the drills, one servicing tool cannot be used reliably in pressurized gloves.' + (S.choices.b_tools === 'std' ? ' With the standard kit, it is not the only one.' : ''),
      options: (S) => [
        { id: 'redesign', label: S.choices.b_tools === 'std' ? 'Redesign the tool interfaces for gloves and test again' : 'Redesign the interface and test again', ai: true, effect: () => ({ d: { risk: -3 }, flags: { gloveFix: true }, text: 'Mateo redesigns the interface. The team tests and retests. Gradually Bridge becomes ready to fly.' }) },
        { id: 'fly', label: 'Fly it as it is — the crew will manage', effect: () => ({ d: { risk: 5 }, text: 'The tool goes into the kit unchanged. Leila writes it into the procedures, in red.' }) }] },
    { id: 'last', chapter: 'Ch. 20 · three days before launch', title: 'The last conversation with Voss', owner: 'Naomi',
      talk: (S) => S.seats.Naomi && !(S.ops && S.ops.game) ? [['Voss', 'You’ve built an impressive program.', 'polite']] : [['Voss', 'You’ve built an impressive program.', 'polite'], ['Voss', 'I never wanted the world to suffer.', 'tired'], ['Naomi', 'Then why suppress scientific observations?', 'serious'],
        ['Naomi', 'Those are reasons to manage information responsibly, not to obstruct an investigation during a planetary emergency.', 'serious'],
        ['Naomi', 'And you told them that person was you.', 'sarcastic'], ['Voss', 'I gave them systems that worked.', 'bitter'],
        ['Naomi', 'Some did. They saved people. Thousands of your employees deserve recognition. But you used their work to justify controlling research that might have made everyone safer.', 'determined'],
        ['Voss', 'Information without infrastructure is useless.', 'sarcastic'], ['Naomi', 'Infrastructure without accountability becomes power over the people who depend on it.', 'commanding'],
        ['Naomi', 'You thought the crisis made you indispensable. It made cooperation indispensable. You just happened to own a great deal of the equipment.', 'angry'],
        ['Voss', 'And if your mission fails?', 'thinking']],
      game: { kind: 'negotiate', title: 'Hold the line', doing: 'talking with Voss',
        hint: 'Four exchanges. Answer Voss with what can be checked: anger gives him something to push against, and every concession is ground you lose. You have a few seconds each time.',
        params: () => ({ rounds: [
          { voss: 'I never wanted the world to suffer.', opts: [{ k: 'firm', t: 'Then why suppress scientific observations?' }, { k: 'angry', t: 'You profited from every day of it.' }, { k: 'concede', t: 'I believe you.' }] },
          { voss: 'I gave them systems that worked.', opts: [{ k: 'firm', t: 'Some did. They saved people. Thousands of your employees deserve recognition. But you used their work to justify controlling research that might have made everyone safer.' }, { k: 'angry', t: 'Your systems were a toll booth on the sky.' }, { k: 'concede', t: 'And we’re grateful for them.' }] },
          { voss: 'Information without infrastructure is useless.', opts: [{ k: 'firm', t: 'Infrastructure without accountability becomes power over the people who depend on it.' }, { k: 'angry', t: 'Then we’ll build our own and put you out of business.' }, { k: 'concede', t: 'Then lend us yours.' }] },
          { pre: 'We believe we have a testable hypothesis.', voss: 'That’s not an answer.', opts: [{ k: 'firm', t: 'It’s the only scientifically responsible answer.' }, { k: 'angry', t: 'It’s more than you’ve ever given anyone.' }, { k: 'concede', t: 'Fine. It will work.' }] }],
          fb: { firm: 'Voss has no answer to that.', angry: 'Voss smiles. You gave him something to push against.', concede: 'Voss takes the ground you gave him.', none: 'You hesitate. Voss fills the silence.' } }),
        result: (S, g) => g === 'good' ? { d: { trust: 6 }, text: 'Naomi never raises her voice. Every claim Voss makes, she answers with something that can be checked.' }
          : g === 'ok' ? { d: { trust: 2 }, text: 'Naomi holds most of the line. Voss notices the one place she didn’t.' }
          : { d: { trust: -4, aegis: 4 }, text: 'Voss steers the conversation. Naomi leaves having given more ground than she meant to.' } },
      text: () => 'A regulatory office: no cameras, no logos. Aegis faces investigations and resignations, but it still runs much of the tracking network. Naomi is at the door.',
      options: () => [
        { id: 'publish', label: '“Then we’ll publish what we learned. And other people will try again.”', ai: true, effect: () => ({ d: { trust: 4 }, text: 'Naomi leaves. It is the last time they speak.' }) },
        { id: 'deal', label: 'Ask for Aegis’s deep-space antennas during the window, in exchange for first look at the data', effect: () => ({ d: { aegis: 10, trust: -6, risk: -3 }, text: 'Voss agrees at once. Better coverage for the window — and Aegis back inside the mission.' }) }] },
    { id: 'go', chapter: 'Ch. 21', title: 'Launch day', owner: 'Naomi',
      game: { kind: 'poll', title: 'GO / NO-GO', doing: 'running the final poll',
        hint: 'Each station reports in turn. Ask for the data when a call sounds too easy, HOLD what is really wrong, GO the rest — before the launch window closes.',
        params: (S) => ({ grounded: S.legacy.risk >= 70 }),
        result: (S, g, v) => g === 'good' ? { d: { risk: -4, trust: 2 }, text: 'Every signature on the poll stands on real data.' } : g === 'ok' ? { text: 'The poll closes with one question left unasked.' } : { d: { risk: 6 }, text: S.legacy.risk >= 70 ? 'The board will not sign.' : 'Something went through as GO that should not have.' } },
      talk: (S) => S.legacy.risk >= 70 ? [] : [['Mateo', 'You’re doing that wrong.', 'smirk'], ['Kiran', 'I know what I’m doing.', 'annoyed'], ['Mateo', 'Then why is it upside down?', 'grin'],
        ['Leila', 'Both of you finished?', 'stern'], ['Mateo', 'Yes, Commander.', 'grin'], ['Leila', 'Good. We have a spacecraft to fly.', 'commanding'],
        ['Naomi', 'Bridge crew, final systems review complete.', 'serious'], ['Naomi', 'Everything we’re capable of making ready.', 'serious'], ['Naomi', 'Come home.', 'gentle'], ['Kiran', 'We will.', 'determined']],
      text: (S) => S.legacy.risk >= 70 ? 'The flight safety board reviews the program’s record of shortcuts and refuses to clear the crew.' : 'Final checks show one pressure sensor reading slightly off. It is probably the sensor, not the tank.',
      options: (S) => S.legacy.risk >= 70 ? [{ id: 'grounded', label: 'Accept the board’s decision', ai: true, effect: () => ({ flags: { aborted: true, abortWhy: 'The safety board grounded the crew after too many shortcuts.' }, end: true, text: 'Bridge stays on the pad.' }) }] : [
        { id: 'scrub', label: 'Scrub 24 hours and replace the sensor (+$10M)', ai: true, effect: () => ({ d: { cost: 10, risk: -5 }, text: 'It was the sensor. Bridge launches the next day.' }) },
        { id: 'fly', label: 'Fly with it', effect: () => ({ d: { risk: 8 }, text: 'Bridge launches on time with a question mark on one tank.' }) }] },
    { id: 'watch', chapter: 'Ch. 21 · São Paulo', title: 'Departure', owner: 'Naomi', cast: ['Lucas', 'Mariana'],
      talk: () => [['Lucas', 'Those are the scientists trying to fix the sky.', 'excited'], ['Mariana', 'They’re trying to understand what’s happening.', 'reassuring'],
        ['Lucas', 'Do you think they’ll do it?', 'curious'], ['Mariana', 'I hope so.', 'hopeful']],
      text: () => 'The morning of launch is clear. Millions watch the broadcast. In their apartment, Mariana Almeida and Lucas watch the enormous vehicle. Lucas’s auroral notebook is full of dates and drawings.',
      options: () => [
        { id: 'rise', label: 'Watch Bridge rise', ai: true, effect: () => ({ text: 'Engines ignite, a brilliant plume appears, and Bridge rises from Earth. Earth recedes behind them, blue oceans and clouds edged by a thin bright atmosphere. “Beautiful, isn’t it?” Mateo says. Kiran nods. “Hard to believe everything we’re doing is because of something we can’t even see.” “Most of the universe works that way,” Kiran says. Leila interrupts: “Gentlemen, sightseeing is over. We have a navigation check.”' }) }] },
    { id: 'storm', chapter: 'Ch. 22 · day four', title: 'Radiation alert', owner: 'Leila',
      talk: () => [['Leila', 'Particle flux is climbing. Everyone into the shelter. Now.', 'commanding'], ['Kiran', 'Two minutes — I’m saving the calculations.', 'worried']],
      text: (S) => `A solar storm. Shelter: ${S.choices.b_shelter === 'water' ? 'water wall' : 'improvised storage bay'}. The shelter reduces the dose; it cannot remove it.`,
      options: (S) => { const base = Math.round((S.choices.b_shelter === 'water' ? 20 : 55) * (S.legacy.flags.fastShelter ? 0.8 : 1)); return [
        { id: 'now', label: 'Shelter immediately', ai: true, effect: () => ({ d: { dose: base, evidence: -2 }, text: 'Everyone in. Kiran loses an hour of unsaved work.' + (S.legacy.flags.fastShelter ? ' Leila’s reworked layout gets them in seconds sooner.' : '') }) },
        { id: 'wait', label: 'Let Kiran finish saving first', effect: () => ({ d: { dose: Math.round(base * 1.4) }, text: 'The work is saved. The crew took more dose for it.' }) },
        ...(S.choices.b_shelter === 'bay' ? [{ id: 'abort', label: 'Abort the mission and turn for home', effect: () => ({ flags: { aborted: true, abortWhy: 'Leila aborted during the storm: the improvised shelter was not enough.' }, end: true, text: 'Bridge swings around the Moon and heads home.' }) }] : [])]; },
      timed: { role: 'Mateo', title: 'Secure the equipment', seconds: 60, reward: 'Shorter time outside the shelter (dose −8)', q: 'Which is true about the radiation shelter?',
        choices: ['It reduces exposure but does not eliminate it', 'It blocks all radiation', 'It is only needed during EVA'], answer: 0, win: { dose: -8 }, winText: 'Mateo straps everything down in one pass.' } },
    { id: 'capture', chapter: 'Ch. 23 · rendezvous', title: 'Capture', owner: 'Leila',
      talk: () => [['Mateo', 'Range decreasing.', 'serious']],
      text: () => 'Selene is alive, transmitting low-rate housekeeping. Leila guides Bridge through lunar approach, orbit insertion and rendezvous. Relative velocity has to be reduced carefully: a spacecraft cannot simply race toward an orbiting target and stop.',
      game: { kind: 'capture', title: 'Fly the capture corridor', doing: 'flying the approach',
        hint: 'Range runs left to right, closing speed bottom to top. Keep Bridge inside the green corridor and touch Selene slower than 0.05 m/s. Hold Thrust or Brake (↑ / ↓). Propellant is limited.',
        result: (S, g, v) => g === 'good' ? { d: { risk: -3 }, text: 'Contact at ' + v.toFixed(2) + ' m/s. Cameras and lidar confirm the geometry; Selene is captured through the servicing interface.' }
          : g === 'ok' ? { text: 'Contact at ' + v.toFixed(2) + ' m/s: firm, within limits. Selene is captured.' }
          : { d: { risk: 5 }, text: v == null ? 'Bridge drifts out of the approach window. Leila backs off and comes in again on the next orbit; it costs margin.' : 'Contact at ' + v.toFixed(2) + ' m/s. The capture arm holds, but one of Selene’s arrays is bent.' } },
      options: (S) => [{ id: 'eva', label: 'Prepare for the EVA', ai: true, effect: () => ({ text: S.ops.game ? '' : 'Bridge approaches slowly, verifies the geometry with cameras and lidar, and captures Selene.' }) }] },
    { id: 'eva', chapter: 'Ch. 23', title: 'Selene', owner: 'Mateo',
      game: { kind: 'eva', title: 'The spacewalk', doing: 'out on the EVA',
        hint: 'Translate along the handrails with two tethers — always one clipped. At the work site, hold Space (or the button) for each task, lock the connector key when it lines up. Shadow and standard tools slow you down. Leila can authorise two more minutes, once.',
        params: (S) => ({ port: !!S.legacy.flags.servicePort, glove: S.choices.b_tools === 'glove' || !!S.legacy.flags.gloveFix }),
        result: (S, g, v) => g === 'good' ? { d: { risk: -3 }, flags: { evaClean: true }, text: 'A clean EVA: every move tethered, every task inside the timeline.' } : g === 'ok' ? { flags: { evaClean: true }, text: 'The work gets done, with less margin than Leila likes.' } : { d: { risk: 6 }, flags: { evaRough: true }, text: v != null && v > 1 ? 'Too many untethered moves. Leila ends the EVA.' : 'The EVA clock runs out before the connection is made.' } },
      talk: () => [['Mateo', 'Primary connector’s scorched. I can’t use it.', 'frustrated'], ['Leila', 'Options, Mateo.', 'stern']],
      text: (S) => `The primary data connector is damaged. ${S.legacy.flags.servicePort ? 'Selene has a secondary service interface.' : 'Selene was built without a secondary service interface.'} Selene’s recorder holds ${Math.round((S.legacy.flags.trapped ?? 0.6) * 100)} % of its campaign data.`,
      options: (S) => [
        { id: 'secondary', label: 'Use the secondary service port', ai: !!S.legacy.flags.servicePort, disabled: !S.legacy.flags.servicePort, why: S.legacy.flags.servicePort ? '' : 'Selene has no secondary port', effect: () => ({ d: { evidence: Math.round(15 * (S.legacy.flags.trapped ?? 0.6)) }, text: 'Connected. Checksums verified on Earth by Naomi’s team. The eighteen minutes are in there.' }) },
        { id: 'improvise', label: 'Bypass the damaged connector by hand', ai: !S.legacy.flags.servicePort, effect: () => {
          const ok = (S.choices.b_tools === 'glove' || S.legacy.flags.gloveFix) && S.legacy.bond >= 30 && !(S.ops.game && S.ops.game.grade === 'bad');
          return ok ? { d: { evidence: Math.round(12 * (S.legacy.flags.trapped ?? 0.6)), risk: 5 }, text: 'Slow, careful work in pressure gloves. It holds. Most of the data come across.' }
            : { d: { risk: 10 }, flags: { seleneLost: true }, text: S.choices.b_tools !== 'glove' && !S.legacy.flags.gloveFix ? 'The standard tools can’t be worked in pressure gloves. The connection fails. Selene’s data stay out of reach.' : 'Kiran and Mateo can’t work as one out there. The connection fails.' };
        } }] },
    { id: 'node', chapter: 'Ch. 24–25', title: 'The Echo Node', owner: 'Kiran', label: 'FICTIONAL 2064 STORY PHYSICS',
      talk: () => [['Kiran', 'Two natural interruptions. Same place, both times.', 'realization'], ['Mateo', 'Then that’s where we push.', 'determined']],
      text: (S) => { const e = S.legacy.evidence; return `Kiran compares the eighteen minutes with ${S.legacy.evidence >= 45 ? 'the earlier Aegis interruption' : 'what little else exists'}. Evidence: ${e}/100. ${e >= 70 ? 'One region stands out clearly.' : e >= 45 ? 'Two regions are plausible.' : 'The data can’t tell the regions apart.'}`; },
      options: (S) => { const e = S.legacy.evidence, ok = 'abc'[S.seed % 3], tag = (k) => (e >= 70 ? (k === ok ? 'Best supported' : 'Ruled out') : e >= 45 ? (k === ok || k === 'abc'[(S.seed + 1) % 3] ? 'Plausible' : 'Ruled out') : 'Unconstrained');
        const pickAi = e >= 45 ? ok : 'a';
        return ['a', 'b', 'c'].map((k, i) => ({ id: k, label: ['Dawn-side flank of the tail', 'Central current sheet', 'Dusk-side flank of the tail'][i], sub: tag(k), ai: k === pickAi,
          effect: () => ({ flags: { targetOk: k === ok }, text: 'Leila positions the three probes.' }) })); } },
    { id: 'breath', chapter: 'Ch. 26', title: 'When Earth held its breath', owner: 'Naomi', cast: ['Lucas', 'Mariana'],
      talk: () => [['Mariana', 'Does it still frighten you?', 'reassuring'], ['Lucas', 'A little.', 'sad'], ['Mariana', 'Me too.', 'frightened']],
      text: () => 'Crimson auroras return over São Paulo. Lucas is older now; he knows the red light comes from excited atoms high in the atmosphere. On television, Bridge is near the Moon. Lucas asks whether the scientists know what they’re doing. “I think they’re trying very hard to find out,” Mariana says. At mission control Naomi aligns Helios, Sentinel, the ground stations, the probes and Bridge: the data are consistent with a developing severe Cascade episode. Kiran reports the local plasma nearing the predicted state — not yet enough to authorize the intervention. The world demands action.',
      options: () => [
        { id: 'wait', label: 'Proceed only when the scientific and engineering conditions are satisfied', ai: true, effect: () => ({ d: { trust: 5 }, text: 'Naomi refuses to repeat Voss’s mistake of presenting uncertainty as certainty. Bridge waits for the plasma.' }) },
        { id: 'promise', label: 'Tell the world the pulse will stop the Cascade', effect: () => ({ d: { trust: -10 }, text: 'The broadcast runs the promise on a loop. Now the pulse has to work.' }) }] },
    { id: 'pulse1', chapter: 'Ch. 27', title: 'First pulse', owner: 'Leila', label: 'FICTIONAL 2064 STORY PHYSICS',
      talk: () => [['Kiran', 'Local response. Only local.', 'disappointed'], ['Leila', 'And probe three just lost its star tracker.', 'pressure']],
      text: (S) => `The first pulse changes the field around the probes — and nowhere else. Probe three’s star tracker has failed. ${S.choices.b_pulses === 'p1' ? 'That was the only charge.' : 'One more charge remains in the window.'}`,
      options: (S) => [
        { id: 'gyro', label: 'Rebuild probe three’s attitude from gyros + Sun sensors, peer-reviewed', ai: true, effect: () => ({ flags: { attitude: 'gyro' }, text: 'The reconstruction is checked twice. Probe three knows where it points.' }) },
        { id: 'two', label: 'Go with two probes', effect: () => ({ flags: { attitude: 'two' }, text: 'Two probes can’t close the geometry.' }) },
        { id: 'wait', label: 'Wait for the tracker to reboot', effect: () => ({ flags: { attitude: 'wait' }, d: { risk: 4 }, text: 'The tracker reboots — after the window has closed.' }) }] },
    { id: 'pulse2', chapter: 'Ch. 28', title: 'Second pulse', owner: 'Naomi', label: 'FICTIONAL 2064 STORY PHYSICS',
      talk: () => [['Naomi', 'Every station on Earth is listening. Your call, or mine?', 'determined']],
      text: () => 'One window, one decision. Only Sentinel, Helios and the ground together can show whether anything changes beyond the probes.',
      options: (S) => { const n = S.choices.b_pulses === 'p1' ? 1 : 2; const f = S.legacy.flags;
        const res = () => { const global = n >= 2 && f.attitude === 'gyro' && f.targetOk && S.legacy.evidence >= 55;
          return global ? { flags: { pulseGlobal: true }, text: 'The repeating pattern fades. Over the verification interval Sentinel, Helios and the ground all agree: it does not come back.' }
            : { flags: { pulseGlobal: false }, text: n < 2 ? 'There is no second charge.' : f.attitude !== 'gyro' ? 'Without a closed geometry the pulse lands in the wrong place.' : !f.targetOk ? 'Local response only: the node was not where you aimed.' : 'Local response only: the evidence was too thin to aim precisely.' }; };
        return [{ id: 'authorize', label: n < 2 ? 'Authorize (no charge left)' : 'Authorize the second pulse', ai: true, disabled: n < 2, why: n < 2 ? 'Only one charge was carried' : '', effect: res },
          { id: 'hold', label: 'Hold — don’t fire', effect: () => ({ flags: { pulseGlobal: false }, text: 'The window closes. The pattern goes on.' }) }]; } },
    { id: 'return', chapter: 'Ch. 29', title: 'Home', owner: 'Leila',
      game: { kind: 'entry', title: 'Hold the entry corridor', doing: 'flying the entry corridor', params: (S) => ({ fuel: S.choices.b_resv === 'r15' ? 100 : 55 }),
        hint: (S) => 'Entry interface in 20 seconds. Keep the flight-path angle inside the green corridor, as close to −6.3° as you can: too shallow and Bridge skips off the atmosphere, too steep and the crew and heat shield take too much. Hold Shallower or Steeper (↑ / ↓). ' + (S.choices.b_resv === 'r15' ? 'The 15 % reserve leaves room to trim.' : 'The 10 % reserve leaves little propellant to trim with.'),
        result: (S, g, v) => { const hurt = S.legacy.dose > 50, a = v == null ? -6.3 : v, end = hurt ? ' Bridge lands safely, but the crew is carried out: the storm dose was too high.' : ' All three walk out.';
          return g === 'good' ? { d: { risk: -2 }, flags: { crewInjured: hurt }, text: 'Entry at ' + a.toFixed(1) + '°, dead centre. The heat shield takes it; blackout, then parachutes.' + end }
            : g === 'ok' ? { flags: { crewInjured: hurt }, text: 'Entry at ' + a.toFixed(1) + '°, near the edge of the corridor. A brutal ride, within limits.' + end }
            : { d: { risk: 4 }, flags: { crewInjured: true }, text: a < -7.4 ? 'Entry at ' + a.toFixed(1) + '°: too steep. Deceleration peaks far above plan; Bridge lands hard and Leila is hurt.' : 'Entry at ' + a.toFixed(1) + '°: too shallow. Bridge skims the atmosphere and burns its last margin to dip back in. It lands hard; Leila is hurt.' }; } },
      talk: () => [['Leila', 'Entry interface in four minutes. Blackout after that.', 'commanding']],
      text: (S) => `Return reserve: ${S.choices.b_resv === 'r15' ? '15 %' : '10 %'}. Crew dose: ${S.legacy.dose} units (limit 50).`,
      options: (S) => S.ops && S.ops.game ? [{ id: 'land', label: 'Bring them home', ai: true, effect: () => ({ text: '' }) }] : S.choices.b_resv === 'r15' ? [{ id: 'nominal', label: 'Nominal entry', ai: true, effect: () => ({ flags: { crewInjured: S.legacy.dose > 50 }, text: S.legacy.dose > 50 ? 'Bridge lands safely. The crew is carried out: the storm dose was too high.' : 'Bridge lands safely. All three walk out.' }) }] : [
        { id: 'correct', label: 'Spend the last margin on a final correction', ai: true, effect: () => ({ flags: { crewInjured: S.legacy.dose > 50 }, text: 'The corridor is perfect. The tanks are nearly dry.' }) },
        { id: 'skip', label: 'Skip it and keep the margin', effect: () => ({ flags: { crewInjured: true }, text: 'A steep entry. Bridge lands hard; Leila is hurt.' }) }] },
    { id: 'open', chapter: 'Ch. 30 · the months after', title: 'A world without fear', owner: 'Kiran', when: (S) => !!S.legacy.flags.pulseGlobal,
      game: { kind: 'anomaly', title: 'Six reports', doing: 'reviewing the public reports',
        hint: 'The open network has six reports that the Cascade is back. For each: does it appear at one station only (an artefact), arrive with the solar wind (shift the upstream trace by its travel time), or fit nothing?',
        result: (S, g) => g === 'good' ? { d: { trust: 3 }, flags: { newAnomaly: true }, text: 'Five familiar things and one that isn’t. Kiran logs it, small and open, for whoever comes next.' } : g === 'ok' ? { flags: { newAnomaly: true }, text: 'Most reports are explained. One stays on the list.' } : { d: { trust: -2 }, text: 'The review mixes artefacts with sky. Critics notice.' } },
      talk: () => [],
      text: () => 'The persistent Cascade signature has not returned. The data are released openly. Independent groups test Kiran’s model: some support it, others refine it, and several question whether the pulse caused the transition or the natural system was already close to changing state.',
      options: () => [
        { id: 'welcome', label: 'Welcome the criticism', ai: true, effect: () => ({ d: { trust: 6 }, text: 'Those are legitimate scientific questions. The evidence no longer belongs to one team or one corporation.' }) },
        { id: 'defend', label: 'Defend the result as settled', effect: () => ({ d: { trust: -8 }, text: 'The argument hardens into camps. It takes years to soften.' }) }] },
    { id: 'letter', chapter: 'Ch. 30 · one afternoon', title: 'Thank you for fixing the sky', owner: 'Kiran', when: (S) => !!S.legacy.flags.pulseGlobal,
      talk: () => [['Mateo', 'Not bad.', 'smirk'], ['Kiran', 'We didn’t really fix the sky. We interrupted one instability. Solar storms will still happen, and we don’t understand every part of the mechanism.', 'thinking'],
        ['Mateo', 'Kiran. It’s a thank-you letter from a kid.', 'laughing'], ['Kiran', 'Right.', 'happy'],
        ['Kiran', 'I thought you’d lost this.', 'curious'], ['Mateo', 'Engineers don’t lose tools.', 'proud'], ['Kiran', 'You lose tools constantly.', 'playful'], ['Mateo', 'That’s different.', 'grin'],
        ['Mateo', 'Someone has to keep you busy.', 'happy'], ['Naomi', 'The next one.', 'happy'], ['Leila', 'Then perhaps our scientist should find one.', 'smirk']],
      text: () => 'A letter from a school in São Paulo: four people beside a spacecraft, Earth wrapped in magnetic-field lines. Beneath it Lucas Almeida has written, Thank you for fixing the sky. That evening the four gather at the observatory. “We haven’t even chosen a scientific problem,” Naomi says.',
      options: () => [
        { id: 'build', label: '“All right. Let’s build something.”', ai: true, effect: () => ({ text: '“Something efficient,” Mateo says. “Something we can actually fly,” Leila adds. Naomi looks at the budget. “Something we can afford.” The laboratory fills with laughter.' }) }] },
  ],
  outcome() { return {}; },
};

export const MISSIONS = { sentinel: SENTINEL, helios: HELIOS, selene: SELENE, aegis: AEGIS, bridge: BRIDGE };
export const CAMPAIGN = ['sentinel', 'helios', 'selene', 'aegis', 'bridge'];

// ---------------------------------------------------------------- endings
export function endingFor(L, history = []) {
  const f = L.flags, why = [];
  why.push(`Evidence ${L.evidence}/100${L.evidence >= 55 ? ' — enough to aim the pulse' : ' — too thin to aim precisely'}`);
  why.push(`Trust ${L.trust}/100 · risk ${L.risk}/100 · Kiran–Mateo bond ${L.bond}/100`);
  if (f.servicePort) why.push('Selene was built with a secondary service port'); else why.push('Selene had no secondary service port');
  if (f.seleneLost) why.push('Selene’s data were never recovered');
  if (L.dose) why.push(`Crew storm dose ${L.dose} (limit 50)`);
  if (L.aegis >= 25) why.push('Aegis gained leverage over the program');
  const avg = history.length ? Math.round(history.filter((h) => h.score != null).reduce((a, h) => a + h.score, 0) / Math.max(1, history.filter((h) => h.score != null).length)) : 0;
  let e;
  if (f.aborted) e = { id: 'D', title: 'Grounded', sub: 'Bridge never reached the node.', text: [f.abortWhy || 'The mission was aborted.', 'The Echo Node stays a hypothesis. The pattern keeps returning, and the world learns to live under it: hardened grids, storm warnings, nights when nobody looks up for long.', 'The team publishes everything it has. Years later, Lucas Almeida reads it as a physics student — and starts asking the questions they never got to answer.'] };
  else if (!f.pulseGlobal) e = { id: 'C', title: 'The Sky Stays Red', sub: 'A local answer to a global problem.', text: ['Bridge comes home. The pulse moved the field around the probes, and nothing else.', 'The pattern weakens for a while, then returns. The data go public; the argument goes on.', 'Lucas grows up under a sky that is still red some nights. He studies it.'] };
  else if (f.crewInjured || f.seleneLost || L.risk >= 45) e = { id: 'B', title: 'The Price of the Sky', sub: 'It worked. It cost more than it had to.', text: ['The repeating pattern stops, and independent observations agree it does not come back.', [f.crewInjured ? 'Not everyone walks out of the capsule.' : '', f.seleneLost ? 'Selene’s records are never recovered.' : '', L.risk >= 45 ? 'The shortcuts along the way are what the inquiry remembers.' : ''].filter(Boolean).join(' '), 'Lucas writes to the crew anyway. Years later, in an open dataset, he notices a small signal that doesn’t fit.'] };
  else e = { id: 'A', title: 'The Last Field', sub: 'The ending of the book.', text: ['The repeating pattern stops. Sentinel, Helios and the ground stations agree over the whole verification interval.', 'Kiran, Mateo and Leila come home. The data are released to everyone. A letter from a boy in São Paulo is waiting.', 'Years later, Lucas Almeida, a physics student, opens one of those datasets and sees a small signal that doesn’t fit. He writes it down.'] };
  return { ...e, why, avg };
}

// ---------------------------------------------------------------- AI teammates (deterministic)
// Lowest-risk legal design: gates first, then science, safety, reliability, budget. Drawing the reserve is a last resort.
const utility = (r) => (r.score ? 5 * r.gates.filter((g) => g.status === 'pass').length - 100 * r.red + 2 * r.score.science + r.score.reliability + 2 * r.score.safety + 0.5 * r.score.budget - (r.o && r.o.n_res && r.o.n_res.id === 'draw' ? 30 : 0) : 0);
export function botDesign(m, choices, roles, L, mods = {}) {
  const ds = m.decisions.filter((d) => roles.includes(d.role)); if (!ds.length) return { ...choices };
  const U = (c) => utility(m.evaluate(c, L, mods));
  const descend = (c0, hold) => { const c = { ...c0 }; for (let pass = 0; pass < 2; pass++) for (const d of ds) { if (pass === 0 && d.id === hold) continue;
    let best = c[d.id], bu = -Infinity; for (const o of d.options) { const u = U({ ...c, [d.id]: o.id }); if (u > bu + 1e-9) { bu = u; best = o.id; } } c[d.id] = best; } return c; };
  // Feasibility-first start: each AI decision greedily takes the option with the fewest red gates, then the lowest cost.
  const cheap = { ...choices };
  for (let pass = 0; pass < 3; pass++) for (const d of ds) { let bo = cheap[d.id], bk = Infinity; for (const o of d.options) { const r = m.evaluate({ ...cheap, [d.id]: o.id }, L, mods), k = r.red * 1e9 + (r.cost || 0); if (k < bk - 1e-9) { bk = k; bo = o.id; } } cheap[d.id] = bo; }
  const starts = [choices, { ...choices, ...Object.fromEntries(ds.map((d) => [d.id, d.def])) }, cheap];
  let best = null, bu = -Infinity;
  for (const s0 of starts) { const c = descend(s0), u = U(c); if (u > bu + 1e-9) { bu = u; best = c; } }
  for (const d of ds) for (const o of d.options) { if (o.id === best[d.id]) continue; const c = descend({ ...best, [d.id]: o.id }, d.id), u = U(c); if (u > bu + 1e-9) { bu = u; best = c; } }
  return best;
}

// ---------------------------------------------------------------- shared state + reducer
const clone = (x) => JSON.parse(JSON.stringify(x));
const LEG0 = { evidence: 10, trust: 50, risk: 0, bond: 60, aegis: 0, dose: 0, flags: {} };
export function newState(seed = 1) {
  return { v: 0, seed: seed >>> 0, phase: 'lobby', mi: 0, players: {}, seats: { Kiran: null, Mateo: null, Leila: null, Naomi: null },
    choices: {}, ready: {}, act: {}, mods: { sci: 1, cost: 0 }, ops: null, report: null, ending: null, legacy: clone(LEG0), history: [], log: [], last: '', paused: false, retries: 0, checkpoint: null };
}
export const mission = (S) => MISSIONS[CAMPAIGN[S.mi]];
export const evaluate = (S) => mission(S).evaluate(S.choices, S.legacy, S.mods);
export const aiRoles = (S) => ROLES.filter((r) => !S.seats[r]);
export const curEvent = (S) => (S.ops ? mission(S).events[S.ops.ei] : null);
export const nextEventIdx = (S) => { const ev = mission(S).events; for (let i = S.ops.ei + 1; i < ev.length; i++) if (!ev[i].when || ev[i].when(S)) return i; return -1; };
// Mateo's hands-on build (Action Lab workbench): qualified craft must match the current plan.
export const CRAFT_KEYS = ['m_arr', 'm_bat', 'm_proc', 'm_com', 'm_rec', 'm_pd', 'k_obj', 'k_time', 'k_cad', 'l_lv', 'l_orb'];
export const craftSig = (S) => { const w = mission(S).workbench; return (Array.isArray(w) ? w : CRAFT_KEYS).map((k) => S.choices[k] || '').join('|'); };
export const craftPending = (S) => { const m = mission(S); if (!m.workbench || !S.seats.Mateo) return false; const c = S.act && S.act.craft; return !(c && c.ok && c.sig === craftSig(S)); };
export const eventOptions = (S) => { const e = curEvent(S); return e ? e.options(S, evaluate(S)) : []; };
const defaults = (m) => Object.fromEntries(m.decisions.map((d) => [d.id, d.def]));
const log = (S, who, text) => { S.log.push({ who, text }); if (S.log.length > 40) S.log.shift(); };
function applyD(S, d = {}, mods = {}, flags = {}) {
  const L = S.legacy;
  for (const k of ['evidence', 'trust', 'risk', 'bond', 'aegis']) if (d[k]) L[k] = Math.round(clamp(L[k] + d[k], 0, 100));
  if (d.dose) L.dose = Math.max(0, L.dose + d.dose);
  if (d.cost) S.mods.cost = Math.round((S.mods.cost + d.cost) * 1000) / 1000;
  if (d.sci) S.mods.sci *= d.sci;
  for (const k in mods) S.mods[k] = (S.mods[k] || 0) + mods[k];
  Object.assign(L.flags, flags);
}
function diffText(m, before, after, label) {
  const parts = [];
  for (const k in after.num) { const a = after.num[k], b = before.num[k]; if (!b) continue; const dv = a[0] - b[0]; if (Math.abs(dv) < 0.005) continue;
    parts.push(a[1] === '$' ? `cost ${dv > 0 ? '+' : '−'}${money(Math.abs(dv))}` : `${sgn(dv, Math.abs(dv) < 10 ? 1 : 0)} ${a[1]}`); }
  const fixed = before.gates.filter((g, i) => g.status === 'fail' && after.gates[i] && after.gates[i].status !== 'fail').map((g) => g.label);
  const broke = after.gates.filter((g, i) => g.status === 'fail' && before.gates[i] && before.gates[i].status !== 'fail').map((g) => g.label);
  return `${label}: ${parts.join(' · ') || 'no numeric change'}${fixed.length ? ` — fixes ${fixed.join(', ')}` : ''}${broke.length ? ` — breaks ${broke.join(', ')}` : ''}.`;
}
function rebot(S) {
  const m = mission(S), ai = aiRoles(S); if (!ai.length || !m.decisions.length) return;
  S.choices = botDesign(m, S.choices, ai, S.legacy, S.mods);
  const r = m.evaluate(S.choices, S.legacy, S.mods);
  if (r.red) { const owners = [...new Set(r.gates.filter((g) => g.status === 'fail').flatMap(() => ROLES.filter((x) => !ai.includes(x))))];
    S.aiNote = `AI teammates can’t clear ${r.gates.filter((g) => g.status === 'fail').map((g) => g.label).join(', ')} with their own choices — ${owners.join(' / ') || 'a human role'} needs to change something.`; }
  else S.aiNote = '';
}
function enterEvent(S) {
  const e = curEvent(S); if (!e) return;
  S.ops.chosen = null; S.ops.timed = null; S.ops.game = null; S.ops.enterText = '';
  if (e.enter) { const x = e.enter(S, evaluate(S)) || {}; applyD(S, x.d, x.mods, x.flags); S.ops.enterText = x.text || ''; }
}
function toBrief(S) { S.phase = 'brief'; S.ops = null; S.report = null; S.act = {}; S.mods = { sci: 1, cost: 0 }; S.ready = {}; S.choices = defaults(mission(S)); const cp = clone(S); delete cp.checkpoint; cp.players = {}; S.checkpoint = cp; }
function finishMission(S) {
  const m = mission(S), r = m.story ? null : evaluate(S), before = clone(S.legacy);
  const out = m.outcome(r, S) || {};
  applyD(S, out, {}, out.flags || {});
  if (S.mods.cost > 0 && r && r.cost > r.avail) applyD(S, { trust: -4 });
  S.report = { id: m.id, name: m.name, score: r ? r.score : null, metrics: r ? r.metrics : [], gates: r ? r.gates : [], results: S.ops.results, before, after: clone(S.legacy), cost: r ? r.cost : null, avail: r ? r.avail : null };
  S.history.push({ id: m.id, name: m.name, score: r ? r.score.total : null });
  S.phase = 'report';
}
// actor: { id, role, host, system }
export function reduce(S0, cmd, actor = {}) {
  const S = clone(S0), m = mission(S), role = actor.role, t = cmd.type;
  const err = (e) => ({ S: S0, err: e });
  const human = (r) => !!S.seats[r];
  const owns = (r) => (role === r && human(r)) || (actor.system && !human(r));
  switch (t) {
    case 'JOIN': S.players[actor.id] = { name: String(cmd.name || 'Player').slice(0, 20) }; log(S, 'Room', `${S.players[actor.id].name} joined.`); break;
    case 'LEAVE': for (const r of ROLES) if (S.seats[r] === actor.id) { S.seats[r] = null; log(S, 'Room', `${r} is now an AI teammate.`); } delete S.players[actor.id]; rebot(S); break;
    case 'CLAIM': { if (!ROLES.includes(cmd.role)) return err('Unknown role'); if (S.seats[cmd.role] && S.seats[cmd.role] !== actor.id) return err(`${cmd.role} is taken`);
      for (const r of ROLES) if (S.seats[r] === actor.id) S.seats[r] = null; S.seats[cmd.role] = actor.id; S.ready[cmd.role] = false; if (!cmd.quiet) log(S, 'Room', `${(S.players[actor.id] || {}).name || 'A player'} plays ${cmd.role}.`); rebot(S); break; }
    case 'RELEASE': for (const r of ROLES) if (S.seats[r] === actor.id) { S.seats[r] = null; log(S, 'Room', `${r} handed to an AI teammate.`); } rebot(S); break;
    case 'START': if (S.phase !== 'lobby') return err('Already started'); S.mi = 0; S.legacy = clone(LEG0); S.history = []; toBrief(S); break;
    case 'BEGIN': if (S.phase !== 'brief') return err('Not in briefing');
      if (!m.decisions.length) { S.phase = 'ops'; S.ops = { ei: 0, results: [] }; enterEvent(S); break; }
      S.phase = 'design'; rebot(S); break;
    case 'SET': { if (S.phase !== 'design') return err('Not in design'); const d = m.decisions.find((x) => x.id === cmd.d); if (!d) return err('Unknown decision');
      if (!owns(d.role)) return err(`Only ${d.role} can change this`); const o = d.options.find((x) => x.id === cmd.o); if (!o) return err('Unknown option');
      const before = m.evaluate(S.choices, S.legacy, S.mods); S.choices[d.id] = o.id; S.ready[d.role] = false;
      S.last = diffText(m, before, m.evaluate(S.choices, S.legacy, S.mods), `${d.role}: ${o.label}`); const prev = { ...S.choices }; rebot(S);
      const moved = m.decisions.filter((x) => prev[x.id] !== S.choices[x.id]).map((x) => `${x.role} → ${x.options.find((y) => y.id === S.choices[x.id]).label}`);
      if (moved.length) S.last += ` AI teammates adjusted: ${moved.join('; ')}.`; log(S, d.role, S.last); break; }
    case 'AUTO': { if (S.phase !== 'design' || !human(role) || role !== actor.role) return err('No role'); const before = evaluate(S);
      S.choices = botDesign(m, S.choices, [role], S.legacy, S.mods); S.last = diffText(m, before, evaluate(S), `${role} took the AI suggestion`); log(S, role, S.last); break; }
    case 'READY': if (!human(role)) return err('No role'); S.ready[role] = !!cmd.v; break;
    case 'ACT': { if (S.phase !== 'design') return err('Not in design'); const own = { craft: 'Mateo' }[cmd.k]; if (!own) return err('Unknown artifact'); if (!owns(own)) return err(`Only ${own} can do this`);
      let data; try { data = JSON.parse(JSON.stringify(cmd.data || {})); } catch (e) { return err('Bad data'); } if (JSON.stringify(data).length > 4000) return err('Too large');
      const was = S.act && S.act[cmd.k] && S.act[cmd.k].ok; S.act = S.act || {}; S.act[cmd.k] = data;
      if (data.ok && !was) log(S, own, `Spacecraft qualified on the workbench${data.summary ? ': ' + data.summary : ''}.`); break; }
    case 'GO': { if (S.phase !== 'design') return err('Not in design'); if (!owns('Naomi')) return err('Only Naomi authorizes launch');
      const r = evaluate(S); if (r.red) return err('Red gates must be fixed first');
      if (craftPending(S)) return err('Mateo has not qualified the spacecraft on the workbench');
      const waiting = ROLES.filter((x) => x !== 'Naomi' && human(x) && !S.ready[x]); if (waiting.length) return err(`Waiting for ${waiting.join(', ')}`);
      S.phase = 'ops'; S.ops = { ei: 0, results: [] }; log(S, 'Naomi', `Go for ${m.name}.`); enterEvent(S); break; }
    case 'CHOOSE': { if (S.phase !== 'ops') return err('No event'); const e = curEvent(S); if (!e || e.id !== cmd.e || S.ops.chosen) return err('Stale');
      if (!owns(e.owner)) return err(`Only ${e.owner} decides this`); if (e.game && human(e.owner) && !S.ops.game) return err('Play it first'); const o = eventOptions(S).find((x) => x.id === cmd.o); if (!o || o.disabled) return err('Not available');
      const x = o.effect(S, evaluate(S)) || {}; if (x.set) Object.assign(S.choices, x.set); applyD(S, x.d, x.mods, x.flags);
      S.ops.chosen = { o: o.id, label: o.label, text: x.text || '', end: !!x.end, by: human(e.owner) ? 'human' : 'ai' };
      S.ops.results.push({ e: e.id, title: e.title, label: o.label, text: x.text || '' }); log(S, e.owner, `${e.title}: ${o.label}`); break; }
    case 'GAME': { if (S.phase !== 'ops') return err('No event'); const e = curEvent(S); if (!e || !e.game || e.id !== cmd.e || S.ops.game || S.ops.chosen) return err('Stale');
      if (!(role === e.owner && human(role))) return err('Only ' + e.owner + ' plays this');
      const g = ['good', 'ok', 'bad', 'glitch'].includes(cmd.grade) ? cmd.grade : 'bad', v = cmd.v == null || !Number.isFinite(+cmd.v) ? null : Math.round(+cmd.v * 1000) / 1000;
      const x = e.game.result(S, g, v) || {}; applyD(S, x.d, x.mods, x.flags); S.ops.game = { grade: g, text: x.text || '' };
      S.ops.results.push({ e: e.id, title: e.game.title, label: g === 'good' ? 'Clean' : g === 'ok' ? 'Within limits' : 'Off target', text: x.text || '' }); log(S, role, e.game.title + ': ' + g); break; }
    case 'TACCEPT': { const e = curEvent(S); if (!e || !e.timed || e.id !== cmd.e || S.ops.timed) return err('Stale'); if (!(role === e.timed.role && human(role))) return err(`Only ${e.timed.role} can take this`);
      S.ops.timed = { e: e.id, left: e.timed.seconds, total: e.timed.seconds, state: 'running' }; break; }
    case 'TANSWER': { const e = curEvent(S), T = S.ops && S.ops.timed; if (!T || T.state !== 'running' || T.e !== (e && e.id)) return err('Stale'); if (!(role === e.timed.role && human(role))) return err('Not yours');
      if (cmd.i === e.timed.answer) { T.state = 'won'; applyD(S, e.timed.win, e.timed.mods, e.timed.flags); S.ops.results.push({ e: e.id, title: e.timed.title, label: 'Bonus earned', text: e.timed.winText }); log(S, role, `Bonus: ${e.timed.title}`); }
      else { T.state = 'wrong'; } break; }
    case 'TICK': { if (!actor.system) return err('System only'); const T = S.ops && S.ops.timed; if (!T || T.state !== 'running' || S.paused) return { S: S0 }; T.left -= 1; if (T.left <= 0) { T.left = 0; T.state = 'expired'; } break; }
    case 'NEXT': { if (S.phase !== 'ops' || !S.ops.chosen || cmd.e !== curEvent(S).id) return err('Stale');
      const ni = nextEventIdx(S); if (S.ops.chosen.end || ni < 0) { finishMission(S); break; }
      S.ops.ei = ni; enterEvent(S); break; }
    case 'CONTINUE': if (S.phase !== 'report') return err('Stale');
      if (S.mi + 1 >= CAMPAIGN.length || S.legacy.flags.aborted) { S.phase = 'ending'; S.ending = endingFor(S.legacy, S.history); break; }
      S.mi += 1; toBrief(S); break;
    case 'RETRY': { if (!S.checkpoint) return err('No checkpoint'); const keep = { players: S.players, seats: S.seats, log: S.log, retries: S.retries + 1, v: S.v };
      const cp = clone(S.checkpoint); Object.assign(S, cp, keep); S.checkpoint = cp; S.checkpoint.players = {}; log(S, 'Room', `Retrying ${mission(S).name} from the checkpoint.`); break; }
    case 'PAUSE': if (!actor.host) return err('Host only'); S.paused = !!cmd.v; break;
    case 'RESET': if (!actor.host) return err('Host only'); { const n = newState(S.seed + 7); n.players = S.players; n.seats = S.seats; n.v = S.v; return { S: { ...n, v: S.v + 1 } }; }
    default: return err('Unknown command');
  }
  S.v += 1;
  return { S };
}
// What the host's AI should do next (or null). Deterministic.
export function aiStep(S) {
  if (S.paused) return null;
  if (S.phase === 'design') { const r = evaluate(S); if (!S.seats.Naomi && !r.red && !craftPending(S) && ROLES.every((x) => !S.seats[x] || S.ready[x])) return { type: 'GO' }; return null; }
  if (S.phase === 'ops') { const e = curEvent(S); if (!e || S.ops.chosen || S.seats[e.owner]) return null; const opts = eventOptions(S).filter((o) => !o.disabled); const o = opts.find((x) => x.ai) || opts[0]; return o ? { type: 'CHOOSE', e: e.id, o: o.id } : null; }
  return null;
}
// Strip host-only data before broadcasting.
export const publicState = (S) => { const p = { ...S }; delete p.checkpoint; return p; };
