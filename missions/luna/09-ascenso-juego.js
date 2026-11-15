/* Ascenso con muestras · lógica del minijuego (usa Lab, C, el, rng, clamp, rgba, tint del archivo HTML) */
const lab=Lab({W:800,H:500});const ctx=lab.ctx;
const VE=315*9.80665,DRY=400,PROP=460,NEED=1870,TB=18,MDOT=PROP/TB,VMAX=2400,GY=440,LX=250,SC=1.45;
const PMAX=PROP/(Math.exp(NEED/VE)-1)-DRY;
const ICE=lab.param('hielo','1')==='1',ROCK=lab.param('roca','1')==='1';
const PCOL={J1:'#90e1bd',J2:'#8ed5f3',J3:'#ffc779',J4:'#d5afff',IA:'#acbbce'};
const RK=['vuelo','instrumentos','operaciones','comunicaciones'],RN={vuelo:'Vuelo',instrumentos:'Instrumentos',operaciones:'Operaciones',comunicaciones:'Comunicaciones'};
const ROLES={vuelo:'J1',instrumentos:'IA',operaciones:'IA',comunicaciones:'IA'};lab.param('roles2','').split(',').forEach(x=>{const [k,v]=x.split(':');if(RN[k]&&/^(J[1-4]|IA)$/.test(v||''))ROLES[k]=v});
if(RK.every(k=>ROLES[k]==='IA'))ROLES.vuelo='J1';
const NAMES={};lab.param('names','').split('|').forEach(x=>{const i=x.indexOf(':');if(i>0&&x.slice(i+1))NAMES[x.slice(0,i)]=x.slice(i+1)});
const PN=p=>p==='IA'?'IA':(NAMES[p]||p);
const isJ=p=>/^J[1-4]$/.test(p||'');
const MOTOR=isJ(lab.param('motor',''))?lab.param('motor',''):(isJ(ROLES.vuelo)?ROLES.vuelo:'J1');
const NAVP=lab.param('nav','IA'),NAVH=isJ(NAVP)?NAVP:MOTOR;let navIA=!isJ(NAVP);
const OWN={};RK.forEach(k=>{const p=ROLES[k];if(p!=='IA')(OWN[p]=OWN[p]||[]).push(k)});
const SOLO=new Set([...Object.keys(OWN),MOTOR].concat(isJ(NAVP)?[NAVP]:[])).size===1,ME=Object.keys(OWN)[0]||MOTOR;
{const g=document.querySelector('.goal');if(g)g.innerHTML=SOLO?'<strong>Objetivo.</strong> Elige qué sube al orbitador, escucha a la tripulación y corta el motor justo en la velocidad de órbita.':'<strong>Objetivo.</strong> Elijan qué sube al orbitador, voten en equipo y corten el motor justo en la velocidad de órbita.'}
const ITEMS=[
 {id:'hielo',k:'m',n:'Hielo del cráter',kg:80,sci:30,col:C.blue,d:'50 kg de hielo + 30 kg de contenedor frío',na:'No hay: el hopper no envió hielo',av:ICE},
 {id:'roca',k:'m',n:'Roca de la repisa alta',kg:18,sci:12,col:C.violet,d:'Roca madre que alcanzó el rover',na:'No hay: el rover no llegó a la repisa alta',av:ROCK},
 {id:'regolito',k:'m',n:'Regolito',kg:8,sci:8,col:'#c3ccd8',d:'Polvo de la superficie junto al lander',av:true},
 {id:'radio',k:'e',n:'Radio de respaldo',kg:22,col:C.mint,d:'Si la dejas: un solo encendido, sin corrección',av:true},
 {id:'guia',k:'e',n:'Computadora de guía',kg:26,col:C.gold,d:'Si la dejas: la barra de velocidad se apaga al 70 % y cortas por tiempo',av:true},
 {id:'camara',k:'e',n:'Cámara de ascenso',kg:12,col:C.red,d:'Si la dejas: no hay video del despegue para la Tierra',av:true}];
const sec=x=>x==null?'—':x.toFixed(1).replace('.',',')+' s',pct=x=>(x>=0?'+':'−')+Math.abs(x*100).toFixed(1).replace('.',',')+' %',D2R=Math.PI/180;
const rr=rng(5),HILLS=[];for(let x=-10;x<=820;x+=26+rr()*30)HILLS.push([x,GY-14-rr()*34]);const CRS=Array.from({length:8},()=>[rr()*540,GY+14+rr()*50,10+rr()*28]);
let on,V,st,v,mp,tb,burnN,guideOff,outcome,doneT,deb,hb=false,sd=0,P,readyT,riseCut,decided,landed,ang,lossDv,errW,rawSum,hist,ph1,ph2,curErr,sayT;
const has=id=>on.has(id);
function calc(){const p=ITEMS.filter(i=>i.av&&on.has(i.id)).reduce((a,i)=>a+i.kg,0),m0=DRY+PROP+p,mf=DRY+p,av=VE*Math.log(m0/mf),mg=(av-NEED)/NEED;return{p,m0,mf,av,mg,tol:mg<.05?30:45,tc:av>=NEED?(m0-m0/Math.exp(NEED/VE))/MDOT:null}}
function tgtAng(){const p=clamp(v/NEED,0,1),x=clamp((p-.08)/.75,0,1);return 75*x*x*(3-2*x)}

