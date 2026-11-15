/* MAPS · Prólogo animado de la Misión Luna (estilo anime). Reemplaza las burbujas del briefing. ?prologo=0 lo desactiva. */
(()=>{const HOOK=typeof STEPS!=='undefined'&&!!STEPS[0];
const TX={
es:{skip:'Saltar',voice:'Activar narración',tap:'Toca para seguir',replay:'Ver prólogo',start:'Comenzar misión',again:'Ver otra vez',
 c1k:'Polo sur · Luna',c1:'Hay lugares donde el Sol **nunca** ha entrado.',
 c2:'Sombra permanente. Miles de millones de años sin un solo rayo de luz.',
 c3:'Eso no es un problema… ¡es una **trampa de frío**! Ahí el agua se congela y ya no escapa.',
 chalk:['H₂O (s)','T < 110 K','☀ = 0','∴ ¿hielo?'],bam:'¡BAM!',brr:'¡BRRR!',c4a:'Combustible',c4b:'Aire',c4:'Hielo significa aire para respirar y combustible para volver. ¡Con ciencia, la Luna se vuelve una **gasolinera**!',
 c5:'Tres sospechosos. Uno de ellos guarda el hielo.',
 c6:['Fotografiar desde órbita','Enviar los datos a la Tierra','Bajar un robot a confirmarlo'],c6s:'El plan es simple. **Ejecutarlo**, no tanto.',
 c7a:'Cada kilo a bordo cuesta.',c7b:'Y todavía no tenemos cohete.',
 ep:'Episodio 01',title:'Misión Luna',epn:'El hielo de la sombra',c8:'Hipótesis lista. Hora de comprobarla.'},
en:{skip:'Skip',voice:'Play narration',tap:'Tap to continue',replay:'Watch prologue',start:'Start mission',again:'Watch again',
 c1k:'South pole · Moon',c1:'There are places the Sun has **never** reached.',
 c2:'Permanent shadow. Billions of years without a single ray of light.',
 c3:'That isn’t a problem… it’s a **cold trap**! In there, water freezes and never escapes.',
 chalk:['H₂O (s)','T < 110 K','☀ = 0','∴ ice?'],bam:'BAM!',brr:'BRRR!',c4a:'Fuel',c4b:'Air',c4:'Ice means air to breathe and fuel to fly home. With science, the Moon becomes a **gas station**!',
 c5:'Three suspects. One of them is hiding the ice.',
 c6:['Photograph from orbit','Send the data to Earth','Land a robot to confirm it'],c6s:'The plan is simple. **Pulling it off**, not so much.',
 c7a:'Every kilogram on board costs.',c7b:'And we still don’t have a rocket.',
 ep:'Episode 01',title:'Moon Mission',epn:'The ice in the shadow',c8:'Hypothesis ready. Time to test it.'},
pt:{skip:'Pular',voice:'Ativar narração',tap:'Toque para seguir',replay:'Ver prólogo',start:'Começar missão',again:'Ver de novo',
 c1k:'Polo sul · Lua',c1:'Há lugares onde o Sol **nunca** entrou.',
 c2:'Sombra permanente. Bilhões de anos sem um único raio de luz.',
 c3:'Isso não é um problema… é uma **armadilha fria**! Lá dentro a água congela e não escapa mais.',
 chalk:['H₂O (s)','T < 110 K','☀ = 0','∴ gelo?'],bam:'BAM!',brr:'BRRR!',c4a:'Combustível',c4b:'Ar',c4:'Gelo significa ar para respirar e combustível para voltar. Com ciência, a Lua vira um **posto de combustível**!',
 c5:'Três suspeitos. Um deles guarda o gelo.',
 c6:['Fotografar da órbita','Enviar os dados à Terra','Descer um robô para confirmar'],c6s:'O plano é simples. **Executá-lo**, nem tanto.',
 c7a:'Cada quilo a bordo custa.',c7b:'E ainda não temos foguete.',
 ep:'Episódio 01',title:'Missão Lua',epn:'O gelo da sombra',c8:'Hipótese pronta. Hora de testá-la.'}};
const prologueLanguage=()=>{
  const lang=window.PROLOGO_LANG||(typeof LANG!=='undefined'?LANG:'es');
  return ['es','en','pt'].includes(lang)?lang:'es';
};
const P=()=>TX[prologueLanguage()];
const X=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=s=>X(s).replace(/\*\*(.+?)\*\*/g,'<em>$1</em>');
const E=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const col=k=>(typeof CH!=='undefined'&&CH[k])||'#90e1bd';
const nm=k=>{try{return t('chars')[k][0]}catch(_){return k}};
const sfx=(n,v)=>{try{SND.play(n,v)}catch(_){}};
function vid(who,z,o){const w=E('div','pv2');w.style.setProperty('--c',col(who));const V=typeof VID!=='undefined'&&VID[who];const ok=V&&(typeof USEV==='undefined'||USEV);const i=E('div','pvi');
  if(ok){const v=document.createElement('video');v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.src=V.talk||V.src;v.style.objectPosition=o||V.o;v.style.transformOrigin=o||V.o;v.style.setProperty('--z',z||V.z||1.25);i.append(v);v.play&&v.play().catch(()=>{})}
  else if(typeof portrait==='function'){const p=portrait(who);p.classList.add('pfb');i.append(p)}
  w.append(i,E('i','pplate m'),E('i','pplate c'));return w}
/* Tomas propias del prólogo: si existe media/prologo/<key>.mp4 se usa; si no, cae al respaldo (fb). */
const lunaSrc=()=>((typeof CAMP!=='undefined'&&CAMP.find(x=>x.id==='luna'))||{}).vid||'media/luna-mision-02.mp4';
const crew=(who,z,o)=>{const V=typeof VID!=='undefined'&&VID[who];return V&&(typeof USEV==='undefined'||USEV)?{src:V.talk||V.src,o:o||V.o,z:z||V.z,c:col(who)}:()=>vid(who,z,o)};
const SHOTS=['01-polo-sur','02-sombra','03-trampa','04-gasolinera','05-sospechosos','06-plan','07a-kilos','07b-plataforma','08-titulo'],RES={},PRB={};
const purl=k=>'media/prologo/'+k+'.mp4';const POS={'01-polo-sur':['50% 28%',1.08],'02-sombra':['50% 72%',1.1],'03-trampa':['58% 68%',1.1],'04-gasolinera':['50% 62%',1.04],'05-sospechosos':['50% 45%',1.02],'06-plan':['45% 50%',1.04],'07a-kilos':['50% 50%',1.02],'07b-plataforma':['50% 50%',1.02]};
const vtest=u=>new Promise(r=>{const t=document.createElement('video');t.muted=true;t.preload='metadata';const to=setTimeout(()=>{t.removeAttribute('src');r(false)},1500);t.onloadedmetadata=()=>{clearTimeout(to);r(true)};t.onerror=()=>{clearTimeout(to);r(false)};t.src=u});
const probeCache='maps:prologo:res:'+new URL('media/prologo/',location.href).pathname;
const verified=(()=>{try{return new Set(JSON.parse(sessionStorage.getItem(probeCache)||'[]'))}catch(_){return new Set()}})();
const probe=k=>PRB[k]||(PRB[k]=verified.has(k)?Promise.resolve(RES[k]=true):fetch(purl(k),{method:'HEAD'}).then(r=>r.ok&&!/^text\//.test(r.headers.get('content-type')||'')).catch(()=>vtest(purl(k))).then(ok=>{
  if(ok){verified.add(k);try{sessionStorage.setItem(probeCache,JSON.stringify([...verified]))}catch(_){}}
  return RES[k]=!!ok;
}));
const videoQueue=[],queuedVideos=new Set();let warming=false;
function nextVideo(){
  if(warming||!videoQueue.length)return;
  warming=true;
  const v=document.createElement('video');v.muted=true;v.preload='auto';
  const done=()=>{clearTimeout(timer);v.oncanplaythrough=v.onerror=null;v.removeAttribute('src');try{v.load()}catch(_){}warming=false;nextVideo()};
  const timer=setTimeout(done,8000);
  v.oncanplaythrough=v.onerror=done;v.src=videoQueue.shift();try{v.load()}catch(_){done()}
}
function warm(urls){
  if(navigator.connection?.saveData||window.MAPSMobileGate)return;
  for(const url of urls){if(!url||queuedVideos.has(url))continue;queuedVideos.add(url);videoQueue.push(url)}
  nextVideo();
}
const need=ks=>Promise.all(ks.map(probe)).then(()=>warm(ks.filter(k=>RES[k]).map(purl)));
need(SHOTS).then(()=>{if(typeof VID!=='undefined'&&(typeof USEV==='undefined'||USEV))warm(Object.values(VID).flatMap(v=>[v.src,v.talk]))});
function mkv(cls,c){const w=E('div','pv2'+(cls?' '+cls:''));w.style.setProperty('--c',c||'#8ed5f3');const i=E('div','pvi');const v=document.createElement('video');v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');i.append(v);w.append(i,E('i','pplate m'),E('i','pplate c'));
  w.set=(s,o,z)=>{v.src=s;v.style.objectPosition=v.style.transformOrigin=o||'50% 50%';v.style.setProperty('--z',z||1.12);v.play&&v.play().catch(()=>{})};return w}
function clip(key,fb,cls,c,o){const pos=()=>{const p=POS[key]||[];return[o||p[0],p[1]]};const mine=()=>{const w=mkv(cls,c||(fb&&fb.c));w.set(purl(key),...pos());return w};if(RES[key])return mine();
  let el;if(typeof fb==='function'){el=fb();if(cls)el.classList.add(...cls.split(' '))}else{el=mkv(cls,c||(fb&&fb.c));if(fb&&fb.src)el.set(fb.src,fb.o,fb.z);else el.style.display='none'}
  if(RES[key]===undefined)probe(key).then(ok=>{if(!ok)return;if(el.set&&!(typeof fb==='function')){el.style.display='';el.set(purl(key),...pos())}else if(el.isConnected)el.replaceWith(mine())});
  return el}
/* Corte 05: cada panel encuadra su cráter y el video arranca desde el inicio, lento, y se detiene antes de que la cámara se aleje. */
function crat(i){const el=clip('05-sospechosos',null,'pcv');const v=el.querySelector('video');if(!v)return el;const f=[.2,.47,.75][i];v.loop=false;Object.assign(v.style,{position:'absolute',left:'50%',top:'50%',width:'250%',height:'auto',aspectRatio:'1',maxWidth:'none',transform:'translate(-'+(f*100)+'%,-50%)'});
  v.addEventListener('loadedmetadata',()=>{try{v.currentTime=0;v.playbackRate=.3}catch(_){}});v.addEventListener('timeupdate',()=>{if(v.currentTime>1)v.pause()});return el}
const bgv=(key,cls)=>clip(key,null,'pbgv'+(cls?' '+cls:''));
const sub=(txt,who)=>{const s=E('div','psub');if(who){s.dataset.who=who;s.style.setProperty('--c',col(who));s.append(E('span','ptag','<span>'+X(nm(who))+'</span>'))}s.append(E('p',null,F(txt)));return s};
const lines=c=>{const l=E('div','psl');if(c)l.style.setProperty('--lc',c);return l};
const kana=(k,css,c)=>{const e=E('div','pkana');e.append(E('span',null,X(k)));if(c)e.style.setProperty('--oc',c);for(const p in css)p.startsWith('--')?e.style.setProperty(p,css[p]):e.style[p]=css[p];return e};
const dur=s=>Math.max(3400,s.replace(/\*/g,'').length*58+1800);
const CUTS=[
 ()=>{const T=P(),c=E('div','pcut');c.append(clip('01-polo-sur',{src:lunaSrc()},'moon'));const b=E('div','pc1');b.append(E('span','pkick',X(T.c1k)),E('p','pline',F(T.c1)));c.append(b);return{el:c,dur:dur(T.c1)+400,sfx:'whoosh'}},
 ()=>{const T=P(),c=E('div','pcut pc2');c.style.setProperty('--c','#8ed5f3');c.append(bgv('02-sombra'),lines('rgba(142,213,243,.75)'),kana(T.brr,{left:'5%',top:'14vh'},'#8ed5f3'),E('div','pbig','−200<small>°C</small>'),sub(T.c2));return{el:c,dur:dur(T.c2),sfx:'stamp',fx:1}},
 ()=>{const T=P(),c=E('div','pcut pc3');const ch=E('div','pchalk');T.chalk.forEach((x,i)=>{const e=E('span',null,X(x));e.style.animationDelay=(.2+i*.35)+'s';ch.append(e)});const pn=E('div','pslant');pn.append(clip('03-trampa',crew('cientifica')));c.append(ch,pn,sub(T.c3,'cientifica'));return{el:c,dur:dur(T.c3),sfx:'whoosh'}},
 ()=>{const T=P(),c=E('div','pcut pc4');c.style.setProperty('--c',col('cientifica'));const cv=clip('04-gasolinera',null,'in-slam keepc');c.append(cv,lines('rgba(255,255,255,.7)'),kana(T.bam,{left:'4%',top:'25vh','--r':'-8deg'},'#ffe14d'));const q=E('div','peq');q.append(E('div','pbig sm','2H₂O <i>→</i> 2H₂ + O₂'));const g=E('div','pgau');[['H₂',T.c4a,'#00e5ff'],['O₂',T.c4b,'#ffe14d']].forEach(([f,l,cc],k)=>{const w=E('div','pgw');w.style.animationDelay=(.35+k*.15)+'s';const b=E('div','pgb');b.style.setProperty('--gc',cc);b.style.setProperty('--gd',(.75+k*.3)+'s');b.append(E('i'),E('b',null,f));const tg=E('span','ptag','<span>'+X(l)+'</span>');tg.style.setProperty('--c',cc);w.append(b,tg);g.append(w)});const hv=RES['04-gasolinera'];if(hv){const r=E('div','plab');r.append(E('span','ptag','<span>H₂ · '+X(T.c4a)+'</span>'),E('span','ptag','<span>O₂ · '+X(T.c4b)+'</span>'));r.children[0].style.setProperty('--c','#00e5ff');r.children[1].style.setProperty('--c','#ffe14d');q.append(r)}c.append(q,...(hv?[]:[g]),sub(T.c4,'cientifica'));return{el:c,dur:dur(T.c4)+600,sfx:'stamp',fx:1,at:[['power_up',800,.3]]}},
 ()=>{const T=P(),c=E('div','pcut paper');const hv5=RES['05-sospechosos'];const g=E('div','pcr');[['A','Shackleton'],['B','Cabeus'],['C','Haworth']].forEach(([l,n],i)=>{const p=E('div','pcrp');p.style.animationDelay=(.1+i*.28)+'s';const n2=E('div','pin');n2.append(crat(i));if(!hv5)n2.append(E('i','pcrh'));n2.append(E('b',null,l),E('span',null,X(n)));p.append(n2);g.append(p)});c.append(g,sub(T.c5,'comandante'));return{el:c,dur:dur(T.c5),sfx:'whoosh',sfx2:['stamp',380]}},
 ()=>{const T=P(),c=E('div','pcut pc6');c.style.setProperty('--c',col('comandante'));const pn=E('div','pslant l');pn.append(clip('06-plan',crew('comandante',1.9,'50% 34%')));const L=E('ol','pbeats');T.c6.forEach((x,i)=>{const li=E('li',null,'<b>0'+(i+1)+'</b><span>'+X(x)+'</span>');li.style.animationDelay=(.35+i*.45)+'s';L.append(li)});c.append(pn,L,sub(T.c6s,'comandante'));return{el:c,dur:dur(T.c6s+T.c6.join(''))-1700,sfx:'whoosh'}},
 ()=>{const T=P(),c=E('div','pcut paper pc7');const a=E('div','pdia a');a.append(clip('07a-kilos',crew('ingeniero')));const b=E('div','pdia b');b.append(clip('07b-plataforma',crew('directora')));const cap=(who,txt,cl)=>{const e=E('div','pcap '+cl);e.style.setProperty('--c',col(who));e.append(E('span','ptag','<span>'+X(nm(who))+'</span>'),E('p',null,F(txt)));return e};c.append(a,b,cap('ingeniero',T.c7a,'a'),cap('directora',T.c7b,'b'));return{el:c,dur:dur(T.c7a+T.c7b)-400,sfx:'whoosh'}},
 ()=>{const T=P(),c=E('div','pcut pc8');c.style.setProperty('--c',col('comandante'));c.append(bgv('08-titulo'),lines('rgba(144,225,189,.55)'));const b=E('div','ptit');b.append(E('span','pkick',X(T.ep)),E('div','pbig',X(T.title)),E('p','pepn',X(T.epn)),E('p','pq','<span class="ptag"><span>'+X(nm('comandante'))+'</span></span> '+F(T.c8)));const r=E('div','pbtns');const go=E('button','pgo',X(T.start)+' →');go.type='button';go.dataset.act='end';const ag=E('button','pag','↺ '+X(T.again));ag.type='button';ag.dataset.act='again';r.append(go,ag);b.append(r);c.append(b);return{el:c,dur:0,sfx:'launch_rumble',fx:1,last:1}}];
let O=null;
const VO=(()=>{const ss=window.speechSynthesis;let cb=null,busy=false,V=[];if(!ss||typeof SpeechSynthesisUtterance==='undefined')return{say(){},stop(){},after(f){f()}};
  const LG=(typeof LANG!=='undefined'?LANG:'es'),PREF={es:['es-mx','es-us','es-419','es-es','es'],en:['en-us','en-gb','en'],pt:['pt-br','pt-pt','pt']}[LG]||['es'];
  const load=()=>{const all=ss.getVoices();const n=v=>v.lang.replace('_','-').toLowerCase();for(const p of PREF){const m=all.filter(v=>n(v).startsWith(p));if(m.length){const base=PREF[PREF.length-1];V=m.concat(all.filter(v=>n(v).startsWith(base)&&!m.includes(v)));return}}V=[]};load();try{ss.addEventListener('voiceschanged',load)}catch(_){ss.onvoiceschanged=load}
  const MALE=/\b(male|hombre|jorge|pablo|diego|ra[uú]l|carlos|juan|enrique|david|daniel|mark|guy|ryan|antonio|ricardo|thiago|duarte|h[eé]lio|alvaro|gerardo|federico|tom[aá]s|jos[eé])\b/i;
  const pick=who=>{if(!V.length)return null;const m=V.filter(v=>MALE.test(v.name)),f=V.filter(v=>!MALE.test(v.name));const k={comandante:[f,0],directora:[f,1],cientifica:[f,2],ingeniero:[m,0]}[who]||[V,3];const L=k[0].length?k[0]:V;return L[k[1]%L.length]};
  const PIT={comandante:1,directora:.88,cientifica:1.15,ingeniero:.82};
  const done=()=>{busy=false;const f=cb;cb=null;f&&f()};
  return{say(text,who){this.stop();if(!text)return;try{if(typeof SFX!=='undefined'&&!SFX.on)return}catch(_){}const u=new SpeechSynthesisUtterance(text);const v=pick(who);if(v){u.voice=v;u.lang=v.lang}else u.lang=PREF[0];u.pitch=PIT[who]||1;u.rate=1.03;u.onend=done;u.onerror=done;busy=true;ss.speak(u)},
    stop(){busy=false;cb=null;try{ss.cancel()}catch(_){}},after(f){if(busy||ss.speaking)cb=f;else f()}}})();
function recordedNarration(button,language){
  const audio=new Audio();
  audio.preload='auto';
  let cue=-1,deadline;
  function clearWait(){
    clearTimeout(deadline);
    audio.onended=null;
    audio.onerror=null;
  }
  function start(){
    const playingCue=cue;
    button.hidden=true;
    audio.play().catch(error=>{
      if(cue===playingCue&&error.name==='NotAllowedError')button.hidden=false;
    });
  }
  button.addEventListener('click',start);
  return {
    play(index){
      this.stop();
      if(typeof SFX!=='undefined'&&!SFX.on)return;
      cue=index;
      audio.src='media/prologo/voice-'+language+'/'+String(index+1).padStart(2,'0')+'.mp3';
      start();
    },
    after(next){
      if(audio.paused||audio.ended){next();return}
      const finish=()=>{clearWait();next()};
      audio.onended=finish;
      audio.onerror=finish;
      deadline=setTimeout(finish,12000);
    },
    stop(){
      cue=-1;
      clearWait();
      audio.pause();
      button.hidden=true;
    }
  };
}
function play(onEnd,opt){opt=opt||{};const LIST=opt.cuts||CUTS;if(O)return;const T=P();O=E('div','pro');if(opt.theme)O.classList.add(opt.theme);const stg=E('div','pstage');O.append(stg,E('i','pbar t'),E('i','pbar b'));
  const sk=E('button','pskip',X(T.skip)+' ⏭');sk.type='button';sk.dataset.act='end';const dots=E('div','pdots');LIST.forEach(()=>dots.append(E('i')));const tap=E('span','ptap',X(T.tap));O.append(sk,dots,tap);
  const voiceButton=E('button','pskip pvoice',X(T.voice));
  voiceButton.type='button';voiceButton.hidden=true;
  const narration=LIST===CUTS?recordedNarration(voiceButton,prologueLanguage()):null;
  if(narration)O.append(voiceButton);
  const voice=narration||VO;
  document.body.append(O);
  try{PAD.duck(true)}catch(_){}requestAnimationFrame(()=>O&&O.classList.add('on'));setTimeout(()=>O&&O.classList.add('on'),50);
  let i=-1,tm=0,cur=null,fin=false;
  const show=n=>{clearTimeout(tm);i=n;const C=LIST[n]();if(C.at)C.at.forEach(([sn,ms,v])=>setTimeout(()=>O&&i===n&&sfx(sn,v||.35),ms));if(cur){const o=cur;o.classList.add('gone');setTimeout(()=>o.remove(),260)}cur=C.el;stg.append(cur);if(narration)narration.play(n);else{const sw=cur.querySelector('.psub'),sp=(sw&&sw.querySelector('p'))||cur.querySelector('.pline');VO.say(sp?sp.textContent.replace(/\s+/g,' ').trim():'',sw&&sw.dataset.who)}const gl=E('div','pglitch');stg.append(gl);setTimeout(()=>gl.remove(),340);
    [...dots.children].forEach((d,k)=>{d.className=k<n?'on':k===n?'now':'';if(k===n)d.style.setProperty('--d',(C.dur||1)+'ms')});tap.hidden=!!C.last;
    if(C.sfx)sfx(C.sfx,C.sfx==='launch_rumble'?.35:.3);if(C.sfx2)setTimeout(()=>O&&sfx(C.sfx2[0],.35),C.sfx2[1]);
    if(C.fx){const f=E('div','pflash');stg.append(f);setTimeout(()=>f.remove(),400);stg.classList.remove('shake','inv');void stg.offsetWidth;stg.classList.add('shake','inv');setTimeout(()=>stg.classList.remove('inv'),110)}
    if(C.last){setTimeout(()=>{if(!fin&&i===n){
      if(narration)narration.after(()=>{if(!fin&&i===n)sfx('fanfare',.35)});
      else sfx('fanfare',.35);
    }},500);setTimeout(()=>{const b=O&&O.querySelector('.pgo');b&&b.focus()},700)}
    if(C.dur&&!opt.hold)tm=setTimeout(()=>voice.after(()=>{if(O&&i===n)tm=setTimeout(next,350)}),C.dur)};
  const next=()=>{if(i<LIST.length-1)show(i+1);else if(opt.autoEnd)end()};
  const end=()=>{if(fin)return;fin=true;clearTimeout(tm);voice.stop();removeEventListener('keydown',key,true);O.classList.add('out');const o=O;setTimeout(()=>{o.remove();if(O===o)O=null},520);try{PAD.duck(false)}catch(_){}sfx('click',.3);onEnd&&onEnd()};
  const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();end()}else if([' ','Enter','ArrowRight'].includes(e.key)){if(e.target&&e.target.closest&&e.target.closest('.pro button'))return;e.preventDefault();e.stopPropagation();if(LIST.length-1===i)end();else next()}};
  addEventListener('keydown',key,true);
  O.addEventListener('click',e=>{const b=e.target.closest('button');if(b){e.stopPropagation();if(b.dataset.act==='end')end();else if(b.dataset.act==='again')show(0);return}next()});
  show(Math.max(0,Math.min(LIST.length-1,opt.start|0)))}
