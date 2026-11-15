/* MAPS · sala en línea (beta). Cada jugador en su computadora, sin servidor propio.
   El anfitrión corre la partida y comparte su pestaña; los invitados la ven en video y sus clics y teclas
   viajan al anfitrión por WebRTC (PeerJS). Apagada por defecto: se activa con MAPS_CONFIG.online.enabled=true o con ?online=1 en la URL.
   MAPS_CONFIG.online.peer = opciones de un servidor PeerJS propio; .iceServers = lista STUN/TURN propia. */
(function(){
  const CFG=(window.MAPS_CONFIG&&window.MAPS_CONFIG.online)||{};
  const params=new URLSearchParams(location.search);
  const ref=document.referrer?new URL(document.referrer):null;
  const mockSession=params.get('mockSession')||'';
  const MOCK=params.get('online')==='mock'&&window.parent!==window&&ref?.origin===location.origin
    &&ref.pathname.endsWith('/sala-local.html')&&/^[a-z0-9]{8,24}$/.test(mockSession);
  if(window.MAPSMobileGate||(CFG.enabled!==true&&params.get('online')!=='1'&&!MOCK))return;
  const LIBS=MOCK?['peer-mock.js']:CFG.lib?[].concat(CFG.lib):['peerjs.min.js','https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'];
  const PRE='maps-luna-',ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789',DC={2:'#8ed5f3',3:'#ffc779',4:'#d5afff'};
  const HOLD_MS=MOCK?1000*Math.max(4,Math.min(45,Number(params.get('hold'))||8)):45000,RETRY_MS=2500,RETRY_LIMIT=12;
  const TX={
    es:{btn:'Jugar en línea',title:'Sala en línea',sub:'Cada jugador en su computadora. Una persona crea la sala y comparte su pantalla; el resto entra con el código y juega desde la suya.',hostH:'Soy el anfitrión',hostP:'La partida corre en tu computadora.',create:'Crear sala',joinH:'Tengo un código',joinP:'Entras a la partida de otra persona.',codePh:'Código',namePh:'Tu nombre',enter:'Entrar',creating:'Abriendo sala…',joining:'Entrando a la sala…',codeL:'Código de la sala',steps:['Pasa este código a tu tripulación.','Comparte esta pestaña para que vean el juego.','Empieza la misión y elige tantos jugadores como personas haya en la sala.'],share:'Compartir esta pestaña',sharing:'Compartiendo pantalla',notTab:'Compartiste una ventana o la pantalla completa. Para que los clics de los demás caigan en su lugar, vuelve a compartir y elige «esta pestaña».',noShare:'Este navegador no permite compartir pantalla. Usa Chrome o Edge en computadora.',crew:'Tripulación conectada',you:'Tú (anfitrión)',anon:'Sin nombre',none:'Aún no entra nadie.',play:'Ir al juego',endRoom:'Cerrar sala',close:'Cerrar',leave:'Salir',room:'Sala {c}',youAre:'eres {n}',noShareYet:'sin compartir',waitHost:'Esperando a que el anfitrión comparta su pantalla…',tap:'Haz clic para ver y oír la sala',noRoom:'No encontré esa sala. Revisa el código y que el anfitrión la tenga abierta.',full:'La sala ya tiene 4 jugadores.',lost:'Se cortó la conexión con la sala.',err:'No se pudo conectar. Revisa tu internet e inténtalo otra vez.',note:'Beta: la partida corre en la computadora del anfitrión. Los demás la ven en video, con un pequeño retraso.'},
    en:{btn:'Play online',title:'Online room',sub:'Each player on their own computer. One person creates the room and shares their screen; the rest join with the code and play from theirs.',hostH:'I am the host',hostP:'The game runs on your computer.',create:'Create room',joinH:'I have a code',joinP:'You join someone else’s game.',codePh:'Code',namePh:'Your name',enter:'Join',creating:'Opening room…',joining:'Joining the room…',codeL:'Room code',steps:['Give this code to your crew.','Share this tab so they can see the game.','Start the mission and pick as many players as there are people in the room.'],share:'Share this tab',sharing:'Sharing screen',notTab:'You shared a window or the whole screen. For everyone’s clicks to land in the right place, share again and pick “this tab”.',noShare:'This browser cannot share the screen. Use Chrome or Edge on a computer.',crew:'Connected crew',you:'You (host)',anon:'No name',none:'Nobody has joined yet.',play:'Go to the game',endRoom:'Close room',close:'Close',leave:'Leave',room:'Room {c}',youAre:'you are {n}',noShareYet:'not sharing',waitHost:'Waiting for the host to share their screen…',tap:'Click to see and hear the room',noRoom:'I could not find that room. Check the code and that the host has it open.',full:'The room already has 4 players.',lost:'The connection to the room dropped.',err:'Could not connect. Check your internet and try again.',note:'Beta: the game runs on the host’s computer. Everyone else sees it as video, with a small delay.'},
    pt:{btn:'Jogar online',title:'Sala online',sub:'Cada jogador no seu computador. Uma pessoa cria a sala e compartilha a tela; os outros entram com o código e jogam do seu.',hostH:'Sou o anfitrião',hostP:'A partida roda no seu computador.',create:'Criar sala',joinH:'Tenho um código',joinP:'Você entra na partida de outra pessoa.',codePh:'Código',namePh:'Seu nome',enter:'Entrar',creating:'Abrindo sala…',joining:'Entrando na sala…',codeL:'Código da sala',steps:['Passe este código para a sua tripulação.','Compartilhe esta aba para que vejam o jogo.','Comece a missão e escolha tantos jogadores quantas pessoas houver na sala.'],share:'Compartilhar esta aba',sharing:'Compartilhando a tela',notTab:'Você compartilhou uma janela ou a tela inteira. Para que os cliques dos outros caiam no lugar certo, compartilhe de novo e escolha «esta aba».',noShare:'Este navegador não permite compartilhar a tela. Use Chrome ou Edge no computador.',crew:'Tripulação conectada',you:'Você (anfitrião)',anon:'Sem nome',none:'Ninguém entrou ainda.',play:'Ir para o jogo',endRoom:'Fechar sala',close:'Fechar',leave:'Sair',room:'Sala {c}',youAre:'você é {n}',noShareYet:'sem compartilhar',waitHost:'Esperando o anfitrião compartilhar a tela…',tap:'Clique para ver e ouvir a sala',noRoom:'Não encontrei essa sala. Confira o código e se o anfitrião está com ela aberta.',full:'A sala já tem 4 jogadores.',lost:'A conexão com a sala caiu.',err:'Não foi possível conectar. Confira sua internet e tente de novo.',note:'Beta: a partida roda no computador do anfitrião. Os outros a veem em vídeo, com um pequeno atraso.'}
  };
  Object.assign(TX.es,{admit:'Admitir',deny:'Rechazar',waitApproval:'Esperando autorización del anfitrión…',denied:'El anfitrión rechazó la entrada.',recon:'Se cortó la conexión. Reconectando…',away:'reconectando…'});
  Object.assign(TX.en,{admit:'Admit',deny:'Decline',waitApproval:'Waiting for the host to admit you…',denied:'The host declined your request to join.',recon:'Connection dropped. Reconnecting…',away:'reconnecting…'});
  Object.assign(TX.pt,{admit:'Admitir',deny:'Recusar',waitApproval:'Aguardando autorização do anfitrião…',denied:'O anfitrião recusou a entrada.',recon:'A conexão caiu. Reconectando…',away:'reconectando…'});
  Object.assign(TX.es,{seats:'Reparto de puestos',seatDenied:'Ese control es de {s}.',mock:'Prueba local · video simulado'});
  Object.assign(TX.en,{seats:'Seat assignment',seatDenied:'That control belongs to {s}.',mock:'Local test · simulated video'});
  Object.assign(TX.pt,{seats:'Divisão de postos',seatDenied:'Esse controle pertence a {s}.',mock:'Teste local · vídeo simulado'});
  let seats=CFG.seats!==false,lastDeny=null;
  const lang=()=>{let l='es';try{l=LANG}catch(_){try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('maps:lang')||'es'}catch(__){}}return TX[l]?l:'es'};
  let T=TX.es,peer=null,role=null,code='',stream=null,guests=[],conn=null,me=0,mo=null,pill=null,gv=null,libP=null,warn='',pend=null;
  let cancelJoin=null;
  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  const btn=(cls,txt,fn)=>{const b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b};
  const popt=()=>Object.assign({debug:0},CFG.peer||{},CFG.iceServers?{config:{iceServers:CFG.iceServers}}:{});
  const st=document.createElement('style');st.textContent=`
.onl{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(3,6,12,.74);font:15px/1.5 "Segoe UI",system-ui,sans-serif;color:#f0f4fa;overflow:auto}
.onl-c{width:min(640px,100%);display:grid;gap:14px;padding:26px;border-radius:20px;background:#111823;border:1px solid #344255;box-shadow:0 30px 80px -20px #000;box-sizing:border-box}
.onl h2{margin:0;font:800 1.5rem "Bahnschrift","Segoe UI",sans-serif}
.onl h3{margin:0;font:800 .78rem "Bahnschrift","Segoe UI",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#acbbce}
.onl p{margin:0;color:#acbbce;text-wrap:pretty}
.onl-ey{font:800 .7rem "Bahnschrift","Segoe UI",sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#ffc779}
.onl-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.onl-p{display:grid;gap:10px;align-content:start;padding:16px;border-radius:14px;background:#0b111a;border:1px solid #243042}
.onl-b{min-height:46px;padding:0 20px;border-radius:999px;border:1px solid #344255;background:#171f2c;color:#f0f4fa;font:800 .95rem "Bahnschrift","Segoe UI",sans-serif;cursor:pointer}
.onl-b.pri{border-color:transparent;background:#90e1bd;color:#08110d}
.onl-b:disabled{opacity:.6;cursor:default}
.onl-x{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid #344255;background:transparent;color:#acbbce;font:700 .85rem "Segoe UI",sans-serif;cursor:pointer;justify-self:start}
.onl-i{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #344255;background:#070b12;color:#f0f4fa;font:600 1rem "Segoe UI",sans-serif;width:100%;box-sizing:border-box}
.onl-i.code{font:800 1.3rem ui-monospace,Consolas,monospace;letter-spacing:.4em;text-align:center;text-transform:uppercase}
.onl-code{font:800 clamp(2.6rem,9vw,4rem)/1 ui-monospace,Consolas,monospace;letter-spacing:.3em;color:#90e1bd;text-align:center;padding:14px 0 14px .3em;border-radius:14px;background:#070b12;border:1px dashed #344255;user-select:all}
.onl-s{margin:0;padding-left:20px;color:#d7dfea;display:grid;gap:4px}
.onl-l{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.onl-l li{display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:10px;background:#0b111a;border:1px solid #243042}
.onl-l li b{font:800 .8rem ui-monospace,Consolas,monospace;color:#90e1bd}
.onl-l li.onl-e{color:#8796ab;border-style:dashed}
.onl-r{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;align-items:center}
.onl-err{color:#ffb4a8!important;padding:10px 12px;border-radius:10px;background:rgba(255,138,122,.1);border:1px solid rgba(255,138,122,.35)}
.onl-n{font-size:.82rem;color:#8796ab!important}
.onl-w{text-align:center;padding:18px 0}
.onl-pill{position:fixed;left:10px;bottom:10px;z-index:2147482000;min-height:30px;padding:0 12px;border-radius:999px;border:1px solid #344255;background:rgba(11,17,26,.92);color:#ffc779;font:800 .72rem ui-monospace,Consolas,monospace;cursor:pointer}
.onl-pill[data-on="1"]{color:#90e1bd}
.onl-dot{position:fixed;left:0;top:0;z-index:2147482500;pointer-events:none;margin:-7px 0 0 -7px;width:14px;height:14px;border-radius:50%;background:var(--c);box-shadow:0 0 0 2px rgba(3,6,12,.8);font:800 10px/14px ui-monospace,Consolas,monospace;color:var(--c);text-indent:18px;white-space:nowrap;font-style:normal;text-shadow:0 1px 2px #000}
.onl-gv{position:fixed;inset:0;z-index:2147483600;background:#000;display:grid;grid-template-rows:auto minmax(0,1fr)}
.onl-gb{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:4px 10px;background:#0b111a;border-bottom:1px solid #243042;color:#90e1bd;font:800 .78rem ui-monospace,Consolas,monospace}
.onl-gb .onl-x{min-height:30px}
.onl-gs{position:relative;min-height:0}
.onl-gs video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;cursor:crosshair;touch-action:none}
.onl-gs .onl-w{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:20px;color:#acbbce;font:600 1.05rem "Segoe UI",system-ui,sans-serif;pointer-events:none}
.onl-tip{position:absolute;left:50%;top:12px;transform:translateX(-50%);margin:0;padding:8px 16px;border-radius:16px;background:#111823;color:#ffc779;border:1px solid #ffc779;pointer-events:none}
.onl-seat{display:flex;align-items:center;gap:8px;color:#d7dfea}.onl-seat input{margin:0}
.onl-tap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
.onl [hidden],.onl-gv [hidden]{display:none!important}`;document.head.append(st);

  function lib(){
    if(window.Peer)return Promise.resolve();
    const load=url=>new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      const fail=()=>{s.remove();reject(new Error('peer'))};
      s.src=url;s.onload=()=>window.Peer?resolve():fail();s.onerror=fail;document.head.append(s);
    });
    return libP||(libP=(async()=>{
      for(const url of LIBS){try{await load(url);return}catch(_){}}
      throw new Error('peer');
    })().catch(error=>{libP=null;throw error}));
  }
  function close(){if(mo){mo.remove();mo=null}}
  function modal(){close();guests.forEach(release);T=TX[lang()];mo=el('div','onl');mo.setAttribute('role','dialog');mo.setAttribute('aria-modal','true');mo.setAttribute('aria-label',T.title);const c=el('div','onl-c');mo.append(c);mo.addEventListener('pointerdown',e=>{if(e.target===mo&&!mo.hasAttribute('aria-busy'))close()});document.body.append(mo);return c}
  function busy(t){const c=modal();mo.setAttribute('aria-busy','true');c.append(el('h2',null,T.title),el('p','onl-w',t),btn('onl-x',T.close,()=>{end();close()}));return mo}
  function home(msg){const c=modal();if(MOCK)c.append(el('span','onl-ey',T.mock));c.append(el('h2',null,T.title),el('p',null,T.sub));if(msg)c.append(el('p','onl-err',msg));
    const g=el('div','onl-g'),a=el('div','onl-p'),b=el('div','onl-p'),ic=el('input','onl-i code'),inm=el('input','onl-i');
    a.append(el('h3',null,T.hostH),el('p',null,T.hostP),btn('onl-b pri',T.create,host));
    ic.maxLength=4;ic.placeholder=T.codePh;ic.spellcheck=false;ic.autocomplete='off';ic.setAttribute('aria-label',T.codePh);inm.maxLength=16;inm.placeholder=T.namePh;inm.autocomplete='off';inm.setAttribute('aria-label',T.namePh);
    const go=()=>{const k=ic.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(k.length!==4){ic.focus();return}join(k,inm.value.replace(/\s+/g,' ').trim())};
    ic.addEventListener('input',()=>{ic.value=ic.value.toUpperCase().replace(/[^A-Z0-9]/g,'')});
    [ic,inm].forEach(i=>['keydown','keyup','keypress'].forEach(ev=>i.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Enter')go()})));
    b.append(el('h3',null,T.joinH),el('p',null,T.joinP),ic,inm,btn('onl-b',T.enter,go));g.append(a,b);c.append(g,el('p','onl-n',T.note),btn('onl-x',T.close,close))}

  /* ── anfitrión ── */
  async function host(){const panel=busy(T.creating);try{await lib()}catch(_){if(mo===panel)home(T.err);return}if(mo!==panel)return;let n=0;
    const open=()=>{code=Array.from({length:4},()=>ABC[Math.floor(Math.random()*ABC.length)]).join('');const p=new Peer(PRE+code,popt());peer=p;
      const timeout=setTimeout(()=>{if(peer===p&&role!=='host'){end();home(T.err)}},15000);
      p.on('open',()=>{clearTimeout(timeout);if(peer===p){role='host';hostUI();pillUI()}});p.on('connection',c=>{if(peer===p&&role==='host')onGuest(c);else c.close()});
      p.on('disconnected',()=>{try{if(!p.destroyed)p.reconnect()}catch(_){}});
      p.on('error',e=>{clearTimeout(timeout);if(peer!==p)return;if(e&&e.type==='unavailable-id'&&n++<5){try{p.destroy()}catch(_){}open()}else if(role!=='host'){end();home(T.err)}})};open()}
  function hostUI(){if(role!=='host')return;const c=modal();c.append(el('span','onl-ey',T.codeL),el('div','onl-code',code));const ol=el('ol','onl-s');T.steps.forEach(s=>ol.append(el('li',null,s)));c.append(ol);if(warn)c.append(el('p','onl-err',warn));
    const sh=btn('onl-b pri',stream?T.sharing:T.share,share);sh.disabled=!!stream;c.append(sh,el('h3',null,T.crew));
    const ul=el('ul','onl-l'),li=(a,b)=>{const x=el('li');x.append(el('b',null,a),el('span',null,b));return x};ul.append(li('J1',T.you));
    guests.filter(g=>g.open||g.hold).sort((a,b)=>a.n-b.n).forEach(g=>{
      const row=li('J'+g.n,(g.name||T.anon)+(g.open?'':' · '+T.away));
      if(g.open&&!g.admitted){
        const accept=btn('onl-x',T.admit,()=>admit(g));
        accept.dataset.admit=String(g.n);
        row.append(accept,btn('onl-x',T.deny,()=>deny(g)));
      }
      ul.append(row);
    });
    if(ul.children.length===1)ul.append(el('li','onl-e',T.none));
    const option=el('label','onl-seat'),check=el('input');
    check.type='checkbox';check.checked=seats;
    check.addEventListener('change',()=>{guests.forEach(release);seats=check.checked});
    option.append(check,el('span',null,T.seats));
    const row=el('div','onl-r');row.append(btn('onl-x',T.endRoom,()=>{end();close()}),btn('onl-b',T.play,close));c.append(ul,option,row,el('p','onl-n',MOCK?T.mock:T.note))}
  function pillUI(){if(role!=='host'){if(pill){pill.remove();pill=null}return}if(!pill){pill=btn('onl-pill','',()=>hostUI());document.body.append(pill)}pill.textContent=T.room.replace('{c}',code)+' · '+(guests.filter(g=>g.open).length+1)+'/4'+(stream?'':' · '+T.noShareYet);pill.dataset.on=stream?'1':'0'}
  function upd(){if(mo&&role==='host')hostUI();pillUI()}
  async function share(){warn='';const owner=peer,md=navigator.mediaDevices;if(!MOCK&&!md?.getDisplayMedia){warn=T.noShare;return upd()}let s=null;
    try{s=MOCK?window.MAPS_PEER_MOCK.screen():await md.getDisplayMedia({video:{frameRate:{ideal:30,max:30}},audio:true,preferCurrentTab:true,selfBrowserSurface:'include'})}
    catch(e){if(e&&(e.name==='TypeError'||e.name==='OverconstrainedError')){try{s=await md.getDisplayMedia({video:true})}catch(_){}}else if(e&&e.name!=='NotAllowedError'&&e.name!=='AbortError')warn=T.noShare}
    if(peer!==owner){s?.getTracks().forEach(t=>t.stop());return}
    if(s){
      const tr=s.getVideoTracks()[0],surface=tr?.getSettings?.().displaySurface;
      if(surface&&surface!=='browser'){s.getTracks().forEach(t=>t.stop());warn=T.notTab;return upd()}
      if(stream)stream.getTracks().forEach(t=>t.stop());
      stream=s;
      tr?.addEventListener('ended',()=>{
        if(stream!==s)return;
        stream=null;
        guests.forEach(g=>{release(g);g.call?.close();g.call=null});
        upd();
      });
      guests.forEach(callG);
    }
    upd();
  }
  function callG(g){if(!stream||!g.open||!g.admitted||!peer)return;try{g.call?.close()}catch(_){}try{g.call=peer.call(g.c.peer,stream)}catch(_){}}
  function tell(g){try{g.c.send({t:'hi',n:g.n})}catch(_){g.c.close();return}callG(g)}
  function admit(g){
    if(!guests.includes(g)||!g.open||g.admitted)return;
    g.admitted=true;
    tell(g);upd();
  }
  function removeGuest(g){
    clearTimeout(g.hold);clearTimeout(g.pending);g.hold=0;
    guests=guests.filter(other=>other!==g);upd();
  }
  function rejectGuest(c,type){try{c.send({t:type})}catch(_){}setTimeout(()=>c.close(),500)}
  function deny(g){removeGuest(g);rejectGuest(g.c,'denied')}
  function onGuest(c){
    const token=typeof c.metadata?.tk==='string'&&/^[0-9a-f-]{36}$/.test(c.metadata.tk)?c.metadata.tk:null;
    let g=token?guests.find(item=>item.token===token&&item.c.peer===c.peer):null;
    if(g&&!g.hold){c.close();return}
    if(g){
      clearTimeout(g.hold);g.hold=0;g.c=c;
    }else{
      const n=[2,3,4].find(slot=>!guests.some(item=>item.n===slot));
      if(!n){c.on('open',()=>rejectGuest(c,'full'));return}
      g={c,n,token,name:'',open:false,admitted:false,dot:null,down:null,held:new Map(),call:null,hold:0,expires:0,edit:null};guests.push(g);
    }
    const current=()=>g.c===c&&guests.includes(g);
    c.on('open',()=>{if(!current())return;clearTimeout(g.pending);g.open=true;g.expires=0;if(g.admitted)tell(g);upd()});
    c.on('data',d=>{
      if(!d||typeof d!=='object'||!g.open||!current())return;
      if(d.t==='name'&&typeof d.name==='string'){g.name=d.name.replace(/\s+/g,' ').trim().slice(0,16);upd()}
      else if(g.admitted&&stream){if(d.t==='k')key(g,d);else if(d.t==='p')ptr(g,d);else if(d.t==='w')wheel(g,d);else if(d.t==='release')release(g)}
    });
    const bye=()=>{
      if(!current()||g.hold)return;
      clearTimeout(g.pending);g.open=false;release(g);g.dot?.remove();g.dot=null;
      try{g.call?.close()}catch(_){}g.call=null;
      if(g.admitted&&g.token){
        const now=Date.now();if(!g.expires)g.expires=now+HOLD_MS;
        if(g.expires>now){g.hold=setTimeout(()=>removeGuest(g),g.expires-now);upd();return}
      }
      removeGuest(g);
    };
    g.pending=setTimeout(()=>{bye();c.close()},g.expires?Math.min(15000,Math.max(0,g.expires-Date.now())):15000);
    c.on('close',bye);c.on('error',()=>{bye();c.close()});
  }
  /* entradas de los invitados → eventos en la página del anfitrión */
  function gameDocument(frame){
    if(MOCK&&frame.hasAttribute('srcdoc'))return frame.contentDocument;
    const url=new URL(frame.src,location.href);
    if(url.origin!==location.origin||!/^\d{2}-[a-z-]+\.html$/.test(url.pathname.split('/').pop()))return null;
    return frame.contentDocument;
  }
  function topDoc(){
    const frame=document.querySelector('#stage iframe');
    if(!frame)return document;
    const r=frame.getBoundingClientRect();
    return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===frame?gameDocument(frame):document;
  }
  function namedOwners(label){
    const explicit=label.match(/\b(?:J[1-4]|IA|AI)\b/g);
    if(explicit)return explicit.map(x=>x==='AI'?'IA':x);
    const name=label.split('·').at(-1).trim().toLowerCase();
    const crew=typeof TEAM==='undefined'?[]:TEAM.players;
    return crew.flatMap((player,i)=>player?.name?.trim().toLowerCase()===name?['J'+(i+1)]:[]);
  }
  function seatList(doc){
    return Array.from(doc.querySelectorAll('.box .seat'),label=>({
      box:label.closest('.box'),
      owners:namedOwners(label.textContent)
    })).filter(item=>item.owners.length);
  }
  function seatBlock(g,doc,element,keyCode){
    if(!seats||!g.n||doc===document)return null;
    const list=seatList(doc);
    let pool;
    const box=element?.closest('.box');
    const controls=doc.querySelector('[data-online-control]');
    const motor=controls&&(element?.closest('.scene')||keyCode==='Space');
    const nav=controls&&(keyCode==='ArrowLeft'||keyCode==='ArrowRight'||
      doc.location?.pathname.endsWith('/09-ascenso.html')&&['KeyA','KeyD'].includes(keyCode));
    if(motor||nav)pool=list.filter(item=>item.box.dataset.onlineControl===(motor?'motor':'nav'));
    else if(box)pool=list.filter(item=>item.box===box);
    else if(!element||element.closest('.scene')){
      const primary=list.filter(item=>item.box.classList.contains('pri'));
      pool=primary.length?primary:list;
    }else return null;
    const permitted=[...new Set(pool.flatMap(item=>item.owners))];
    return permitted.length&&!permitted.includes('J'+g.n)?permitted.join(' / '):null;
  }
  function refuseSeat(g,owner){
    const now=Date.now();
    if(MOCK)lastDeny={n:g.n,s:owner,at:now};
    if(now-(g.lastDeny||0)<1000)return;
    g.lastDeny=now;
    try{g.c?.send({t:'seat-denied',owner})}catch(_){}
  }
  function dispatchKey(doc,type,code,value,repeat=false){
    const W=doc.defaultView;
    if(W&&doc.body)doc.body.dispatchEvent(new W.KeyboardEvent(type,{code,key:value,repeat,bubbles:true,cancelable:true,composed:true}));
  }
  function releaseKey(g,code){
    const pressed=g.held.get(code);
    if(!pressed)return;
    g.held.delete(code);
    if(!guests.some(other=>other.held.get(code)?.doc===pressed.doc))dispatchKey(pressed.doc,'keyup',code,pressed.value);
  }
  const nameField=e=>e?.matches('input[data-online-edit="name"]:not(:disabled):not([readonly])');
  function editName(field,value){
    let start=field.selectionStart,end=field.selectionEnd;
    const text=field.value;
    if(value==='Backspace'){
      if(start===end)start-=Array.from(text.slice(0,start)).at(-1)?.length||0;
      value='';
    }else if(value==='Delete'){
      if(start===end)end+=Array.from(text.slice(end))[0]?.length||0;
      value='';
    }else if(Array.from(value).length!==1||/[\u0000-\u001f\u007f]/.test(value))return;
    if(field.maxLength>=0&&text.length-(end-start)+value.length>field.maxLength)return;
    field.setRangeText(value,start,end,'end');
    field.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function key(g,d){
    const code=d.code;
    if(typeof code!=='string')return;
    if(d.k==='keyup'){releaseKey(g,code);return}
    if(d.k!=='keydown'||mo||document.querySelector('.xov'))return;
    const doc=topDoc();
    if(!doc)return;
    const value=typeof d.key==='string'?d.key.slice(0,12):'';
    if(doc===document&&nameField(doc.activeElement)){
      if(doc.activeElement===g.edit)editName(g.edit,value);
      return;
    }
    if(!/^(Key[A-Z]|Digit\d|Numpad\w{1,9}|Arrow(Up|Down|Left|Right)|Space|Enter|Escape|Shift(Left|Right))$/.test(code))return;
    const owner=seatBlock(g,doc,null,code);if(owner){refuseSeat(g,owner);return}
    const held=g.held.get(code);
    if(held&&held.doc!==doc)releaseKey(g,code);
    if(!g.held.has(code)){
      g.held.set(code,{doc,value});
      if(!guests.some(other=>other!==g&&other.held.get(code)?.doc===doc))dispatchKey(doc,'keydown',code,value);
    }else if(d.r)dispatchKey(doc,'keydown',code,value,true);
  }
  function hit(X,Y){let doc=document,x=X,y=Y,e=doc.elementFromPoint(x,y),i=0;
    if(!e?.closest('#stage')||(!nameField(e)&&e.closest('a, input, textarea, select, .onl-entry')))return null;
    while(e&&i++<6){if(e.tagName==='IFRAME'){const d2=gameDocument(e);if(!d2)return null;const r=e.getBoundingClientRect();x-=r.left+e.clientLeft;y-=r.top+e.clientTop;doc=d2;e=doc.elementFromPoint(x,y)}
      else if(e.shadowRoot&&e.shadowRoot.elementFromPoint){const s=e.shadowRoot.elementFromPoint(x,y);if(!s||s===e)break;e=s}else break}
    return e?{el:e,x,y,W:doc.defaultView}:null}
  function wheel(g,d){
    if(mo||document.querySelector('.xov')||![d.x,d.y,d.dx,d.dy].every(Number.isFinite))return;
    const h=hit(Math.min(1,Math.max(0,d.x))*(innerWidth-1),Math.min(1,Math.max(0,d.y))*(innerHeight-1));
    if(!h)return;
    const owner=seatBlock(g,h.el.ownerDocument,h.el);if(owner){refuseSeat(g,owner);return}
    const limit=n=>Math.min(800,Math.max(-800,n));
    const dx=limit(d.dx),dy=limit(d.dy);
    const event=new h.W.WheelEvent('wheel',{bubbles:true,cancelable:true,composed:true,view:h.W,clientX:h.x,clientY:h.y,deltaX:dx,deltaY:dy});
    if(!h.el.dispatchEvent(event))return;
    for(let e=h.el;e&&(h.W!==window||e.closest('#stage'));e=e.parentElement){
      const style=h.W.getComputedStyle(e);
      if((dy&&/auto|scroll/.test(style.overflowY)&&e.scrollHeight>e.clientHeight)||(dx&&/auto|scroll/.test(style.overflowX)&&e.scrollWidth>e.clientWidth)){
        e.scrollBy(dx,dy);return;
      }
    }
    if(h.W!==window)h.W.scrollBy(dx,dy);
  }
  function fire(h,types,b,pid){const o={bubbles:true,cancelable:true,composed:true,view:h.W,clientX:h.x,clientY:h.y,screenX:h.x,screenY:h.y,button:0,buttons:b,pointerId:pid,pointerType:'mouse',isPrimary:true};
    types.forEach(t=>{try{h.el.dispatchEvent(new (t[0]==='p'?h.W.PointerEvent:h.W.MouseEvent)(t,o))}catch(_){}})}
  function release(g){
    for(const code of g.held.keys())releaseKey(g,code);
    if(g.down){const h=g.down;g.down=null;fire(h,['pointercancel','mouseup'],0,9000+g.n)}
    g.edit=null;
  }
  function ptr(g,d){
    if(!['d','m','u'].includes(d.k)||!Number.isFinite(d.x)||!Number.isFinite(d.y))return;
    if(mo||document.querySelector('.xov')){release(g);return}
    const pid=9000+g.n,X=Math.min(1,Math.max(0,d.x))*(innerWidth-1),Y=Math.min(1,Math.max(0,d.y))*(innerHeight-1);
    if(guests.includes(g)){if(!g.dot){g.dot=el('i','onl-dot','J'+g.n);g.dot.style.setProperty('--c',DC[g.n]||'#fff');document.body.append(g.dot)}g.dot.style.transform='translate('+X+'px,'+Y+'px)'}
    if(d.k==='d'){
      if(g.down)return;const h=hit(X,Y);if(!h)return;
      const owner=seatBlock(g,h.el.ownerDocument,h.el);if(owner){refuseSeat(g,owner);return}
      if(nameField(h.el)){g.edit=h.el;h.el.focus();return}
      if(g.edit&&g.edit===document.activeElement)g.edit.blur();g.edit=null;
      g.down=h;g.dx=X-h.x;g.dy=Y-h.y;fire(h,['pointerdown','mousedown'],1,pid);
    }
    else if(d.k==='m'){const h=g.down?{el:g.down.el,W:g.down.W,x:X-g.dx,y:Y-g.dy}:hit(X,Y);if(h){if(g.down)g.down=h;fire(h,['pointermove','mousemove'],g.down?1:0,pid)}}
    else if(d.k==='u'){const dn=g.down;g.down=null;if(!dn)return;const h={el:dn.el,W:dn.W,x:X-g.dx,y:Y-g.dy};fire(h,['pointerup','mouseup'],0,pid);const u=hit(X,Y);
      if(u){const t=u.el===dn.el||dn.el.contains(u.el)?dn.el:u.el.contains(dn.el)?u.el:null;if(t&&t.isConnected)fire({el:t,W:dn.W,x:h.x,y:h.y},['click'],0,pid)}}}

  const TG={n:0,down:null,held:new Map(),edit:null};

  /* ── invitado ── */
  async function join(k,name){
    const panel=busy(T.joining);
    try{await lib()}catch(_){if(mo===panel)home(T.err);return}
    if(mo!==panel)return;
    code=k;
    const tk=crypto.randomUUID?.();
    const p=new Peer(popt());peer=p;
    let joined=false,mediaCall=null,tries=0,retryTimer=0,connectTimer=0;
    const bad=m=>{if(peer===p){end();home(m)}};
    const initial=setTimeout(()=>{if(!joined)bad(T.noRoom)},15000);
    const clearMedia=()=>{
      const call=mediaCall;mediaCall=null;pend=null;call?.close();gv?.show(null);
    };
    cancelJoin=()=>{clearTimeout(initial);clearTimeout(retryTimer);clearTimeout(connectTimer);clearMedia()};
    function retry(){
      if(peer!==p||retryTimer)return;
      if(tries>=RETRY_LIMIT){bad(T.lost);return}
      gv?.status(T.recon);
      retryTimer=setTimeout(()=>{
        retryTimer=0;tries++;
        if(peer!==p)return;
        if(p.disconnected){try{p.reconnect()}catch(_){}retry()}
        else link();
      },RETRY_MS);
    }
    function dropped(c,message){
      if(peer!==p||conn!==c)return;
      conn=null;clearTimeout(connectTimer);c?.close();clearMedia();me=0;
      if(joined){gv?.label();retry()}else bad(message);
    }
    function link(){
      if(peer!==p||conn)return;
      let c;
      try{c=p.connect(PRE+k,{reliable:true,metadata:{tk}})}catch(_){}
      if(!c){if(joined)retry();else bad(T.err);return}
      conn=c;
      connectTimer=setTimeout(()=>dropped(c,T.noRoom),joined?5000:15000);
      c.on('open',()=>{
        if(peer!==p||conn!==c)return;
        clearTimeout(initial);clearTimeout(connectTimer);
        if(!joined){joined=true;role='guest';close();guestUI()}
        gv?.status(T.waitApproval);
        try{c.send({t:'name',name})}catch(_){dropped(c,T.err)}
      });
      c.on('data',d=>{
        if(peer!==p||conn!==c||!d||typeof d!=='object')return;
        if(d.t==='hi'&&[2,3,4].includes(d.n)){me=d.n;tries=0;gv?.label();gv?.status(T.waitHost)}
        else if(d.t==='seat-denied'&&me&&typeof d.owner==='string')gv?.notify(T.seatDenied.replace('{s}',d.owner.slice(0,70)));
        else if(d.t==='full')bad(T.full);
        else if(d.t==='denied')bad(T.denied);
      });
      c.on('close',()=>dropped(c,T.noRoom));c.on('error',()=>dropped(c,T.err));
    }
    p.on('open',()=>{
      if(peer!==p||conn)return;
      clearTimeout(retryTimer);retryTimer=0;link();
    });
    p.on('call',call=>{
      if(peer!==p||!conn||call.peer!==PRE+k){call.close();return}
      const previous=mediaCall,c=conn;mediaCall=call;previous?.close();
      call.on('stream',s=>{if(peer===p&&conn===c&&mediaCall===call){if(gv)gv.show(s);else pend=s}});
      call.on('close',()=>{if(peer===p&&mediaCall===call){mediaCall=null;pend=null;gv?.show(null)}});
      call.answer();
    });
    p.on('disconnected',()=>{if(peer===p&&!p.destroyed){try{p.reconnect()}catch(_){}}});
    p.on('error',e=>{
      if(peer!==p)return;
      if(e?.type==='peer-unavailable'&&conn&&!conn.open)dropped(conn,T.noRoom);
      else if(!joined)bad(T.err);
    });
  }
  function guestUI(){const root=el('div','onl-gv'),bar=el('div','onl-gb'),lab=el('span'),box=el('div','onl-gs'),v=el('video'),wait=el('p','onl-w',T.waitApproval),tap=btn('onl-b pri onl-tap',T.tap,()=>{v.muted=false;v.play().catch(()=>{});tap.hidden=true});
    v.autoplay=true;v.playsInline=true;v.tabIndex=0;tap.hidden=true;bar.append(lab,btn('onl-x',T.leave,()=>{end();home()}));const tip=el('p','onl-tip');tip.hidden=true;tip.setAttribute('role','status');box.append(v,wait,tap,tip);root.append(bar,box);document.body.append(root);
    let down=false,lastM=0,tipTimer=0;const held=new Set(),send=o=>{try{if(conn&&conn.open)conn.send(o)}catch(_){}};
    const pos=e=>{const r=v.getBoundingClientRect(),vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return null;const s=Math.min(r.width/vw,r.height/vh),cw=vw*s,ch=vh*s;return{x:(e.clientX-r.left-(r.width-cw)/2)/cw,y:(e.clientY-r.top-(r.height-ch)/2)/ch}},out=p=>p.x<0||p.x>1||p.y<0||p.y>1;
    v.addEventListener('pointerdown',e=>{if(!me||!v.srcObject||e.button!==0)return;const p=pos(e);if(!p||out(p))return;e.preventDefault();v.focus();down=true;try{v.setPointerCapture(e.pointerId)}catch(_){}send({t:'p',k:'d',x:p.x,y:p.y})});
    v.addEventListener('pointermove',e=>{const n=performance.now();if(n-lastM<33)return;const p=pos(e);if(!p||(!down&&out(p)))return;lastM=n;send({t:'p',k:'m',x:p.x,y:p.y})});
    const pu=e=>{if(!down)return;down=false;const p=pos(e);if(p)send({t:'p',k:'u',x:p.x,y:p.y});else send({t:'release'})};
    v.addEventListener('pointerup',pu);v.addEventListener('pointercancel',()=>{down=false;send({t:'release'})});v.addEventListener('contextmenu',e=>e.preventDefault());
    let wheelTimer=0,dx=0,dy=0;
    v.addEventListener('wheel',e=>{
      const p=pos(e);if(!me||!v.srcObject||!p||out(p)||e.ctrlKey||e.metaKey)return;
      e.preventDefault();const unit=e.deltaMode===1?32:e.deltaMode===2?400:1;
      dx+=e.deltaX*unit;dy+=e.deltaY*unit;
      if(!wheelTimer)wheelTimer=setTimeout(()=>{wheelTimer=0;send({t:'w',...p,dx,dy});dx=dy=0},40);
    },{passive:false});
    const kd=e=>{if(e.type==='keyup'&&held.delete(e.code)){e.preventDefault();e.stopPropagation();send({t:'k',k:e.type,code:e.code,key:e.key});return}
      if(e.type!=='keydown'||!me||!v.srcObject||e.ctrlKey||e.metaKey||e.altKey||/^F\d+$/.test(e.code)||e.code==='Tab')return;
      if(e.target&&e.target.tagName==='BUTTON'&&root.contains(e.target))return;
      e.preventDefault();e.stopPropagation();held.add(e.code);send({t:'k',k:e.type,code:e.code,key:e.key,r:e.repeat})};
    const blur=()=>{if(held.size||down)send({t:'release'});held.clear();down=false;clearTimeout(wheelTimer);wheelTimer=dx=dy=0};
    window.addEventListener('keydown',kd,true);window.addEventListener('keyup',kd,true);window.addEventListener('blur',blur);
    gv={root,wait,tip,notify:text=>{clearTimeout(tipTimer);tip.textContent=text;tip.hidden=false;tipTimer=setTimeout(()=>{tip.hidden=true},2600)},status:text=>{wait.textContent=text},label:()=>{lab.textContent=T.room.replace('{c}',code)+(me?' · '+T.youAre.replace('{n}','J'+me):'')},
      show:s=>{v.srcObject=s;wait.hidden=!!s;if(!s){blur();tap.hidden=true;return}const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{if(v.srcObject===s){v.muted=true;v.play().catch(()=>{});tap.hidden=false}})},
      off:()=>{blur();clearTimeout(tipTimer);window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',kd,true);window.removeEventListener('blur',blur)}};
    gv.label();if(pend){gv.show(pend);pend=null}}

  function end(){
    cancelJoin?.();cancelJoin=null;
    if(gv){gv.off();gv.root.remove();gv=null}
    guests.forEach(g=>{clearTimeout(g.hold);clearTimeout(g.pending);release(g);g.dot?.remove()});guests=[];
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
    const p=peer,c=conn;peer=null;conn=null;
    try{c?.close()}catch(_){}
    try{p?.destroy()}catch(_){}
    role=null;code='';me=0;warn='';pend=null;lastDeny=null;pillUI();
  }
  window.addEventListener('pagehide',()=>{end();close()});
  window.MAPS_ONLINE={open:()=>{T=TX[lang()];if(role==='host')hostUI();else if(role!=='guest')home()},label:()=>TX[lang()].btn,state:()=>({role,code,guests:guests.length,sharing:!!stream,...(MOCK?{
      me,seats,lastDeny,list:guests.map(g=>({n:g.n,name:g.name,open:g.open,admitted:g.admitted,held:!g.open&&!!g.hold})),
      view:gv?{wait:gv.wait.hidden?'':gv.wait.textContent,tip:gv.tip.hidden?'':gv.tip.textContent}:null
    }:{})}),
    /* prueba local sin red: MAPS_ONLINE.inject({t:'p',k:'d'|'m'|'u',x,y}) o ({t:'k',k:'keydown'|'keyup',code}) aplica la entrada como si viniera de un invitado */
    inject:d=>{if(!d||typeof d!=='object')return;if(d.t==='k')key(TG,d);else if(d.t==='p')ptr(TG,d);else if(d.t==='w')wheel(TG,d);else if(d.t==='release')release(TG)}};
})();