/* Panel */
const bI=lab.box('Bodega de ascenso',RN.instrumentos+' · '+PN(ROLES.instrumentos));
lab.note(bI,'Todo lo que sube pesa. Toca para dejar algo en la Luna y mira cómo cambia la barra de Δv.');
const list=el('div','items');bI.append(list);const ib={};
ITEMS.forEach((it,i)=>{if(!i||ITEMS[i-1].k!==it.k)list.append(el('small','grp',it.k==='m'?'Muestras':'Equipo de la etapa'));const b=el('button','item');b.type='button';b.style.setProperty('--c',it.col);b.append(el('i'),el('b',null,it.n),el('em',null,it.kg+' kg'),el('span',null,it.av?it.d:it.na));
  b.addEventListener('click',()=>{if(st!=='pack'||!it.av)return;if(on.has(it.id))on.delete(it.id);else on.add(it.id);lab.sfx('click');RK.forEach(k=>{if(ROLES[k]!=='IA')V[k]=null});refresh()});ib[it.id]=b;list.append(b)});
const bV=lab.box(SOLO?'Consulta a la tripulación':'Votación de despegue',SOLO?'Tú decides':'Toda la tripulación');bV.append(el('p','rule',SOLO?'Juegas solo: la tripulación IA opina, pero la decisión final es tuya. Si cambias la carga, se consulta de nuevo.':'Vota cada persona una vez, aunque lleve varios puestos. La IA solo recomienda: no vota. Gana la mayoría; si empatan, decide Vuelo. Si cambian la carga, se vota de nuevo.'));const vl=el('div','votes');bV.append(vl);const vr={};
RK.forEach(k=>{const p=ROLES[k],r=el('div','vote'),top=el('div','vt'),tg=el('span','tag',PN(p)),ctl=el('div','vv'),why=el('small');tg.style.setProperty('--c',PCOL[p]||PCOL.IA);top.append(el('b',null,RN[k]),tg);r.append(top,ctl,why);vl.append(r);
  const first=p!=='IA'&&OWN[p][0]===k;if(first)[['si','Sí'],['no','No']].forEach(([val,l])=>{const b=el('button',null,l);b.type='button';b.dataset.v=val;b.addEventListener('click',()=>{if(st!=='pack')return;OWN[p].forEach(r=>V[r]=val);lab.sfx('select');refresh()});ctl.append(b)});
  vr[k]={r,why,ctl,first}});
