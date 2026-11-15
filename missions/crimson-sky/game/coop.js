// The Crimson Sky — co-op story (lockstep). Every screen runs the same story engine. The host's browser orders
// every player's input and tells the others on which tick it happens, so all screens play exactly the same scene.
// Who acts follows the story: the character on screen, the character who is speaking, or the minigame's owner.
// Reconnect: every frame says which tick range it covers (p..n); a screen that sees a gap asks the host for the missing
// events ({k:'sync', from}) and catches up, so a dropped connection or a reloaded page rejoins the same scene.
import { bgTicker } from './bg-timer.js';
export { bgTicker };
export const SEATS = ['Kiran', 'Mateo', 'Leila', 'Naomi'];
// Lucas has no seat: Naomi's player walks him (Naomi is not in the story until Chapter Three).
export const AVATAR = { kiran: 'Kiran', mateo: 'Mateo', lucas: 'Naomi', lucasAdult: 'Naomi' };
export const MG_OWNER = { pattern: 'Kiran', diagnose: 'Mateo', front: 'Leila', regions: 'Leila', trim: 'Naomi', epi: 'Naomi' };
const KINDS = { press: 1, release: 1, A: 1, mg: 1, help: 1, run: 1, relAll: 1, skip: 1, cineA: 1, start: 1, epilogue: 1, cineEnd: 1 };

export function ownerOf(c, seats, hostId) {
  if (!c || !c.started || c.cine) return { id: hostId, seat: null };
  const av = AVATAR[c.avatar] || 'Kiran';
  const want = c.card ? av : c.who ? (SEATS.includes(c.who) ? c.who : av) : c.mg ? (MG_OWNER[c.mg] || av) : av;
  for (const s of [want, av]) if (seats[s]) return { id: seats[s], seat: s };
  return { id: hostId, seat: want };
}

function clean(ev) {
  if (!ev || typeof ev !== 'object' || !KINDS[ev.k]) return null;
  const o = { k: ev.k };
  if (ev.d != null) o.d = Math.max(0, Math.min(3, ev.d | 0));
  if (typeof ev.a === 'string') o.a = ev.a.slice(0, 12);
  if (typeof ev.v === 'number' && Number.isFinite(ev.v)) o.v = ev.v; else if (typeof ev.v === 'boolean') o.v = ev.v;
  if (ev.ch != null) o.ch = Math.max(0, Math.min(3, ev.ch | 0));
  return o;
}

