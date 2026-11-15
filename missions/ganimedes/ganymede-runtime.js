/* Ganymede runtime helpers, one file: music.js (Luna), ganymede-sfx.js, mobile-gate.js (Luna, repainted), maps-bridge.js. Sources kept alongside for editing. */

/* ---- music.js ---- */
/* MAPS · música generada por código (WebAudio, sin archivos de audio). Cinco pistas en bucle:
   tema · control · tension · maravilla · derrota.
   Pistas reales: si music/pistas.js declara window.MAPS_TRACKS={tema:'tema.ogg',...}, esa pista suena desde el archivo
   (en bucle, con el mismo fundido, volumen y atenuación). Si no hay archivo o no abre, suena la generada por código.
   API: MAPS_MUSIC.play(id,{fade}) · stop(fade) · vol(0..1) · duck(true|false) · current() · source(id) · file(id) · tracks
        on · enable(bool) (se guarda en maps:music) · mute(bool) (silencio temporal, p. ej. sonido apagado) */
(function(){
  const F=m=>440*Math.pow(2,(m-69)/12);
  let ac=null,out=null,rev=null,dIn=null,dly=null,noiseB=null,cur=null,timer=0,vol=.5,ducked=false,fl=[],ft=0,want=null,on=true,muted=false;
  try{on=(localStorage.getItem('maps:music')??'1')==='1'}catch(_){}
  const live=()=>on&&!muted;
  const MAN=()=>window.MAPS_TRACKS||{},BASE=(window.MAPS_CONFIG&&window.MAPS_CONFIG.music&&window.MAPS_CONFIG.music.base)||'music/',FC={};
  function init(){if(ac)return ac;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ac=new AC();
    out=ac.createGain();out.gain.value=vol*(ducked?.3:1);const comp=ac.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.3;out.connect(comp);comp.connect(ac.destination);
    const len=Math.floor(ac.sampleRate*2.8),ib=ac.createBuffer(2,len,ac.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    const cv=ac.createConvolver();cv.buffer=ib;rev=ac.createGain();rev.gain.value=.34;rev.connect(cv);cv.connect(out);
    dIn=ac.createGain();dly=ac.createDelay(1.5);const fb=ac.createGain(),dO=ac.createGain(),dlp=ac.createBiquadFilter();fb.gain.value=.36;dO.gain.value=.5;dlp.type='lowpass';dlp.frequency.value=2600;
    dIn.connect(dly);dly.connect(dlp);dlp.connect(fb);fb.connect(dly);dlp.connect(dO);dO.connect(out);
    noiseB=ac.createBuffer(1,Math.floor(ac.sampleRate*.2),ac.sampleRate);const nd=noiseB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    return ac}
  /* voces: I.g = con reverberación · I.dry = seco · I.d = envío al eco */
  const V={
    pad(I,t,notes,dur,o){o=o||{};const v=o.vol||.03,a=Math.min(1.4,dur*.35),lp=ac.createBiquadFilter(),g=ac.createGain();lp.type='lowpass';lp.frequency.value=o.cut||900;lp.Q.value=.4;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,dur-.1));g.gain.linearRampToValueAtTime(0,t+dur+1.2);lp.connect(g);g.connect(I.g);
      notes.forEach(m=>[-7,7].forEach(dt=>{const os=ac.createOscillator();os.type=o.type||'sawtooth';os.frequency.value=F(m);os.detune.value=dt;os.connect(lp);os.start(t);os.stop(t+dur+1.3)}))},
    pluck(I,t,m,o){o=o||{};const os=ac.createOscillator(),g=ac.createGain(),v=o.vol||.05,d=o.dec||.5;os.type=o.type||'triangle';os.frequency.value=F(m);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);let n=os;
      if(o.cut){const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(o.cut*2.5,t);lp.frequency.exponentialRampToValueAtTime(o.cut,t+d*.6);os.connect(lp);n=lp}
      n.connect(g);g.connect(I.g);if(o.dly)g.connect(I.d);os.start(t);os.stop(t+d+.05)},
    bell(I,t,m,o){o=o||{};const c=ac.createOscillator(),md=ac.createOscillator(),mg=ac.createGain(),g=ac.createGain(),fr=F(m),v=o.vol||.05,d=o.dec||1.8;
      md.frequency.value=fr*3.01;mg.gain.setValueAtTime(fr*1.4,t);mg.gain.exponentialRampToValueAtTime(1,t+d*.5);md.connect(mg);mg.connect(c.frequency);c.frequency.value=fr;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);c.connect(g);g.connect(I.g);g.connect(I.d);c.start(t);md.start(t);c.stop(t+d+.05);md.stop(t+d+.05)},
    bass(I,t,m,dur,v){const os=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),g2=ac.createGain();os.type='sine';o2.type='triangle';os.frequency.value=F(m);o2.frequency.value=F(m);g2.gain.value=.35;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.setValueAtTime(v,t+Math.max(.03,dur-.08));g.gain.linearRampToValueAtTime(0,t+dur+.12);os.connect(g);o2.connect(g2);g2.connect(g);g.connect(I.dry);os.start(t);o2.start(t);os.stop(t+dur+.2);o2.stop(t+dur+.2)},
    kick(I,t,v){const os=ac.createOscillator(),g=ac.createGain();os.frequency.setValueAtTime(125,t);os.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.24);os.connect(g);g.connect(I.dry);os.start(t);os.stop(t+.26)},
    hat(I,t,v){const s=ac.createBufferSource(),hp=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseB;hp.type='highpass';hp.frequency.value=7000;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(hp);hp.connect(g);g.connect(I.dry);s.start(t);s.stop(t+.06)}};
  const mel=(T,I,bar,s,t,sd,v)=>T.mel[bar%T.mel.length].forEach(([st,m,d])=>{if(st===s)V.bell(I,t,m,{vol:v,dec:Math.max(.9,d*sd*1.6)})});
  /* pistas: b = bajo, n = notas del acorde (MIDI). step() se llama en cada semicorchea. */
  const TR={
    tema:{bpm:84,hold:1,prog:[{b:38,n:[57,62,66,69]},{b:37,n:[57,61,64,69]},{b:35,n:[54,59,62,66]},{b:43,n:[55,59,62,67]}],
      mel:[[[0,74,6],[8,78,4],[12,81,4]],[[0,76,8],[8,73,8]],[[0,74,6],[8,78,4],[12,83,4]],[[0,79,8],[8,81,4],[12,78,4]]],
      step(I,bar,s,t,c,sd){if(s===0){V.pad(I,t,c.n,sd*16,{cut:1100,vol:.03});V.bass(I,t,c.b,sd*5,.2)}if(s===8)V.bass(I,t,c.b,sd*3,.16);if(s===14)V.bass(I,t,c.b+7,sd*1.6,.12);
        if(s%2===0)V.pluck(I,t,c.n[[0,1,2,1,3,2,1,2][s/2]]+12,{vol:.05,dec:.45,dly:1});
        if(bar%8>=4){if(s===0||s===8)V.kick(I,t,.16);mel(this,I,bar,s,t,sd,.06)}}},
    control:{bpm:66,hold:2,prog:[{b:45,n:[52,59,60,64]},{b:41,n:[53,57,60,64]},{b:36,n:[52,55,59,64]},{b:43,n:[50,55,59,62]}],
      step(I,bar,s,t,c,sd){if(s===0&&bar%2===0){V.pad(I,t,c.n,sd*32,{cut:800,vol:.034});V.bass(I,t,c.b,sd*10,.15)}
        if((s===0||s===6||s===10)&&Math.random()<.62)V.pluck(I,t,c.n[1+Math.floor(Math.random()*3)]+12,{vol:.045,dec:1.3,dly:1,type:'sine'});
        if(bar%4===3&&s===12)V.bell(I,t,88,{vol:.022,dec:1.2})}},
    tension:{bpm:112,hold:1,prog:[{b:38,n:[50,53,57]},{b:38,n:[50,53,57]},{b:34,n:[46,53,58]},{b:33,n:[45,52,57]}],
      step(I,bar,s,t,c,sd){if(s===0)V.pad(I,t,c.n,sd*16,{cut:650,vol:.035});if(s%4===0)V.kick(I,t,.26);if(bar%4===3&&s===14)V.kick(I,t,.2);
        if(s%4===2)V.hat(I,t,.035);else if(s%2===1)V.hat(I,t,.012);if([0,3,6,8,11,14].includes(s))V.bass(I,t,c.b,sd*1.5,.2);
        if(s%2===0)V.pluck(I,t,c.n[0]+[0,12,7,12,0,12,7,12][s/2],{vol:.04,dec:.22,type:'sawtooth',cut:700+(bar%8)*90})}},
    maravilla:{bpm:72,hold:1,prog:[{b:36,n:[55,59,64,67]},{b:40,n:[55,59,62,67]},{b:41,n:[57,60,64,71]},{b:43,n:[55,59,62,64]}],
      mel:[[[0,79,8],[8,83,8]],[[0,81,12]],[[0,84,8],[8,83,4],[12,79,4]],[[0,86,16]]],
      step(I,bar,s,t,c,sd){if(s===0){V.pad(I,t,c.n,sd*16,{cut:1500,vol:.03});V.bass(I,t,c.b,sd*12,.15)}
        V.pluck(I,t,c.n[[0,1,2,3,2,1,2,3][s%8]]+(s%8>=4?24:12),{vol:.028,dec:.5,dly:1,type:'sine'});if(bar%8>=2)mel(this,I,bar,s,t,sd,.05)}},
    derrota:{bpm:60,hold:1,prog:[{b:45,n:[57,60,64,69]},{b:41,n:[57,60,65,69]},{b:38,n:[57,62,65,69]},{b:40,n:[55,59,64,67]}],
      step(I,bar,s,t,c,sd){if(s===0){V.pad(I,t,c.n,sd*16,{cut:620,vol:.036});V.bass(I,t,c.b,sd*14,.13)}if(s%4===0)V.pluck(I,t,c.n[3-s/4]+12,{vol:.055,dec:1.6,cut:1500,dly:1})}}};
  function inst(fade){const mk=to=>{const g=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(1,ac.currentTime+Math.max(.05,fade));g.connect(to);return g};
    const fw=mk(out),fd=mk(out),fl=mk(dIn);fw.connect(rev);return{g:fw,dry:fd,d:fl,fs:[fw,fd,fl]}}
  function kill(I,fade){const n=ac.currentTime;I.fs.forEach(g=>{try{g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(0,n+Math.max(.05,fade))}catch(_){}});setTimeout(()=>I.fs.forEach(g=>{try{g.disconnect()}catch(_){}}),(fade+5)*1000)}
  function tick(){if(!cur||cur.kind!=='synth'||!ac)return;const n=ac.currentTime;if(cur.next<n)cur.next=n+.05;
    while(cur.next<n+.3){const bar=Math.floor(cur.i/16),s=cur.i%16,T=cur.T,c=T.prog[Math.floor(bar/T.hold)%T.prog.length];try{T.step(cur.I,bar,s,cur.next,c,cur.sd)}catch(_){}cur.i++;cur.next+=cur.sd}}
  function load(id){if(FC[id]!==undefined)return Promise.resolve(FC[id]);const f=MAN()[id];if(!f)return Promise.resolve(false);
    return new Promise(res=>{const a=new Audio();a.loop=true;a.preload='auto';const done=v=>{a.removeEventListener('canplaythrough',ok);a.removeEventListener('error',bad);clearTimeout(to);res(FC[id]=v)},ok=()=>done(a),bad=()=>done(false),to=setTimeout(bad,8000);a.addEventListener('canplaythrough',ok);a.addEventListener('error',bad);a.src=BASE+f;a.load()})}
  function ftick(){fl=fl.filter(x=>{const step=.05/Math.max(.05,x.fade);x.l=x.to>x.l?Math.min(x.to,x.l+step):Math.max(x.to,x.l-step);try{x.el.volume=Math.min(1,x.l*vol*(ducked?.3:1))}catch(_){}if(x.to===0&&x.l===0){try{x.el.pause()}catch(_){}return false}return true});if(!fl.length){clearInterval(ft);ft=0}}
  function halt(fade){if(!cur)return;if(cur.kind==='file'){cur.x.to=0;cur.x.fade=fade}else if(ac)kill(cur.I,fade);cur=null}
  function synth(id,fade){const T=TR[id];if(!init())return;if(ac.state==='suspended')ac.resume().catch(()=>{});const sd=60/T.bpm/4;dly.delayTime.setTargetAtTime(sd*3,ac.currentTime,.05);cur={id,kind:'synth',T,I:inst(fade),i:0,next:ac.currentTime+.1,sd};if(!timer)timer=setInterval(tick,60);tick()}
  function play(id,o){if(!TR[id])return false;const fade=o&&o.fade!=null?+o.fade:1.5;want=id;if(!live())return true;if(cur&&cur.id===id)return true;
    load(id).then(a=>{if(want!==id||!live()||(cur&&cur.id===id))return;halt(fade);
      if(a){try{a.currentTime=0}catch(_){}a.volume=0;fl=fl.filter(y=>y.el!==a);const x={el:a,l:0,to:1,fade};fl.push(x);const p=a.play();if(p&&p.catch)p.catch(()=>{});cur={id,kind:'file',x};if(!ft)ft=setInterval(ftick,50)}
      else synth(id,fade)});return true}
  function stop(fade){want=null;halt(fade!=null?+fade:1.5)}
  function sync(){if(!live()){const w=want;halt(.6);want=w}else if(want&&!(cur&&cur.id===want)){const w=want;want=null;play(w)}}
  const kickG=()=>{try{if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});if(cur&&cur.kind==='file'&&cur.x.el.paused){const p=cur.x.el.play();if(p&&p.catch)p.catch(()=>{})}}catch(_){}};
  ['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,kickG,true));
  function setOut(){if(out&&ac)out.gain.setTargetAtTime(vol*(ducked?.3:1),ac.currentTime,.12)}
  window.MAPS_MUSIC={get on(){return on},enable:b=>{on=!!b;try{localStorage.setItem('maps:music',on?'1':'0')}catch(_){}sync()},mute:b=>{muted=!!b;sync()},play,stop,vol:v=>{vol=Math.min(1,Math.max(0,+v||0));setOut()},duck:b=>{ducked=!!b;setOut()},current:()=>cur?cur.id:null,source:id=>MAN()[id]?(FC[id]===false?'fallo':'archivo'):'codigo',file:id=>MAN()[id]||null,tracks:Object.keys(TR)};
})();