const goB=lab.btn(bV,'Despegar',()=>launch(),'go');
const bB=lab.box('Motor',RN.vuelo+' · '+PN(MOTOR));bB.classList.add('pri');bB.dataset.onlineControl='motor';
const holdB=lab.btn(bB,'Mantén para encender',null,'hold');
holdB.addEventListener('pointerdown',e=>{e.preventDefault();if(holdB.disabled)return;hb=true;holdB.classList.add('held');try{holdB.setPointerCapture(e.pointerId)}catch(_){}});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>holdB.addEventListener(ev,()=>{hb=false;holdB.classList.remove('held')}));
lab.note(bB,'Mantén ESPACIO, el botón o la escena. Suelta para cortar dentro de la ventana dorada.');
const bA=lab.box('Actitud','Navegación');bA.dataset.onlineControl='nav';const seatA=bA.querySelector('.seat');
lab.seg(bA,[['h',PN(NAVH)],['ia','IA']],navIA?'ia':'h',x=>{navIA=x==='ia';updA()});
const dvA=el('div','drive');bA.append(dvA);
const steerBtns=[['◀  Izquierda',-1],['Derecha  ▶',1]].map(([l,d])=>{const b=lab.btn(dvA,l,null);const onp=e=>{e.preventDefault();if(b.disabled)return;sd=d;b.classList.add('held');try{b.setPointerCapture(e.pointerId)}catch(_){}};const off=()=>{if(sd===d)sd=0;b.classList.remove('held')};b.addEventListener('pointerdown',onp);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,off));return b});
const noteA=lab.note(bA,'');
function updA(){seatA.textContent='Navegación · '+(navIA?'IA':PN(NAVH));steerBtns.forEach(b=>b.disabled=navIA);noteA.textContent=navIA?'La IA alinea la etapa con la silueta punteada. Reacciona con algo de retraso.':'Alinea la etapa con la silueta punteada: ← → o A D. Inclinada, el motor empuja de lado y pierde velocidad.'}
lab.feedback();lab.stateBox();
lab.key=code=>['Space','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(code);

/* Votos */
function aiVote(k,c){
  if(k==='vuelo')return c.mg>=.03?['si','Margen '+pct(c.mg)+': alcanza aunque pilotemos con errores.']:['no',c.av<NEED?'No alcanza la órbita.':'Margen '+pct(c.mg)+': un pilotaje torcido nos deja cortos.'];
  if(k==='instrumentos'){if(ICE&&!has('hielo'))return['no','Dejamos el hielo: la mejor ciencia.'];if(!ICE&&ROCK&&!has('roca'))return['no','Sin hielo, la roca es lo más valioso.'];return['si','La ciencia principal va a bordo.']}
  if(k==='operaciones')return has('guia')||c.mg>=.08?['si',has('guia')?'Con guía, el corte es seguro.':'Sin guía, pero con margen de sobra.']:['no','Sin guía y con poco margen.'];
  return has('radio')||c.mg>=.08?['si',has('radio')?'Con radio hay una segunda oportunidad.':'Sin radio, pero con margen de sobra.']:['no','Sin radio no hay corrección.']}
function tally(){const pend=RK.filter(k=>!V[k]).length,yes=RK.filter(k=>V[k]==='si').length;if(SOLO){const mine=V[OWN[ME][0]];return{pend,yes,pass:!pend&&mine==='si',kind:yes===4?'unanime':'solo',solo:true,mine}}const pass=(()=>{const H=Object.keys(OWN),hv=H.map(p=>V[OWN[p][0]]),hp=hv.filter(x=>!x).length,hy=hv.filter(x=>x==='si').length,n=H.length,fl=isJ(ROLES.vuelo)?ROLES.vuelo:H[0],fv=V[OWN[fl][0]];return{pend:hp,yes:hy,n,pass:!hp&&(hy*2>n||(hy*2===n&&fv==='si')),kind:hy===n?'unanime':hy*2>n?'mayoria':'vuelo'}})();return pass}
function refresh(){const c=calc();
  ITEMS.forEach(it=>{ib[it.id].setAttribute('aria-pressed',String(it.av&&on.has(it.id)));ib[it.id].disabled=!it.av||st!=='pack'});
  RK.forEach(k=>{const a=aiVote(k,c),o=vr[k],p=ROLES[k];if(p==='IA')V[k]=a[0];o.r.dataset.v=V[k]||'';
    if(p==='IA'){o.ctl.replaceChildren(el('em','vres',(a[0]==='si'?'Recomienda sí':'Recomienda no')));o.why.textContent=a[1]+(SOLO?'':' No cuenta como voto.')}
    else if(o.first){o.ctl.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.v===V[k]));b.disabled=st!=='pack'});o.why.textContent=(OWN[p].length>1?'Su voto cuenta por '+OWN[p].length+' puestos. ':'')+'La IA diría: '+a[1]}
    else{o.ctl.replaceChildren(el('em','same',V[k]?(V[k]==='si'?'Sí':'No'):'…'));o.why.textContent='Mismo voto que '+RN[OWN[p][0]]+'. La IA diría: '+a[1]}});
  if(st==='pack'){const T=tally();goB.disabled=!T.pass;if(T.solo){const ia=RK.filter(k=>ROLES[k]==='IA'),iy=ia.filter(k=>V[k]==='si').length;goB.textContent=!T.mine?'Decide: ¿sí o no?':T.mine==='no'?'Votaste no: cambia la carga':'Despegar'+(ia.length?' · la IA: '+iy+' de '+ia.length+' a favor':'');lab.say(c.av<NEED?'Con '+c.p+' kg no alcanza la órbita: deja al menos '+Math.ceil(c.p-PMAX)+' kg más.':(ia.length&&iy<ia.length&&T.mine==='si'?'Parte de la tripulación duda. Puedes despegar igual: lee sus razones. ':'')+'Margen '+pct(c.mg)+'. '+(c.mg<.05?'Ventana de corte estrecha: ±30 m/s.':'Ventana de corte: ±45 m/s.'),c.av<NEED?'bad':c.mg<.05?'warn':'good');return}goB.textContent=T.pend?(T.pend>1?'Faltan '+T.pend+' votos':'Falta 1 voto'):!T.pass?(T.yes*2===T.n?'Empate: Vuelo vota no':'Sin mayoría ('+T.yes+' de '+T.n+')'):T.yes===T.n?'Despegar · unánime':T.yes*2>T.n?'Despegar · mayoría '+T.yes+' a '+(T.n-T.yes):'Empate: Vuelo decide despegar';
    lab.say(c.av<NEED?'Con '+c.p+' kg no alcanza la órbita: hay que dejar al menos '+Math.ceil(c.p-PMAX)+' kg más.':(!T.pend&&!T.pass?'La tripulación no aprueba este plan. Cambien la carga y voten otra vez. ':'')+'Margen '+pct(c.mg)+'. '+(c.mg<.05?'Ventana de corte estrecha: ±30 m/s.':'Ventana de corte: ±45 m/s.'),c.av<NEED?'bad':c.mg<.05||(!T.pend&&!T.pass)?'warn':'good')}}

