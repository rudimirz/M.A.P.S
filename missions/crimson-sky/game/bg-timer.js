// The Crimson Sky — a timer that keeps running in a hidden tab.
// Browsers throttle page timers in background tabs (Chrome: about once a minute after five minutes hidden);
// a dedicated worker's timer is not throttled that way, so the host's story and AI keep their pace.
export function bgTicker(fn, ms) {
  let w = null, i = 0;
  try {
    w = new Worker(URL.createObjectURL(new Blob(['setInterval(function () { postMessage(0); }, ' + (ms | 0) + ');'], { type: 'text/javascript' })));
    w.onmessage = () => fn();
  } catch (e) { w = null; i = setInterval(fn, ms); }
  return () => { if (w) w.terminate(); if (i) clearInterval(i); };
}