/* ---- ganymede-sfx.js ---- */
/* Ganymede SFX, recycled from Luna's sound set. Inside the MAPS site (path /missions/ganimedes/) it plays Luna's CC0 files from ../luna/sfx/; anywhere else it plays generated tones. API: GANY_SFX.play(k) · toggle() · on. Keys: click blip ok bad stamp whoosh ring fanfare pop rumble alarm unlock */
(function(){const base=/\/missions\/ganimedes\//.test(location.pathname)?'../luna/sfx/':null;let ac=null,on=true;const B={},N=['click','blip','success','error','stamp','whoosh','phone_ring','fanfare','select','launch_rumble','alarm','unlock'];try{on=(localStorage.getItem('maps:sfx')??'1')==='1'}catch(_){}
const ctx=()=>{if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(_){}if(ac&&base)N.forEach(n=>fetch(base+n+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>ac.decodeAudioData(a)).then(b=>{B[n]=b}).catch(()=>{}))}if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});return ac};
const smp=(n,v)=>{const x=ctx();if(!x||!B[n]||x.state!=='running')return false;const s=x.createBufferSource(),g=x.createGain();s.buffer=B[n];g.gain.value=v;s.connect(g).connect(x.destination);s.start();return true};
const tone=(f,d,type,v,slide,delay)=>{const x=ctx();if(!x)return;const t0=x.currentTime+(delay||0),o=x.createOscillator(),g=x.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v||.06,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g).connect(x.destination);o.start(t0);o.stop(t0+d+.03)};
const noise=(d,v,lp,delay)=>{const x=ctx();if(!x)return;const t0=x.currentTime+(delay||0),n=Math.floor(x.sampleRate*d),b=x.createBuffer(1,n,x.sampleRate),ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=Math.random()*2-1;const s=x.createBufferSource();s.buffer=b;const f=x.createBiquadFilter();f.type='lowpass';f.frequency.value=lp||800;const g=x.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v||.1,t0+Math.min(.3,d*.2));g.gain.exponentialRampToValueAtTime(.0001,t0+d);s.connect(f).connect(g).connect(x.destination);s.start(t0)};
const S={click:['click',.28,()=>tone(620,.05,'triangle',.04)],blip:['blip',.12,()=>tone(760+Math.random()*260,.025,'square',.012)],ok:['success',.45,()=>{tone(523,.12,'triangle',.06);tone(784,.2,'triangle',.06,0,.1)}],bad:['error',.4,()=>tone(200,.22,'sawtooth',.04,-70)],stamp:['stamp',.6,()=>{noise(.14,.3,420);tone(95,.16,'square',.05,-30)}],whoosh:['whoosh',.3,()=>noise(.45,.06,1400)],ring:['phone_ring',.4,()=>[0,.18,.6,.78].forEach(d=>tone(1180,.12,'sine',.035,0,d))],fanfare:['fanfare',.5,()=>[523,659,784,1046].forEach((f,i)=>tone(f,.3,'triangle',.06,0,i*.13))],pop:['select',.4,()=>tone(420,.09,'sine',.06,320)],rumble:['launch_rumble',.7,()=>noise(2.6,.2,160)],alarm:['alarm',.4,()=>[0,.25,.5].forEach(d=>tone(880,.16,'square',.03,-200,d))],unlock:['unlock',.45,()=>{tone(660,.1,'triangle',.05);tone(990,.18,'triangle',.05,0,.09)}]};
window.GANY_SFX={get on(){return on},set(b){on=!!b;try{localStorage.setItem('maps:sfx',on?'1':'0')}catch(_){}},toggle(){this.set(!on);return on},play(k){if(!on)return;const e=S[k];if(!e)return;if(!smp(e[0],e[1]))e[2]()}};})();

