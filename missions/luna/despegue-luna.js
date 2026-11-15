/* MAPS · Arranque del despegue — estilo TERMINAL CRT de control de misión (fósforo verde). ~12 s, entrega al lanzamiento original. */
(()=>{const M=window.MAPSCine;if(!M)return;const {E,X,F}=M;
const TX={
es:{who:'CONTROL MAPS',r1:'Todos los sistemas, **listos**.',sg:'Cohete compartido: salimos cuando ellos digan. **Ni un segundo más.**',so:'Cohete propio. Esta vez, **el reloj es nuestro**.',
 log:['ENLACE MAPS-LV1 ........ OK','PRESIÓN TANQUES ........ 100%','GUIADO INERCIAL ........ OK','TELEMETRÍA ............. OK','VENTANA ................ ABIERTA'],
 poll:['COMBUSTIBLE','NAVEGACIÓN','COMUNICACIÓN','CLIMA','DIRECTORA'],q:'SONDEO GO / NO-GO',ign:'IGNICIÓN',eng:'MOTORES 1·2·3'},
en:{who:'MAPS CONTROL',r1:'All systems **go**.',sg:'Shared rocket: we leave when they say. **Not a second later.**',so:'Our own rocket. This time, **the clock is ours**.',
 log:['LINK MAPS-LV1 .......... OK','TANK PRESSURE .......... 100%','INERTIAL GUIDANCE ...... OK','TELEMETRY .............. OK','LAUNCH WINDOW .......... OPEN'],
 poll:['FUEL','NAVIGATION','COMMS','WEATHER','FLIGHT DIRECTOR'],q:'GO / NO-GO POLL',ign:'IGNITION',eng:'ENGINES 1·2·3'},
pt:{who:'CONTROLE MAPS',r1:'Todos os sistemas **prontos**.',sg:'Foguete compartilhado: saímos quando eles mandarem. **Nem um segundo a mais.**',so:'Foguete próprio. Desta vez, **o relógio é nosso**.',
 log:['ENLACE MAPS-LV1 ........ OK','PRESSÃO TANQUES ........ 100%','GUIAGEM INERCIAL ....... OK','TELEMETRIA ............. OK','JANELA ................. ABERTA'],
 poll:['COMBUSTÍVEL','NAVEGAÇÃO','COMUNICAÇÃO','CLIMA','DIRETORA'],q:'VOTAÇÃO GO / NO-GO',ign:'IGNIÇÃO',eng:'MOTORES 1·2·3'}};
const T=()=>{const l=window.PROLOGO_LANG||(typeof LANG!=='undefined'?LANG:'es');return TX[l]||TX.es};
const ganga=()=>{try{return S.contrato==='ganga'}catch(_){return true}};
const cap=txt=>{const s=E('div','psub');s.append(E('span','ptag','<span>'+X(T().who)+'</span>'),E('p',null,F(txt)));return s};
const typed=(txt,d,cls)=>{const e=E('span','ctype'+(cls?' '+cls:''),X(txt));e.style.setProperty('--n',[...txt].length);e.style.animationDelay=d+'s';return e};
M.need(['d1-plataforma','d2-motores','d3-ignicion']);
const CUTS=[
 ()=>{const t=T(),c=E('div','pcut cbt');const lg=E('div','clog');lg.append(typed('MAPS//MISION-LUNA  T−00:00:10',0,'hd'));t.log.forEach((x,i)=>lg.append(typed(x,.35+i*.42)));
  const sc=E('div','cscope');sc.append(E('i','cswp'));for(let k=0;k<5;k++){const b=E('b');b.style.setProperty('--k',k);sc.append(b)}
  const cam=M.shot('d1-plataforma','cvid');if(cam){sc.classList.add('cam');sc.prepend(cam);sc.append(E('em',null,'CAM 01'))}
  c.append(lg,sc,cap(t.r1));return{el:c,dur:3500,sfx:'data_beep',at:t.log.map((_,i)=>['blip',350+i*420,.25])}},
 ()=>{const t=T(),c=E('div','pcut cpoll');const h=E('div','cq');h.append(typed(t.q,0,'hd'));const L=E('ol','cpoll');t.poll.forEach((x,i)=>{const li=E('li');li.style.setProperty('--k',i);li.append(E('span',null,X(x)),E('b',null,'GO'));L.append(li)});
  const l2=ganga()?t.sg:t.so;c.append(h,L,E('i','ccur'),cap(l2));return{el:c,dur:Math.max(3900,M.dur(l2)-300),at:t.poll.map((_,i)=>['data_beep',300+i*360,.3])}},
 ()=>{const t=T(),c=E('div','pcut ccd');['3','2','1'].forEach((n,i)=>{const e=E('div','cdig',n);e.style.animationDelay=(i*.7)+'s';c.append(e)});const bg=M.shot('d2-motores','cvid bg');if(bg)c.prepend(bg);c.append(E('i','cbloom'),E('div','cign','<span>'+X(t.ign)+'</span>'));
  return{el:c,dur:3200,at:[['blip',0,.5],['blip',700,.5],['blip',1400,.5],['stamp',2100,.5]]}},
 ()=>{const t=T(),c=E('div','pcut cen');const n=E('div','cnoz');for(let k=0;k<3;k++){const b=E('div','cbell');b.style.setProperty('--k',k);b.append(E('i','cwave'));n.append(b)}
  const hd=E('div','chud');hd.append(typed(t.eng+' ......... ON',0,'hd'));const fire=M.shot('d3-ignicion','cvid full','50% 60%');c.append(fire||n,hd);return{el:c,dur:fire?3600:2900,sfx:'launch_rumble'}}];
const play=(onEnd,opt)=>M.play(onEnd,Object.assign({autoEnd:1},opt||{},{cuts:CUTS,theme:'th-crt'}));
window.MAPSDespegue={play,cuts:CUTS.length};
if(typeof STEPS!=='undefined'){const ix=STEPS.findIndex(f=>f&&f.name==='launch');if(ix>=0){const o=STEPS[ix];STEPS[ix]=function(){const a=arguments,me=this;if(M.off||S._dcine)return o.apply(me,a);S._dcine=1;play(()=>o.apply(me,a))}}}
const G='#7dff9b',A='#ffb347',MONO='ui-monospace,"Cascadia Mono",Consolas,"Courier New",monospace';
const st=document.createElement('style');st.textContent=`
.pro.th-crt{background:#020503}
.pro.th-crt .pstage::after{content:"";position:absolute;inset:0;z-index:8;pointer-events:none;background:repeating-linear-gradient(rgba(0,0,0,.38) 0 2px,transparent 2px 4px),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(0,0,0,.75));animation:cFlick .12s steps(2) infinite}
.pro.th-crt .pskip{border-radius:0;background:#000;border:2px solid ${G};color:${G};font-family:${MONO}}
.pro.th-crt .pdots i.on,.pro.th-crt .pdots i.now::after{background:${G}}
.pro.th-crt .psub{bottom:9vh;justify-items:start;text-align:left;width:min(88%,1100px)}
.pro.th-crt .psub p{padding:0;background:none;border:0;box-shadow:none;transform:none;color:${G};font:600 clamp(18px,1.5vw + 9px,34px)/1.3 ${MONO};text-shadow:0 0 10px rgba(125,255,155,.65)}
.pro.th-crt .psub p::before{content:"> "}.pro.th-crt .psub p::after{content:"█";margin-left:.2em;animation:cBlink 1s steps(1) infinite}
.pro.th-crt .psub em{color:${A};text-shadow:0 0 10px rgba(255,179,71,.6)}
.pro.th-crt .ptag{transform:none;background:none;border:2px solid ${A};color:${A};font-family:${MONO}}.pro.th-crt .ptag>span{transform:none}
.cbt,.cpoll,.ccd,.cen{background:radial-gradient(70% 70% at 50% 45%,#08200f,#020503 75%);animation:cOn .35s steps(4) both}
.ctype{display:block;width:0;max-width:max-content;overflow:hidden;white-space:pre;font:600 clamp(16px,1.6vw,30px)/1.5 ${MONO};color:${G};text-shadow:0 0 8px rgba(125,255,155,.6);animation:cType .4s steps(var(--n)) both;animation-name:cType}
.ctype{width:calc(var(--n) * 1ch)}.ctype.hd{color:${A};text-shadow:0 0 8px rgba(255,179,71,.6);margin-bottom:.6em}
@keyframes cType{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.clog{position:absolute;left:6%;top:calc(6vh + 64px);width:min(52%,760px);display:grid}
.cscope{position:absolute;right:6%;top:calc(6vh + 64px);width:min(30vw,44vh);aspect-ratio:1;border-radius:50%;border:3px solid ${G};box-shadow:0 0 22px rgba(125,255,155,.35),inset 0 0 30px rgba(125,255,155,.2);background:repeating-radial-gradient(circle,transparent 0 19%,rgba(125,255,155,.3) 19% 19.6%),linear-gradient(transparent 49.7%,rgba(125,255,155,.35) 49.7% 50.3%,transparent 50.3%),linear-gradient(90deg,transparent 49.7%,rgba(125,255,155,.35) 49.7% 50.3%,transparent 50.3%);overflow:hidden}
.cswp{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(125,255,155,.75),transparent 22%);animation:cSpin 2s linear infinite}
.cscope b{position:absolute;width:10px;height:10px;border-radius:50%;background:${A};box-shadow:0 0 12px ${A};left:calc(22% + var(--k) * 13%);top:calc(30% + (var(--k) * 23 % 40) * 1%);opacity:0;animation:cBlip 2s steps(1) calc(var(--k) * .4s) infinite}
.cvid{position:absolute;inset:0;overflow:hidden}.cvid video{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1) contrast(1.5) brightness(1.05)}
.cvid::after{content:"";position:absolute;inset:0;background:${G};mix-blend-mode:multiply}
.cvid.bg{opacity:.6}.cvid.bg video{filter:grayscale(1) contrast(1.3) brightness(2.3)}.cvid.full{animation:cRum .1s steps(2) infinite}.cvid.full video{filter:contrast(1.25) saturate(1.35) brightness(1.1)}.cvid.full::after{display:none}.cen:has(.cvid){animation:cOn .3s steps(4) both,cOff .7s steps(7) 2.9s forwards}
.cscope.cam{background:#020503}.cscope.cam .cswp{opacity:.4}.cscope.cam b{display:none}
.cscope em{position:absolute;left:50%;bottom:9%;translate:-50% 0;padding:2px 8px;background:#020503;color:${A};font:700 clamp(11px,1vw,16px)/1.2 ${MONO};font-style:normal;letter-spacing:.14em}
.chud{z-index:2;padding:4px 10px;background:rgba(2,5,3,.8)}
.cq{position:absolute;left:6%;top:calc(6vh + 64px)}
.cpoll{position:absolute;left:6%;right:6%;top:calc(6vh + 130px);bottom:30vh;margin:0;padding:0;list-style:none;display:grid;grid-template-rows:repeat(5,minmax(0,1fr))}
.cpoll li{display:flex;align-items:center;justify-content:space-between;padding:0 2%;border-bottom:2px dashed rgba(125,255,155,.35);font:700 clamp(20px,2.4vw,46px)/1 ${MONO};color:${G};text-shadow:0 0 8px rgba(125,255,155,.6)}
.cpoll b{color:#020503;background:${G};padding:.1em .45em;box-shadow:0 0 16px rgba(125,255,155,.7);opacity:0;animation:cGo .3s steps(1) calc(.35s + var(--k) * .36s) both}
.ccur{position:absolute;left:6%;right:6%;top:calc(6vh + 130px);height:calc((100% - 6vh - 130px - 30vh) / 5);background:rgba(125,255,155,.16);border:2px solid ${G};pointer-events:none;animation:cCur 1.8s steps(5) .3s both}
.ccd{display:grid;place-items:center}
.cdig{position:absolute;left:50%;top:48%;translate:-50% -50%;font:700 clamp(180px,42vh,520px)/1 ${MONO};color:${G};text-shadow:0 0 30px rgba(125,255,155,.8),0 12px 0 rgba(125,255,155,.25),0 24px 0 rgba(125,255,155,.12);opacity:0;animation:cDig .7s steps(1) both}
.cdig::after{content:"";position:absolute;left:-10%;right:-10%;top:50%;height:6px;background:${G};opacity:.25;animation:cRoll .7s steps(7) infinite}
.cbloom{position:absolute;inset:0;background:radial-gradient(circle,#eaffef,${G} 40%,transparent 75%);opacity:0;animation:cBloom .9s steps(5) 2.1s both;z-index:3}
.cign{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:4;opacity:0;animation:cGo .1s steps(1) 2.35s both}
.cign span{display:block;padding:.15em .5em;background:${G};color:#020503;font:800 clamp(40px,8vw,150px)/1 ${MONO};letter-spacing:.06em;box-shadow:0 0 50px rgba(125,255,155,.9)}
.cen{animation:cOn .3s steps(4) both,cOff .7s steps(7) 2.2s forwards}
.cnoz{position:absolute;left:50%;top:6vh;translate:-50% 0;display:flex;gap:4vw;animation:cRum .1s steps(2) infinite}
.cbell{position:relative;width:clamp(90px,12vw,200px);height:24vh}
.cbell::before,.cbell::after{content:"";position:absolute;inset:0;clip-path:polygon(32% 0,68% 0,100% 100%,0 100%)}.cbell::before{background:${G};box-shadow:0 0 20px ${G}}.cbell::after{inset:4px 6px 4px;background:repeating-linear-gradient(rgba(125,255,155,.25) 0 2px,#041208 2px 12px)}
.cwave{position:absolute;left:0;right:0;top:100%;height:52vh;background:repeating-linear-gradient(90deg,transparent 0 10px,${A} 10px 13px,transparent 13px 22px,${G} 22px 24px);-webkit-mask:linear-gradient(#000,transparent);mask:linear-gradient(#000,transparent);clip-path:polygon(4% 0,96% 0,80% 60%,64% 45%,50% 100%,36% 45%,20% 60%);transform-origin:top;animation:cFire .08s steps(2) infinite alternate}
.chud{position:absolute;left:6%;bottom:12vh}
@keyframes cFlick{50%{opacity:.85}}@keyframes cBlink{50%{opacity:0}}@keyframes cSpin{to{transform:rotate(360deg)}}@keyframes cBlip{0%,8%{opacity:1}30%,100%{opacity:0}}
@keyframes cOn{0%{opacity:0;transform:scaleY(.01)}40%{opacity:1;transform:scaleY(.01) scaleX(1)}100%{transform:none}}
@keyframes cOff{0%{transform:none;filter:none}50%{transform:scaleY(.008);filter:brightness(3)}85%{transform:scale(.01,.008);filter:brightness(4)}100%{transform:scale(0);opacity:0}}
@keyframes cGo{from{opacity:0}to{opacity:1}}@keyframes cCur{from{transform:translateY(0)}to{transform:translateY(400%)}}
@keyframes cDig{0%{opacity:1;transform:scale(1.04)}10%{transform:none}92%{opacity:1}100%{opacity:0}}@keyframes cRoll{from{top:0}to{top:100%}}
@keyframes cBloom{0%{opacity:0}20%{opacity:1}100%{opacity:.25}}@keyframes cFire{from{transform:scaleY(.88)}to{transform:scaleY(1.12)}}@keyframes cRum{50%{transform:translateX(3px)}}
@media (max-aspect-ratio:1/1){.cscope:not(.cam){display:none}.cscope.cam{top:auto;bottom:30vh;right:50%;translate:50% 0;width:min(60vw,30vh)}.clog{width:88%}.cnoz{gap:2vw}}
@media (prefers-reduced-motion:reduce){.pro.th-crt .pstage::after,.cnoz,.cwave,.cdig::after{animation:none}.cen{animation:none}}
`;document.head.append(st)})();
