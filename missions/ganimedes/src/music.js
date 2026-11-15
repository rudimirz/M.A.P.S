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
