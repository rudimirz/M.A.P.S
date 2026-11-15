// The Crimson Sky — rooms. Host-authoritative: the host's browser runs the engine; other screens only send commands.
// Different devices: WebRTC data channels through the public PeerJS broker. ICE: Google STUN plus the PeerJS public TURN relay
// (for networks where a direct link fails). A team TURN server can be added without code changes:
//   localStorage.setItem('tcs-turn', JSON.stringify({ urls: 'turn:turn.example.org:3478', username: 'u', credential: 'p' }))
// Same device: BroadcastChannel between tabs/windows (also the fallback when the broker is unreachable).
// Messages are plain JSON data; no code is ever sent or executed.
const PEERJS = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'tlf-mlab-';
const ICE = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
];
function peerOpts() {
  let extra = [];
  try { const x = JSON.parse(localStorage.getItem('tcs-turn') || 'null'); extra = (Array.isArray(x) ? x : x ? [x] : []).filter((s) => s && s.urls); } catch (e) { /* none */ }
  return { debug: 0, config: { iceServers: [...extra, ...ICE] } };
}
let loading = null;
function loadPeer() {
  if (window.Peer) return Promise.resolve(window.Peer);
  if (!loading) loading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = PEERJS; s.onload = () => (window.Peer ? res(window.Peer) : rej(new Error('PeerJS missing'))); s.onerror = () => { loading = null; rej(new Error('Could not load PeerJS')); }; document.head.appendChild(s); });
  return loading;
}
export const makeCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const FRIENDLY = {
  'peer-unavailable': 'room not found — check the code and that the host still has the room open',
  'room not found': 'room not found — check the code and that the host still has the room open',
  network: 'could not reach the room server', 'server-error': 'could not reach the room server', 'socket-error': 'could not reach the room server',
  'socket-closed': 'lost the room server', 'broker timeout': 'the room server did not answer', 'Could not load PeerJS': 'could not load the online module (offline?)',
  'unavailable-id': 'that room code is already in use — open a new room', 'browser-incompatible': 'this browser cannot open online rooms',
  webrtc: 'the direct connection failed (a strict network may block it)',
};
export const errText = (e) => { const k = String((e && (e.type || e.message)) || e); return FRIENDLY[k] || k; };
// A data channel whose ICE link fails may never fire 'close'; close it ourselves so both sides notice.
function watchIce(conn, kill) {
  let t = 0;
  conn.on('iceStateChanged', (st) => { clearTimeout(t); if (st === 'failed' || st === 'closed') kill(); else if (st === 'disconnected') t = setTimeout(kill, 8000); });
}

export async function openHost(code, onMsg) {
  const links = new Map();
  const bc = new BroadcastChannel(PREFIX + code);
  bc.onmessage = (e) => { const m = e.data || {}; if (m.to !== 'host' || !m.from) return; const id = String(m.from); if (!links.has(id)) links.set(id, (x) => bc.postMessage({ ...x, to: id })); onMsg(id, m); };
  let peer = null, online = false, error = '';
  try {
    const Peer = await loadPeer();
    peer = await new Promise((res, rej) => { const p = new Peer(PREFIX + code, peerOpts()); const t = setTimeout(() => rej(new Error('broker timeout')), 9000);
      p.on('open', () => { clearTimeout(t); res(p); }); p.on('error', (e) => { clearTimeout(t); rej(e); }); });
    online = true;
    peer.on('connection', (conn) => {
      let id = null, gone = false;
      const bye = () => { if (gone) return; gone = true; if (id) { links.delete(id); onMsg(id, { t: 'bye' }); } };
      conn.on('data', (m) => { if (!m || typeof m !== 'object') return; if (!id && m.from) { id = String(m.from); links.set(id, (x) => { try { if (conn.open) conn.send(x); } catch (e) { /* closed */ } }); } if (id) onMsg(id, m); });
      conn.on('close', bye); conn.on('error', bye);
      watchIce(conn, () => { try { conn.close(); } catch (e) { /* ignore */ } bye(); });
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* ignore */ } });
  } catch (e) { error = errText(e); }
  return { online, error, send: (id, m) => { const f = links.get(id); if (f) f(m); }, broadcast: (m) => links.forEach((f) => f(m)), close: () => { try { bc.close(); } catch (e) { /* ignore */ } if (peer) peer.destroy(); } };
}

export async function joinRoom(code, clientId, onMsg, onClose) {
  code = String(code || '').trim().toUpperCase();
  const bc = new BroadcastChannel(PREFIX + code);
  const local = await new Promise((res) => { const t = setTimeout(() => res(false), 800);
    bc.onmessage = (e) => { const m = e.data || {}; if (m.to === clientId) { clearTimeout(t); res(true); onMsg(m); } };
    bc.postMessage({ t: 'ping', from: clientId, to: 'host' }); });
  if (local) { bc.onmessage = (e) => { const m = e.data || {}; if (m.to === clientId) onMsg(m); }; return { mode: 'local', send: (m) => bc.postMessage({ ...m, from: clientId, to: 'host' }), close: () => bc.close() }; }
  bc.close();
  const Peer = await loadPeer();
  const peer = await new Promise((res, rej) => { const p = new Peer(undefined, peerOpts()); const t = setTimeout(() => rej(new Error('broker timeout')), 9000); p.on('open', () => { clearTimeout(t); res(p); }); p.on('error', (e) => { clearTimeout(t); rej(e); }); });
  const conn = peer.connect(PREFIX + code, { reliable: true });
  try {
    await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('room not found')), 12000);
      conn.on('open', () => { clearTimeout(t); res(); }); conn.on('error', (e) => { clearTimeout(t); rej(e); }); peer.on('error', (e) => { clearTimeout(t); rej(e); }); });
  } catch (e) { try { peer.destroy(); } catch (x) { /* ignore */ } throw e; }
  let ended = false;
  const lost = () => { if (ended) return; ended = true; try { peer.destroy(); } catch (e) { /* ignore */ } if (onClose) onClose(); };
  conn.on('data', (m) => onMsg(m));
  conn.on('close', lost); conn.on('error', lost);
  watchIce(conn, lost);
  return { mode: 'online', send: (m) => { try { if (conn.open) conn.send({ ...m, from: clientId }); } catch (e) { /* closed */ } }, close: () => { ended = true; peer.destroy(); } };
}