function strip(){const c=stage.querySelector('.screen .card');if(!c)return;const dl=c.querySelector('.dlg');if(dl)dl.remove();const bt=[...c.querySelectorAll('.btn.primary')].find(b=>b.hidden);if(bt)bt.hidden=false;
  if(!c.querySelector('.prore')){const r=E('button','btn ghost sm prore','▶ '+X(P().replay));r.type='button';r.addEventListener('click',()=>play(()=>{const b=c.querySelector('.btn.primary');b&&b.focus()}));const ba=c.querySelector('.bact');if(ba)ba.prepend(r);else{const cd=c.querySelector('.cond');(cd||c.lastChild).after(r)}}return bt}
const off=(()=>{try{return new URLSearchParams(location.search).get('prologo')==='0'}catch(_){return false}})();
const isBrief=()=>!!(typeof stage!=='undefined'&&stage.querySelector('.screen .card .polemap'));
function kick(){if(off||!isBrief())return;const bt=strip();if(S._prol)return;S._prol=1;const wait=()=>{if(document.querySelector('.qov')){setTimeout(wait,300);return}if(isBrief())play(()=>bt&&bt.focus());else S._prol=0};wait()}
if(HOOK){const orig=STEPS[0];STEPS[0]=function(){const r=orig.apply(this,arguments);kick();return r};kick();setTimeout(kick,400)}
window.MAPSPrologo=play;play.cuts=CUTS.length;const shot=(key,cls,o)=>{if(!RES[key])return null;const d=E('div',cls||'');const v=document.createElement('video');v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.src=purl(key);if(o)v.style.objectPosition=o;d.append(v);v.play&&v.play().catch(()=>{});return d};
window.MAPSCine={need,warm,has:k=>!!RES[k],shot,play,vid,sub,lines,kana,E,X,F,col,nm,dur,P,off};
const st=document.createElement('style');st.textContent=`
.pro{position:fixed;inset:0;z-index:95;background:#050608;color:#fff;overflow:hidden;cursor:pointer;font-family:var(--heading);opacity:0;transition:opacity .4s;-webkit-user-select:none;user-select:none}
.pro.on{opacity:1}.pro.out{opacity:0;transition:opacity .5s;pointer-events:none}
.pstage{position:absolute;inset:0}.pstage.shake{animation:pShake .5s}.pstage.inv{filter:invert(1) contrast(1.6)}
.pbar{position:absolute;left:0;right:0;height:6vh;background:#000;z-index:6}.pbar.t{top:0}.pbar.b{bottom:0}
.pcut{position:absolute;inset:0;overflow:hidden;animation:pIn .3s steps(4) both}
.pglitch{position:absolute;inset:0;z-index:5;pointer-events:none;background:linear-gradient(transparent 0 16%,rgba(255,43,214,.6) 16% 21%,transparent 21% 46%,rgba(0,229,255,.6) 46% 50%,transparent 50% 70%,rgba(255,225,77,.55) 70% 74%,transparent 74%);mix-blend-mode:screen;animation:pGl .32s steps(3) forwards}.pcut.gone{animation:pOut .25s forwards}
.pflash{position:absolute;inset:0;background:#fff;z-index:5;pointer-events:none;animation:pFl .38s forwards}
.pv2{position:absolute;inset:0;overflow:hidden;background:#0b0d12}.pvi{position:absolute;inset:0;animation:pPush 7s steps(28) forwards}
.pvi::after{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(255,43,214,.75) 0 1px,transparent 1.5px) 0 0/6px 6px,radial-gradient(circle,rgba(0,229,255,.65) 0 1px,transparent 1.5px) 3px 3px/6px 6px;mix-blend-mode:screen;opacity:.5;pointer-events:none}
.pv2 video{width:100%;height:100%;object-fit:cover;display:block;transform:scale(var(--z,1.25));filter:grayscale(1) contrast(1.6) brightness(1.08)}
.pv2 .pfb{width:100%!important;height:100%!important;border-radius:0!important;object-fit:cover}
.pv2::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(205deg,transparent 30%,var(--c) 140%);mix-blend-mode:screen;opacity:.9;pointer-events:none}
.pv2::after{content:"";position:absolute;inset:0;z-index:2;background:radial-gradient(circle,rgba(0,0,0,.55) 0 1.1px,transparent 1.6px) 0 0/5px 5px;mix-blend-mode:multiply;opacity:.55;pointer-events:none}
.pplate{position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:screen;opacity:0;animation:pPlate .75s steps(7) both}.pplate.m{background:#ff2bd6;--x:-22%}.pplate.c{background:#00e5ff;--x:22%;animation-delay:.06s}
.pv2.in-slam{animation:pSlamIn .6s steps(6) both}
.pv2.pbgv{z-index:0;opacity:.42}.pc2 .pv2.pbgv{opacity:.8}.pc2 .pv2.pbgv video{filter:grayscale(1) contrast(1.3) brightness(1.7)}.pv2.pbgv.paperv{opacity:.22}.pv2.pbgv video{filter:grayscale(1) contrast(1.5) brightness(.75)}
.pslant{animation:pPanelR .45s steps(5) both}.pslant.l{animation-name:pPanelL}
.pv2.moon .pvi{-webkit-mask:radial-gradient(circle,#000 var(--dr),transparent calc(var(--dr) + .6px)) 0 0/8px 8px;mask:radial-gradient(circle,#000 var(--dr),transparent calc(var(--dr) + .6px)) 0 0/8px 8px;animation:pDots 1.5s steps(10) both,pPush 7s steps(28) forwards}
.pv2.moon video{filter:grayscale(1) contrast(1.35) brightness(.8)}
.psl{position:absolute;inset:-25%;z-index:3;pointer-events:none;background:repeating-conic-gradient(from 0deg at 50% 50%,var(--lc,rgba(255,255,255,.85)) 0deg .45deg,transparent .45deg 3.1deg,var(--lc,rgba(255,255,255,.4)) 3.1deg 3.35deg,transparent 3.35deg 6.8deg);-webkit-mask:radial-gradient(circle at 50% 50%,transparent 24%,#000 64%);mask:radial-gradient(circle at 50% 50%,transparent 24%,#000 64%);animation:pSpin .16s steps(2) infinite}
.psub{position:absolute;left:50%;bottom:9vh;transform:translateX(-50%);width:min(92%,1100px);z-index:7;display:grid;justify-items:center;gap:10px;text-align:center;animation:pSub .4s .15s both}
.psub p{margin:0;padding:.45em .85em;background:#fff1a8;color:#0b0b0b;border:3px solid #0b0b0b;box-shadow:7px 7px 0 #ff2bd6,-4px -4px 0 #00e5ff;font:700 clamp(17px,1.4vw + 9px,32px)/1.25 var(--heading);text-wrap:pretty;transform:rotate(-.6deg)}
.pro em{font-style:normal;color:var(--c,#ffc779)}.psub em,.pcap em{color:#c8005f}
.ptag{display:inline-block;padding:4px 14px;background:var(--c,#90e1bd);color:#07080b;font:800 clamp(11px,.5vw + 8px,15px)/1.25 var(--heading);letter-spacing:.14em;text-transform:uppercase;transform:skewX(-14deg);text-shadow:none}
.ptag>span{display:inline-block;transform:skewX(14deg)}
.pbig{position:relative;z-index:4;font:800 clamp(64px,15vw,250px)/.9 var(--heading);font-stretch:condensed;font-style:italic;letter-spacing:-.02em;color:#fff;text-shadow:-6px 0 0 #00e5ff,6px 0 0 #ff2bd6,10px 10px 0 #000;animation:pSlam .45s steps(5) both;white-space:nowrap}
.pbig small{font-size:.42em;vertical-align:.95em;margin-left:.08em}.pbig i{font-style:normal;color:var(--c)}
.pbig.sm{font-size:clamp(34px,6.4vw,112px)}
.pkana{position:absolute;z-index:4;--oc:#ffe14d;display:grid;place-items:center;padding:.75em 1.05em;font:900 clamp(30px,5.2vw,96px)/1 var(--heading);transform:rotate(var(--r,-10deg));animation:pKana .8s steps(6) both;pointer-events:none}
.pkana::before,.pkana::after{content:"";position:absolute;inset:0;clip-path:polygon(50% 0,61% 22%,86% 6%,80% 32%,100% 40%,82% 55%,96% 82%,68% 73%,58% 100%,45% 77%,16% 96%,22% 68%,0 57%,19% 44%,5% 14%,34% 25%)}
.pkana::before{background:#0b0b0b}.pkana::after{inset:8px;background:radial-gradient(circle,rgba(0,0,0,.3) 0 1.4px,transparent 1.9px) 0 0/7px 7px,var(--oc)}
.pkana span{position:relative;z-index:1;font:inherit;font-style:italic;letter-spacing:-.01em;color:#fff;-webkit-text-stroke:3px #0b0b0b;paint-order:stroke fill;text-shadow:-3px 0 0 #00e5ff,3px 0 0 #ff2bd6,6px 6px 0 #0b0b0b;white-space:nowrap}
.pkick{font:700 clamp(12px,.6vw + 9px,17px)/1 ui-monospace,Consolas,monospace;letter-spacing:.32em;text-transform:uppercase;color:var(--c,#8ed5f3);animation:pRise .5s .1s both}
.pc1{position:absolute;left:7%;bottom:14vh;z-index:7;display:grid;gap:16px;max-width:min(86%,900px)}.pc1 .pkick{--c:#8ed5f3}
.pline{margin:0;font:700 clamp(30px,4.4vw,78px)/1.04 var(--heading);font-style:italic;text-wrap:balance;text-shadow:-3px 0 0 rgba(0,229,255,.85),3px 0 0 rgba(255,43,214,.85),0 4px 30px rgba(0,0,0,.9);animation:pRise .7s .5s both}.pline em{color:#8ed5f3}
.pro .pline{display:block;gap:0;justify-content:normal;align-items:normal;color:#f0f4fa}
.pc2{display:grid;place-items:center;background:radial-gradient(50% 45% at 50% 48%,rgba(142,213,243,.28),transparent 70%),#04070c}.pc2 .pbig{margin-bottom:6vh}
.pc3{background:#050608}.pslant{position:absolute;top:6vh;bottom:6vh;right:0;width:66%;background:#ece6d8;clip-path:polygon(16% 0,100% 0,100% 100%,0 100%)}
.pslant>.pv2{inset:0 0 0 8px;clip-path:polygon(16% 0,100% 0,100% 100%,0 100%);animation:pWipe .5s cubic-bezier(.2,.9,.2,1) both}
.pslant.l{left:0;right:auto;width:50%;clip-path:polygon(0 0,100% 0,84% 100%,0 100%)}.pslant.l>.pv2{inset:0 8px 0 0;clip-path:polygon(0 0,100% 0,84% 100%,0 100%)}
.pchalk{position:absolute;left:5%;top:14vh;width:34%;display:grid;gap:3vh;z-index:4}
.pchalk span{font:700 clamp(18px,2.2vw,40px)/1 ui-monospace,Consolas,monospace;color:#eae4d4;opacity:0;animation:pChalk .5s both;text-shadow:0 0 12px rgba(142,213,243,.5)}
.pchalk span:nth-child(2n){margin-left:12%;transform:rotate(-4deg)}.pchalk span:nth-child(3){color:#8ed5f3}
.pc4{background:radial-gradient(45% 40% at 50% 52%,rgba(255,225,77,.16),transparent 70%),#050608}
.pgau{position:absolute;left:50%;top:30vh;height:34vh;transform:translateX(-50%);z-index:5;display:flex;gap:clamp(28px,6vw,110px)}
.pgw{display:grid;grid-template-rows:minmax(0,1fr) auto;justify-items:center;gap:16px;animation:pRise .45s both}
.pgb{position:relative;width:clamp(70px,9vw,150px);background:#0b0b0b;border:4px solid #ece6d8;box-shadow:8px 8px 0 #ff2bd6,-4px -4px 0 #00e5ff;transform:skewX(-8deg);overflow:hidden}
.pgb i{position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,.35) 0 1.4px,transparent 1.9px) 0 0/7px 7px,var(--gc);transform-origin:bottom;animation:pGauge 1.3s steps(9) var(--gd) both}
.pgb b{position:absolute;top:10px;left:0;right:0;z-index:1;text-align:center;font:900 clamp(24px,3vw,54px)/1 var(--heading);font-style:italic;color:#fff;-webkit-text-stroke:3px #0b0b0b;paint-order:stroke fill}
@keyframes pGauge{from{transform:scaleY(0)}to{transform:scaleY(.8)}}
.pc4 .peq{position:absolute;left:0;right:0;top:11vh;z-index:6;display:grid;justify-items:center;gap:14px}.plab{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;animation:pRise .4s .55s both}
.paper{background:#ece6d8}
.pcr{position:absolute;left:4%;right:4%;top:calc(6vh + 3%);bottom:31vh;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.pcrp{position:relative;overflow:hidden;background:#07080b;transform:skewX(-8deg);animation:pDrop .45s cubic-bezier(.2,1.4,.3,1) both}
.pin{position:absolute;inset:0 -14%;transform:skewX(8deg);display:grid;place-items:center;align-content:center;gap:6px;background:radial-gradient(60% 50% at 50% 46%,#262b33,#07080b 75%)}
.pcrh{width:56%;aspect-ratio:2.2;border-radius:50%;background:radial-gradient(70% 70% at 50% 30%,#000 55%,#3a414b 70%,#0c0e12 76%);box-shadow:0 -6px 0 rgba(236,230,216,.18);margin-bottom:-12%}
.pin b{font:800 clamp(70px,11vw,190px)/.85 var(--heading);font-style:italic;color:transparent;-webkit-text-stroke:3px #ece6d8;position:relative;z-index:4;filter:drop-shadow(4px 4px 0 #0b0b0b)}
.pin>span{position:relative;z-index:4;padding:4px 10px;background:#0b0b0b}.pv2.pcv video{filter:grayscale(1) contrast(1.45) brightness(.85)}
.pv2.keepc video{filter:contrast(1.25) saturate(1.3) brightness(1.05)}.pv2.keepc::before{opacity:.35}
.pin span{font:800 clamp(16px,1.8vw,32px)/1 var(--heading);letter-spacing:.12em;text-transform:uppercase;color:#ffc779;font-style:italic}
.paper .psub p{box-shadow:7px 7px 0 #0b0b0b}
.pc6{background:#050608}.pbeats{position:absolute;right:5%;top:12vh;width:44%;margin:0;padding:0;list-style:none;display:grid;gap:3.2vh;z-index:5}
.pbeats li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:baseline;animation:pRise .45s both}
.pbeats b{font:800 clamp(34px,4.6vw,82px)/.9 var(--heading);font-style:italic;color:var(--c)}.pbeats span{font:700 clamp(18px,1.9vw,36px)/1.15 var(--heading);text-wrap:balance}
.pdia{position:absolute;left:0;right:0;overflow:hidden}.pdia.a{top:6vh;height:56vh;clip-path:polygon(0 0,100% 0,100% 62%,0 100%)}.pdia.b{bottom:6vh;height:56vh;clip-path:polygon(0 38%,100% 0,100% 100%,0 100%)}
.pdia.a{animation:pSlideL .55s steps(6) .1s both}.pdia.b{animation:pSlideR .55s steps(6) .65s both}.pdia.b .pplate{animation-delay:.65s}
@media (min-aspect-ratio:1/1){.pdia.a,.pdia.b{top:6vh;bottom:6vh;height:auto;width:56%}.pdia.a{right:auto;clip-path:polygon(0 0,100% 0,80% 100%,0 100%)}.pdia.b{left:auto;clip-path:polygon(20% 0,100% 0,100% 100%,0 100%)}}
.pcap{position:absolute;z-index:7;display:grid;gap:8px;max-width:min(40%,520px);animation:pRise .45s both}.pcap.a{left:4%;top:calc(6vh + 4%)}.pcap.b{right:4%;bottom:calc(6vh + 5%);justify-items:end;text-align:right;animation-delay:1.1s}
.pcap p{margin:0;padding:12px 18px;background:#fff1a8;color:#0b0b0b;border:3px solid #0b0b0b;box-shadow:7px 7px 0 #ff2bd6;font:700 clamp(18px,1.7vw,34px)/1.2 var(--heading);transform:skewX(-6deg)}
.pc8{display:grid;place-items:center;background:radial-gradient(55% 50% at 50% 50%,rgba(144,225,189,.16),transparent 70%),#050608}
.ptit{position:relative;z-index:6;display:grid;justify-items:center;gap:14px;text-align:center;padding:0 5%}
.pepn{margin:0;font:700 clamp(20px,2.2vw,40px)/1.1 var(--heading);font-style:italic;color:#ece6d8;animation:pRise .5s .45s both}
.pq{margin:6px 0 0;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;font:600 clamp(15px,1.1vw + 8px,22px)/1.3 var(--heading);color:#c9d4e2;animation:pRise .5s .8s both}
.pbtns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;animation:pRise .5s 1.1s both}
.pgo,.pag{min-height:50px;padding:0 26px;font:800 clamp(14px,.5vw + 11px,18px)/1 var(--heading);letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transform:skewX(-10deg);border:0}
.pgo{background:var(--c);color:#07080b;box-shadow:5px 5px 0 #ece6d8}.pgo:hover{transform:skewX(-10deg) translate(-2px,-2px);box-shadow:7px 7px 0 #ece6d8}
.pag{background:transparent;color:#ece6d8;border:2px solid rgba(236,230,216,.5)}.pag:hover{border-color:#ece6d8}
.pgo:focus-visible,.pag:focus-visible,.pskip:focus-visible{outline:3px solid #fff;outline-offset:4px}
.pskip{position:absolute;top:calc(6vh + 14px);right:18px;z-index:9;min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.55);color:#fff;font:700 .8rem var(--heading);letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.pskip:hover{background:#000}.pvoice{left:18px;right:auto}
.pdots{position:absolute;left:20px;bottom:calc(3vh - 2px);z-index:8;display:flex;gap:6px}.pdots i{width:22px;height:3px;background:rgba(255,255,255,.22);position:relative;overflow:hidden}.pdots i.on{background:#fff}
.pdots i.now::after{content:"";position:absolute;inset:0;background:#fff;transform-origin:left;animation:pFill var(--d) linear both}
.ptap{position:absolute;right:20px;bottom:calc(3vh - 7px);z-index:8;font:700 .7rem var(--heading);letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.55)}
@keyframes pIn{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:none}}@keyframes pOut{to{opacity:0;transform:scale(.98)}}
@keyframes pFl{from{opacity:1}to{opacity:0}}@keyframes pPush{from{transform:scale(1)}to{transform:scale(1.09)}}
@keyframes pShake{0%,100%{transform:none}15%{transform:translate(-12px,7px) rotate(-.7deg)}30%{transform:translate(10px,-8px)}45%{transform:translate(-8px,-4px) rotate(.4deg)}60%{transform:translate(6px,5px)}80%{transform:translate(-3px,2px)}}
@keyframes pSpin{to{transform:rotate(2.4deg)}}@keyframes pSub{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translateX(-50%)}}
@keyframes pSlam{from{opacity:0;transform:scale(2.4) rotate(-5deg);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
@keyframes pKana{0%{opacity:0;scale:2.2}35%{opacity:1;scale:.88}60%{scale:1.08}100%{opacity:1;scale:1}}@keyframes pGl{0%{transform:translateX(-5%)}50%{transform:translateX(4%)}100%{transform:none;opacity:0}}
@keyframes pRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes pChalk{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes pWipe{from{clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%)}}@keyframes pDrop{from{opacity:0;transform:skewX(-8deg) translateY(-40px) scale(1.15)}to{opacity:1;transform:skewX(-8deg)}}
@keyframes pSlideL{from{transform:translateX(-105%) rotate(-3deg)}70%{transform:translateX(3%)}to{transform:none}}@keyframes pSlideR{from{transform:translateX(105%) rotate(3deg)}70%{transform:translateX(-3%)}to{transform:none}}
@keyframes pPlate{0%{opacity:.95;transform:translateX(var(--x))}55%{opacity:.7;transform:translateX(calc(var(--x) * .15))}100%{opacity:0;transform:none}}
@keyframes pSlamIn{from{transform:scale(1.7) rotate(-6deg);filter:brightness(2.6) contrast(2)}55%{transform:scale(.96) rotate(1.2deg);filter:none}to{transform:none;filter:none}}
@keyframes pPanelR{from{transform:translateX(45%) skewX(-10deg)}70%{transform:translateX(-2%)}to{transform:none}}@keyframes pPanelL{from{transform:translateX(-45%) skewX(10deg)}70%{transform:translateX(2%)}to{transform:none}}
@keyframes pDots{from{--dr:0px}to{--dr:7px}}
@property --dr{syntax:'<length>';inherits:false;initial-value:7px}@keyframes pFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media (max-aspect-ratio:1/1){.pslant,.pslant.l{width:100%;top:6vh;bottom:42vh;clip-path:polygon(0 0,100% 0,100% 88%,0 100%)}.pslant>.pv2,.pslant.l>.pv2{inset:0 0 8px;clip-path:polygon(0 0,100% 0,100% 88%,0 100%)}
 .pchalk{display:none}.pbeats{left:6%;right:6%;width:auto;top:auto;bottom:26vh;gap:1.6vh}.pc6 .psub{bottom:8vh}.pcr{grid-template-columns:1fr;bottom:30vh;gap:12px}.pin b{font-size:clamp(48px,11vh,110px)}.pcrh{display:none}.pcap{max-width:84%}.pc1{bottom:22vh}}
@media (prefers-reduced-motion:reduce){.pplate{display:none}.pv2.in-slam,.pslant,.pdia{animation:none}.pstage.shake{animation:none}.pstage.inv{filter:none}.psl{animation:none}.pvi{animation:none}}
`;document.head.append(st)})();