/* Vuelo */
function launch(){if(st!=='pack')return;const T=tally();if(!T.pass)return;P=calc();decided=T.kind;st='ready';readyT=0;lab.begin();try{document.activeElement.blur()}catch(_){}refresh();goB.disabled=true;goB.textContent={unanime:'Unánime ✓',mayoria:'Mayoría ✓',vuelo:'Decidió Vuelo ✓',solo:'Decidiste tú ✓'}[decided];holdB.disabled=false;lab.sfx('data_beep');
  lab.say(P.av<NEED?(SOLO?'Despegas sin margen: no alcanza. Inténtalo igual.':'Despegan sin margen: no alcanza. Inténtenlo igual.'):'Motor armado. '+(SOLO?'Mantén para encender. ':PN(MOTOR)+': mantén para encender. ')+(navIA?'La IA lleva la actitud.':(SOLO?'Alinea con la silueta usando ← →.':PN(NAVH)+': alinea con la silueta.'))+(has('guia')?'':' Sin guía: corta cerca de los '+sec(P.tc)+'.'),P.av<NEED?'bad':'')}
function riseNow(){if(st==='pack'||st==='ready')return 0;let r=Math.pow(Math.min(v,NEED*1.12)/NEED,1.5)*360;if(st==='done'&&outcome==='suborbital')r=riseCut*Math.max(0,1-Math.pow(Math.min(1,doneT/1.5),2));if(st==='done'&&outcome==='perdida')r+=doneT*90;return r}
function cut(){const lo=NEED-P.tol,hi=NEED+P.tol;holdB.disabled=true;
  if(v>=lo&&v<=hi){finish(burnN===2?'corregida':'exacta');return}
  if(v<lo){if(burnN===1&&has('radio')&&mp>0){st='corr';readyT=0;holdB.disabled=false;lab.say('Corto: '+Math.round(v)+' m/s. La radio de respaldo lo confirma: mantén para un pulso más.','warn');lab.sfx('alarm');return}finish('suborbital');return}
  if(has('radio')&&v<=hi+150){finish('corregida');return}finish('perdida')}
function finish(k){outcome=k;riseCut=riseNow();st='done';doneT=0;deb=false;landed=false;holdB.disabled=true;const ok=k==='exacta'||k==='corregida';lab.sfx(ok?'success':'error');
  lab.say({exacta:'¡Corte perfecto! El orbitador viene a buscarte.',corregida:'Fuera de la ventana, pero la radio permitió corregir.',perdida:'Demasiada velocidad: la órbita quedó lejos del orbitador.',suborbital:'Faltó velocidad: la etapa no llega a la órbita.'}[k],ok?'good':'bad')}
const avgErr=()=>rawSum?errW/rawSum:0;
function debrief(){const ok=outcome==='exacta'||outcome==='corregida',ret=ITEMS.filter(i=>i.k==='m'&&i.av&&has(i.id)),left=ITEMS.filter(i=>i.av&&!has(i.id)),sci=ok?ret.reduce((a,i)=>a+i.sci,0):0,err=Math.abs(v-NEED),ae=avgErr(),
    cutS=outcome==='exacta'?Math.max(12,25-12*err/P.tol):outcome==='corregida'?10:0,pil=25*clamp(1-ae/12,0,1);
  const pilTxt=' Pilotaje: '+ae.toFixed(1).replace('.',',')+'° de error medio, '+Math.round(lossDv)+' m/s perdidos por empujar de lado'+(navIA?' (actitud: IA).':'.');
  lab.debrief({tone:ok?(outcome==='exacta'?'good':'warn'):'bad',title:{exacta:'Órbita exacta · muestras en el orbitador',corregida:'Órbita corregida · muestras a salvo',perdida:'Órbita equivocada · el orbitador no llega',suborbital:'Sin órbita · la etapa no llegó'}[outcome],
    areas:[['Ciencia',sci,50],['Corte',cutS,25],['Pilotaje',pil,25]],
    data:{outcome,orbita:ok,muestras:ok?ret.map(i=>i.id):[],dejado:left.map(i=>i.id),cargaKg:P.p,dvDisponible:Math.round(P.av),dvNecesaria:NEED,margen:Math.round(P.mg*1000)/10,dvFinal:Math.round(v),propSobrante:Math.round(mp),kgDeMas:Math.max(0,Math.ceil(P.p-PMAX)),perdidaPilotaje:Math.round(lossDv),errorMedio:Math.round(ae*10)/10,motor:MOTOR,actitud:navIA?'IA':NAVH,votos:Object.assign({},V),roles:Object.assign({},ROLES),decision:decided,correccion:burnN===2,guiaApagada:guideOff,sinCamara:!has('camara')},
    got:ok?'Subimos '+(ret.length?ret.map(i=>i.n.toLowerCase()).join(', '):'la etapa vacía')+'. '+(outcome==='exacta'?'Corte a '+Math.round(v)+' m/s, dentro de la ventana.':'La radio de respaldo permitió corregir.'):outcome==='suborbital'?'El motor se apagó a '+Math.round(v)+' m/s: faltaron '+Math.max(1,Math.round(NEED-v))+' m/s para la órbita.':'Cortaste a '+Math.round(v)+' m/s: la órbita quedó demasiado alta para el encuentro.',
    lost:(left.length?'Quedó en la Luna: '+left.map(i=>i.n.toLowerCase()).join(', ')+'.':'No dejamos nada: subimos con todo el peso.')+pilTxt,
    why:P.av<NEED?'Con '+P.p+' kg la Δv disponible era '+Math.round(P.av)+' m/s, menos que los '+NEED+' necesarios. Con '+Math.ceil(P.p-PMAX)+' kg menos, alcanzaba.':outcome==='suborbital'&&lossDv>P.av-NEED?'Había '+Math.round(P.av-NEED)+' m/s de margen, pero el pilotaje torcido gastó '+Math.round(lossDv)+'. Más margen o mejor actitud.':'Δv = 3090 · ln(m₀ / m_f). Cada kilo que subes está en las dos masas y achica la división: menos velocidad con el mismo combustible.',
    who:'Motor: '+PN(MOTOR)+' · Actitud: '+(navIA?'IA':PN(NAVH))+'. Votación: '+RK.map(k=>RN[k]+' '+(ROLES[k]==='IA'?'(IA, recomendó '+(V[k]==='si'?'sí':'no')+')':(V[k]==='si'?'sí':'no'))).join(' · ')+'. '+{unanime:'Decisión unánime.',mayoria:'Mayoría de la tripulación.',vuelo:'Empate: decidió Vuelo.',solo:'Decidiste tú, con la opinión de la IA.'}[decided],
    real:'En 2020, la etapa de ascenso de Chang’e 5 despegó de la Luna con 1,7 kg de muestras y se acopló en órbita a su nave de regreso.'})}

