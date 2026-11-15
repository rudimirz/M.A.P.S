/* MAPS · tarjeta «Cómo se juega» + primer paso guiado (Antena, Salto). Pausa el juego mientras está abierta. */
(function(){
  const QS=new URLSearchParams(location.search),LG=['en','pt'].includes(QS.get('lang'))?QS.get('lang'):'es',I=LG==='en'?1:LG==='pt'?2:0;
  const DEMO=(location.pathname.split('/').pop()||'').replace(/\.html$/,''),CAMP=QS.get('campaign')==='1',RETRY=+QS.get('reinicios')||0;
  const t=a=>Array.isArray(a)?a[I]:a;
  const K=(k,l)=>({k,l});
  const MOUSE=['Mouse','Mouse','Mouse'],DRAG=['Arrastrar','Drag','Arrastar'],HOLD=['Mantener clic','Hold click','Segurar clique'];
  const G={
    '01-cofia':{n:['Encaja la carga en la cofia','Pack the fairing','Encaixe a carga na coifa'],
      s:[[['Elige la carga','Pick the payload','Escolha a carga'],['Arrastra cada pieza de la bandeja a un hueco de la cofia. No cabe todo.','Drag each piece from the tray into a slot in the fairing. Not everything fits.','Arraste cada peça da bandeja para um espaço da coifa. Nem tudo cabe.']],
         [['Gírala si no entra','Rotate it if it won’t fit','Gire se não couber'],['Selecciona una pieza y pulsa R o «Girar pieza seleccionada».','Select a piece and press R or “Rotate selected piece”.','Selecione uma peça e aperte R ou «Girar peça selecionada».']],
         [['Ensaya y lanza','Test and launch','Teste e lance'],['«Ensayo de vibración» revela piezas sueltas. Luego «Cerrar cofia y lanzar».','“Vibration test” shows loose pieces. Then “Close fairing and launch”.','«Ensaio de vibração» mostra peças soltas. Depois «Fechar coifa e lançar».']]],
      c:[K(DRAG,['Mover pieza','Move piece','Mover peça']),K('R',['Girar','Rotate','Girar'])],
      w:['Lanza lo más valioso bien sujeto antes de que se cierre la ventana de lanzamiento.','Launch the most valuable payload, well secured, before the launch window closes.','Lance a carga mais valiosa, bem presa, antes que a janela de lançamento feche.']},
    '02-visor-crater':{n:['Visor de cráteres','Crater viewer','Visor de crateras'],
      s:[[['Espera el cráter','Wait for the crater','Espere a cratera'],['Los cráteres cruzan la pantalla de derecha a izquierda.','Craters cross the screen from right to left.','As crateras cruzam a tela da direita para a esquerda.']],
         [['Encuádralo y mantén','Frame it and hold','Enquadre e segure'],['Pon la mira sobre el cráter y mantén el clic mientras pasa: la barra se llena.','Put the sight over the crater and hold the click while it passes: the bar fills up.','Ponha a mira sobre a cratera e segure o clique enquanto ela passa: a barra enche.']],
         [['Cuida la memoria','Watch the memory','Cuide da memória'],['Cada captura ocupa memoria. Cambia el visor entre cráteres, nunca durante el barrido.','Each capture uses memory. Switch the lens between craters, never mid-sweep.','Cada captura ocupa memória. Troque o visor entre crateras, nunca durante a varredura.']]],
      c:[K(DRAG,['Mover la mira','Move the sight','Mover a mira']),K(HOLD,['Capturar','Capture','Capturar'])],
      w:['Consigue al menos 2 capturas completas de 3 sin llenar la memoria.','Get at least 2 full captures out of 3 without filling the memory.','Consiga pelo menos 2 capturas completas de 3 sem encher a memória.']},
    '03-antena-y-cola':{n:['Antena y cola de envío','Antenna and send queue','Antena e fila de envio'],
      s:[[['Ordena la cola','Sort the queue','Ordene a fila'],['A la izquierda: arrastra los paquetes. El de arriba se envía primero.','On the left: drag the packets. The top one is sent first.','À esquerda: arraste os pacotes. O de cima é enviado primeiro.']],
         [['Abre el contacto','Open the contact','Abra o contato'],['Pulsa «Abrir contacto» en el panel. La ventana dura pocos segundos.','Press “Open contact” in the panel. The window lasts only a few seconds.','Aperte «Abrir contato» no painel. A janela dura poucos segundos.']],
         [['Alinea los aros','Line up the rings','Alinhe os aros'],['Arrastra en círculo alrededor de la antena hasta que los aros coincidan, y sostenlos ahí.','Drag in a circle around the antenna until the rings match, and hold them there.','Arraste em círculo ao redor da antena até os aros coincidirem, e mantenha-os ali.']]],
      c:[K(DRAG,['Ordenar cola','Sort queue','Ordenar fila']),K(['Girar en círculo','Circle drag','Girar em círculo'],['Apuntar antena','Aim antenna','Apontar antena']),K('A D',['Estabilizar nave','Steady the ship','Estabilizar nave']),K('1 2',['Potencia normal / alta','Normal / high power','Potência normal / alta']),K('3 4',['Apagar calefactor / sensor','Turn off heater / sensor','Desligar aquecedor / sensor'])],
      w:['Baja a Tierra los datos más importantes antes de que cierre la pasada.','Get the most important data down to Earth before the pass closes.','Envie à Terra os dados mais importantes antes que a passagem feche.']},
    '04-pulso-eclipse':{n:['Pulso en la totalidad','Pulse at totality','Pulso na totalidade'],
      s:[[['Apunta','Aim','Mire'],['Mantén la mira sobre el blanco: el enfoque sube mientras la sostienes.','Keep the sight on the target: focus rises while you hold it.','Mantenha a mira no alvo: o foco sobe enquanto você segura.']],
         [['Espera la totalidad','Wait for totality','Espere a totalidade'],['Solo dentro de la franja oscura la luz del Sol no satura el detector.','Only inside the dark band does sunlight not saturate the detector.','Só dentro da faixa escura a luz do Sol não satura o detector.']],
         [['Dispara','Fire','Dispare'],['Pulsa «Dar pulso» o Espacio. Cada pulso gasta energía.','Press “Fire pulse” or Space. Each pulse uses energy.','Aperte «Dar pulso» ou Espaço. Cada pulso gasta energia.']]],
      c:[K(HOLD,['Enfocar','Focus','Focar']),K(['Espacio','Space','Espaço'],['Pulso','Pulse','Pulso'])],
      w:['Tres pulsos dentro de la totalidad en una pasada de 30 s.','Three pulses inside totality in a 30-second pass.','Três pulsos dentro da totalidade numa passagem de 30 s.']},
    '05-panel-electrico':{n:['Panel eléctrico','Power panel','Painel elétrico'],
      s:[[['Conecta las cargas','Plug in the loads','Conecte as cargas'],['Arrastra cada cable hasta el borne de su color.','Drag each cable to the socket of its colour.','Arraste cada cabo até o borne da sua cor.']],
         [['No pases el margen','Stay under the limit','Não passe do limite'],['El panel da pocas «u» (unidades de energía). Si te pasas, salta el disyuntor: quita una carga y «Rearmar disyuntor».','The panel gives few “u” (energy units). Go over and the breaker trips: unplug a load and “Reset breaker”.','O painel dá poucas «u» (unidades de energia). Se passar, o disjuntor desarma: tire uma carga e «Rearmar disjuntor».']],
         [['Decide y confirma','Decide and confirm','Decida e confirme'],['Elige qué función queda encendida y pulsa «Confirmar reparto». Si algo se quema, arrastra los empalmes para repararlo.','Choose which function stays on and press “Confirm split”. If something burns, drag the splices to repair it.','Escolha que função fica ligada e aperte «Confirmar divisão». Se algo queimar, arraste as emendas para consertar.']]],
      c:[K(DRAG,['Conectar cable','Connect cable','Conectar cabo'])],
      w:['Confirma un reparto sin sobrecarga, con la función clave funcionando.','Confirm a split with no overload and the key function working.','Confirme uma divisão sem sobrecarga, com a função principal funcionando.']},
    '06-alunizaje':{n:['Alunizaje','Moon landing','Alunissagem'],
      s:[[['Frena a pulsos','Brake in bursts','Freie em pulsos'],['Mantén Espacio (o «Empuje») para encender el motor. Suelta antes de que se caliente.','Hold Space (or “Thrust”) to fire the engine. Let go before it overheats.','Segure Espaço (ou «Empuxo») para ligar o motor. Solte antes de esquentar.']],
         [['Busca la zona firme','Find firm ground','Busque a zona firme'],['Con ← → mueves la nave de lado hasta la zona marcada.','Use ← → to slide the lander sideways to the marked zone.','Com ← → você move a nave de lado até a zona marcada.']],
         [['Toca suelo suave','Touch down gently','Toque o solo suave'],['Llega a menos de 1,8 m/s. Si vas demasiado rápido, A aborta con la reserva (una vez).','Arrive under 1.8 m/s. Too fast? A aborts using the reserve (once).','Chegue a menos de 1,8 m/s. Rápido demais? A aborta com a reserva (uma vez).']]],
      c:[K(['Espacio','Space','Espaço'],['Motor (mantener)','Engine (hold)','Motor (segurar)']),K('← →',['Lateral','Sideways','Lateral']),K('A',['Abortar','Abort','Abortar'])],
      w:['Posarse en la zona firme por debajo de 1,8 m/s para conservar el sismómetro.','Land on firm ground under 1.8 m/s to keep the seismometer.','Pousar na zona firme abaixo de 1,8 m/s para manter o sismômetro.']},
    '07-rover-con-cable':{n:['Rover con cable','Rover on a cable','Rover com cabo'],
      s:[[['Rueda al borde','Drive to the edge','Vá até a borda'],['Con A D o ← → llevas el rover hasta el borde del cráter.','Use A D or ← → to drive the rover to the crater edge.','Com A D ou ← → você leva o rover até a borda da cratera.']],
         [['Engancha y balancéate','Hook and swing','Enganche e balance'],['Haz clic sobre un anclaje y mantén el clic: el rover se columpia y gana impulso.','Click an anchor and hold: the rover swings and builds momentum.','Clique num ancoradouro e segure: o rover balança e ganha impulso.']],
         [['Suelta en lo alto','Release at the top','Solte no alto'],['Suelta el clic cuando sube: sale volando hacia la repisa. Si te quedas corto, recógelo con el cable.','Let go as it rises: it flies to the ledge. Fall short? Reel it back with the cable.','Solte quando subir: ele voa até a saliência. Ficou curto? Recolha com o cabo.']]],
      c:[K('A D',['Rodar','Drive','Rodar']),K(HOLD,['Balancear','Swing','Balançar']),K(['Soltar','Release','Soltar'],['Saltar','Jump','Saltar'])],
      w:['Deja el rover en la repisa más alta posible: allí está la mejor roca.','Land the rover on the highest ledge you can: that’s where the best rock is.','Deixe o rover na saliência mais alta possível: lá está a melhor rocha.']},
    '08-salto-al-crater':{n:['Salto al cráter','Hop into the crater','Salto na cratera'],
      s:[[['Arma el programa','Build the program','Monte o programa'],['Toca las órdenes para ponerlas en fila (hasta 9). Toca una casilla para quitarla.','Tap commands to line them up (up to 9). Tap a slot to remove it.','Toque as ordens para enfileirá-las (até 9). Toque um espaço para tirá-la.']],
         [['Pruébalo gratis','Test it for free','Teste de graça'],['El Gemelo Digital simula el salto. Mira C (combustible) y B (batería) en cada paso.','The Digital Twin simulates the hop. Watch C (fuel) and B (battery) at each step.','O Gêmeo Digital simula o salto. Veja C (combustível) e B (bateria) em cada passo.']],
         [['Súbelo al hopper','Upload to the hopper','Envie ao hopper'],['Dentro del cráter no hay sol ni radio: en la sombra la batería solo baja. Termina perforando y enviando.','Inside the crater there is no sun or radio: in shadow the battery only drains. End by drilling and sending.','Dentro da cratera não há sol nem rádio: na sombra a bateria só cai. Termine perfurando e enviando.']]],
      c:[K(['Clic','Click','Clique'],['Añadir / quitar orden','Add / remove command','Adicionar / tirar ordem'])],
      w:['Confirma hielo en el fondo y envía la muestra a Tierra antes de quedarte sin hoppers.','Confirm ice at the bottom and send the sample to Earth before you run out of hoppers.','Confirme gelo no fundo e envie a amostra à Terra antes de ficar sem hoppers.']},
    '09-ascenso':{n:['Ascenso al orbitador','Ascent to the orbiter','Subida ao orbitador'],
      s:[[['Carga la bodega','Load the hold','Carregue o porão'],['Elige qué sube al orbitador. Cada kilo de más resta velocidad.','Choose what goes up to the orbiter. Every extra kilo costs speed.','Escolha o que sobe ao orbitador. Cada quilo a mais tira velocidade.']],
         [['Voten','Vote','Votem'],['Cada puesto vota sí o no. Hace falta mayoría para «Despegar».','Each seat votes yes or no. You need a majority to “Lift off”.','Cada posto vota sim ou não. É preciso maioria para «Decolar».']],
         [['Corta a tiempo','Cut on time','Corte na hora'],['Mantén Espacio para el motor y corrige con A D. Suelta dentro de la ventana dorada.','Hold Space for the engine and correct with A D. Release inside the gold window.','Segure Espaço para o motor e corrija com A D. Solte dentro da janela dourada.']]],
      c:[K(['Espacio','Space','Espaço'],['Motor (mantener)','Engine (hold)','Motor (segurar)']),K('A D',['Actitud','Attitude','Atitude'])],
      w:['Llega a velocidad de órbita con la carga más valiosa a bordo.','Reach orbital speed with the most valuable cargo on board.','Atinja a velocidade de órbita com a carga mais valiosa a bordo.']}
  };
  const g=G[DEMO];if(!g)return;
  if(/^(02|03|06|07|09)-/.test(DEMO))g.c=g.c.concat(K('1× 2× 3×',CAMP?['Más velocidad, más puntos (+25 % y +50 %). Elígela antes de empezar o en los primeros 8 segundos de juego.','More speed, more points (+25% and +50%). Pick it before you start or in the first 8 seconds of play.','Mais velocidade, mais pontos (+25 % e +50 %). Escolha antes de começar ou nos primeiros 8 segundos de jogo.']:['Más velocidad, más puntos (+25 % y +50 %). Cuenta la más baja que uses.','More speed, more points (+25% and +50%). The lowest one you use counts.','Mais velocidade, mais pontos (+25 % e +50 %). Conta a mais baixa que você usar.']));
  const U={eye:['Cómo se juega','How to play','Como se joga'],ctl:['Controles','Controls','Controles'],win:['Para ganar','To win','Para vencer'],
    team:['Equipo','Team','Equipe'],teamT:['De 1 a 4 jugadores en la misma computadora. La etiqueta de cada panel dice quién lo maneja; los marcados «IA» los juega la computadora. Jugando solo, tú manejas todo lo demás.','1 to 4 players on the same computer. Each panel’s tag shows who runs it; panels marked “AI” are played by the computer. Playing solo, you run everything else.','De 1 a 4 jogadores no mesmo computador. A etiqueta de cada painel mostra quem o controla; os marcados «IA» são jogados pelo computador. Jogando sozinho, você controla todo o resto.'],teamC:['Quien no maneja apoya: cuando se enciende su círculo, clic o su tecla (J2 = K, J3 = L, J4 = P).','Whoever isn’t driving supports: when their circle lights up, click it or press their key (P2 = K, P3 = L, P4 = P).','Quem não controla apoia: quando o círculo acender, clique ou aperte a tecla (J2 = K, J3 = L, J4 = P).'],
    go:['Entendido, ¡a jugar!','Got it, let’s play!','Entendi, vamos jogar!'],help:['Cómo se juega','How to play','Como se joga'],paused:['Juego en pausa','Game paused','Jogo em pausa'],
    skip:['Saltar guía','Skip guide','Pular guia'],next:['Siguiente','Next','Próximo'],step:['Paso','Step','Passo'],of:['de','of','de'],doit:['Hazlo ahora o pulsa Siguiente.','Do it now or press Next.','Faça agora ou aperte Próximo.'],doitL:['Hazlo ahora o pulsa Entendido.','Do it now or press Got it.','Faça agora ou aperte Entendi.'],ok:['Entendido','Got it','Entendi']};
  const CSS=`:host{all:initial}
*{box-sizing:border-box}
.bd{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:rgba(4,7,12,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font:15px/1.45 "Segoe UI",system-ui,sans-serif;color:#f0f4fa;animation:fi .25s ease both}
.cd{--a:var(--accent,#8ed5f3);width:min(820px,100%);max-height:calc(100vh - 32px);overflow:auto;display:grid;gap:18px;padding:26px 28px 22px;border-radius:24px;border:1px solid #3d4d63;border:1px solid color-mix(in srgb,var(--a) 35%,#344255);background:#121a27;background:radial-gradient(90% 60% at 50% 0%,color-mix(in srgb,var(--a) 13%,transparent),transparent 70%),linear-gradient(180deg,#172131,#0e141e);box-shadow:0 40px 90px -30px #000;animation:up .45s cubic-bezier(.2,.7,.2,1) both}
.hd{display:grid;gap:4px}.ey{font:800 .72rem "Bahnschrift","Segoe UI",sans-serif;letter-spacing:.26em;text-transform:uppercase;color:var(--a)}
h2{margin:0;font:800 clamp(1.5rem,2.6vw,2rem)/1.1 "Bahnschrift","Segoe UI",sans-serif;text-wrap:balance}
.st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0;padding:0;list-style:none}
.st li{position:relative;display:grid;gap:6px;align-content:start;padding:16px 16px 15px;border-radius:16px;border:1px solid #273346;background:rgba(10,15,23,.7);animation:up .5s cubic-bezier(.2,.7,.2,1) both}
.st li:nth-child(2){animation-delay:.07s}.st li:nth-child(3){animation-delay:.14s}
.st li:not(:last-child)::after{content:"";position:absolute;right:-9px;top:30px;width:6px;height:6px;border-top:2px solid var(--a);border-right:2px solid var(--a);transform:rotate(45deg);opacity:.7}
.nb{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:var(--a);color:#07101a;font:900 .95rem "Bahnschrift",sans-serif;box-shadow:0 0 22px -4px var(--a)}
.st b{font:800 1.02rem "Bahnschrift","Segoe UI",sans-serif}.st p{margin:0;color:#b9c6d6;font-size:.9rem;text-wrap:pretty}
.rw{display:grid;grid-template-columns:110px minmax(0,1fr);gap:14px;align-items:center;padding-top:14px;border-top:1px solid #222d3d}
.lb{font:800 .7rem "Bahnschrift",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8a99ad}
.ks{display:flex;flex-wrap:wrap;gap:8px 14px}.k{display:flex;align-items:center;gap:8px;font-size:.88rem;color:#d3dce8}
kbd{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 9px;border-radius:8px;border:1px solid #46566d;border-bottom-width:3px;background:#1b2535;color:#fff;font:800 .82rem "Bahnschrift","Segoe UI",sans-serif;white-space:nowrap}
.wn{display:flex;gap:10px;align-items:center;font-weight:600;color:#ffe2b0}.wn i{font-style:normal;color:#ffc779;font-size:1.1rem}
.tm{color:#b9c6d6;font-size:.88rem;text-wrap:pretty}
.ft{display:flex;justify-content:flex-end;align-items:center;gap:14px;padding-top:4px}.ft small{color:#7e8da2;font-size:.78rem}
button.go{min-height:50px;padding:0 28px;border:0;border-radius:999px;background:var(--a);background:linear-gradient(180deg,color-mix(in srgb,var(--a) 82%,#fff),var(--a));color:#07101a;font:800 1.02rem "Bahnschrift","Segoe UI",sans-serif;cursor:pointer;box-shadow:0 14px 30px -12px var(--a);transition:transform .15s}
button.go:hover{transform:translateY(-2px)}button.go:focus-visible{outline:3px solid #fff;outline-offset:3px}
.hb{position:fixed;left:14px;bottom:14px;z-index:2147482990;height:38px;padding:0 14px 0 8px;display:flex;align-items:center;gap:8px;border-radius:999px;border:1px solid #344255;background:rgba(17,24,35,.92);color:#f0f4fa;font:700 .82rem "Bahnschrift","Segoe UI",sans-serif;cursor:pointer;box-shadow:0 10px 24px -12px #000}
.hb span{width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:var(--accent,#8ed5f3);color:#07101a;font-weight:900}
.hb:hover{border-color:var(--accent,#8ed5f3)}
.cm{position:fixed;z-index:2147482995;pointer-events:none;transition:left .25s,top .25s,width .25s,height .25s}
.cm .ring{position:absolute;inset:0;border-radius:16px;border:2.5px solid #ffc779;box-shadow:0 0 0 4000px rgba(4,7,12,.38),0 0 26px rgba(255,199,121,.55);animation:pr 1.4s ease-in-out infinite}
.cm.round .ring{border-radius:50%}
.cm .orb{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px;border-radius:50%;background:radial-gradient(circle,#fff 0 30%,rgba(255,199,121,.9) 32% 60%,transparent 62%);offset-rotate:0deg;animation:orb 2.2s linear infinite}
.bb{position:fixed;z-index:2147482996;max-width:280px;padding:12px 14px;border-radius:14px;background:#ffc779;color:#1a1206;font:700 .92rem/1.35 "Segoe UI",system-ui,sans-serif;box-shadow:0 18px 36px -14px #000;animation:up .3s both}
.bb::before{content:"";position:absolute;width:12px;height:12px;background:#ffc779;transform:rotate(45deg)}
.bb.b::before{top:-6px;left:24px}.bb.t::before{bottom:-6px;left:24px}.bb.l::before{right:-6px;top:18px}.bb.r::before{left:-6px;top:18px}
.bb em{display:block;margin-bottom:4px;font:800 .68rem "Bahnschrift",sans-serif;font-style:normal;letter-spacing:.16em;text-transform:uppercase;opacity:.7}
.bb small{display:block;margin-top:4px;font-weight:600;opacity:.78;font-size:.78rem}.bb small.do{font-style:italic}
.bb .bt{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px}
.bb button{padding:5px 12px;border-radius:999px;border:1px solid rgba(26,18,6,.4);background:transparent;color:#1a1206;font:800 .78rem "Bahnschrift",sans-serif;cursor:pointer}
.bb button.nx{min-height:34px;padding:5px 16px;border-color:#1a1206;background:#1a1206;color:#ffc779;font-size:.86rem}.bb button.nx:hover{background:#000}
@keyframes fi{from{background:rgba(4,7,12,.4)}}@keyframes up{from{transform:translateY(14px)}}
@keyframes pr{50%{transform:scale(1.04);box-shadow:0 0 0 4000px rgba(4,7,12,.38),0 0 40px rgba(255,199,121,.8)}}
@media (max-width:720px){.st{grid-template-columns:1fr}.st li::after{display:none}.rw{grid-template-columns:1fr;gap:6px}}
@media (max-height:700px){.cd{padding:18px 20px 16px;gap:12px}.st li{padding:12px}}
@media (max-height:560px){.cd{padding:14px 18px 12px;gap:9px}.st li{padding:9px 12px;gap:3px}.nb{width:26px;height:26px;font-size:.82rem}.st p{font-size:.84rem}.rw{padding-top:8px}h2{font-size:1.35rem}button.go{min-height:42px}kbd{height:26px;min-width:26px}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let root,open=false,onClose=null;
  const keyBlock=e=>{if(!open)return;e.stopImmediatePropagation();if(e.type==='keydown'&&(e.code==='Enter'||e.code==='Space'||e.code==='Escape')){e.preventDefault();close()}};
  window.addEventListener('keydown',keyBlock,true);window.addEventListener('keyup',keyBlock,true);
  function mount(){const host=document.createElement('div');host.id='mg-howto';document.body.append(host);root=host.attachShadow({mode:'open'});const st=document.createElement('style');st.textContent=CSS;root.append(st);
    const hb=document.createElement('button');hb.type='button';hb.className='hb';hb.innerHTML='<span>?</span>'+esc(t(U.help));hb.addEventListener('click',()=>show());root.append(hb)}
  function show(cb){if(open)return;stopGuide?.();open=true;window.__MGPAUSE=true;onClose=cb||null;
    const bd=document.createElement('div');bd.className='bd';bd.setAttribute('role','dialog');bd.setAttribute('aria-modal','true');bd.setAttribute('aria-label',t(U.eye)+': '+t(g.n));
    bd.innerHTML='<div class="cd"><div class="hd"><span class="ey">'+esc(t(U.eye))+'</span><h2>'+esc(t(g.n))+'</h2></div>'+
      '<ol class="st">'+g.s.map((x,i)=>'<li><span class="nb">'+(i+1)+'</span><b>'+esc(t(x[0]))+'</b><p>'+esc(t(x[1]))+'</p></li>').join('')+'</ol>'+
      '<div class="rw"><span class="lb">'+esc(t(U.ctl))+'</span><div class="ks">'+g.c.map(c=>'<span class="k"><kbd>'+esc(t(c.k))+'</kbd>'+esc(t(c.l))+'</span>').join('')+'</div></div>'+
      '<div class="rw"><span class="lb">'+esc(t(U.win))+'</span><div class="wn"><i>★</i><span>'+esc(t(g.w))+'</span></div></div>'+
      '<div class="rw"><span class="lb">'+esc(t(U.team))+'</span><div class="tm">'+esc(t(U.teamT))+(CAMP&&QS.get('names')?' '+esc(t(U.teamC)):'')+'</div></div>'+
      '<div class="ft"><small>'+esc(t(U.paused))+' · Enter</small><button type="button" class="go">'+esc(t(U.go))+'</button></div></div>';
    bd.querySelector('.go').addEventListener('click',close);root.append(bd);setTimeout(()=>{const b=bd.querySelector('.go');b&&b.focus()},60)}
  function close(){if(!open)return;open=false;const bd=root.querySelector('.bd');bd&&bd.remove();window.__MGPAUSE=false;try{sessionStorage.setItem('maps-howto:'+DEMO,'1')}catch(_){}try{document.activeElement&&document.activeElement.blur()}catch(_){}const cb=onClose;onClose=null;cb&&cb()}
  /* coach marks */
  let cm=null,bb=null,raf=0,tgt=null;
  function coach(getRect,text,sub,opt){opt=opt||{};clearCoach();window.__MGPAUSE=!!opt.pause;cm=document.createElement('div');cm.className='cm'+(opt.round?' round':'');cm.innerHTML='<div class="ring"></div>'+(opt.orbit?'<div class="orb"></div>':'');bb=document.createElement('div');bb.className='bb';const last=opt.idx!=null&&opt.idx===opt.total-1;bb.innerHTML=(opt.total?'<em>'+esc(t(U.step))+' '+(opt.idx+1)+' '+esc(t(U.of))+' '+opt.total+'</em>':'')+'<span>'+esc(text)+'</span>'+(sub?'<small>'+esc(sub)+'</small>':'')+'<small class="do">'+esc(t(last?U.doitL:U.doit))+'</small><div class="bt"><button type="button" class="sk">'+esc(t(U.skip))+'</button><button type="button" class="nx">'+esc(last?t(U.ok):t(U.next))+' ▸</button></div>';bb.style.pointerEvents='auto';bb.querySelector('.sk').addEventListener('click',opt.onSkip);bb.querySelector('.nx').addEventListener('click',opt.onNext);root.append(cm,bb);tgt=getRect;
    const pos=()=>{const r=tgt&&tgt();if(!r||!cm){raf=requestAnimationFrame(pos);return}const p=opt.pad||8;Object.assign(cm.style,{left:(r.left-p)+'px',top:(r.top-p)+'px',width:(r.width+2*p)+'px',height:(r.height+2*p)+'px'});
      if(opt.orbit){const o=cm.querySelector('.orb'),a=performance.now()/700,rx=(r.width/2+p),ry=(r.height/2+p);o.style.transform='translate('+(Math.cos(a)*rx)+'px,'+(Math.sin(a)*ry)+'px)'}
      const bw=bb.offsetWidth,bh=bb.offsetHeight,vw=innerWidth,vh=innerHeight;let x,y,c;
      if(r.bottom+p+14+bh<vh){x=r.left;y=r.bottom+p+12;c='b'}else if(r.top-p-14-bh>0){x=r.left;y=r.top-p-12-bh;c='t'}else if(r.right+p+14+bw<vw){x=r.right+p+12;y=r.top;c='r'}else{x=r.left-p-12-bw;y=r.top;c='l'}
      x=Math.max(8,Math.min(vw-bw-8,x));y=Math.max(8,Math.min(vh-bh-8,y));bb.style.left=x+'px';bb.style.top=y+'px';bb.className='bb '+c;raf=requestAnimationFrame(pos)};pos()}
  function clearCoach(){if(!open)window.__MGPAUSE=false;cancelAnimationFrame(raf);cm&&cm.remove();bb&&bb.remove();cm=bb=null;tgt=null}
  const cvRect=(x,y,w,h)=>()=>{const cv=document.querySelector('canvas');if(!cv)return null;const r=cv.getBoundingClientRect();if(!r.width)return null;const s=Math.min(r.width/800,r.height/500),ox=r.left+(r.width-800*s)/2,oy=r.top+(r.height-500*s)/2;return{left:ox+x*s,top:oy+y*s,width:w*s,height:h*s,right:ox+(x+w)*s,bottom:oy+(y+h)*s}};
  const elRect=sel=>()=>{const e=typeof sel==='function'?sel():document.querySelector(sel);if(!e||e.offsetParent===null)return null;return e.getBoundingClientRect()};
  let stopGuide=null;
  const G2={
    '01-cofia':()=>[
      {pause:true,r:cvRect(470,80,320,350),tx:['Toma una pieza de la bandeja: haz clic y arrástrala.','Grab a piece from the tray: click and drag it.','Pegue uma peça da bandeja: clique e arraste.'],done:'cvdown'},
      {r:cvRect(98,88,256,256),tx:['Suéltala dentro de la cofia. Lo pesado va abajo.','Drop it inside the fairing. Heavy things go at the bottom.','Solte dentro da coifa. O pesado vai embaixo.'],sub:['Para girarla: tócala sin arrastrar o pulsa R.','To rotate it: tap it without dragging, or press R.','Para girar: toque sem arrastar ou aperte R.'],done:'cvup'},
      {el:()=>document.querySelectorAll('.box.pri .btn')[1],r:elRect(()=>document.querySelectorAll('.box.pri .btn')[1]),tx:['Cuando tengas la carga puesta, prueba aquí si va bien sujeta.','Once the payload is in, test here whether it is well secured.','Com a carga no lugar, teste aqui se está bem presa.'],done:'el'},
      {el:()=>document.querySelector('.box.pri .btn.primary'),r:elRect('.box.pri .btn.primary'),tx:['Y lanza antes de que el reloj llegue a cero.','Then launch before the clock hits zero.','E lance antes que o relógio chegue a zero.'],done:'el'}],
    '02-visor-crater':()=>[
      {pause:true,r:cvRect(350,160,160,160),tx:['Esta es la mira. Arrástrala sobre el cráter y mantén el clic mientras pasa.','This is the sight. Drag it over the crater and hold the click while it passes.','Esta é a mira. Arraste sobre a cratera e segure o clique enquanto ela passa.'],sub:['Los cráteres entran por la derecha.','Craters come in from the right.','As crateras entram pela direita.'],done:'cvdown'},
      {pause:true,r:cvRect(10,420,310,74),tx:['Aquí se guardan las 3 capturas. Cada una ocupa memoria: no la llenes.','The 3 captures are stored here. Each one uses memory: don’t fill it up.','Aqui ficam as 3 capturas. Cada uma ocupa memória: não encha.'],done:'none'}],
    '05-panel-electrico':()=>[
      {r:cvRect(200,160,64,220),tx:['Estos son los enchufes del bus. Haz clic en uno y arrastra el cable.','These are the bus sockets. Click one and drag the cable.','Estes são os bornes do barramento. Clique em um e arraste o cabo.'],done:'cvdown'},
      {r:cvRect(520,138,256,284),tx:['Suelta el cable sobre una carga. Cada una gasta energía (u).','Drop the cable on a load. Each one uses energy (u).','Solte o cabo sobre uma carga. Cada uma gasta energia (u).'],sub:['Si te pasas del límite, salta el disyuntor.','Go over the limit and the breaker trips.','Se passar do limite, o disjuntor desarma.'],done:'cvup'},
      {el:()=>document.querySelector('.box.pri .btn.primary'),r:elRect('.box.pri .btn.primary'),tx:['Cuando el reparto esté listo, confírmalo aquí.','When the split is ready, confirm it here.','Quando a divisão estiver pronta, confirme aqui.'],done:'el'}],
    '06-alunizaje':()=>[
      {el:()=>document.querySelector('.drive'),r:elRect('.drive'),tx:['Con ← → mueves la nave de lado hasta la zona firme.','Use ← → to slide the lander sideways to firm ground.','Com ← → você move a nave de lado até a zona firme.'],sub:['Toca suelo a menos de 1,8 m/s.','Touch down under 1.8 m/s.','Toque o solo a menos de 1,8 m/s.'],done:'none'},
      {el:()=>document.querySelector('.box.pri .btn.primary'),r:elRect('.box.pri .btn.primary'),tx:['Mantén ESPACIO (o este botón) para encender el motor y frenar la caída.','Hold SPACE (or this button) to fire the engine and slow the fall.','Segure ESPAÇO (ou este botão) para ligar o motor e frear a queda.'],sub:['Suelta a ratos: el motor se calienta.','Let go now and then: the engine heats up.','Solte de vez em quando: o motor esquenta.'],done:'hold'}],
    '07-rover-con-cable':()=>[
      {el:()=>document.querySelector('.drive'),r:elRect('.drive'),tx:['Rueda con A D (o estos botones) hasta el borde de la plataforma.','Drive with A D (or these buttons) to the edge of the platform.','Ande com A D (ou estes botões) até a borda da plataforma.'],done:'none'},
      {r:cvRect(262,148,60,60),round:true,tx:['Este es un anclaje. Haz clic sobre él y mantén: el rover se cuelga y se balancea.','This is an anchor. Click it and hold: the rover hangs and swings.','Este é um ancoradouro. Clique nele e segure: o rover fica pendurado e balança.'],done:'cvdown'},
      {r:cvRect(510,120,60,60),round:true,tx:['Suelta el clic cuando el rover sube. En el aire puedes engancharte al segundo anclaje.','Release the click as the rover rises. In mid-air you can hook the second anchor.','Solte o clique quando o rover subir. No ar você pode se prender ao segundo ancoradouro.'],done:'none'}],
    '09-ascenso':()=>[
      {el:()=>document.querySelector('.items'),r:elRect('.items'),tx:['Toca lo que quieras dejar en la Luna. Menos peso = más margen para llegar a órbita.','Tap what you want to leave on the Moon. Less weight = more margin to reach orbit.','Toque o que quiser deixar na Lua. Menos peso = mais margem para chegar à órbita.'],done:'el'},
      {el:()=>document.querySelector('.votes'),r:elRect('.votes'),tx:['Lee lo que opina la tripulación y vota sí o no.','Read what the crew thinks and vote yes or no.','Leia o que a tripulação acha e vote sim ou não.'],done:'el'},
      {el:()=>document.querySelector('.btn.go'),r:elRect('.btn.go'),tx:['Con mayoría a favor, despega aquí.','With a majority in favour, lift off here.','Com maioria a favor, decole aqui.'],done:'el'},
      {el:()=>document.querySelector('.btn.hold'),r:elRect('.btn.hold'),tx:['Mantén ESPACIO para el motor y suelta dentro de la ventana dorada.','Hold SPACE for the engine and release inside the gold window.','Segure ESPAÇO para o motor e solte dentro da janela dourada.'],sub:['Corrige la inclinación con A D.','Correct the tilt with A D.','Corrija a inclinação com A D.'],done:'none'}],
    '03-antena-y-cola':()=>{const rs=(QS.get('roles')||'').split(',').filter(Boolean).reduce((o,s)=>{const [k,v]=s.split(':');o[k]=v||'IA';return o},{}),team=Object.keys(rs).length>0,ai=k=>team&&(rs[k]||'IA')==='IA';
      const startB=()=>[...document.querySelectorAll('button')].find(b=>!b.closest('#mg-howto')&&/contact|contat|pasada|pass/i.test(b.textContent)&&/abri|open/i.test(b.textContent));
      const steps=[];
      if(!ai('cola'))steps.push({r:cvRect(14,104,270,148),tx:['1 · Arrastra un paquete hacia arriba o abajo: el de arriba sale primero.','1 · Drag a packet up or down: the top one goes first.','1 · Arraste um pacote para cima ou para baixo: o de cima sai primeiro.'],done:'cvdown-left'});
      steps.push({el:startB,r:elRect(startB),tx:['2 · Cuando la cola esté lista, abre el contacto aquí.','2 · When the queue is ready, open the contact here.','2 · Quando a fila estiver pronta, abra o contato aqui.'],done:'start'});
      if(!ai('antena'))steps.push({r:cvRect(545-160,240-160,320,320),tx:['3 · Arrastra en círculo alrededor de la antena hasta que los aros coincidan.','3 · Drag in a circle around the antenna until the rings line up.','3 · Arraste em círculo ao redor da antena até os aros coincidirem.'],sub:['Mantenlos alineados mientras baja la barra de datos.','Keep them aligned while the data bar fills.','Mantenha-os alinhados enquanto a barra de dados enche.'],round:true,orbit:true,done:'circle'});
      return steps},
    '08-salto-al-crater':()=>[
      {el:()=>document.querySelector('button.card'),r:elRect('button.card'),tx:['1 · Toca una orden para añadirla al programa.','1 · Tap a command to add it to the program.','1 · Toque uma ordem para adicioná-la ao programa.'],sub:['Añade varias en el orden en que debe hacerlas el hopper.','Add several, in the order the hopper should run them.','Adicione várias, na ordem em que o hopper deve executá-las.'],done:'card'},
      {el:()=>document.querySelector('button.btn.sim'),r:elRect('button.btn.sim'),tx:['2 · Prueba el programa gratis en el Gemelo Digital.','2 · Test the program for free in the Digital Twin.','2 · Teste o programa de graça no Gêmeo Digital.'],sub:['Si falla, ajusta las órdenes. Cuando funcione, súbelo al hopper real.','If it fails, adjust the commands. When it works, upload it to the real hopper.','Se falhar, ajuste as ordens. Quando funcionar, envie ao hopper real.'],done:'sim'}]
  };
  function runGuide(){
    if(open||stopGuide)return;
    const steps=G2[DEMO]?.();
    if(!steps?.length)return;
    const events=['pointerdown','click','pointermove','pointerup','keydown'];
    let i=0,advanceTimer=0,waitTimer=0,circ=0,lastA=null;
    const stop=()=>{
      clearTimeout(advanceTimer);
      clearTimeout(waitTimer);
      events.forEach(ev=>document.removeEventListener(ev,hit,true));
      clearCoach();
      stopGuide=null;
    };
    const reveal=e=>{
      for(let p=e?.parentElement;p&&p!==document.body;p=p.parentElement){
        if(!/(auto|scroll)/.test(getComputedStyle(p).overflowY)||p.scrollHeight<=p.clientHeight+4)continue;
        const pr=p.getBoundingClientRect(),er=e.getBoundingClientRect();
        if(er.top<pr.top+8||er.bottom>pr.bottom-8)p.scrollTop+=er.top-pr.top-(pr.height-er.height)/2;
        return;
      }
    };
    const next=()=>{
      clearTimeout(advanceTimer);
      clearTimeout(waitTimer);
      advanceTimer=0;
      if(++i===steps.length)stop();
      else showStep();
    };
    const showStep=()=>{
      const s=steps[i],step=i;
      reveal(s.el?.());
      const wait=()=>{
        if(s.r())coach(s.r,t(s.tx).replace(/^\d+ · /,''),s.sub&&t(s.sub),{
          ...s,idx:step,total:steps.length,onNext:()=>{if(i===step)next()},onSkip:stop,
        });
        else waitTimer=setTimeout(wait,300);
      };
      wait();
    };
    const within=(r,e)=>r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
    const later=ms=>{if(!advanceTimer)advanceTimer=setTimeout(next,ms)};
    function hit(e){
      if(e.composedPath().includes(root.host))return;
      const s=steps[i],canvas=e.target.tagName==='CANVAS';
      if((s.done==='cvdown-left'||s.done==='cvdown')&&e.type==='pointerdown'&&canvas&&within(s.r(),e)){
        if(steps[i+1]?.done==='cvup')next();
        else later(350);
      }else if(s.done==='cvup'&&e.type==='pointerup'&&canvas&&within(s.r(),e)){
        later(350);
      }else if(s.done==='start'&&e.type==='click'){
        const button=e.target.closest?.('button'),r=s.r();
        if(button&&r){const b=button.getBoundingClientRect();if(Math.abs(b.left-r.left)<2&&Math.abs(b.top-r.top)<2)later(250)}
      }else if((s.done==='el'||s.done==='hold')&&(e.type==='click'||(s.done==='hold'&&e.type==='pointerdown'))){
        const target=s.el?.(),button=e.target.closest?.('button');
        if(button&&!button.disabled&&target?.contains(button))later(350);
      }else if(s.done==='hold'&&e.type==='keydown'&&e.code==='Space'){
        later(600);
      }else if(s.done==='card'&&e.type==='click'&&e.target.closest?.('button.card')){
        later(300);
      }else if(s.done==='sim'&&e.type==='click'&&e.target.closest?.('button.btn.sim')){
        next();
      }else if(s.done==='circle'&&e.type==='pointermove'&&e.buttons&&canvas){
        const r=s.r();
        if(!r)return;
        const a=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));
        if(lastA!==null)circ+=Math.abs(Math.atan2(Math.sin(a-lastA),Math.cos(a-lastA)));
        lastA=a;
        if(circ>Math.PI*1.2)next();
      }
    }
    stopGuide=stop;
    events.forEach(ev=>document.addEventListener(ev,hit,true));
    showStep();
  }
  const init=()=>{mount();let seen=false;try{seen=!!sessionStorage.getItem('maps-howto:'+DEMO)}catch(_){}
    const want=QS.has('howto')||(CAMP?RETRY===0:!seen);if(want)show(()=>setTimeout(runGuide,250));};
  if(document.body)init();else addEventListener('DOMContentLoaded',init);
})();
