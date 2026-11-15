/* MAPS · Epílogo — estilo PERIÓDICO / TELETIPO / PARCHE DE MISIÓN. Cambia según el resultado. */
(()=>{const M=window.MAPSCine;if(!M)return;const {E,X,F}=M;
const CR={A:'Shackleton',B:'Cabeus',C:'Haworth'};
const TX={
es:{who:'DESPACHO MAPS',paper:'El Diario Lunar',ed:'Edición especial · Polo sur',
 fax:['TRANSMISIÓN · MAPS','ORIGEN: POLO SUR LUNAR','DISTANCIA: 384 400 KM','PAQUETES: {n}/2','ESTADO: {e}'],st:{total:'HIELO CONFIRMADO',parcial:'PISTA DE HIELO',fallida:'SIN SEÑAL'},
 fx:'Llega el último mensaje desde la Luna.',fxb:'La línea se corta. **Silencio.**',
 hl:{total:'¡HAY HIELO EN LA LUNA!',parcial:'PISTA DE HIELO EN {C}',fallida:'LA LUNA GANA ESTA VEZ'},
 sub:{total:'Hielo confirmado en {c}: la Luna tiene gasolinera.',parcial:'El hielo está en {c}. Falta tocarlo.',fallida:'La misión no llegó, pero ya sabemos por qué.'},
 photo:'Cráter {c}',photoF:'Control MAPS · sin señal',ep:'Episodio 01',done:'Completado',cont:'Continuará',rep:'Ver informe',again:'Ver otra vez'},
en:{who:'MAPS DISPATCH',paper:'The Lunar Times',ed:'Special edition · South pole',
 fax:['TRANSMISSION · MAPS','ORIGIN: LUNAR SOUTH POLE','DISTANCE: 384,400 KM','PACKETS: {n}/2','STATUS: {e}'],st:{total:'ICE CONFIRMED',parcial:'ICE LEAD',fallida:'NO SIGNAL'},
 fx:'The last message from the Moon arrives.',fxb:'The line goes dead. **Silence.**',
 hl:{total:'THERE IS ICE ON THE MOON!',parcial:'ICE LEAD AT {C}',fallida:'THE MOON WINS THIS TIME'},
 sub:{total:'Ice confirmed at {c}: the Moon has a gas station.',parcial:'The ice is at {c}. We just have to touch it.',fallida:'The mission fell short, but now we know why.'},
 photo:'{c} crater',photoF:'MAPS control · no signal',ep:'Episode 01',done:'Complete',cont:'To be continued',rep:'See report',again:'Watch again'},
pt:{who:'DESPACHO MAPS',paper:'O Diário Lunar',ed:'Edição especial · Polo sul',
 fax:['TRANSMISSÃO · MAPS','ORIGEM: POLO SUL LUNAR','DISTÂNCIA: 384.400 KM','PACOTES: {n}/2','ESTADO: {e}'],st:{total:'GELO CONFIRMADO',parcial:'PISTA DE GELO',fallida:'SEM SINAL'},
 fx:'Chega a última mensagem da Lua.',fxb:'A linha cai. **Silêncio.**',
 hl:{total:'HÁ GELO NA LUA!',parcial:'PISTA DE GELO EM {C}',fallida:'A LUA VENCE DESTA VEZ'},
 sub:{total:'Gelo confirmado em {c}: a Lua tem um posto de combustível.',parcial:'O gelo está em {c}. Falta tocá-lo.',fallida:'A missão não chegou, mas já sabemos por quê.'},
 photo:'Cratera {c}',photoF:'Controle MAPS · sem sinal',ep:'Episódio 01',done:'Concluído',cont:'Continua',rep:'Ver relatório',again:'Ver de novo'}};
const T=()=>{const l=window.PROLOGO_LANG||(typeof LANG!=='undefined'?LANG:'es');return TX[l]||TX.es};
function outcome(){try{const r=S.res||{},del=(r.antena&&r.antena.data&&r.antena.data.delivered)||[],sent=!!(r.hopper&&r.hopper.data&&r.hopper.data.sent);const c=(S.hop&&S.hop.crater)||del[0]||'A';return{k:!del.length?'fallida':sent?'total':'parcial',c:CR[c]||c,n:del.length}}catch(_){return{k:'total',c:'Shackleton',n:2}}}
const head=()=>{try{return finalResult().titular}catch(_){return ''}};
const fl=(s,o,t)=>s.replace('{c}',o.c).replace('{C}',o.c.toUpperCase()).replace('{n}',o.n).replace('{e}',t?t.st[o.k]:'');
const cap=txt=>{const s=E('div','psub');s.append(E('span','ptag','<span>'+X(T().who)+'</span>'),E('p',null,F(txt)));return s};
M.need(['e1-antena','e2-foto-total','e2-foto-parcial','e2-foto-fallida','e3-tierra']);
const CUTS=[
 ()=>{const t=T(),o=outcome(),bad=o.k==='fallida',c=E('div','pcut nfax'+(bad?' bad':''));c.append(E('i','nslot'));const p=E('div','nstrip');
  t.fax.forEach((x,i)=>{const l=E('span',null,X(fl(x,o,t)));l.style.animationDelay=(.25+i*.36)+'s';if(i===4)l.className='st';p.append(l)});if(bad)p.append(E('i','ntear'));
  const bg=M.shot('e1-antena','nvid bg');if(bg)c.prepend(bg);c.append(p,cap(bad?t.fxb:t.fx));return{el:c,dur:3600,sfx:'paper',at:t.fax.map((_,i)=>['data_beep',250+i*360,.22])}},
 ()=>{const t=T(),o=outcome(),c=E('div','pcut nfront o-'+o.k);const pg=E('div','npage');
  const mh=E('div','nmast');mh.append(E('b',null,X(t.paper)),E('small',null,X(t.ed)+' · MAPS'));
  const hl=E('h3','nhl',X(fl(t.hl[o.k],o)));const sb=E('p','nsb',X(fl(t.sub[o.k],o)));
  const bd=E('div','nbody');const ph=E('div','nphoto');ph.append(E('i'),E('span',null,X(o.k==='fallida'&&M.has('e2-foto-fallida')?t.photoF:fl(t.photo,o))));const pv=M.shot('e2-foto-'+o.k,'nvid');if(pv){ph.classList.add('hasv');ph.prepend(pv)}bd.append(ph,E('i','ncol'),E('i','ncol'));
  pg.append(mh,hl,sb,bd);c.append(pg);return{el:c,dur:4400,sfx:'whoosh',at:[['stamp',950,.45],['paper',1000,.3]]}},
 ()=>{try{window.MAPS_MUSIC&&MAPS_MUSIC.duck(false)}catch(_){}const t=T(),o=outcome(),ok=o.k!=='fallida',c=E('div','pcut npatch o-'+o.k);const w=E('div','nwrap');
  const pt=E('div','npt');const inr=E('div','npin');if(typeof LOGO==='function'){pt.classList.add('haslogo');inr.classList.add('nlogo');inr.innerHTML=LOGO(240)+'<small>· 01 ·</small>'}else inr.append(E('i','nmoon'),E('b',null,'MAPS'),E('small',null,'· 01 ·'));pt.append(inr);for(let k=0;k<8;k++){const s=E('i','nstar');s.textContent='★';s.style.setProperty('--k',k);pt.append(s)}
  const stp=E('div','nstamp',X(ok?t.done:t.cont));pt.append(stp);
  const tx=E('div','ntx');const hd=head();tx.append(E('span','nkick',X(t.ep)));tx.append(E('div','nbig',X(ok?t.done+'.':t.cont+'…')));if(hd)tx.append(E('p','nhd',X(hd)));try{const lg=window.PROLOGO_LANG||(typeof LANG!=='undefined'?LANG:'es'),SC={es:['puntos de misión','Guardado en la tabla de récords.','Modo piloto: este puntaje no se guarda.'],en:['mission points','Saved to the records table.','Pilot mode: this score is not saved.'],pt:['pontos de missão','Salvo na tabela de recordes.','Modo piloto: esta pontuação não é salva.']}[lg]||null,pts=totalPts(),stn=Math.max(0,Math.min(3,finalResult().msg.estrellas||0));if(SC){const sc=E('div','nscore');sc.append(E('b',null,String(pts)),E('span','nlb',X(SC[0])),E('span','nst','★'.repeat(stn)+'<s>'+'★'.repeat(3-stn)+'</s>'));tx.append(sc);if(S.pilot||S._recSaved==='stored')tx.append(E('small','nsaved',X(S.pilot?SC[2]:SC[1])))}}catch(_){}
  const r=E('div','pbtns');const go=E('button','pgo',X(t.rep)+' →');go.type='button';go.dataset.act='end';const ag=E('button','pag','↺ '+X(t.again));ag.type='button';ag.dataset.act='again';r.append(go,ag);tx.append(r);
  w.append(pt,tx);const eb=M.shot('e3-tierra','nvid bg');if(eb)c.append(eb);c.append(w);return{el:c,dur:0,last:1,sfx:'stamp',at:[['stamp',900,.5]]}}];
const play=(onEnd,opt)=>M.play(onEnd,Object.assign({},opt||{},{cuts:CUTS,theme:'th-news'}));
window.MAPSEpilogo={play,cuts:CUTS.length};
if(typeof STEPS!=='undefined'&&STEPS.length){const ix=STEPS.length-1,o=STEPS[ix];STEPS[ix]=function(){const a=arguments,me=this;if(M.off||S._ecine)return o.apply(me,a);S._ecine=1;try{if(typeof saveRec==='function')saveRec(finalResult())}catch(_){}try{window.MAPS_MUSIC&&MAPS_MUSIC.play(outcome().k==='fallida'?'derrota':'maravilla')}catch(_){}play(()=>o.apply(me,a))}}
const P='#efe7d3',K='#1b1a17',R='#b3261e',SER='Georgia,"Times New Roman",Cambria,serif',MONO='ui-monospace,"Courier New",Consolas,monospace';
const st=document.createElement('style');st.textContent=`
.pro.th-news{background:#2a2620}
.pro.th-news .pskip{border-radius:0;background:${P};color:${K};border:2px solid ${K};font-family:${SER};letter-spacing:.08em}
.pro.th-news .psub p{background:${P};color:${K};border:0;border-top:3px double ${K};border-bottom:3px double ${K};box-shadow:0 10px 30px rgba(0,0,0,.5);transform:none;font:italic 600 clamp(18px,1.4vw + 9px,32px)/1.3 ${SER};padding:.5em 1em}
.pro.th-news .psub em{color:${R}}.pro.th-news .ptag{transform:none;background:${R};color:${P};font-family:${SER};letter-spacing:.2em}.pro.th-news .ptag>span{transform:none}
.nfax{background:radial-gradient(circle,rgba(255,255,255,.05) 0 1px,transparent 1.5px) 0 0/14px 14px,#2a2620}
.nslot{position:absolute;left:50%;top:6vh;translate:-50% 0;width:min(640px,86vw);height:4.5vh;background:#111;border-radius:0 0 10px 10px;box-shadow:0 6px 0 #0a0a0a,0 12px 30px rgba(0,0,0,.6);z-index:3}
.nstrip{position:absolute;left:50%;top:calc(6vh + 2vh);translate:-50% 0;width:min(560px,78vw);padding:4vh 34px 3vh;display:grid;gap:1.6vh;background:repeating-linear-gradient(${P} 0 31px,#e2d8c0 31px 32px);box-shadow:0 20px 40px rgba(0,0,0,.5);transform-origin:top;animation:nFeed 2.2s steps(14) both;z-index:2}
.nstrip span{font:700 clamp(15px,1.5vw,26px)/1.2 ${MONO};color:${K};opacity:0;animation:nPrint .2s steps(1) both}
.nstrip .st{color:${R};font-size:clamp(18px,1.9vw,32px);border:3px solid ${R};padding:.2em .4em;justify-self:start;transform:rotate(-2deg)}
.nfax.bad .nstrip{filter:grayscale(1)}.ntear{position:absolute;left:0;right:0;bottom:-14px;height:16px;background:${P};clip-path:polygon(0 0,100% 0,100% 40%,92% 100%,84% 30%,76% 90%,68% 20%,60% 100%,52% 40%,44% 90%,36% 10%,28% 80%,20% 30%,12% 100%,4% 40%,0 80%)}
.nfront{display:grid;place-items:center;background:radial-gradient(70% 70% at 50% 50%,#3a342a,#141210)}
.npage{width:min(1100px,90vw);max-height:84vh;box-sizing:border-box;padding:clamp(16px,2.4vw,40px);background:radial-gradient(circle,rgba(0,0,0,.06) 0 1px,transparent 1.4px) 0 0/5px 5px,${P};color:${K};box-shadow:0 30px 60px rgba(0,0,0,.6);display:grid;gap:1.4vh;animation:nSpin 1s steps(10) both}
.nmast{display:grid;justify-items:center;gap:6px;padding-bottom:1vh;border-bottom:4px double ${K}}
.nmast b{font:900 clamp(28px,4.4vw,76px)/1 ${SER};letter-spacing:.02em}.nmast small{font:italic 600 clamp(12px,1vw,17px)/1 ${SER};letter-spacing:.14em;text-transform:uppercase}
.nhl{margin:0;text-align:center;font:900 clamp(38px,7vw,128px)/.92 ${SER};letter-spacing:-.02em;text-wrap:balance;text-transform:uppercase}
.nfront.o-fallida .nhl{color:${R}}
.nsb{margin:0;text-align:center;font:italic 600 clamp(16px,1.6vw,28px)/1.25 ${SER};border-bottom:2px solid ${K};padding-bottom:1.2vh}
.nbody{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;min-height:14vh}
.nphoto{position:relative;display:grid;align-content:end;overflow:hidden;background:radial-gradient(circle,rgba(0,0,0,.55) 0 1.6px,transparent 2.2px) 0 0/6px 6px,radial-gradient(60% 55% at 55% 60%,#555 0,#222 55%,#999 70%,#cfc6b0 100%);border:2px solid ${K}}
.nphoto i{position:absolute;inset:18% 22% 26% 20%;border-radius:50%;background:radial-gradient(circle at 60% 65%,#000 50%,#444 68%,transparent 72%)}
.nphoto span{position:relative;padding:4px 8px;background:${P};font:italic 700 clamp(12px,1vw,16px)/1.2 ${SER}}
.nvid{position:absolute;inset:0;overflow:hidden}.nvid video{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1) contrast(1.35) sepia(.25)}
.nvid::after{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,.5) 0 1.3px,transparent 1.9px) 0 0/5px 5px;mix-blend-mode:multiply}
.nvid.bg{z-index:0;opacity:.5}.nvid.bg video{filter:grayscale(1) contrast(1.3) brightness(1.5) sepia(.25)}.npatch .nvid.bg{opacity:.45}.npatch .nvid.bg video{object-position:50% 70%;filter:grayscale(1) contrast(1.25) brightness(1.6) sepia(.25)}
.npatch .ntx{padding:clamp(14px,2vw,28px);background:rgba(11,19,40,.86)}
.nfront.o-total .nphoto.hasv video{filter:grayscale(1) contrast(1.2) brightness(2.2) sepia(.25);object-position:45% 70%}.nwrap{position:relative;z-index:1}
.nphoto.hasv{min-height:26vh}.nphoto.hasv>i{display:none}.nfront.o-fallida .nphoto.hasv video{filter:grayscale(1) contrast(1.15) brightness(2.2) sepia(.25)}
.ncol{background:repeating-linear-gradient(${K} 0 3px,transparent 3px 11px);opacity:.28;-webkit-mask:linear-gradient(90deg,#000 88%,transparent);mask:linear-gradient(90deg,#000 88%,transparent)}
.npatch{display:grid;place-items:center;background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 6px),radial-gradient(70% 70% at 40% 50%,#1d2f57,#0b1328)}
.nwrap{display:grid;grid-template-columns:auto minmax(0,1fr);gap:clamp(24px,5vw,80px);align-items:center;width:min(1150px,90vw)}
.npt{position:relative;width:min(40vh,34vw);aspect-ratio:1;border-radius:50%;background:#14213d;box-shadow:0 0 0 10px #c9a227,0 0 0 13px #7a5f12,0 20px 50px rgba(0,0,0,.6);display:grid;place-items:center;animation:nDrop .5s steps(5) both}
.npt::before{content:"";position:absolute;inset:6px;border-radius:50%;border:3px dashed rgba(201,162,39,.8)}
.npin{display:grid;justify-items:center;gap:4px;z-index:1}.npin b{font:900 clamp(30px,5vh,58px)/1 ${SER};letter-spacing:.18em;color:${P}}.npin small{font:700 clamp(13px,1.8vh,20px)/1 ${SER};color:#c9a227;letter-spacing:.3em}
.nmoon{width:38%;aspect-ratio:1;border-radius:50%;margin-bottom:6px;background:radial-gradient(circle at 62% 64%,#0b1328 14%,transparent 15%),radial-gradient(circle at 34% 40%,#8f97a6 9%,transparent 10%),radial-gradient(circle at 40% 35%,#f2f1ea,#b8b6ad 60%,#6f6d66)}
.nstar{position:absolute;left:50%;top:50%;font-size:clamp(14px,2.2vh,24px);color:#c9a227;font-style:normal;transform:rotate(calc(var(--k) * 45deg + 22deg)) translateY(calc(min(40vh,34vw) * -.4)) rotate(calc(var(--k) * -45deg - 22deg));translate:-50% -50%}
.nstamp{position:absolute;left:50%;top:58%;z-index:3;padding:.15em .5em;border:6px solid ${R};color:${R};font:900 clamp(26px,5vh,58px)/1 ${SER};letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;background:rgba(239,231,211,.08);mix-blend-mode:screen;opacity:0;transform:translate(-50%,-50%) rotate(-14deg);animation:nStamp .35s steps(4) .9s both}
.npatch.o-total .nstamp,.npatch.o-parcial .nstamp{border-color:#e14b3b;color:#ff6a58}
.ntx{display:grid;gap:14px;justify-items:start;color:${P}}
.nkick{font:italic 700 clamp(14px,1.2vw,20px)/1 ${SER};letter-spacing:.3em;text-transform:uppercase;color:#c9a227}
.nbig{font:900 clamp(48px,7.4vw,130px)/.95 ${SER};letter-spacing:-.02em;animation:pRise .5s steps(5) .5s both}
.nhd{margin:0;max-width:34ch;font:italic 500 clamp(16px,1.5vw,26px)/1.35 ${SER};color:#d8d2c2;text-wrap:pretty;animation:pRise .5s steps(5) .8s both}
.npatch .pbtns{justify-content:flex-start}.npatch .pgo{--c:#c9a227;box-shadow:5px 5px 0 ${R}}
@keyframes nFeed{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}@keyframes nPrint{from{opacity:0}to{opacity:1}}
@keyframes nSpin{0%{transform:rotate(-720deg) scale(.04)}80%{transform:rotate(-8deg) scale(1.04)}100%{transform:rotate(-1.5deg)}}
@keyframes nDrop{0%{opacity:0;transform:scale(1.6) rotate(-30deg)}70%{opacity:1;transform:scale(.95)}100%{transform:none}}
@keyframes nStamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-14deg) scale(2.6)}70%{opacity:1;transform:translate(-50%,-50%) rotate(-14deg) scale(.92)}100%{opacity:.95;transform:translate(-50%,-50%) rotate(-14deg)}}
.npin.nlogo{width:100%;height:100%;align-content:center;gap:2%}.npin.nlogo .badge{width:60%!important;height:auto!important;visibility:visible!important;opacity:1!important;animation:none!important;margin:0!important;justify-self:center!important;filter:drop-shadow(0 8px 18px rgba(0,0,0,.55))!important}.npt.haslogo .nstamp{top:84%}
.nscore{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap}.nscore b{font:900 clamp(40px,5vw,84px)/1 ${SER};color:#e3bb3a;font-variant-numeric:tabular-nums}.nscore .nlb{font:700 clamp(14px,1.3vw,20px)/1 ${SER}}.nscore .nst{position:static;color:#e3bb3a;font-size:clamp(20px,2vw,32px);line-height:1;letter-spacing:.12em;white-space:nowrap}.nscore .nst s{text-decoration:none;opacity:.25}.nsaved{font:italic 500 clamp(13px,1.1vw,17px)/1.3 ${SER};opacity:.85}
@media (max-aspect-ratio:1/1){.nwrap{grid-template-columns:1fr;justify-items:center;text-align:center}.npt{width:min(34vh,64vw)}.nstar{transform:rotate(calc(var(--k) * 45deg + 22deg)) translateY(calc(min(34vh,64vw) * -.4)) rotate(calc(var(--k) * -45deg - 22deg))}.ntx{justify-items:center}.npatch .pbtns{justify-content:center}.nbody{grid-template-columns:1fr 1fr}.nbody .ncol:last-child{display:none}}
@media (prefers-reduced-motion:reduce){.npage,.npt{animation:none}}
`;document.head.append(st)})();