/* Dibujo */
function zoom(fn){ctx.save();ctx.translate(LX,GY);ctx.scale(SC,SC);ctx.translate(-LX,-GY);fn();ctx.restore()}
function descent(){const x=LX,y=GY-58;lab.shadowE(x,GY+2,84,10,.55);ctx.strokeStyle='#8b97aa';ctx.lineWidth=3;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(x+s*36,y+26);ctx.lineTo(x+s*62,GY-2);ctx.stroke();ctx.fillStyle='#8b97aa';ctx.beginPath();ctx.ellipse(x+s*62,GY,9,3,0,0,7);ctx.fill()});
  lab.prism(x-44,y,88,32,12,'#b8913a',{edge:C.gold,lw:1});ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x-44+i*22,y+2);ctx.lineTo(x-44+i*22,y+30);ctx.stroke()}}
function ghost(x,yb,a){ctx.save();ctx.translate(x,yb-22);ctx.rotate(a*D2R);ctx.setLineDash([4,4]);ctx.lineDashOffset=-lab.t*20;ctx.strokeStyle=rgba(C.mint,.85);ctx.lineWidth=1.4;ctx.strokeRect(-34,-24,68,46);ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(0,-46);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=C.mint;ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(-5,-44);ctx.lineTo(5,-44);ctx.closePath();ctx.fill();ctx.restore()}
function ascent(x,yb){ctx.save();ctx.translate(x,yb-22);ctx.rotate(ang*D2R);ctx.translate(-x,-(yb-22));
  ctx.fillStyle='#2a3546';ctx.beginPath();ctx.moveTo(x-8,yb);ctx.lineTo(x+8,yb);ctx.lineTo(x+12,yb+12);ctx.lineTo(x-12,yb+12);ctx.closePath();ctx.fill();
  if(st==='burn'){const L=26+Math.random()*18,g=ctx.createLinearGradient(0,yb+12,0,yb+12+L);g.addColorStop(0,'#fff1cf');g.addColorStop(.5,'rgba(255,199,121,.85)');g.addColorStop(1,'rgba(255,138,122,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-11,yb+12);ctx.quadraticCurveTo(x,yb+12+L*1.4,x+11,yb+12);ctx.fill();lab.glow(x,yb+22,46,C.gold,.5)}
  let cy=yb-4;ITEMS.filter(i=>i.k==='m'&&i.av&&has(i.id)).forEach(it=>{const hh=Math.max(7,it.kg/5);lab.prism(x-60,cy-hh,22,hh,6,it.col,{edge:tint(it.col,.35),lw:1});cy-=hh+3});
  lab.prism(x-32,yb-44,64,44,14,'#9aa6b8',{edge:'#f0f4fa',lw:1});
  ctx.fillStyle='#0b111a';ctx.beginPath();ctx.moveTo(x-24,yb-35);ctx.lineTo(x-6,yb-35);ctx.lineTo(x-10,yb-22);ctx.lineTo(x-24,yb-22);ctx.closePath();ctx.fill();ctx.fillStyle=rgba(C.blue,.4);ctx.fillRect(x-21,yb-33,6,3);
  if(has('radio')){ctx.strokeStyle=C.mint;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-14,yb-52);ctx.lineTo(x-14,yb-64);ctx.stroke();ctx.beginPath();ctx.ellipse(x-14,yb-67,9,3.5,-.3,0,7);ctx.fillStyle='#d6dde6';ctx.fill();ctx.stroke()}
  if(has('guia'))lab.prism(x+4,yb-60,16,10,6,'#b8913a',{edge:C.gold,lw:1});
  if(has('camara')){lab.prism(x+38,yb-30,10,8,4,'#46546a',{edge:C.red,lw:1});lab.ball(x+48,yb-26,2,C.red)}
  ctx.restore()}
function orbiter(sx,sy){if(st!=='done'||outcome==='suborbital')return;const ok=outcome!=='perdida',k=Math.min(1,doneT/1.4),e=1-Math.pow(1-k,3),x=ok?620+(sx+90-620)*e:620-k*800,y=ok?sy-40:sy+150;
  ctx.fillStyle='#1c3a72';ctx.fillRect(x-40,y-4,22,8);ctx.fillRect(x+18,y-4,22,8);ctx.strokeStyle=rgba(C.blue,.7);ctx.lineWidth=1;ctx.strokeRect(x-40,y-4,22,8);ctx.strokeRect(x+18,y-4,22,8);lab.prism(x-14,y-12,28,22,8,'#7fb2ff',{edge:C.blue,lw:1});
  if(ok&&k>=1&&!landed){landed=true;lab.pop('ACOPLE',x,y-36,C.mint,16);lab.burst(x-14,y,{n:16,color:C.mint,glow:true,speed:90,life:.6,size:2})}}
function gauge(){const c=st==='pack'?calc():P,x=548,y=40,w=238,h=420;lab.rr(x,y,w,h,14);ctx.fillStyle='rgba(8,12,20,.86)';ctx.fill();ctx.strokeStyle='rgba(142,213,243,.22)';ctx.lineWidth=1;ctx.stroke();
  const hide=guideOff&&st!=='done',pk=st==='pack';
  lab.txt(pk?'Δv DISPONIBLE':'VELOCIDAD',x+16,y+20,{size:11,w:800,color:C.muted});
  if(pk){lab.txt(Math.round(c.av)+' m/s',x+16,y+46,{size:22,w:800,mono:true,color:c.av<NEED?C.red:C.ink});lab.txt('margen '+pct(c.mg),x+16,y+72,{size:12,w:700,color:c.av<NEED?C.red:c.mg<.05?C.gold:C.mint})}
  else if(!hide){lab.txt(Math.round(v)+' m/s',x+16,y+46,{size:22,w:800,mono:true,color:C.blue});lab.txt('ventana '+(NEED-P.tol)+'–'+(NEED+P.tol),x+16,y+72,{size:12,w:700,color:C.gold})}
  else{lab.txt('GUÍA APAGADA',x+16,y+46,{size:17,w:800,color:C.gold});lab.txt('corta por tiempo',x+16,y+72,{size:12,w:700,color:C.muted})}
  const bx=x+18,bw=30,top=y+96,bot=y+h-110,Y=val=>bot-(bot-top)*clamp(val/VMAX,0,1),lx=bx+bw+14;
  lab.rr(bx,top,bw,bot-top,7);ctx.fillStyle='#1d2736';ctx.fill();
  if(pk){const yy=Y(c.av);ctx.fillStyle=c.av<NEED?C.red:c.mg<.05?C.gold:C.mint;lab.rr(bx,yy,bw,bot-yy,7);ctx.fill()}
  else{const lo=NEED-P.tol,hi=NEED+P.tol,reach=P.av-lossDv;
    ctx.setLineDash([3,4]);ctx.strokeStyle=rgba(C.mint,.8);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx-4,Y(reach));ctx.lineTo(bx+bw+4,Y(reach));ctx.stroke();ctx.setLineDash([]);lab.txt('alcance',lx,Y(reach)-8,{size:10,color:C.mint});
    if(!hide){ctx.fillStyle=rgba(C.gold,.3);ctx.fillRect(bx-7,Y(hi),bw+14,Y(lo)-Y(hi));ctx.strokeStyle=C.gold;ctx.lineWidth=1.5;ctx.strokeRect(bx-7,Y(hi),bw+14,Y(lo)-Y(hi));const yy=Y(v);ctx.fillStyle=C.blue;lab.rr(bx,yy,bw,bot-yy,7);ctx.fill();if(st==='burn')lab.glow(bx+bw/2,yy,24,C.blue,.6)}
    else{ctx.fillStyle=rgba(C.gold,.1);lab.rr(bx,top,bw,bot-top,7);ctx.fill();ctx.strokeStyle=rgba(C.gold,.35);for(let q=top+6;q<bot;q+=10){ctx.beginPath();ctx.moveTo(bx+2,q+8);ctx.lineTo(bx+bw-2,q);ctx.stroke()}}}
  ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx-8,Y(NEED));ctx.lineTo(bx+bw+8,Y(NEED));ctx.stroke();lab.txt('Órbita '+NEED,lx,Y(NEED)+6,{size:11,w:700});
  if(!pk){lab.txt(sec(tb),lx,bot-30,{size:17,w:800,mono:true,color:C.gold});lab.txt('corte ≈ '+sec(P.tc),lx,bot-10,{size:10,color:C.muted});if(lossDv>1)lab.txt('pilotaje −'+Math.round(lossDv)+' m/s',lx,top+8,{size:11,w:700,color:lossDv>25?C.red:C.gold})}
  const ey=y+h-84;ctx.fillStyle='rgba(52,66,85,.6)';ctx.fillRect(x+14,ey-14,w-28,1);
  lab.txt('Δv = 3090 · ln(m₀/m_f)',x+16,ey+4,{size:12,w:700,mono:true});lab.txt('m₀ '+Math.round(c.m0)+' kg',x+16,ey+28,{size:11,mono:true,color:C.muted});lab.txt('m_f '+Math.round(c.mf)+' kg',x+122,ey+28,{size:11,mono:true,color:C.muted});lab.txt('carga '+c.p+' kg',x+16,ey+50,{size:11,w:700,mono:true,color:C.gold})}