/* ---- mobile-gate.js ---- */
/* Recycled from Luna mobile-gate.js, repainted for Ganymede pixel art. MAPS · aviso para celulares: el juego se juega en computadora o laptop. Saltar con ?desktop=1 */
(function(){
  const QS=new URLSearchParams(location.search),mq=q=>{try{return matchMedia(q).matches}catch(_){return false}};
  const ua=navigator.userAgent||'',phoneUA=/Android.+Mobile|iPhone|iPod|Windows Phone|IEMobile|Opera Mini|Mobile Safari/i.test(ua);
  const touchOnly=mq('(pointer:coarse)')&&!mq('(any-pointer:fine)'),small=Math.min(screen.width||0,screen.height||0)<820;
  const needsComputer=QS.has('mobile')||(!QS.has('desktop')&&(phoneUA||(touchOnly&&small)));
  if(!needsComputer)return;
  let L=QS.get('lang');try{L=L||localStorage.getItem('maps:lang')}catch(_){}L=['es','en','pt'].includes(L)?L:((navigator.language||'es').slice(0,2)==='pt'?'pt':(navigator.language||'es').slice(0,2)==='en'?'en':'es');
  const T={
    es:{ey:'MAPS · Ganímedes',h:'Esta misión se pilota desde una computadora',p:'MAPS necesita una pantalla grande, teclado y mouse. El taller, los minijuegos y los controles de la nave no caben en un celular.',s:['Abre este enlace en una laptop o computadora','Usa Chrome, Edge o Firefox','Juega solo o con hasta 4 personas en la misma pantalla'],copy:'Copiar enlace',copied:'Enlace copiado',back:'Volver al menú',share:'Enviar enlace',soon:'La versión para celular está en camino.'},
    en:{ey:'MAPS · Ganymede',h:'This mission is flown from a computer',p:'MAPS needs a big screen, a keyboard and a mouse. The workshop, the minigames and the ship controls don’t fit on a phone.',s:['Open this link on a laptop or desktop computer','Use Chrome, Edge or Firefox','Play solo or with up to 4 people on the same screen'],copy:'Copy link',copied:'Link copied',back:'Back to menu',share:'Send link',soon:'A phone version is on its way.'},
    pt:{ey:'MAPS · Ganimedes',h:'Esta missão é pilotada de um computador',p:'O MAPS precisa de uma tela grande, teclado e mouse. A oficina, os minijogos e os controles da nave não cabem num celular.',s:['Abra este link num notebook ou computador','Use Chrome, Edge ou Firefox','Jogue sozinho ou com até 4 pessoas na mesma tela'],copy:'Copiar link',copied:'Link copiado',back:'Voltar ao menu',share:'Enviar link',soon:'A versão para celular está a caminho.'}
  }[L];
  const css=`
.mgate[open]{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;box-sizing:border-box;margin:0;border:0;overflow:auto;display:grid;place-items:center;padding:28px max(20px,env(safe-area-inset-right)) 28px max(20px,env(safe-area-inset-left));color:#effcf8;font:16px/1.5 "Manrope",system-ui,sans-serif;
  background:radial-gradient(1px 1px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 82% 12%,#fff,transparent),radial-gradient(1.4px 1.4px at 64% 34%,#dfeaff,transparent),radial-gradient(1px 1px at 30% 62%,#fff,transparent),radial-gradient(1px 1px at 90% 70%,#fff,transparent),radial-gradient(1px 1px at 8% 86%,#dfeaff,transparent),#03100f}
.mgate .mg{width:min(440px,100%);display:grid;gap:22px;justify-items:center;text-align:center}
.mgate .dev{position:relative;width:250px;height:170px;margin-top:6px;animation:mgUp .9s cubic-bezier(.2,.7,.2,1) both}
.mgate .lap{position:absolute;left:10px;right:10px;top:0;height:136px;border-radius:0;background:#0b111c;border:2px solid #2b5560;box-shadow:0 0 0 6px #121a28,0 24px 50px -16px #000,0 0 60px -10px rgba(142,213,243,.35);overflow:hidden}
.mgate .scr{position:absolute;inset:8px;border-radius:0;overflow:hidden;background:radial-gradient(60% 70% at 70% 40%,#1a2a48,#060b16)}
.mgate .scr::before{content:"";position:absolute;left:58%;top:24%;width:58px;height:58px;border-radius:0;background:radial-gradient(circle at 30% 34%,rgba(60,68,84,.5) 0 8%,transparent 9%),radial-gradient(circle at 62% 60%,rgba(60,68,84,.45) 0 11%,transparent 12%),radial-gradient(circle at 36% 30%,#f4f6fa,#a3acbb 55%,#4d5566 90%);box-shadow:0 0 30px rgba(220,228,240,.25)}
.mgate .scr::after{content:"";position:absolute;left:-30%;top:58%;width:160%;height:140%;border-radius:0;border-top:1.5px dashed rgba(255,199,121,.75);transform:rotate(-14deg);animation:mgOrb 6s linear infinite}
.mgate .scr i{position:absolute;left:14px;top:14px;width:46px;height:5px;border-radius:0;background:#7dffbf;box-shadow:0 10px 0 -1px #2b5560,0 20px 0 -1px #2b5560}
.mgate .base{position:absolute;left:0;right:0;top:136px;height:12px;border-radius:0;background:linear-gradient(180deg,#2a3546,#141b27);box-shadow:0 10px 24px -10px #000}
.mgate .base::after{content:"";position:absolute;left:50%;top:0;width:44px;height:4px;margin-left:-22px;border-radius:0;background:#0b111c}
.mgate .ph{position:absolute;left:-14px;bottom:4px;width:40px;height:72px;border-radius:0;border:2px solid #4a5568;background:#0b111c;transform:rotate(-10deg);opacity:.9}
.mgate .ph::after{content:"";position:absolute;left:-10px;right:-10px;top:50%;height:2.5px;border-radius:0;background:#ff8a7a;transform:rotate(-52deg);box-shadow:0 0 10px rgba(255,138,122,.7)}
.mgate .ey{font:800 .72rem "Pixelify Sans",system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#7ff0ff;animation:mgUp .8s .15s both}
.mgate h1{margin:-10px 0 0;font:800 clamp(1.6rem,7vw,2.1rem)/1.12 "Pixelify Sans",system-ui,sans-serif;text-wrap:balance;animation:mgUp .8s .22s both}
.mgate p{margin:-6px 0 0;color:#cfe9e3;text-wrap:pretty;animation:mgUp .8s .3s both}
.mgate ol{margin:0;padding:0;list-style:none;display:grid;gap:8px;width:100%;text-align:left;animation:mgUp .8s .38s both}
.mgate li{display:grid;grid-template-columns:30px minmax(0,1fr);gap:12px;align-items:center;padding:11px 14px;border-radius:0;background:#06191c;border:1px solid #2b5560;font-size:.95rem}
.mgate li b{width:30px;height:30px;display:grid;place-items:center;border-radius:0;border:1.5px solid #7dffbf;color:#7dffbf;font:800 .85rem "Pixelify Sans",system-ui,sans-serif}
.mgate .acts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%;animation:mgUp .8s .46s both}
.mgate button{flex:1 1 160px;min-height:50px;border-radius:0;border:4px solid #2b5560;background:#06191c;color:#effcf8;font:800 1rem "Pixelify Sans",system-ui,sans-serif;cursor:pointer}
.mgate button.pri{border-color:#03100f;background:#7dffbf;color:#03100f;box-shadow:6px 6px 0 #000}
.mgate small{color:#a9cfc8;font-size:.82rem;animation:mgUp .8s .54s both}
@keyframes mgUp{from{opacity:0;transform:translateY(14px)}}@keyframes mgOrb{to{transform:rotate(346deg)}}
@media (prefers-reduced-motion:reduce){.mgate *{animation:none!important}}`;
  const st=document.createElement('style');st.textContent=css;document.head.append(st);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  window.MAPSMobileGate=trigger=>{
    if(document.querySelector('.mgate[open]'))return;
    const g=document.createElement('dialog');
    g.className='mgate';
    g.setAttribute('aria-label',T.h);
    g.innerHTML='<div class="mg"><div class="dev" aria-hidden="true"><div class="lap"><div class="scr"><i></i></div></div><div class="base"></div><div class="ph"></div></div><span class="ey">'+esc(T.ey)+'</span><h1>'+esc(T.h)+'</h1><p>'+esc(T.p)+'</p><ol>'+T.s.map((x,i)=>'<li><b>'+(i+1)+'</b><span>'+esc(x)+'</span></li>').join('')+'</ol><div class="acts"><button type="button" class="pri" data-a="copy">'+esc(T.copy)+'</button>'+(navigator.share?'<button type="button" data-a="share">'+esc(T.share)+'</button>':'')+'<button type="button" data-a="back" autofocus>'+esc(T.back)+'</button></div><small>'+esc(T.soon)+'</small></div>';
    const url=location.href.replace(/[?&]desktop(=[^&]*)?/,'');
    g.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.a==='back'){g.close();return}if(b.dataset.a==='share'){try{await navigator.share({title:'MAPS',text:T.h,url})}catch(_){}return}
      try{await navigator.clipboard.writeText(url)}catch(_){const ta=document.createElement('textarea');ta.value=url;document.body.append(ta);ta.select();try{document.execCommand('copy')}catch(__){}ta.remove()}b.textContent='✓ '+T.copied;setTimeout(()=>b.textContent=T.copy,2200)});
    g.addEventListener('close',()=>{
      g.remove();
      trigger?.focus();
    });
    document.body.append(g);
    g.showModal();
  };
})();

/* ---- maps-bridge.js ---- */
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
