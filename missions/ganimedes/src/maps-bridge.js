/* Ganymede ↔ MAPS selector bridge (same messages Luna's host accepts for external campaigns).
   Host opens: ?from=maps&lang=es&session=<id>&name=<name>. API: GANY_MAPS.ready() · exit() · finish(r) · inHost · lang · session
   finish(r): r = {outcome:'complete'|'minimum'|'degraded'|'lost', score:0..1000, stars, decisions:[], causes:[], crew:[{name,role,controller}]} */
(function(){const QS=new URLSearchParams(location.search),inHost=window.parent!==window,session=QS.get('session')||'local-'+Date.now().toString(36);let L=QS.get('lang');L=['es','en','pt'].includes(L)?L:'en';let n=0;
const fromMaps=QS.get('from')==='maps';
const send=m=>{if(inHost&&fromMaps)window.parent.postMessage(m,location.origin)};
window.GANY_MAPS={inHost,fromMaps,session,lang:L,playerName:QS.get('name')||'',
  ready(){send({type:'maps:ready',campaignId:'ganimedes',sessionId:session})},
  exit(){send({type:'maps:exit',campaignId:'ganimedes',sessionId:session})},
  finish(r){r=r||{};n++;const msg={type:'maps:mission',version:1,campaignId:'ganimedes',mision:'ganimedes',sessionId:session,eventId:session+':finish-'+n,revision:n,idioma:L,outcome:r.outcome||'complete',
    score:{value:Math.max(0,Math.min(1000,Math.round(r.score||0))),max:1000,scheme:'ganymede-v1'},estrellas:r.stars||0,metrics:r.metrics||[],decisions:r.decisions||[],causes:r.causes||[],crew:r.crew||[],at:new Date().toISOString()};
    try{localStorage.setItem('maps:mision:ganimedes:last',JSON.stringify(msg))}catch(_){}window.dispatchEvent(new CustomEvent('maps:mission',{detail:msg}));send(msg);return msg}};})();
