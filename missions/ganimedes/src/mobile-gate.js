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