export function createCoop({ game, host, me, hostId, send, sendTo, broadcast, seats, names, onApply, onCtl, onNudge }) {
  let sentN = 0, got = 0, syncAt = -1e9; const hist = [];
  let n = 0, target = 0, raf = 0, busy = false, paused = false, dead = false, acc = 0, last = performance.now(), lastOwner, ctlKey = '';
  const pending = [], evq = new Map();
  const mc = new MessageChannel(); let flushRes = null;
  mc.port1.onmessage = () => { const r = flushRes; flushRes = null; if (r) r(); };
  // A macrotask between ticks lets every awaiting story script settle before the next tick, the same on every screen.
  const flush = () => new Promise((r) => { flushRes = r; mc.port2.postMessage(0); });
  const owner = () => ownerOf(game.control(), seats() || {}, hostId);
  function apply(ev) { if (ev.k === 'cineEnd' || ev.k === 'epilogue') onApply(ev); if (ev.k !== 'cineEnd') game.applyInput(ev); }
  function take(ev, id) {
    ev = clean(ev); if (!ev) return;
    if (ev.k === 'epilogue') { paused = false; pending.push(ev); return; }
    if (paused) return;
    if (ev.k === 'cineEnd' || ev.k === 'start' || ev.k === 'relAll') { if (id === hostId) pending.push(ev); return; }
    if (owner().id === id) pending.push(ev);
  }
  function dispatch(ev) { if (host) take(ev, me); else send({ k: 'in', ev }); }
  let moveT = 0, lastMove = null, lastSent = '';
  function input(ev) {
    if (dead || !ev) return;
    if (ev.k === 'epilogue') { dispatch(ev); return; }
    if (ev.k === 'cineEnd') { if (host) take(ev, me); return; }
    if (paused) return;
    if (owner().id !== me) { if (ev.k === 'A' || ev.k === 'press' || ev.k === 'help' || ev.k === 'skip' || ev.k === 'cineA' || (ev.k === 'mg' && ev.a !== 'set' && ev.a !== 'hover')) onNudge && onNudge(); return; }
    if (ev.k === 'mg' && (ev.a === 'set' || ev.a === 'hover')) {
      const key = ev.a + ':' + ev.v; if (key === lastSent) return;
      lastMove = ev; if (!moveT) moveT = setTimeout(() => { moveT = 0; lastSent = lastMove.a + ':' + lastMove.v; dispatch(lastMove); }, 45);
      return;
    }
    if (moveT) { clearTimeout(moveT); moveT = 0; lastSent = lastMove.a + ':' + lastMove.v; dispatch(lastMove); }
    dispatch(ev);
  }
  function ctlCheck() {
    const o = owner(), nm = names() || {}, k = o.id + '|' + o.seat;
    if (k === ctlKey) return; ctlKey = k;
    onCtl && onCtl({ seat: o.seat, name: nm[o.id] || 'Player', mine: o.id === me });
  }
  // rAF drives the clock; a slow timer keeps it going while the tab is hidden (rAF stops there).
  async function pumpHost(now, fromTimer) {
    if (dead) return; if (!fromTimer) raf = requestAnimationFrame(pumpHost);
    const hid = document.hidden;
    acc += Math.min(hid ? 1 : 0.1, Math.max(0, (now - last) / 1000)); last = now;
    if (busy) return;
    if (paused) { acc = 0; return; }
    let k = Math.floor(acc * 60 + 1e-6); const kmax = hid ? 60 : 6; if (k > kmax) { k = kmax; acc = 0; } else acc -= k / 60;
    if (!k) return;
    busy = true; const log = [];
    try {
      for (let i = 0; i < k && !dead; i++) {
        const o = owner().id;
        if (o !== lastOwner) { if (lastOwner !== undefined) pending.unshift({ k: 'relAll' }); lastOwner = o; }
        if (pending.length) for (const e of pending.splice(0)) { log.push([n, e]); apply(e); }
        game.tick1(); n++; await flush();
      }
      broadcast({ k: 'f', p: sentN, n, ev: log }); sentN = n; for (const x of log) hist.push(x);
      game.render(); ctlCheck();
    } catch (e) { console.error(e); } finally { busy = false; }
  }
  async function pumpClient(now, fromTimer) {
    if (dead) return; if (!fromTimer) raf = requestAnimationFrame(pumpClient);
    if (busy || paused) return;
    let k = target - n; if (k <= 0) { game.render(); return; }
    k = k > 3000 ? Math.min(k, 900) : k > 30 || document.hidden ? Math.min(k, 120) : Math.min(k, 3);
    busy = true;
    try {
      for (let i = 0; i < k && !dead; i++) { const evs = evq.get(n); if (evs) { evq.delete(n); evs.forEach(apply); } game.tick1(); n++; await flush(); }
      game.render(); ctlCheck();
    } catch (e) { console.error(e); } finally { busy = false; }
  }
  game.lockstep(input);
  raf = requestAnimationFrame(host ? pumpHost : pumpClient);
  const bgStop = bgTicker(() => { if (document.hidden) (host ? pumpHost : pumpClient)(performance.now(), true); }, 250);
  function resync() { if (host || dead) return; syncAt = performance.now(); send({ k: 'sync', from: got }); }
  function catchUp(id, from) { from = Math.max(0, from | 0); if (sendTo) sendTo(id, { k: 'f', p: from, n: sentN, ev: hist.filter((x) => x[0] >= from) }); }
  if (!host) setTimeout(resync, 0);
  return {
    input,
    onMsg(id, m) {
      if (!m || dead) return;
      if (host) { if (m.k === 'in' && id) take(m.ev, String(id)); else if (m.k === 'sync' && id) catchUp(String(id), m.from); return; }
      if (m.k === 'f' && Number.isFinite(m.n)) {
        const p = Number.isFinite(m.p) ? m.p : got;
        if (p > got) { if (performance.now() - syncAt > 1500) resync(); return; }
        (m.ev || []).forEach((x) => { if (!Array.isArray(x) || !(x[0] >= got)) return; const e = clean(x[1]); if (!e) return; const q = evq.get(x[0]); if (q) q.push(e); else evq.set(x[0], [e]); });
        if (m.n > got) got = m.n; if (got > target) target = got;
        if (paused && m.ev && m.ev.some((x) => x && x[1] && x[1].k === 'epilogue')) paused = false;
      }
    },
    begin() { if (host) take({ k: 'start', ch: 0 }, me); },
    setPaused(v) { paused = !!v; if (paused) acc = 0; },
    isHost: () => host,
    resync,
    behind: () => (host ? 0 : target - n),
    destroy() { dead = true; cancelAnimationFrame(raf); bgStop(); clearTimeout(moveT); game.lockstep(null); try { mc.port1.close(); } catch (e) { /* ignore */ } },
  };
}
