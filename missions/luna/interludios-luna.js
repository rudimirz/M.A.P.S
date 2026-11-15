/* MAPS · Interludios cortos (cámara de a bordo): descenso → ¡TUNK! (alunizaje) y borde → caída (salto al cráter). Solo se muestran si existen sus videos. */
(()=>{const M=window.MAPSCine;if(!M)return;const {E,X}=M;
const TX={
es:{a1k:'DESCENSO',a1:'Sin aire no hay paracaídas. **Solo el motor.**',alt:'ALT',tunk:'¡TUNK!',a2k:'CONTACTO',a2:'Contacto. **Estamos en la Luna.**',
 s1k:'BORDE DEL CRÁTER',s1:'Ahí abajo no hay sol ni radio.',s2k:'SOMBRA PERMANENTE',s2:'Desde aquí, **el hopper decide solo**.',nos:'SIN SEÑAL'},
en:{a1k:'DESCENT',a1:'No air, no parachute. **Only the engine.**',alt:'ALT',tunk:'TUNK!',a2k:'CONTACT',a2:'Contact. **We are on the Moon.**',
 s1k:'CRATER RIM',s1:'Down there, no sunlight and no radio.',s2k:'PERMANENT SHADOW',s2:'From here, **the hopper decides alone**.',nos:'NO SIGNAL'},
pt:{a1k:'DESCIDA',a1:'Sem ar não há paraquedas. **Só o motor.**',alt:'ALT',tunk:'TUNK!',a2k:'CONTATO',a2:'Contato. **Estamos na Lua.**',
 s1k:'BORDA DA CRATERA',s1:'Lá embaixo não há sol nem rádio.',s2k:'SOMBRA PERMANENTE',s2:'Daqui em diante, **o hopper decide sozinho**.',nos:'SEM SINAL'}};
const T=()=>{const l=window.PROLOGO_LANG||(typeof LANG!=='undefined'?LANG:'es');return TX[l]||TX.es};
const KEYS=['a1-descenso','a2-contacto','s1-borde','s2-caida'];M.need(KEYS);
const base=(key,kick,cam)=>{const c=E('div','pcut icut');const f=E('div','ifr');const v=M.shot(key,'ivid');if(v)f.append(v);f.append(E('i','ibrk'));c.append(f);
  const h=E('div','ihud');h.append(E('span','irec','<i></i>'+X(cam)),E('b',null,X(kick)));c.append(h);return{c,f,h}};
const CUTS=[
 ()=>{const t=T(),{c,h}=base('a1-descenso',t.a1k,'CAM 02');const n=E('span','ialt',t.alt+' 120 m');h.append(n);let a=120;const iv=setInterval(()=>{if(!n.isConnected&&a<120){clearInterval(iv);return}a=Math.max(8,a-3);n.textContent=t.alt+' '+a+' m'},90);
  c.append(M.sub(t.a1));return{el:c,dur:4000,sfx:'thruster'}},
 ()=>{const t=T(),{c}=base('a2-contacto',t.a2k,'CAM 03');c.append(M.kana(t.tunk,{left:'7%',top:'20vh','--r':'-9deg'},'#ffe14d'),M.sub(t.a2));return{el:c,dur:3400,sfx:'landing_thud',fx:1}},
 ()=>{const t=T(),{c}=base('s1-borde',t.s1k,'CAM 04');c.append(M.sub(t.s1));return{el:c,dur:3600,sfx:'thruster'}},
 ()=>{const t=T(),{c,f}=base('s2-caida',t.s2k,'CAM 04');f.append(E('div','inos','<span>'+X(t.nos)+'</span>'));c.classList.add('idark');c.append(M.sub(t.s2));return{el:c,dur:4000,sfx:'jump',at:[['radio_static',2000,.3]]}}];
const run=(ix,onEnd,opt)=>M.play(onEnd,Object.assign({autoEnd:1},opt||{},{cuts:ix.map(i=>CUTS[i]),theme:'th-cam'}));
const has=ks=>ks.every(k=>M.has(k));
window.MAPSInter={play:(onEnd,opt)=>run([0,1,2,3],onEnd,opt),cuts:CUTS.length};
if(typeof STEPS!=='undefined'){
  const wrap=(re,flag,ix,keys)=>{const k=STEPS.findIndex(f=>f&&re.test(String(f)));if(k<0)return;const o=STEPS[k];STEPS[k]=function(){const a=arguments,me=this;if(M.off||S[flag]||!has(keys))return o.apply(me,a);S[flag]=1;run(ix,()=>o.apply(me,a))}};
  wrap(/06-alunizaje/,'_acine',[0],['a1-descenso']);wrap(/08-salto-al-crater/,'_scine',[2,3],['s1-borde','s2-caida']);
  try{const g0=window.game;if(typeof g0==='function')window.game=function(file,p,key,onRes){const a=[].slice.call(arguments);if(key==='aluniz'&&!M.off)a[3]=function(r){onRes&&onRes.apply(this,arguments);const k=r&&r.data&&r.data.result;if(k&&k!=='Impacto'&&k!=='Volcado'&&!S._tcine&&has(['a2-contacto'])){S._tcine=1;run([1])}};return g0.apply(this,a)}}catch(_){}}
const MONO='ui-monospace,"Cascadia Mono",Consolas,"Courier New",monospace';
const st=document.createElement('style');st.textContent=`
.pro.th-cam{background:#000}.icut{display:grid;place-items:center;background:#000}
.ifr{position:relative;height:88vh;aspect-ratio:1;max-width:100vw;overflow:hidden;background:#07080b}
.ivid{position:absolute;inset:0}.ivid video{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.15) brightness(1.1)}
.ifr::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
.ibrk{position:absolute;inset:16px;z-index:2;pointer-events:none;background:linear-gradient(#fff,#fff) 0 0/34px 2px,linear-gradient(#fff,#fff) 0 0/2px 34px,linear-gradient(#fff,#fff) 100% 0/34px 2px,linear-gradient(#fff,#fff) 100% 0/2px 34px,linear-gradient(#fff,#fff) 0 100%/34px 2px,linear-gradient(#fff,#fff) 0 100%/2px 34px,linear-gradient(#fff,#fff) 100% 100%/34px 2px,linear-gradient(#fff,#fff) 100% 100%/2px 34px;background-repeat:no-repeat;opacity:.7}
.ihud{position:absolute;left:max(4%,22px);top:calc(6vh + 22px);z-index:7;display:grid;gap:8px;justify-items:start;font-family:${MONO};color:#fff;text-shadow:0 2px 0 #000}
.ihud>*{padding:3px 9px;background:rgba(0,0,0,.72)}
.irec{display:flex;align-items:center;gap:8px;font:700 clamp(12px,.6vw + 9px,16px)/1.2 ${MONO};letter-spacing:.16em}.irec i{width:10px;height:10px;border-radius:50%;background:#ff3b30;animation:iBlink 1s steps(1) infinite}
.ihud b{font:800 clamp(18px,1.6vw + 8px,34px)/1.1 ${MONO};letter-spacing:.08em}.ialt{font:700 clamp(16px,1.2vw + 8px,26px)/1.1 ${MONO};color:#ffe14d;font-variant-numeric:tabular-nums}
.pro.th-cam .psub p{background:#000;color:#fff;border:2px solid #fff;box-shadow:none;transform:none;font:700 clamp(16px,1.2vw + 9px,28px)/1.3 ${MONO}}.pro.th-cam .psub em{color:#ffe14d}
.inos{position:absolute;inset:0;z-index:3;display:grid;place-items:center;background:repeating-linear-gradient(rgba(255,255,255,.07) 0 2px,transparent 2px 5px),rgba(0,0,0,.55);opacity:0;animation:iNos .2s steps(2) 2s forwards}
.inos span{padding:.2em .6em;border:4px solid #ff3b30;color:#ff3b30;background:#000;font:800 clamp(24px,4vw,64px)/1 ${MONO};letter-spacing:.12em;animation:iBlink .7s steps(1) 2s infinite}
@keyframes iBlink{50%{opacity:.15}}@keyframes iNos{to{opacity:1}}
@media (max-aspect-ratio:1/1){.ifr{height:auto;width:100vw}}
@media (prefers-reduced-motion:reduce){.irec i,.inos span{animation:none}}
`;document.head.append(st)})();