function attDial(){if(st==='pack')return;const x=70,y=200,R=34,tg=tgtAng(),e=curErr||0,col=e<4?C.mint:e<9?C.gold:C.red;lab.rr(x-50,y-56,100,112,12);ctx.fillStyle='rgba(8,12,20,.8)';ctx.fill();lab.txt('ACTITUD',x,y-42,{size:10,w:800,align:'center',color:C.muted});
  ctx.strokeStyle='#2a3546';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y+6,R,-Math.PI/2-.3,.3);ctx.stroke();
  const pa=a=>-Math.PI/2+a*D2R;ctx.strokeStyle=C.mint;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+6);ctx.lineTo(x+Math.cos(pa(tg))*(R+6),y+6+Math.sin(pa(tg))*(R+6));ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+6);ctx.lineTo(x+Math.cos(pa(ang))*R,y+6+Math.sin(pa(ang))*R);ctx.stroke();lab.ball(x,y+6,3,col);
  lab.txt(Math.round(e)+'° de error',x,y+46,{size:11,w:700,align:'center',color:col})}

let spc=false,spcT=null;window.addEventListener('keydown',e=>{if(e.code==='Space'){spc=true;clearTimeout(spcT)}});window.addEventListener('keyup',e=>{if(e.code==='Space')spc=false});window.addEventListener('blur',()=>{if(spc){clearTimeout(spcT);spcT=setTimeout(()=>{spc=false},1200)}});window.addEventListener('focus',()=>clearTimeout(spcT));
lab.frame=dt=>{const hold=!!(spc||lab.held.Space||lab.pressed||hb),sdir=sd||((lab.held.ArrowRight||lab.held.KeyD)?1:0)-((lab.held.ArrowLeft||lab.held.KeyA)?1:0);
  if(st==='ready'||st==='corr'){readyT+=dt;if(hold&&readyT>.35){burnN=st==='corr'?2:1;st='burn';lab.sfx('thruster')}}
  if(st==='burn'){const dm=Math.min(mp,MDOT*dt),m=P.mf+mp,raw=dm>0?VE*Math.log(m/(m-dm)):0;mp-=dm;tb+=dt;
    const tg=tgtAng(),drift=10*Math.sin(tb*.8+ph1)+7*Math.sin(tb*2.1+ph2);let rate;
    if(navIA){hist.push([tb,tg]);while(hist.length>1&&hist[0][0]<tb-.4)hist.shift();rate=clamp((hist[0][1]-ang)*4.5,-45,45)+(Math.random()-.5)*14}else rate=sdir*45;
    ang=clamp(ang+(rate+drift)*dt,-40,110);curErr=Math.abs(ang-tg);const eff=Math.max(.25,1-.5*Math.pow(Math.min(curErr,35)/24,2));v+=raw*eff;lossDv+=raw*(1-eff);errW+=curErr*raw;rawSum+=raw;
    if(!has('guia')&&!guideOff&&v>.7*NEED){guideOff=true;lab.pop('GUÍA APAGADA',LX+60,120,C.gold,15);lab.sfx('power_down')}
    sayT-=dt;if(sayT<=0){sayT=.3;lab.say(curErr<4?'Actitud alineada. '+(guideOff?'Corta por tiempo.':'Suelta en la ventana dorada.'):'Etapa inclinada '+Math.round(curErr)+'°: se pierde velocidad. '+(navIA?'La IA corrige.':'Corrige con ← →.'),curErr<4?'good':curErr<9?'warn':'bad')}
    if(!hold||mp<=0)cut()}
  if(st==='done'){doneT+=dt;if(outcome==='suborbital'&&doneT>=1.5&&!landed){landed=true;lab.shake(.6);lab.burst(LX,GY-80,{n:30,color:'#8b97aa',speed:140,a:-Math.PI/2,spread:2.6,life:.9,g:160,size:2.6});lab.pop('SIN ÓRBITA',LX,GY-150,C.red,16)}if(!deb&&doneT>1.8){deb=true;debrief()}}
  const r=riseNow(),lift=Math.min(r,170),go=Math.max(0,r-170),sx=LX+clamp(r-60,0,300)*.35*Math.sin(Math.min(ang,80)*D2R),syb=GY-58-lift/SC;
  lab.drawStars(1);lab.glow(96,80,48,C.blue,.25);lab.ball(96,80,20,'#2f7fc6');ctx.fillStyle='rgba(240,244,250,.45)';ctx.beginPath();ctx.arc(91,76,7,0,7);ctx.fill();lab.txt('Tierra',96,114,{size:10,align:'center',color:C.muted});
  if(GY+go-80<lab.H){ctx.save();ctx.translate(0,go);ctx.beginPath();ctx.moveTo(-10,lab.H+10);HILLS.forEach(([x,y])=>ctx.lineTo(x,y));ctx.lineTo(820,lab.H+10);ctx.closePath();ctx.fillStyle='#1c2430';ctx.fill();
    const g=ctx.createLinearGradient(0,GY,0,lab.H);g.addColorStop(0,'#4a5363');g.addColorStop(1,'#1a212c');ctx.fillStyle=g;ctx.fillRect(-10,GY,830,lab.H-GY+10);
    CRS.forEach(([x,y,q])=>{ctx.fillStyle='rgba(10,14,20,.35)';ctx.beginPath();ctx.ellipse(x,y,q,q*.28,0,0,7);ctx.fill()});zoom(descent);ctx.restore()}
  const ax=LX+(sx-LX)/SC;
  zoom(()=>{if(st==='ready'||st==='burn'||st==='corr')ghost(ax,syb,tgtAng());ascent(ax,syb)});
  if(st==='burn'&&Math.random()<dt*40){const a=(90+ang)*D2R,bxp=LX+(ax-LX)*SC+Math.cos(a)*SC*14,byp=GY+(syb-22-GY)*SC+Math.sin(a)*SC*36;lab.burst(bxp,byp,{n:1,color:Math.random()<.5?C.gold:'#fff1cf',speed:160,a,spread:.5,life:.45,glow:true,size:2.4})}
  if(st==='pack'||st==='ready')lab.txt('Etapa de ascenso',LX,GY-58*SC-118,{size:11,w:700,align:'center',color:C.muted});
  orbiter(LX+(ax-LX)*SC,GY+(syb-22-GY)*SC);attDial();gauge();
  const c=st==='pack'?calc():P,T=tally();
  const rows=[['Carga a subir',c.p+' kg'],['Δv disponible',Math.round(c.av)+' m/s',c.av<NEED?'bad':c.mg<.05?'warn':'good'],['Margen',pct(c.mg),c.av<NEED?'bad':c.mg<.05?'warn':'good'],['Ventana de corte','±'+c.tol+' m/s',c.tol<45?'warn':''],['Encendidos',has('radio')?'2 (con radio)':'1 (sin radio)',has('radio')?'':'warn'],['Guía',has('guia')?'Completa':'Se apaga al 70 %',has('guia')?'':'warn']];
  if(st==='pack')rows.push(['Votos a favor',T.pend?T.yes+' de '+(T.n||4)+' · faltan '+T.pend:T.yes+' de '+(T.n||4),T.pass?'good':T.pend?'':'bad']);
  else rows.push(['Combustible',Math.round(mp)+' kg',mp<20?'warn':''],['Velocidad',guideOff&&st!=='done'?'—':Math.round(v)+' m/s'],['Pérdida por pilotaje',Math.round(lossDv)+' m/s',lossDv>25?'bad':lossDv>10?'warn':'']);
  if(st==='done')rows.push(['Resultado',{exacta:'Órbita exacta',corregida:'Órbita corregida',perdida:'Sin encuentro',suborbital:'Sin órbita'}[outcome],outcome==='exacta'?'good':outcome==='corregida'?'warn':'bad']);
  lab.state(rows);
  lab.hint(st==='ready'?'Mantén ESPACIO para encender'+(navIA?'':' · ← → para alinear'):st==='corr'?'Un pulso más: mantén y suelta en la ventana':st==='burn'&&!navIA?'← → alinea con la silueta':st==='pack'&&T.pend?(SOLO?'Elige la carga y decide':'Elijan la carga y voten'):'')};
function reset(){lab.debrief(null);on=new Set(ITEMS.filter(i=>i.av).map(i=>i.id));V={};st='pack';v=0;mp=PROP;tb=0;burnN=1;guideOff=false;outcome=null;doneT=0;deb=false;hb=false;sd=0;P=null;readyT=0;riseCut=0;decided=null;landed=false;ang=0;lossDv=0;errW=0;rawSum=0;hist=[];ph1=Math.random()*6;ph2=Math.random()*6;curErr=0;sayT=0;holdB.disabled=true;updA();refresh()}
lab.reset=reset;reset();
